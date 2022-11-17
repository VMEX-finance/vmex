const { ethers } = require("ethers");
const chai = require("chai");
const { expect } = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const {
    getTrancheNames 
} = require("../dist");


describe("Utils - unit tests", () => {
    it("1 - should be able to get number of tranches without using a signer", async () => {
        const data = await getTrancheNames('localhost');
        console.log(data);
    })
})
