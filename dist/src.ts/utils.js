"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLendingPoolImpl = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const ILendingPoolAddressesProvider_json_1 = __importDefault(require("../artifacts/contracts/interfaces/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json"));
/**
 * network agnostic function for getting the correct LendingPool address
 * @param signer
 * @param network
 * @param test
 */
async function getLendingPoolImpl(signer, network, test) {
    let LPAddressProvider = new ethers_1.ethers.Contract(constants_1.deployments.LendingPoolAddressesProvider[`${network}`].address, ILendingPoolAddressesProvider_json_1.default.abi, signer);
    let address = await LPAddressProvider.getLendingPool();
    let { abi } = require("../artifacts/contracts/interfaces/ILendingPool.sol/ILendingPool.json");
    return new ethers_1.ethers.Contract(address, abi, signer);
}
exports.getLendingPoolImpl = getLendingPoolImpl;
//# sourceMappingURL=utils.js.map