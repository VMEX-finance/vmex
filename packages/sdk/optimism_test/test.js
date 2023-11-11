// import { BigNumber, utils } from "ethers";

require("dotenv").config();
const { deployments } = require("../dist/constants.js");
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
} = require("../dist/protocol.js");

const { isLocalhost, getAssetPrices } = require("../dist/utils.js");
const {
  getUserTrancheData,
  getTrancheAssetData,
  getUserSummaryData,
  getTrancheData,
  getAllTrancheData,
  getProtocolData,
  getTopAssets,
  getAllMarketsData,
  getTotalTranches,
  getUserWalletData,
} = require("../dist/analytics.js");

const network = process.env.NETWORK;

let providerRpc, provider, temp, owner;
if (isLocalhost(network)) {
  providerRpc = "http://127.0.0.1:8545";
  provider = new ethers.providers.JsonRpcProvider(providerRpc);
  temp = provider.getSigner(2);
  owner = provider.getSigner(0);
} else {
  let key;
  if (network == "goerli") {
    key = process.env.GOERLI_ALCHEMY_KEY;
    providerRpc = "https://eth-goerli.public.blastapi.io";
  }
  if (network == "sepolia") {
    key = process.env.SEPOLIA_ALCHEMY_KEY;
    providerRpc = `https://eth-sepolia.g.alchemy.com/v2/${key}`;
  }
  if (network == "optimism") {
    key = process.env.OP_ALCHEMY_KEY;
    providerRpc = `https://opt-mainnet.g.alchemy.com/v2/${key}`;
  }
  if (network == "base") {
    key = process.env.BASE_ALCHEMY_KEY;
    providerRpc = `https://base-mainnet.g.alchemy.com/v2/${key}`;
  }
  if (network == "arbitrum") {
    key = process.env.ARBITRUM_ALCHEMY_KEY;
    providerRpc = `https://arb-mainnet.g.alchemy.com/v2/${key}`;
  }
  const myprovider = new ethers.providers.JsonRpcProvider(providerRpc);
  temp = Wallet.fromMnemonic(process.env.MNEMONIC, `m/44'/60'/0'/0/0`).connect(
    myprovider
  ); //0th signer
  owner = temp;
}

describe("WETHgateway", () => {
  it("Try depositing 0.005 ETH", async () => {
    const dat = await supply(
      {
        underlying: "ETH",
        trancheId: 0,
        amount: "0.005",
        signer: owner,
        network: network,
        isMax: false,
        test: false,
        providerRpc: providerRpc,
        collateral: true,
      },
      () => {
        return true;
      }
    );
    dat.wait(1);

    console.log("finished supplying: ", dat);
  });

  // it("Set user reserve as collateral", async () => {
  //   const dat = await markReserveAsCollateral(
  //     {
  //       asset: "ETH",
  //       trancheId: 1,
  //       signer: owner,
  //       network: network,
  //       test: false,
  //       providerRpc: providerRpc,
  //       useAsCollateral: true
  //     },
  //     () => {
  //       return true;
  //     }
  //   );
  //   dat.wait(1)

  //   console.log("finished setting as collateral: ");
  // });
  // it("Try borrowing 0.0005 ETH", async () => {
  //   const tx = await borrow(
  //     {
  //       underlying: "ETH",
  //       trancheId: 1,
  //       amount: "0.0005",
  //       signer: owner,
  //       network: network,
  //       isMax: false,
  //       test: false,
  //       providerRpc: providerRpc
  //     }
  //   );
  //   tx.wait(1)

  //   console.log("finished borrowing: ");

  // });
  // it("Try repaying max: 0.005 ETH", async () => {
  //   const tx = await repay(
  //     {
  //       asset: "ETH",
  //       trancheId: 1,
  //       amount: "0.0000",
  //       signer: owner,
  //       network: network,
  //       isMax: true,
  //       test: false,
  //       providerRpc: providerRpc
  //     }
  //   );
  //   tx.wait(1)
  // });

  // it("Try withdrawing all", async () => {
  //   const tx = await withdraw(
  //     {
  //       asset: "ETH",
  //       trancheId: 1,
  //       amount: "0.0000",
  //       signer: owner,
  //       network: network,
  //       isMax: true,
  //       test: false,
  //       providerRpc: providerRpc
  //     },
  //     () => {
  //       return true;
  //     }
  //   );
  //   tx.wait(1)
  // });
});

describe("getPrices", () => {
  it("Try getting prices of weth and btc", async () => {
    const dat = await getAssetPrices({
      assets: ["USDbC"],
      network: network,
      test: false,
      providerRpc: providerRpc,
    });

    console.log(dat);
  });
});
