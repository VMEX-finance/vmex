const { ethers } = require("hardhat");
const { expect } = require("chai");
const {
    userTrancheBalances
} = require("../dist/src.ts/analytics.js");


describe("Analytics Testing", () => {
    let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const owner = provider.getSigner();

    it("1 - userTrancheBalances ** should return tuple(address, uint256)", async () => {
        console.log(await userTrancheBalances({
            signer: owner,
            tranche: 0,
            network: "localhost"
        }));
    })
});