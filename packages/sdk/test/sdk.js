// import { BigNumber, utils } from "ethers";

const { ethers } = require("ethers");
const chai = require("chai");
const { expect } = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
chai.use(require('chai-bignumber')());
// require("@nomicfoundation/hardhat-chai-matchers");
const {
    approveUnderlying,
    getLendingPoolImpl,
    lendingPoolPause,
    getUserSingleReserveData,
    getLendingPoolReservesList,
    getReserveData
} = require("../dist/src.ts");
const {
    borrow,
    marketReserveAsCollateral,
    withdraw,
    repay,
    swapBorrowRateMode,
    supply,
    markReserveAsCollateral,
    claimTrancheId,
    initTranche
} = require("../dist/protocol.js");
const {
    userAggregatedTrancheData, getTVL, getTrancheTVL, getTotalTranches
} = require("../dist/analytics.js");
const {TOKEN_ADDR_MAINNET} = require("../dist/constants.js");

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
    "function withdraw(uint wad) public"
];

const TricryptoDeposit = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
const TricryptoABI = require("@vmex/contracts/localhost_tests/abis/tricrypto.json");
const Crv3Crypto = "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff";

const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const UNISWAP_ROUTER_ABI = require("@vmex/contracts/localhost_tests/abis/uniswapAbi.json")
const USDCaddr = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const network = "localhost";

describe("Tranche creation - end-to-end test", () => {
    let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const temp = provider.getSigner(2);
    var mytranche;

    it("1 - claim tranche", async () => {
        mytranche = (await getTotalTranches({
            network: network
        })).toString();
        expect(await claimTrancheId({
            name: "New test tranche",
            admin: temp,
            network: network
        }, () => { return true }
        )).to.be.true;
        //can't do this check since state doesn't revert so this will keep increasing
        // expect(await getTotalTranches({
        //     network: 'localhost'
        // })).to.be.bignumber.equals(3);
        console.log("My tranche num: ",mytranche)
    });

    it("2 - init reserves in this tranche", async () => {
        let assets0 = [
            TOKEN_ADDR_MAINNET.AAVE,
            TOKEN_ADDR_MAINNET.DAI
        ]
        let reserveFactors0 = [];
        let forceDisabledBorrow0 = [];
        let forceDisabledCollateral0 = [];
        for(let i =0;i<assets0.length;i++){
            reserveFactors0.push("1000")
            forceDisabledBorrow0.push(false);
            forceDisabledCollateral0.push(false);
        }
        expect(await initTranche({
            assetAddresses: assets0,
            reserveFactors: reserveFactors0,
            forceDisabledBorrow: forceDisabledBorrow0,
            forceDisabledCollateral: forceDisabledCollateral0,
            admin: temp,
            treasuryAddress: "0x0000000000000000000000000000000000000000",
            incentivesController: "0x0000000000000000000000000000000000000000",
            trancheId: mytranche,
            network: network
        }, () => { return true }
        )).to.be.true;
        
    });
    // initTranche
})

describe("Supply - end-to-end test", () => {
    let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const owner = provider.getSigner();

    it("1 - signer should receive 3 WETH so he can transact for LP tokens", async () => {
        const WETH = new ethers.Contract(WETHadd, IERC20abi, owner);
        await WETH.connect(owner).deposit({ value: ethers.utils.parseEther("3.0")});
        expect(await WETH.balanceOf(await owner.getAddress())).to.be.above(ethers.utils.parseEther("1.0"))
    });

    it("2 - should test the approveUnderlying util", async () => {
        let lendingPool = await getLendingPoolImpl(owner, network);
        await approveUnderlying(owner, ethers.utils.parseEther("3.0"), WETHadd, lendingPool.address);
    })

    it("3 - should test lendingPoolSetPause() function", async () => {
        expect(await lendingPoolPause(owner, false, 'localhost', 0)).to.be.false;

    })

    it("4 - should test whether the lending Pool is paused or not", async () => {
        let lendingPool = await getLendingPoolImpl(owner, 'localhost');
        expect(await lendingPool.paused(0)).to.be.false;
    })

    it("5 - should test the protocol supply function", async () => {
        expect(await supply({
            underlying: WETHadd,
            trancheId: 0,
            amount: '2.0',
            signer: owner,
            network: 'localhost',
            test: true
        }, () => { return true })).to.be.true;

    })

    it("6 - should test that the user has a non-zero amount (ETH) in totalCollateral", async () => {
        let { totalCollateralETH } = await userAggregatedTrancheData({
            signer: owner,
            tranche: 0,
            network: network
        });
        expect(totalCollateralETH).to.be.above(ethers.utils.parseEther("1.0"));
    })

    it("7 - test that tranche 0 has non zero TVL", async () => {
        let trancheTvl0 = await getTrancheTVL({
            tranche: 0,
            network: network
        });
        console.log("tranche 0 tvl is", trancheTvl0.toString());
        expect(trancheTvl0).to.be.above(ethers.utils.parseEther("1.0"));
    })

    it("8 - test tranche 1 has zero TVL", async () => {
        let trancheTvl1 = await getTrancheTVL({
            tranche: 1,
            network: network
        });

        expect(trancheTvl1).to.be.equal(0);
    })

    it("9 - test that the protocol has non zero TVL", async () => {
        let protocolTvl = await getTVL({
            network: network,
	    test: true
        });
	console.log(protocolTvl);
        expect(protocolTvl).to.be.above(ethers.utils.parseEther("1.0"));
    })
})

describe("Borrow - end-to-end test", () => {
    let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const temp = provider.getSigner(1);

    it("1 - should give temp 1 WETH", async () => {
        const WETH = new ethers.Contract(WETHadd, IERC20abi, temp);
        await WETH.connect(temp).deposit({ value: ethers.utils.parseEther("2.0")});
        await WETH.approve(UNISWAP_ROUTER_ADDRESS, ethers.utils.parseEther("1.0"));
        expect(await WETH.balanceOf(await temp.getAddress())).to.be.above(ethers.utils.parseEther("1.0"))
    })

    it("2 - should swap for USDC with UNISWAP", async () => {
        var path = [WETHadd, USDCaddr];
        var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
        const USDC = new ethers.Contract(USDCaddr, IERC20abi, temp);

        const UNISWAP = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, temp);
        await UNISWAP.swapExactETHForTokens(1, path, await temp.getAddress(), deadline, { value: ethers.utils.parseEther("0.5"), gasLimit: "8000000"} );
        expect(await USDC.balanceOf(await temp.getAddress())).to.be.above(ethers.utils.parseEther("0"));
    })


    it("4 - should supply USDC tokens for aTokens with fn supply()", async () => {
        USDC = new ethers.Contract(USDCaddr, IERC20abi, temp)
        expect(await supply({
            underlying: USDCaddr,
            trancheId: 0,
            amount: ethers.utils.formatUnits(await USDC.balanceOf(await temp.getAddress())),
            signer: temp,
            network: network,
            test: true
        }, () => { return true })).to.be.true;
    })

    it("5 - should mark supplied asset for collateral with fn markReserveAsCollateral", async () => {
        markReserveAsCollateral({
            signer: temp,
            network: network,
            asset: USDCaddr,
            trancheId: 0,
            useAsCollateral: true
        }, () => { return true });
    })

    it("6 - should test that the user has a non-zero amount (ETH) in totalCollateral", async () => {
        let { totalCollateralETH, availableBorrowsETH } = await userAggregatedTrancheData({
            signer: temp,
            tranche: 0,
            network: network
        });
        console.log(totalCollateralETH, availableBorrowsETH);
        expect(totalCollateralETH).to.be.above(ethers.utils.parseEther("0"));
    })

    it("7 - should test borrowing WETH with borrow() fn", async () => {
        const WETHContract = new ethers.Contract(WETHadd, IERC20abi, temp);
        let originalBalance = await WETHContract.balanceOf(await temp.getAddress());
        let { availableBorrowsETH } = await userAggregatedTrancheData({
            signer: temp,
            tranche: 0,
            network: network
        })

        await borrow({
            underlying: WETHadd,
            trancheId: 0,
            amount: ethers.utils.parseEther("0.1"),
            interestRateMode: 1,
            signer: temp,
            network: network,
            test: true
        })

        expect(await WETHContract.balanceOf(await temp.getAddress())).to.be.above(originalBalance);
    })




})
