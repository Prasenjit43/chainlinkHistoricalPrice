const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(process.env.GOERLI_URL);
const wallet = new ethers.Wallet(process.env.GOERLI_PRIVATE_KEY);
const signer = wallet.connect(provider);


module.exports = {
    providers: function () {
        return {
            provider,
            signer
          };
    },

}