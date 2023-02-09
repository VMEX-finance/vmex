// import { BigNumber, utils } from "ethers";

require('dotenv').config();
const {deployments} = require("../dist/constants.js")
const { ethers, BigNumber, Wallet } = require("ethers");
const chai = require("chai");
const { expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
chai.use(require("chai-bignumber")());
const { getLendingPool } = require("../dist/contract-getters.js");
const {
  borrow,
  supply,
  markReserveAsCollateral,
  initTranche,
  lendingPoolPause,
} = require("../dist/protocol.js");
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
  getUserWalletData
} = require("../dist/analytics.js");
const {getAssetPrices, mintTokens} = require("../dist/utils.js")
const { RateMode } = require("../dist/interfaces.js");
const { MAINNET_ASSET_MAPPINGS } = require("../dist/constants.js");

const IERC20abi = [
  "function allowance(address owner, address spender) external view returns (uint256 remaining)",
  "function approve(address spender, uint256 value) external returns (bool success)",
  "function balanceOf(address owner) external view returns (uint256 balance)",
  "function decimals() external view returns (uint8 decimalPlaces)",
  "function name() external view returns (string memory tokenName)",
  "function symbol() external view returns (string memory tokenSymbol)",
  "function totalSupply() external view returns (uint256 totalTokensIssued)",
  "function transfer(address to, uint256 value) external returns (bool success)",
  "function transferFrom(address from, address to, uint256 value) external returns (bool success)",
  "function deposit() public payable",
  "function withdraw(uint wad) public",
];

const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const UNISWAP_ROUTER_ABI = [
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"
]

const network = "goerli";

const WETHaddr = deployments["WETH"][network] && network!="localhost" ? deployments["WETH"][network].address : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDCaddr = deployments["USDC"][network] && network!="localhost" ? deployments["USDC"][network].address : "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

let provider, temp, owner;
  if(network=="localhost"){
    provider = "http://127.0.0.1:8545";
    temp = provider.getSigner(2);
    owner = provider.getSigner(0);
  }
  else if (network=="goerli"){
    const myprovider = new ethers.providers.AlchemyProvider(network, process.env.ALCHEMY_KEY);
    temp = Wallet.fromMnemonic(process.env.MNEMONIC,`m/44'/60'/0'/0/0`).connect(myprovider); //0th signer
    owner = temp;
    provider = 'https://eth-goerli.public.blastapi.io';
  }

describe("Analytics", () => {
  var mytranche;

  it("0 - test get wallet data", async () => {
    const dat = await getUserWalletData({
      user: await temp.getAddress(),
      network: network,
      test: true,
    });

    // console.log(dat)
  });

  it("1 - test get tranche data", async () => {
    const dat = await getUserTrancheData({
      tranche: "0",
      user: await temp.getAddress(),
      network: network,
      test: true,
    });

    console.log(JSON.stringify(dat))
  });

  it("2 - test get prices", async () => {
    const dat = await getAssetPrices({
      assets: ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
      network: network,
      test: true,
    });

    console.log(JSON.stringify(dat))
  });

});

describe("CustomTest", () => {
  // it("1- mint AAVE", async () => {
  //   await mintTokens({
  //     token: "AAVE",
  //     signer: owner,
  //     network: network,
  //     providerRpc: provider
  //   })
  // })
  it("5 - should test the protocol supply function", async () => {
    
    const tx = await supply(
      {
        underlying: "AAVE",
        trancheId: 21,
        amount: "2.0",
        signer: owner,
        network: network,
        isMax: false,
        test: true,
        providerRpc: provider,
      },
      () => {
        return true;
      }
    )
    await tx.wait();  // wait 1 network confirmation
    console.log("tx: ",tx);

  });
});

describe("Tranche creation - end-to-end test", () => {
  it("1 - init reserves in this tranche", async () => {
    let assets0 = ["AAVE", "DAI"];
    let reserveFactors0 = [];
    let canBorrow0 = [];
    let canBeCollateral0 = [];
    for (let i = 0; i < assets0.length; i++) {
      reserveFactors0.push("1000");
      canBorrow0.push(true);
      canBeCollateral0.push(true);
    }
    await initTranche(
      {
        name: "New test tranche",
        whitelisted: [await temp.getAddress()],
        blacklisted: [],
        assetAddresses: assets0,
        reserveFactors: reserveFactors0,
        canBorrow: canBorrow0,
        canBeCollateral: canBeCollateral0,
        admin: temp,
        treasuryAddress: "0x0000000000000000000000000000000000000000",
        incentivesController: "0x0000000000000000000000000000000000000000",
        network: network,
        test: true
      }
    )
  });


  // initTranche
});

describe("Supply", () => { //this assumes you already have funds in your wallet
  // it("0 - total tranches is correct", async () => {
  //   const totalTranches = await getTotalTranches({ network: network, providerRpc: provider });
  //   expect(totalTranches >= 3, "Incorrect number of tranches");
  // });

  // it("1 - signer should receive 3 WETH so he can transact for LP tokens", async () => {
  //   const WETH = new ethers.Contract(WETHaddr, IERC20abi, owner);
  //   await WETH.connect(owner).deposit({
  //     value: ethers.utils.parseEther("3.0"),
  //   });
  //   expect(await WETH.balanceOf(await owner.getAddress())).to.be.above(
  //     ethers.utils.parseEther("1.0")
  //   );
  // });

  //   it("2 - should test the approveUnderlying util", async () => {
  //     let lendingPool = await getLendingPoolImpl(owner, network);
  //     await approveUnderlying(
  //       owner,
  //       ethers.utils.parseEther("3.0"),
  //       WETHaddr,
  //       lendingPool.address
  //     );
  //   });

  it("3 - should test lendingPoolSetPause() function", async () => {
    expect(
      await lendingPoolPause({
        approvedSigner: owner,
        setPause: false,
        network: network,
        tranche: 0,
        test: true,
        providerRpc: provider
      })
    ).to.be.false;
  });

  it("4 - should test whether the lending Pool is paused or not", async () => {
    let lendingPool = await getLendingPool({
      signer: owner,
      network: network,
      providerRpc: provider
    });
    expect(await lendingPool.paused(0)).to.be.false;
  });

  it("5 - should test the protocol supply function", async () => {
    await supply(
      {
        underlying: "WETH",
        trancheId: 0,
        amount: "2.0",
        signer: owner,
        network: network,
        isMax: false,
        test: true,
        providerRpc: provider,
      },
      () => {
        return true;
      }
    )
  });

  // it("6 - should test that the user has a non-zero amount (ETH) in totalCollateral", async () => {
  //   let { totalCollateralETH } = await getUserTrancheData({
  //     user: await owner.getAddress(),
  //     tranche: 0,
  //     network: network,
  //     test: true,
  //     providerRpc: provider,
  //   });
  //   expect(totalCollateralETH).to.be.above(ethers.utils.parseEther("1.0"));
  // });

  // it("7.1 - call get all markets to populate the cache", async () => {
  //   const marketsData = await getAllMarketsData({
  //     network: network,
  //     test: true,
  //   });
  // });

  // it("7.2 - test that the protocol has non zero TVL", async () => {
  //   let protocolData = await getProtocolData({
  //     network: network,
  //     test: true,
  //   });
  //   expect(protocolData.tvl).to.be.above(ethers.utils.parseEther("1.0"));
  //   expect(protocolData.totalSupplied).to.be.above(ethers.utils.parseEther("1.0"));
  // });
});

describe("Borrow - end-to-end test", () => {
  let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const temp = provider.getSigner(0);
  const tranche = 0;

  it("1 - should give temp 10 WETH", async () => {
    const { suppliedAssetData } = await getUserTrancheData({
      user: await temp.getAddress(),
      tranche: 0,
      network: network,
      test: true,
    });

    const WETH = new ethers.Contract(WETHaddr, IERC20abi, temp);
    await WETH.connect(temp).deposit({
      value: ethers.utils.parseEther("10.0"),
    });
    await WETH.approve(UNISWAP_ROUTER_ADDRESS, ethers.utils.parseEther("5.0"));
    console.log("weth balance", (await WETH.balanceOf(await temp.getAddress())).toString());
    expect(await WETH.balanceOf(await temp.getAddress())).to.be.above(
      ethers.utils.parseEther("4.0")
    );
  });

  it("2 - should swap for USDC with UNISWAP", async () => {
    var path = [WETHaddr, USDCaddr];
    var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
    const USDC = new ethers.Contract(USDCaddr, IERC20abi, temp);

    const UNISWAP = new ethers.Contract(
      UNISWAP_ROUTER_ADDRESS,
      UNISWAP_ROUTER_ABI,
      temp
    );
    await UNISWAP.swapExactETHForTokens(
      ethers.utils.parseUnits("100", 6), // usdc has 6 decimals
      path,
      await temp.getAddress(),
      deadline,
      { value: ethers.utils.parseEther("3"), gasLimit: "8000000" }
    );
    expect(await USDC.balanceOf(await temp.getAddress())).to.be.above(
      ethers.utils.parseUnits("100", 6)
    );

    const { suppliedAssetData } = await getUserTrancheData({
      user: await temp.getAddress(),
      tranche: 0,
      network: network,
      test: true,
    });
  });

  it("4 - should supply USDC tokens for aTokens with fn supply()", async () => {
    USDC = new ethers.Contract(USDCaddr, IERC20abi, temp);
    const userBalance = await USDC.balanceOf(await temp.getAddress());
    const amountToDepositT1 = userBalance.div(ethers.BigNumber.from(5));
    const amountToDepositT0 = userBalance.sub(amountToDepositT1);
    await supply(
      {
        underlying: USDCaddr,
        trancheId: 0,
        amount: ethers.utils.formatUnits(amountToDepositT0, 6),
        signer: temp,
        network: network,
        test: true,
      }
    )
    await supply(
      {
        underlying: USDCaddr,
        trancheId: 1,
        amount: ethers.utils.formatUnits(amountToDepositT1, 6),
        signer: temp,
        network: network,
        test: true,
      }
    )
    const { suppliedAssetData } = await getUserTrancheData({
      user: await temp.getAddress(),
      tranche: 0,
      network: network,
      test: true,
    });

    // assert(suppliedAssetData.length == 1, "suppliedAssetData does not have correct length. expected=1, got=" + suppliedAssetData.length);
    expect(suppliedAssetData[0].asset).to.be.eq(USDCaddr);
    expect(suppliedAssetData[0].tranche).to.be.eq(0);
    expect(suppliedAssetData[0].amount).to.be.above(0);
    expect(suppliedAssetData[0].isCollateral).to.be.equal(true);

    // expect(suppliedAssetData[1].asset).to.be.eq(USDCaddr);
    // expect(suppliedAssetData[1].tranche).to.be.eq(1);
    // expect(suppliedAssetData[1].amount).to.be.above(0);
    // expect(suppliedAssetData[1].isCollateral).to.be.equal(true);
  });

  it("5 - should mark supplied asset for collateral with fn markReserveAsCollateral", async () => {
    markReserveAsCollateral(
      {
        signer: temp,
        network: network,
        asset: USDCaddr,
        trancheId: tranche,
        useAsCollateral: true,
        test: true
      },
      () => {
        return true;
      }
    );
  });

  it("6 - should test that the user has a non-zero amount (ETH) in totalCollateral", async () => {
    let { totalCollateralETH, availableBorrowsETH } = await getUserTrancheData({
      user: await temp.getAddress(),
      tranche: tranche,
      network: network,
      test: true,
    });
    expect(totalCollateralETH).to.be.above(ethers.utils.parseEther("0"));
  });

  it("7 - should test borrowing WETH with borrow() fn", async () => {
    const WETHContract = new ethers.Contract(WETHaddr, IERC20abi, temp);
    let originalBalance = await WETHContract.balanceOf(await temp.getAddress());

    await borrow({
      underlying: WETHaddr,
      trancheId: tranche,
      amount: "0.1",
      signer: temp,
      network: network,
      test: true,
    });

    expect(await WETHContract.balanceOf(await temp.getAddress())).to.be.above(
      originalBalance
    );

    const userAccountData = await getUserTrancheData({
      user: await temp.getAddress(),
      tranche: tranche,
      network: network,
      test: true,
    });

    expect(userAccountData.totalCollateralETH).to.be.gte(
      ethers.utils.parseEther("0.1")
    );
    expect(userAccountData.totalDebtETH).to.be.above(0);
    expect(userAccountData.totalDebtETH).to.be.above(
      ethers.utils.parseEther("0")
    );
    expect(userAccountData.healthFactor).to.be.above(
      ethers.utils.parseEther("1")
    );
  });
//deprecated protocol sdk functions
  // it("8 - supply some more tokens and check user/tranche data", async () => {
  //   await supply(
  //     {
  //       underlying: WETHaddr,
  //       trancheId: tranche,
  //       amount: "0.5",
  //       signer: temp,
  //       network: network,
  //       test: true,
  //     }
  //   )
    

    // const { suppliedAssetData, borrowedAssetData } = await getUserTrancheData({
    //   user: await temp.getAddress(),
    //   tranche: tranche,
    //   network: network,
    //   test: true,
    // });

    // suppliedAssetData.map((assetData) => {
    //   expect(assetData.amount).to.be.above(0);
    //   expect(assetData.tranche).to.be.equal(tranche);
    //   expect(assetData.isCollateral).to.be.equal(true);
    // });

    // assert(
    //   borrowedAssetData.length >= 1,
    //   "borrowedAssetData does not have correct length. expected=1, got=" +
    //     suppliedAssetData.length
    // );
    // expect(borrowedAssetData[0].amount).to.be.above(0);
  // });

  // it("9 - test get tranche asset data", async () => {
  //   const trancheAssetData = await getTrancheAssetData({
  //     asset: WETHaddr,
  //     tranche: tranche,
  //     network: network,
  //     test: true,
  //   });

  //   expect(trancheAssetData.ltv).to.be.above(0);
  //   expect(trancheAssetData.liquidationThreshold).to.be.above(0);
  //   expect(trancheAssetData.liquidationPenalty).to.be.above(0);
  //   expect(trancheAssetData.canBeCollateral).to.be.eq(true);
  //   expect(trancheAssetData.canBeBorrowed).to.be.eq(true);
  //   expect(trancheAssetData.totalSupplied).to.be.above(0);
  //   expect(trancheAssetData.utilization).to.be.above(0);
  //   expect(trancheAssetData.totalBorrowed).to.be.above(0);
  //   expect(trancheAssetData.strategyAddress).to.be.eq(ethers.BigNumber.from(0));
  //   expect(trancheAssetData.adminFee).to.be.above(0);
  //   expect(trancheAssetData.platformFee).to.be.above(0);
  // });

  // it("10 - test get tranche data", async () => {
  //   const trancheData = await getTrancheData({
  //     tranche: 0,
  //     network: network,
  //     test: true,
  //   });

  //   expect(trancheData.id).to.be.eq(0);
  //   expect(trancheData.name).to.be.eq("Vmex tranche 0");
  //   expect(trancheData.assets.length).to.be.eq(19);
  //   expect(trancheData.tvl).to.be.above(0);
  //   expect(trancheData.totalSupplied).to.be.above(0);
  //   expect(trancheData.totalBorrowed).to.be.above(0);
  //   expect(trancheData.availableLiquidity).to.be.above(0);
  //   expect(trancheData.utilization).to.be.above(0);
  // });
  // it("11 - test get all tranches data", async () => {
  //   const tranchesData = await getAllTrancheData({
  //     network: network,
  //     test: true,
  //   });

  //   console.log("number of tranches: ", tranchesData.length);
  //   // assert(tranchesData.length == 2,
  //   //   "tranchesData does not have correct length. expected=2, got="
  //   //   + tranchesData.length);

  //   expect(tranchesData[0].id).to.be.eq(0);
  //   expect(tranchesData[0].name).to.be.eq("Vmex tranche 0");
  //   expect(tranchesData[0].assets.length).to.be.eq(19);
  //   expect(tranchesData[0].tvl).to.be.above(0);
  //   expect(tranchesData[0].totalSupplied).to.be.above(0);
  //   expect(tranchesData[0].totalBorrowed).to.be.above(0);
  //   expect(tranchesData[0].availableLiquidity).to.be.above(0);
  //   expect(tranchesData[0].utilization).to.be.above(0);

  //   expect(tranchesData[1].id).to.be.eq(1);
  //   expect(tranchesData[1].name).to.be.eq("Vmex tranche 1");
  //   expect(tranchesData[1].assets.length).to.be.eq(33);
  //   expect(tranchesData[1].tvl).to.be.above(0);
  //   expect(tranchesData[1].totalSupplied).to.be.above(0);
  //   expect(tranchesData[1].totalBorrowed).to.be.eq(0);
  //   expect(tranchesData[1].availableLiquidity).to.be.above(0);
  //   expect(tranchesData[1].utilization).to.be.eq(0);
  // });
});
