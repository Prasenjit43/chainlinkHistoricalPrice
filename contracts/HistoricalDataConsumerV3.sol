// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract HistoricalDataConsumerV3 {
    AggregatorV3Interface internal dataFeed;

    struct ReturnedData {
        uint80 roundID;
        int256 answer;
        uint256 startedAt;
        uint256 timeStamp;
    }

    /**
     * Network: Goerli
     * Aggregator: BTC/USD
     * Address: 0xA39434A63A52E749F02807ae27335515BA4b07F7
     */
    constructor() {
        dataFeed = AggregatorV3Interface(
            0xA39434A63A52E749F02807ae27335515BA4b07F7
        );
    }

    function getHistoricalData(
        uint80 roundId
    ) public view returns (uint80, int256, uint256, uint256) {
        (
            uint80 roundID,
            int256 answer,
            uint256 startedAt,
            uint256 timeStamp /*uint80 answeredInRound*/,

        ) = dataFeed.getRoundData(roundId);
        return (roundID, answer, startedAt, timeStamp);
    }

    /*Function to get batch of roundIds*/
    function getBatch(
        uint80 lowerLimit,
        uint80 upperLimit
    ) public view returns (ReturnedData[] memory) {
        uint256 diff = upperLimit - lowerLimit;
        ReturnedData[] memory aggregators = new ReturnedData[](diff);
        for (uint80 i = 1; i <= diff; i++) {
            (
                uint80 roundID,
                int256 answer,
                uint256 startedAt,
                uint256 timeStamp
            ) = getHistoricalData(lowerLimit + i);
            ReturnedData memory temp = ReturnedData({
                roundID: roundID,
                answer: answer,
                startedAt: startedAt,
                timeStamp: timeStamp
            });
            aggregators[i - 1] = temp;
        }
        return aggregators;
    }

    /*Function to get round Id for startDate TimeStamp unix epoc*/
    function getStartRoundId(
        uint80 startingRoundId,
        uint80 latestRoundId,
        uint256 startTime
    ) public view returns (uint80, uint256) {
        uint80 startRoundId;
        uint256 startTimeStamp;
        for (uint80 i = startingRoundId + 1; i <= latestRoundId; i++) {
            (
                ,
                ,
                ,
                /*uint80 roundID*/
                /*int256 answer*/
                /*uint256 startedAt*/
                uint256 timeStamp
            ) = getHistoricalData(i);

            if (timeStamp >= startTime) {
                startRoundId = i;
                startTimeStamp = timeStamp;
                break;
            }
        }
        return (startRoundId, startTimeStamp);
    }

    /*Function to get round Id for endDate TimeStamp unix epoc*/
    function getEndRoundId(
        uint80 startingRoundId,
        uint80 latestRoundId,
        uint256 endTime
    ) public view returns (uint80) {
        uint80 endRoundId;
        for (uint80 i = startingRoundId + 1; i <= latestRoundId; i++) {
            (
                ,
                ,
                ,
                /*uint80 roundID*/
                /*int256 answer*/
                /*uint256 startedAt*/
                uint256 timeStamp
            ) = getHistoricalData(i);

            if (timeStamp >= endTime) {
                endRoundId = i - 1;
                break;
            }
        }
        return endRoundId;
    }
}
