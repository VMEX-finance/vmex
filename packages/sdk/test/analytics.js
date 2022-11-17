const { ethers } =  require("ethers");
const chai = require("chai");
const { expect } = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { 
    getWalletBalanceAcrossTranches,
    getTVL
} = require("../dist/src.ts/analytics");


// required functions
// total Value Locked
// Reserves $
// total supplied $ (available reserves; protocol)
// Total Borrowed $ (outstanding debt; protcool)
// # Lenders
// # Borrowers
// # Markets
// Tranche Based Analytics (top tranches)

describe("Analytics - Overview Page", () => {
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const owner = provider.getSigner();
    it("UserBalanceAcrossTranches", async () => { 
        let userBalances = await getWalletBalanceAcrossTranches({ 
            signer: owner,
            network: "localhost",
            test: true
        });
        console.log(userBalances);
    })
    it("getTVL", async () => {
        let protocolTVL = await getTVL({ network: "localhost", test: true });
        console.log(protocolTVL);
    })
   })
