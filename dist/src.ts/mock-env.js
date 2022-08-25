"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMockEnv = void 0;
const ethers_1 = __importDefault(require("ethers"));
const providers_1 = require("@ethersproject/providers");
async function setupMockEnv(address) {
    console.log(address);
    try {
        let provider = new providers_1.JsonRpcProvider("http://127.0.0.1:8545");
        await provider.send("hardhat_setBalance", [
            address,
            ethers_1.default.utils.hexValue(ethers_1.default.constants.MaxUint256)
        ]);
        const storage = await provider.getStorageAt("0x3619DbE27d7c1e7E91aA738697Ae7Bc5FC3eACA5", 0);
        console.log("Storage Slot [0]", ethers_1.default.utils.arrayify(storage));
        // await provider.send("hardhar_setStorageAt")
    }
    catch (err) {
        console.error(err);
    }
}
exports.setupMockEnv = setupMockEnv;
