import hre from "hardhat";
const { ethers } = hre;
import { deployments } from "../dist/src.ts/constants";
import ILendingPool from "../artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json";

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
    const [ signer ] = await ethers.getSigners();
    const address = await signer.getAddress();
    // give signer WETH tokens with ether;

    const WETHContract = new ethers.Contract(WETHadd, WETHabi);
    var options = { value: ethers.utils.parseEther("100.0")};
    
    await WETHContract.connect(signer).deposit(options);
    // let balance = await (WETHContract.connect(signer)).balanceOf(address)
    // console.log(`balance of WETH in signer account: ${balance}`);

    const LendingPool = new ethers.Contract(deployments.LendingPool.hardhat.address, ILendingPool.abi);
    await LendingPool.connect(signer).deposit(WETHadd, 0, false, ethers.utils.parseUnits('100'), address, '0');    
    // deposit WETH tokens

    
    // give user tricrypto2 tokens



})().catch(error => {
    console.error(error)
})