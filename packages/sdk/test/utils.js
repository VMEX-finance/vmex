const { ethers } = require("ethers");
const chai = require("chai");
const { expect } = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const {
    getAllTrancheNames
} = require("../dist/utils");


describe("Utils - unit tests", () => {
    it("1 - should be able to get number of tranches without using a signer", async () => {
        const data = await getAllTrancheNames({network: 'localhost'});
        console.log(data);
    })
})
