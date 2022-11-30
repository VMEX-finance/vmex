// import { BigNumber, utils } from "ethers";

const { ethers, BigNumber } = require("ethers");
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
  claimTrancheId,
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
  getTotalTranches
} = require("../dist/analytics.js");
const { RateMode } = require("../dist/interfaces.js");
const { TOKEN_ADDR_MAINNET } = require("../dist/constants.js");

const WETHaddr = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
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

const TricryptoDeposit = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
const TricryptoABI = require("@vmex/contracts/localhost_tests/abis/tricrypto.json");
const Crv3Crypto = "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff";

const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const UNISWAP_ROUTER_ABI = require("@vmex/contracts/localhost_tests/abis/uniswapAbi.json");
const USDCaddr = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const network = "localhost";

describe("Tranche creation - end-to-end test", () => {
  let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const temp = provider.getSigner(2);
  var mytranche;

  it("1 - claim tranche", async () => {
    mytranche = (
      await getTotalTranches({
        network: network,
      })
    ).toString();
    expect(
      await claimTrancheId(
        {
          name: "New test tranche",
          admin: temp,
          network: network,
        },
        () => {
          return true;
        }
      )
    ).to.be.true;
    //can't do this check since state doesn't revert so this will keep increasing
    // expect(await getTotalTranches({
    //     network: 'localhost'
    // })).to.be.bignumber.equals(3);
  });

  it("2 - init reserves in this tranche", async () => {
    let assets0 = [TOKEN_ADDR_MAINNET.AAVE, TOKEN_ADDR_MAINNET.DAI];
    let reserveFactors0 = [];
    let forceDisabledBorrow0 = [];
    let forceDisabledCollateral0 = [];
    for (let i = 0; i < assets0.length; i++) {
      reserveFactors0.push("1000");
      forceDisabledBorrow0.push(false);
      forceDisabledCollateral0.push(false);
    }
    expect(
      await initTranche(
        {
          assetAddresses: assets0,
          reserveFactors: reserveFactors0,
          forceDisabledBorrow: forceDisabledBorrow0,
          forceDisabledCollateral: forceDisabledCollateral0,
          admin: temp,
          treasuryAddress: "0x0000000000000000000000000000000000000000",
          incentivesController: "0x0000000000000000000000000000000000000000",
          trancheId: mytranche,
          network: network,
        },
        () => {
          return true;
        }
      )
    ).to.be.true;
  });
  // initTranche
});

describe("Supply - end-to-end test", () => {
  let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const owner = provider.getSigner(0);

  it("0 - total tranches is correct", async () => {
    const totalTranches = await getTotalTranches({ network: network });
    expect(totalTranches == 2, "Incorrect number of tranches");
  });

  it("1 - signer should receive 3 WETH so he can transact for LP tokens", async () => {
    const WETH = new ethers.Contract(WETHaddr, IERC20abi, owner);
    await WETH.connect(owner).deposit({
      value: ethers.utils.parseEther("3.0"),
    });
    expect(await WETH.balanceOf(await owner.getAddress())).to.be.above(
      ethers.utils.parseEther("1.0")
    );
  });

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
      })
    ).to.be.false;
  });

  it("4 - should test whether the lending Pool is paused or not", async () => {
    let lendingPool = await getLendingPool({
      signer: owner,
      network: network,
    });
    expect(await lendingPool.paused(0)).to.be.false;
  });

  it("5 - should test the protocol supply function", async () => {
    expect(
      await supply(
        {
          underlying: WETHaddr,
          trancheId: 0,
          amount: "2.0",
          signer: owner,
          network: network,
          test: true,
        },
        () => {
          return true;
        }
      )
    ).to.be.true;
  });

  it("6 - should test that the user has a non-zero amount (ETH) in totalCollateral", async () => {
    let { totalCollateralETH } = await getUserTrancheData({
      user: await owner.getAddress(),
      tranche: 0,
      network: network,
      test: true,
    });
    expect(totalCollateralETH).to.be.above(ethers.utils.parseEther("1.0"));
  });

  it("7.1 - call get all markets to populate the cache", async () => {
    const marketsData = await getAllMarketsData({
      network: network,
      test: true,
    });
  });

  it("7.2 - test that the protocol has non zero TVL", async () => {
    let protocolData = await getProtocolData({
      network: network,
      test: true,
    });
    expect(protocolData.tvl).to.be.above(ethers.utils.parseEther("1.0"));
    expect(protocolData.totalSupplied).to.be.above(ethers.utils.parseEther("1.0"));
  });
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
    expect(
      await supply(
        {
          underlying: USDCaddr,
          trancheId: 0,
          amount: ethers.utils.formatUnits(amountToDepositT0, 6),
          signer: temp,
          network: network,
          test: true,
        },
        () => {
          return true;
        }
      )
    ).to.be.true;
    expect(
      await supply(
        {
          underlying: USDCaddr,
          trancheId: 1,
          amount: ethers.utils.formatUnits(amountToDepositT1, 6),
          signer: temp,
          network: network,
          test: true,
        },
        () => {
          return true;
        }
      )
    ).to.be.true;
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
      amount: ethers.utils.parseEther("0.1"),
      interestRateMode: RateMode.Variable,
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
      ethers.utils.parseEther("0.1")
    );
    expect(userAccountData.healthFactor).to.be.above(
      ethers.utils.parseEther("1")
    );
  });

  it("8 - supply some more tokens and check user/tranche data", async () => {
    expect(
      await supply(
        {
          underlying: WETHaddr,
          trancheId: tranche,
          amount: "0.5",
          signer: temp,
          network: network,
          test: true,
        },
        () => {
          return true;
        }
      )
    ).to.be.true;
    const { suppliedAssetData, borrowedAssetData } = await getUserTrancheData({
      user: await temp.getAddress(),
      tranche: tranche,
      network: network,
      test: true,
    });

    suppliedAssetData.map((assetData) => {
      expect(assetData.amount).to.be.above(0);
      expect(assetData.tranche).to.be.equal(tranche);
      expect(assetData.isCollateral).to.be.equal(true);
    });

    assert(
      borrowedAssetData.length == 1,
      "borrowedAssetData does not have correct length. expected=1, got=" +
        suppliedAssetData.length
    );
    expect(borrowedAssetData[0].amount).to.be.above(0);
  });

  it("9 - test get tranche asset data", async () => {
    const trancheAssetData = await getTrancheAssetData({
      asset: WETHaddr,
      tranche: tranche,
      network: network,
      test: true,
    });

    expect(trancheAssetData.ltv).to.be.above(0);
    expect(trancheAssetData.liquidationThreshold).to.be.above(0);
    expect(trancheAssetData.liquidationPenalty).to.be.above(0);
    expect(trancheAssetData.canBeCollateral).to.be.eq(true);
    expect(trancheAssetData.canBeBorrowed).to.be.eq(true);
    expect(trancheAssetData.totalSupplied).to.be.above(0);
    expect(trancheAssetData.utilization).to.be.above(0);
    expect(trancheAssetData.totalBorrowed).to.be.above(0);
    expect(trancheAssetData.strategyAddress).to.be.eq(ethers.BigNumber.from(0));
    expect(trancheAssetData.adminFee).to.be.above(0);
    expect(trancheAssetData.platformFee).to.be.above(0);
  });

  it("10 - test get tranche data", async () => {
    const trancheData = await getTrancheData({
      tranche: 0,
      network: network,
      test: true,
    });

    expect(trancheData.id).to.be.eq(0);
    expect(trancheData.name).to.be.eq("Vmex tranche 0");
    expect(trancheData.assets.length).to.be.eq(19);
    expect(trancheData.tvl).to.be.above(0);
    expect(trancheData.totalSupplied).to.be.above(0);
    expect(trancheData.totalBorrowed).to.be.above(0);
    expect(trancheData.availableLiquidity).to.be.above(0);
    expect(trancheData.utilization).to.be.above(0);
  });
  it("11 - test get all tranches data", async () => {
    const tranchesData = await getAllTrancheData({
      network: network,
      test: true,
    });

    console.log("number of tranches: ", tranchesData.length);
    // assert(tranchesData.length == 2,
    //   "tranchesData does not have correct length. expected=2, got="
    //   + tranchesData.length);

    expect(tranchesData[0].id).to.be.eq(0);
    expect(tranchesData[0].name).to.be.eq("Vmex tranche 0");
    expect(tranchesData[0].assets.length).to.be.eq(19);
    expect(tranchesData[0].tvl).to.be.above(0);
    expect(tranchesData[0].totalSupplied).to.be.above(0);
    expect(tranchesData[0].totalBorrowed).to.be.above(0);
    expect(tranchesData[0].availableLiquidity).to.be.above(0);
    expect(tranchesData[0].utilization).to.be.above(0);

    expect(tranchesData[1].id).to.be.eq(1);
    expect(tranchesData[1].name).to.be.eq("Vmex tranche 1");
    expect(tranchesData[1].assets.length).to.be.eq(33);
    expect(tranchesData[1].tvl).to.be.above(0);
    expect(tranchesData[1].totalSupplied).to.be.above(0);
    expect(tranchesData[1].totalBorrowed).to.be.eq(0);
    expect(tranchesData[1].availableLiquidity).to.be.above(0);
    expect(tranchesData[1].utilization).to.be.eq(0);
  });

  it("12.1 - call get all markets to populate the cache", async () => {
    const marketsData = await getAllMarketsData({
      network: network,
      test: true,
    });
  });

  it("12.2 - test get protocol data", async () => {
    const protocolData = await getProtocolData({
      network: network,
      test: true,
    });

    expect(protocolData.tvl).to.be.above(0);
    expect(protocolData.totalReserves).to.be.above(0);
    expect(protocolData.totalSupplied).to.be.above(0);
    expect(protocolData.totalBorrowed).to.be.above(0);
    expect(protocolData.numTranches).to.be.eq(
      await getTotalTranches({ network: network })
    );
    expect(protocolData.topTranches[0].name).to.be.eq("Vmex tranche 0");
    expect(protocolData.topTranches[1].name).to.be.eq("Vmex tranche 1");
  });

  it("13 - test top assets", async () => {
    const topAssets = await getTopAssets({
      network: network,
      test: true
    })
    expect(topAssets.topSuppliedAssets.length).to.be.eq(33);
    expect(topAssets.topSuppliedAssets[0].asset).to.be.eq(WETHaddr);
    expect(topAssets.topSuppliedAssets[1].asset).to.be.eq(USDCaddr);
    expect(topAssets.topBorrowedAssets.length).to.be.eq(33);
    expect(topAssets.topBorrowedAssets[0].asset).to.be.eq(WETHaddr);
  });
});
