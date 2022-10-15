"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const getTokenReserveData_json_1 = __importDefault(require("../../artifacts/contracts/analytics/queries/getTokenReserveData.sol/getTokenReserveData.json"));
const constants_1 = require("../constants");
const lodash_1 = __importDefault(require("lodash"));
/**
 * gets tranche reserve data for all deployed tokens over each tranch.
 * uses a batch request RPC to loop over all three tranches as one request.
 * @param signer
 * @returns returnData
 */
async function getTrancheReserveData(signer) {
    if (!signer.provider)
        return { response: { data: null } };
    let contractFactory = new ethers_1.ContractFactory(getTokenReserveData_json_1.default.abi, getTokenReserveData_json_1.default.bytecode);
    let data = await signer.provider.call({
        data: contractFactory.getDeployTransaction(constants_1.deployments.LendingPoolAddressesProvider.hardhat.address, 0).data
    });
    const iFace = new ethers_1.ethers.utils.Interface(getTokenReserveData_json_1.default.abi);
    const returnData = await iFace.decodeFunctionResult("getType", data);
    return (lodash_1.default.uniq(returnData['0']));
}
exports.default = getTrancheReserveData;
//# sourceMappingURL=getTrancheReserveData.js.map