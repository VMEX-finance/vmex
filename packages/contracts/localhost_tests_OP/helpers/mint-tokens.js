"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBalance = void 0;
const ethers_1 = require("ethers");
const { ethers } = require('hardhat');
const token_fork_1 = require("../../helpers/token-fork");
const fs = require('fs');
const ERC20abi = [
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
const WETHadd = "0x4200000000000000000000000000000000000006";
const VELO_ROUTER_ADDRESS = "0x9c12939390052919aF3155f41Bf4160Fd3666A6f";
const VELO_ROUTER_ABI = fs.readFileSync("./localhost_tests_OP/abis/velo.json").toString();
// doesn't work for SNX and SUSD
async function setBalance(tokenAddr, signer, balance) {
    if (tokenAddr == "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4" || tokenAddr == "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9") {
        const VELO_ROUTER_CONTRACT = new ethers.Contract(VELO_ROUTER_ADDRESS, VELO_ROUTER_ABI);
        var path = [WETHadd, tokenAddr, false];
        // await myWETH.connect(signer).approve(VELO_ROUTER_ADDRESS,ethers.utils.parseEther("100000.0"))
        var deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
        var options = { value: ethers.utils.parseEther("1000.0") };
        await VELO_ROUTER_CONTRACT.connect(signer).swapExactETHForTokens(ethers.utils.parseUnits("0.0", 18), [path], signer.address, deadline, options);
    }
    else {
        const slotInfo = await findBalancesSlot(tokenAddr);
        const userBalanceSlot = slotInfo.isVyper
            ? ethers_1.utils.hexStripZeros(ethers_1.utils.keccak256(ethers_1.utils.defaultAbiCoder.encode(['uint', 'address'], [slotInfo.slot, signer.address.toString()])))
            : ethers_1.utils.hexStripZeros(ethers_1.utils.keccak256(ethers_1.utils.defaultAbiCoder.encode(['address', 'uint'], [signer.address.toString(), slotInfo.slot])));
        const encodedBalance = ethers_1.utils.defaultAbiCoder.encode(['uint'], [balance]);
        await (0, token_fork_1.setStorageAt)(tokenAddr, userBalanceSlot, encodedBalance);
    }
}
exports.setBalance = setBalance;
async function findBalancesSlot(tokenAddr) {
    const token = new ethers_1.Contract(tokenAddr.toString(), ERC20abi, ethers.provider);
    const randomAddress = '0x8b359fb7a31620691dc153cddd9d463259bcf29b';
    const probeValue = ethers_1.BigNumber.from(356);
    const encodedBalance = ethers_1.utils.defaultAbiCoder.encode(['uint'], [probeValue]);
    for (let i = 0n; i < 100; i++) {
        const userBalanceSlot = ethers_1.utils.hexStripZeros(ethers_1.utils.keccak256(ethers_1.utils.defaultAbiCoder.encode(['address', 'uint'], [randomAddress, i])));
        const storageBefore = await ethers.provider.getStorageAt(tokenAddr, userBalanceSlot);
        await (0, token_fork_1.setStorageAt)(tokenAddr, userBalanceSlot, encodedBalance);
        const balance = await token.balanceOf(randomAddress);
        if (balance.eq(probeValue)) {
            await (0, token_fork_1.setStorageAt)(tokenAddr, userBalanceSlot, storageBefore);
            return { slot: i, isVyper: false };
        }
        await (0, token_fork_1.setStorageAt)(tokenAddr, userBalanceSlot, storageBefore);
    }
    for (let i = 0n; i < 100; i++) {
        const userBalanceSlot = ethers_1.utils.hexStripZeros(ethers_1.utils.keccak256(ethers_1.utils.defaultAbiCoder.encode(['uint', 'address'], [i, randomAddress])));
        const storageBefore = await ethers.provider.getStorageAt(tokenAddr, userBalanceSlot);
        await (0, token_fork_1.setStorageAt)(tokenAddr, userBalanceSlot, encodedBalance);
        const balance = await token.balanceOf(randomAddress);
        if (balance.eq(probeValue)) {
            await (0, token_fork_1.setStorageAt)(tokenAddr, userBalanceSlot, storageBefore);
            return { slot: i, isVyper: true };
        }
        await (0, token_fork_1.setStorageAt)(tokenAddr, userBalanceSlot, storageBefore);
    }
    throw new Error('Balances slot not found');
}
// export const mintToken = async (symbol, signer, tokenAddress, tokenDec) => {
//     let slot = -1;
//     let keyFirst = true;
//     if(symbol=="DAI"){
//         slot = 2;
//         keyFirst = true;
//       }
//       else if(symbol=="USDC"){
//         slot = 0;
//         keyFirst = true;
//       }
//       else if(symbol=="USDT"){
//         slot = 0;
//         keyFirst = true;
//       }
//       else if(symbol=="WBTC"){
//         slot = 0;
//         keyFirst = true;
//       }
//       else if(symbol=="wstETH"){
//         slot = 1;
//         keyFirst = true;
//       }
//       else if(symbol=="rETH"){
//         slot = 0;
//         keyFirst = true;
//       }
//       else if(symbol=="FRAX"){
//         slot = 0;
//         keyFirst = true;
//       }
//       else if(symbol=="ThreeCRV"){
//         slot = 26;
//         keyFirst = false;
//       }
//       else if(symbol=="sUSD3CRV"){
//         slot = 17;
//         keyFirst = false;
//       }
//       else if(symbol=="wstETHCRV"){
//         slot = 7;
//         keyFirst = false;
//       }
//       else if(symbol.substring(0,4)=="velo"){
//         slot = 0;
//         keyFirst = true;
//       }
//       else if(symbol.substring(0,2)=="yv"){
//         slot = 7;
//         keyFirst = false;
//       }
//       else if(symbol.substring(0,3)=="moo" || symbol.substring(0,4)=="beet" ){
//         slot = 0;
//         keyFirst = true;
//       }
//       if(slot!=-1){
//         let index;
//         console.log("Attempt setting storage")
//         if(keyFirst){
//           index = ethers.utils.solidityKeccak256(
//             ["uint256", "uint256"],
//             [signer.address, slot] // key, slot
//           );
//         } else {
//           index = ethers.utils.solidityKeccak256(
//             ["uint256", "uint256"],
//             [slot, signer.address] // slot, key
//           );
//         }
//         // Manipulate local balance (needs to be bytes32 string)
//         await setStorageAt(
//             tokenAddress,
//           index.toString(),
//           toBytes32(ethers.utils.parseUnits("10.0", tokenDec)).toString()
//         );
//         console.log("done setting storage")
//       }
//       else {
//         throw "error minting";
//       }
// }
//# sourceMappingURL=mint-tokens.js.map