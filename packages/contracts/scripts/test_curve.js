"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = __importDefault(require("hardhat"));
const { ethers } = hardhat_1.default;
const constants_1 = require("../dist/src.ts/constants");
const ILendingPool_json_1 = __importDefault(require("../artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json"));
const types_1 = require("../types");
const ILendingPoolAddressesProvider_json_1 = __importDefault(require("../artifacts/contracts/interfaces/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json"));
const WETHadd = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
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
(async () => {
    const [signer, emergency] = await ethers.getSigners();
    const address = await signer.getAddress();
    const WETHContract = new ethers.Contract(WETHadd, WETHabi, signer);
    const LendingPool = new ethers.Contract(constants_1.deployments.LendingPool.localhost.address, ILendingPool_json_1.default.abi, signer);
    let LPAddressProvider = new ethers.Contract(constants_1.deployments.LendingPoolAddressesProvider.localhost.address, ILendingPoolAddressesProvider_json_1.default.abi, signer);
    if (LendingPool.paused()) {
        console.log('unpausing Lending Pool');
        const LendingPoolConfiguratorProxy = await types_1.LendingPoolConfiguratorFactory.connect(constants_1.deployments.LendingPoolConfigurator.localhost.address, emergency);
        await LendingPoolConfiguratorProxy.setTranchePause(false, { gasLimit: "8000000" });
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
    console.error(error);
});
//# sourceMappingURL=test_curve.js.map