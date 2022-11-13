// import { BigNumber, utils } from "ethers";

const { ethers } = require("ethers");
const chai = require("chai");
const { expect } = require("chai");
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
  getUserAggregatedTrancheData,
  getTVL,
  getTrancheTVL,
  getTotalTranches,
  getUserInfoForAsset,
  getUserSuppliedForTranche,
  getUserBorrowedForTranche,
} = require("../dist/analytics.js");
const { RateMode } = require("../dist/interfaces.js");
const { TOKEN_ADDR_MAINNET } = require("../dist/constants.js");

const WETHadd = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
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
    console.log("My tranche num: ", mytranche);
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
    console.log(totalTranches);
    expect(totalTranches == 2, "Incorrect number of tranches");
  });

  it("1 - signer should receive 3 WETH so he can transact for LP tokens", async () => {
    const WETH = new ethers.Contract(WETHadd, IERC20abi, owner);
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
  //       WETHadd,
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
          underlying: WETHadd,
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
    let { totalCollateralETH } = await getUserAggregatedTrancheData({
      user: owner.getAddress(),
      tranche: 0,
      network: network,
      test: true,
    });
    expect(totalCollateralETH).to.be.above(ethers.utils.parseEther("1.0"));
  });

  it("7 - test that tranche 0 has non zero TVL", async () => {
    let trancheTvl0 = await getTrancheTVL({
      tranche: 0,
      network: network,
      test: true,
    });
    console.log("tranche 0 tvl is", trancheTvl0.toString());
    expect(trancheTvl0).to.be.above(ethers.utils.parseEther("1.0"));
  });

  it("8 - test tranche 1 has zero TVL", async () => {
    let trancheTvl1 = await getTrancheTVL({
      tranche: 1,
      network: network,
      test: true,
    });

    expect(trancheTvl1).to.be.equal(0);
  });

  it("9 - test that the protocol has non zero TVL", async () => {
    let protocolTvl = await getTVL({
      network: network,
      test: true,
    });
    expect(protocolTvl).to.be.above(ethers.utils.parseEther("1.0"));
  });
});

describe("Borrow - end-to-end test", () => {
  let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const temp = provider.getSigner(1);
  const tranche = 0;

  it("1 - should give temp 1 WETH", async () => {
    const WETH = new ethers.Contract(WETHadd, IERC20abi, temp);
    await WETH.connect(temp).deposit({ value: ethers.utils.parseEther("5.0") });
    await WETH.approve(UNISWAP_ROUTER_ADDRESS, ethers.utils.parseEther("1.0"));
    expect(await WETH.balanceOf(await temp.getAddress())).to.be.above(
      ethers.utils.parseEther("3.0")
    );
  });

  it("2 - should swap for USDC with UNISWAP", async () => {
    var path = [WETHadd, USDCaddr];
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
      { value: ethers.utils.parseEther("1.5"), gasLimit: "8000000" }
    );
    expect(await USDC.balanceOf(await temp.getAddress())).to.be.above(
      ethers.utils.parseUnits("100", 6)
    );
  });

  it("4 - should supply USDC tokens for aTokens with fn supply()", async () => {
    USDC = new ethers.Contract(USDCaddr, IERC20abi, temp);
    const userBalance = await USDC.balanceOf(await temp.getAddress());
    expect(
      await supply(
        {
          underlying: USDCaddr,
          trancheId: tranche,
          amount: ethers.utils.formatUnits(userBalance),
          signer: temp,
          network: network,
          test: true,
        },
        () => {
          return true;
        }
      )
    ).to.be.true;
    const allBalances = await getUserSuppliedForTranche({
      user: await temp.getAddress(),
      tranche: tranche,
      network: network,
    });

    expect(allBalances[0].currentATokenBalance).to.be.above(0);
    expect(allBalances[0].usageAsCollateralEnabled).to.be.equal(true);
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
    let { totalCollateralETH, availableBorrowsETH } =
      await getUserAggregatedTrancheData({
        user: await temp.getAddress(),
        tranche: tranche,
        network: network,
      });
    console.log(totalCollateralETH, availableBorrowsETH);
    expect(totalCollateralETH).to.be.above(ethers.utils.parseEther("0"));
  });

  it("7 - should test borrowing WETH with borrow() fn", async () => {
    const WETHContract = new ethers.Contract(WETHadd, IERC20abi, temp);
    let originalBalance = await WETHContract.balanceOf(await temp.getAddress());
    let { availableBorrowsETH } = await getUserAggregatedTrancheData({
      user: await temp.getAddress(),
      tranche: tranche,
      network: network,
    });

    await borrow({
      underlying: WETHadd,
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

    const userReserveDataWETH = await getUserInfoForAsset({
      underlying: WETHadd, // borrows WETH, so WETH asset will show debt
      tranche: tranche,
      user: await temp.getAddress(),
      network: network,
    });

    expect(userReserveDataWETH.currentVariableDebt).to.be.above(0);

    const userAccountData = await getUserAggregatedTrancheData({
      user: await temp.getAddress(),
      tranche: tranche,
      network: network,
    });

    expect(userAccountData.totalCollateralETH).to.be.gte(
      ethers.utils.parseEther("0.1")
    );
    expect(userAccountData.totalDebtETH).to.be.above(
      ethers.utils.parseEther("0.1")
    );
    expect(userAccountData.healthFactor).to.be.above(
      ethers.utils.parseEther("1")
    );

    console.log("user t0 data", userAccountData);
  });

  it("8 - supply some more tokens and check user data", async () => {
    expect(
      await supply(
        {
          underlying: WETHadd,
          trancheId: tranche,
          amount: "1",
          signer: temp,
          network: network,
          test: true,
        },
        () => {
          return true;
        }
      )
    ).to.be.true;
    const userSupplied = await getUserSuppliedForTranche({
      user: await temp.getAddress(),
      tranche: tranche,
      network: network,
    });

    userSupplied.map((assetData) => {
      expect(assetData.currentATokenBalance).to.be.above(0);
      expect(assetData.tranche).to.be.equal(tranche);
      expect(assetData.usageAsCollateralEnabled).to.be.equal(true);
    });

    const allBorrows = await getUserBorrowedForTranche({
      user: await temp.getAddress(),
      tranche: tranche,
      network: network,
    });

    expect(allBorrows[0].currentVariableDebt).to.be.above(0);
  });
});
