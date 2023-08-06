const { ethers } = require('ethers');
const Table = require("cli-table3");
const BigNumber = require('bignumber.js');
const dataConsumerArtifact = require("../misc/DataConsumerV3.json");
const histConsumerArtifact = require("../misc/HistoricalDataConsumerV3.json");
const { providers } = require('./helper');
const { provider, signer } = providers();

const DataConsumerV3_Addr = "0xd724240e9d6a3bc0b8476fbfd34d66e174af48f4";
const HistoricalDataConsumerV3_Addr = "0xD405E7ab3d7e71774325C16D792fc9dc148F1D56";

const DataConsumerV3 = new ethers.Contract(DataConsumerV3_Addr, dataConsumerArtifact.abi, provider);
const HistoricalDataConsumerV3 = new ethers.Contract(HistoricalDataConsumerV3_Addr, histConsumerArtifact.abi, provider);

/*******Start Date and End Date ********/
const startDate = new Date("2022-10-01 00:00:00 GMT+05:30");
const unixStartDate = dateToUnixEpoch(startDate);
const endData = new Date("2022-10-05 23:59:59 GMT+05:30");
const unixEndDate = dateToUnixEpoch(endData);


function dateToUnixEpoch(date) {
    return Math.floor(date.getTime() / 1000);
}
let batchIDCounter = 0;
async function getBatchForDate(startingRoundId, latestRoundId, uinxEpocDate) {
    let roundIdUpperLimit;
    let roundIdLowerLimit;

    for (let i = startingRoundId; i < latestRoundId; i = i + BigInt("500")) {
        batchIDCounter++;
        console.log("Batch Id :", batchIDCounter);
        const historicalData = await HistoricalDataConsumerV3.getHistoricalData(BigInt(i));
        if (Number(historicalData[3]) >= uinxEpocDate) {
            roundIdUpperLimit = i;
            roundIdLowerLimit = i - BigInt("500");
            break;
        }

        if (i + BigInt("500") > latestRoundId) {
            batchIDCounter++;
            console.log("Batch Id :", batchIDCounter);
            roundIdUpperLimit = latestRoundId;
            roundIdLowerLimit = i;
        }
    }
    return [roundIdLowerLimit, roundIdUpperLimit];
}


// Function to wrap text within a specified width
function table_display(data) {
    const table = new Table();
    const formattedData = data.map((row) => row.map((item) => (item instanceof BigNumber ? item.toString() : item)));
    formattedData.forEach((row) => {
        table.push(row);
    });
    table.options.head = ['DATE', 'OPEN', 'HIGH', 'LOW', 'CLOSE'];
    console.log(table.toString());
}

 /* getDataFromStartToEnd() will pull all the roundIDs between startingRoundId and endRoundId*/ 
async function getDataFromStartToEnd(startingRoundId, endRoundId) {
    const combinedData = [];
    let batches;
    for (let i = startingRoundId; i <= endRoundId; i = i + BigInt("500")) {

        if (i + BigInt("500") > endRoundId) {
            batches = await HistoricalDataConsumerV3.getBatch(
                BigInt(i),
                BigInt(endRoundId)
            );
        } else {
            batches = await HistoricalDataConsumerV3.getBatch(
                BigInt(i),
                BigInt(i + BigInt("500"))
            );
        }
        combinedData.push(...batches);
    }

    /******************Process Data ***************/
    const twoDimensionalArray = [];
    let date = startDate.toLocaleDateString();
    let open = combinedData[0].answer;
    let high = combinedData[0].answer;
    let low = combinedData[0].answer;
    let close;


    for (let i = 0; i < combinedData.length; i++) {
        const timeStamp = new Date(Number(combinedData[i].timeStamp) * 1000);
        const simpleDate = timeStamp.toLocaleDateString();
        if (simpleDate > date) {
            close = combinedData[i - 1].answer;
            twoDimensionalArray.push([
                date, 
                new BigNumber(open.toString()), 
                new BigNumber(high.toString()), 
                new BigNumber(low.toString()), 
                new BigNumber(close.toString())]);

            date = simpleDate;
            open = combinedData[i].answer;
            high = combinedData[i].answer;
            low = combinedData[i].answer;
        }

        if (combinedData[i].answer > high) {
            high = combinedData[i].answer;
        }
        if (combinedData[i].answer < low) {
            low = combinedData[i].answer;
        }
    }

    close = combinedData[combinedData.length - 1].answer;
    twoDimensionalArray.push([
        date, 
        new BigNumber(open.toString()), 
        new BigNumber(high.toString()), 
        new BigNumber(low.toString()), 
        new BigNumber(close.toString())]);

    console.log("**************");
    table_display(twoDimensionalArray);
}

async function main() {
    console.log("Start Date : ", startDate.toLocaleDateString());
    console.log("End Date : ", endData.toLocaleDateString());
    console.log("\n");
    const latestData = await DataConsumerV3.getLatestData();
    const latestRoundId = BigInt(latestData[0]);

    /* Logic to calculate phaseId, aggregatorRoundId 
        can be reference from "https://docs.chain.link/data-feeds/historical-data"
    */

    // Largest 64bits integer
    const larget64Bits = BigInt("0xFFFFFFFFFFFFFFFF");
    const aggregatorRoundId = Number(latestRoundId & larget64Bits);
    const startingRoundId = latestRoundId - BigInt(aggregatorRoundId) + BigInt("1");

    /* getBatchForDate() will provide the round IDs, both lower and upper bounds, 
    for a batch with a start date falling within a specified range.  */
    const startDatelimits = await getBatchForDate(startingRoundId, latestRoundId, unixStartDate);

    /* HistoricalDataConsumerV3.getStartRoundId will accurately provide the round Id 
    corresponding to the start date within the retrieved batch*/
    const startDateDetails = await HistoricalDataConsumerV3.getStartRoundId(
        startDatelimits[0],
        startDatelimits[1],
        unixStartDate);
    console.log("*************");
    console.log("StartDate RoundID : ", startDateDetails[0].toString());
    console.log("StartDate Unix epoc : ", startDateDetails[1].toString());
    console.log("*************");

    /* getBatchForDate() will provide the round IDs, both lower and upper bounds, 
    for a batch with a end date falling within a specified range.  */
    const endDatelimits = await getBatchForDate(BigInt(startDateDetails[0]), latestRoundId, unixEndDate);
    const endDateDetails = await HistoricalDataConsumerV3.getEndRoundId(
        endDatelimits[0],
        endDatelimits[1],
        unixEndDate);
    const endDateTimeStamp = await HistoricalDataConsumerV3.getHistoricalData(BigInt(endDateDetails));
    console.log("*************");
    console.log("EndDate RoundID : ", endDateDetails.toString());
    console.log("EndDate Unix epoc : ", endDateTimeStamp[3].toString());

    await getDataFromStartToEnd(BigInt(startDateDetails[0]), BigInt(endDateDetails));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});