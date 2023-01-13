import hre from "hardhat";
const { ethers } = hre;
import { deployments } from "../dist/src.ts/constants";
import ILendingPool from "../artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json";
import { LendingPoolConfiguratorFactory } from "../types";
import ILendingPoolAddressesProvider from "../artifacts/contracts/interfaces/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json";

import ILendingPoolConfigurator from "../artifacts/contracts/protocol/lendingpool/LendingPoolCOnfigurator.sol/LendingPoolConfigurator.json";

const WETHadd = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const WETHabi = [
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

( async () => {
    const [ signer, emergency ] = await ethers.getSigners();
    const address = await signer.getAddress();
    const WETHContract = new ethers.Contract(WETHadd, WETHabi, signer);
    const LendingPool = new ethers.Contract(deployments.LendingPool.localhost.address, ILendingPool.abi, signer);

    let LPAddressProvider = new ethers.Contract(deployments.LendingPoolAddressesProvider.localhost.address, ILendingPoolAddressesProvider.abi, signer);

    if (LendingPool.paused()) {
        console.log('unpausing Lending Pool')
        const LendingPoolConfiguratorProxy = await LendingPoolConfiguratorFactory.connect(deployments.LendingPoolConfigurator.localhost.address, emergency);
        await LendingPoolConfiguratorProxy.setPoolPause(false, { gasLimit: "8000000"});
    }



    // if (WETHContract.balanceOf(address) < ethers.utils.parseUnits(1.0)) {
    //     console.log('depositing ETH > WETH')
    //     var options = { value: ethers.utils.parseEther("10.0"), gasLimit: "8000000" };
    //     await WETHContract.depsit(options);
    //     const balance = await WETHContract.balanceOf(address);
    //     console.log(`updating user balance, now contains ${ balance } WETH`)
    // }


    console.log("approving WETH for LendingPool deposit");
    await WETHContract.approve(LendingPool.address, ethers.utils.parseEther("5.0"));
    await LendingPool.deposit(WETHadd, 0, false, ethers.utils.parseUnits("5.0"), address, '0', { gasLimit: "8000000" });





})().catch(error => {
    console.error(error)
})