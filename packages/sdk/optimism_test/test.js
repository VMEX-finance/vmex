// import { BigNumber, utils } from "ethers";

require("dotenv").config();
const { deployments } = require("../dist/src.ts/constants.js");
const { ethers, BigNumber, Wallet } = require("ethers");
const chai = require("chai");
const { expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
chai.use(require("chai-bignumber")());
const {
  borrow,
  supply,
  repay,
  withdraw,
  markReserveAsCollateral,
  initTranche,
  lendingPoolPause,
  configureExistingTranche,
} = require("../dist/src.ts/protocol.js");

const {
  isLocalhost,
} = require("../dist/src.ts/utils.js");

const network = process.env.NETWORK;

let providerRpc, provider, temp, owner;
if (isLocalhost(network)) {
  providerRpc = "http://127.0.0.1:8545";
  provider = new ethers.providers.JsonRpcProvider(providerRpc);
  temp = provider.getSigner(2);
  owner = provider.getSigner(0);
} else {
  const myprovider = new ethers.providers.AlchemyProvider(
    network,
    process.env.ALCHEMY_KEY
  );
  temp = Wallet.fromMnemonic(process.env.MNEMONIC, `m/44'/60'/0'/0/0`).connect(
    myprovider
  ); //0th signer
  owner = temp;
  if (network == "goerli") providerRpc = "https://eth-goerli.public.blastapi.io";
  if (network == "optimism") providerRpc = "https://mainnet.optimism.io";
}

describe("WETHgateway", () => {
  it("Try depositing 0.005 ETH", async () => {
    const dat = await supply(
      {
        underlying: "ETH",
        trancheId: 1,
        amount: "0.005",
        signer: owner,
        network: network,
        isMax: true,
        test: false,
        providerRpc: providerRpc,
        collateral: true
      },
      () => {
        return true;
      }
    );
    dat.wait(1)

    console.log("finished supplying: ",dat);
  });

  it("Set user reserve as collateral", async () => {
    const dat = await markReserveAsCollateral(
      {
        asset: "ETH",
        trancheId: 1,
        signer: owner,
        network: network,
        test: false,
        providerRpc: providerRpc,
        useAsCollateral: true
      },
      () => {
        return true;
      }
    );
    dat.wait(1)

    console.log("finished setting as collateral: ");
  });
  it("Try borrowing 0.0005 ETH", async () => {
    const tx = await borrow(
      {
        underlying: "ETH",
        trancheId: 1,
        amount: "0.0005",
        signer: owner,
        network: network,
        isMax: false,
        test: false,
        providerRpc: providerRpc
      }
    );
    tx.wait(1)

    console.log("finished borrowing: ");

  });
  it("Try repaying max: 0.005 ETH", async () => {
    const tx = await repay(
      {
        asset: "ETH",
        trancheId: 1,
        amount: "0.0000",
        signer: owner,
        network: network,
        isMax: true,
        test: false,
        providerRpc: providerRpc
      }
    );
    tx.wait(1)
  });


  it("Try withdrawing all", async () => {
    const tx = await withdraw(
      {
        asset: "ETH",
        trancheId: 1,
        amount: "0.0000",
        signer: owner,
        network: network,
        isMax: true,
        test: false,
        providerRpc: providerRpc
      },
      () => {
        return true;
      }
    );
    tx.wait(1)
  });
});
