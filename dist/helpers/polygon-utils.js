"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAtPolygon = exports.usingPolygon = void 0;
const axios_1 = __importDefault(require("axios"));
const misc_utils_1 = require("./misc-utils");
const types_1 = require("./types");
const TASK_FLATTEN_GET_FLATTENED_SOURCE = 'flatten:get-flattened-sources';
const TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS = 'compile:solidity:get-source-paths';
/* Polygon Helpers */
const usingPolygon = () => misc_utils_1.DRE && Object.keys(types_1.ePolygonNetwork).includes(misc_utils_1.DRE.network.name);
exports.usingPolygon = usingPolygon;
/* Polygon Verifier */
const SOLIDITY_PRAGMA = 'pragma solidity';
const LICENSE_IDENTIFIER = 'License-Identifier';
const EXPERIMENTAL_ABIENCODER = 'pragma experimental ABIEncoderV2;';
const encodeDeployParams = (instance, args) => {
    return instance.interface.encodeDeploy(args).replace('0x', '');
};
// Remove lines at "text" that includes "matcher" string, but keeping first "keep" lines
const removeLines = (text, matcher, keep = 0) => {
    let counter = keep;
    return text
        .split('\n')
        .filter((line) => {
        const match = !line.includes(matcher);
        if (match === false && counter > 0) {
            counter--;
            return true;
        }
        return match;
    })
        .join('\n');
};
// Try to find the path of a Contract by name of the file without ".sol"
const findPath = async (id) => {
    const paths = await misc_utils_1.DRE.run(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS);
    const path = paths.find((x) => {
        const t = x.split('/');
        return t[t.length - 1].split('.')[0] == id;
    });
    if (!path) {
        throw Error('Missing path for contract name: ${id}');
    }
    return path;
};
// Hardhat Flattener, similar to truffle flattener
const hardhatFlattener = async (filePath) => await misc_utils_1.DRE.run(TASK_FLATTEN_GET_FLATTENED_SOURCE, { files: [filePath] });
// Verify a smart contract at Polygon Matic network via a GET request to the block explorer
const verifyAtPolygon = async (id, instance, args) => {
    /*
      ${net == mumbai or mainnet}
      https://explorer-${net}.maticvigil.com/api
      ?module=contract
      &action=verify
      &addressHash={addressHash}
      &name={name}
      &compilerVersion={compilerVersion}
      &optimization={false}
      &contractSourceCode={contractSourceCode}
    */
    const network = misc_utils_1.DRE.network.name;
    const net = network === types_1.EthereumNetworkNames.matic ? 'mainnet' : network;
    const filePath = await findPath(id);
    const encodedConstructorParams = encodeDeployParams(instance, args);
    const flattenSourceCode = await hardhatFlattener(filePath);
    // Remove pragmas and license identifier after first match, required by block explorers like explorer-mainnet.maticgivil.com or Etherscan
    const cleanedSourceCode = removeLines(removeLines(removeLines(flattenSourceCode, LICENSE_IDENTIFIER, 1), SOLIDITY_PRAGMA, 1), EXPERIMENTAL_ABIENCODER, 1);
    try {
        console.log(`[Polygon Verify] Verifying ${id} with address ${instance.address} at Matic ${net} network`);
        const response = await axios_1.default.post(`https://explorer-${net}.maticvigil.com/api`, {
            addressHash: instance.address,
            name: id,
            compilerVersion: 'v0.6.12+commit.27d51765',
            optimization: 'true',
            contractSourceCode: cleanedSourceCode,
            constructorArguments: encodedConstructorParams,
        }, {
            params: {
                module: 'contract',
                action: 'verify',
            },
            headers: {
                'Content-Type': 'application/json',
                Referer: 'aavematic-42e1f6da',
            },
        });
        if (response.status === 200 && response.data.message === 'OK') {
            console.log(`[Polygon Verify] Verified contract at Matic ${net} network.`);
            console.log(`[Polygon Verify] Check at: https://explorer-${net}.maticvigil.com/address/${instance.address}/contracts) \n`);
            return;
        }
        throw Error(JSON.stringify(response.data, null, 2));
    }
    catch (error) {
        if (error === null || error === void 0 ? void 0 : error.message.includes('Smart-contract already verified.')) {
            console.log(`[Polygon Verify] Already verified. Check it at: https://explorer-${net}.maticvigil.com/address/${instance.address}/contracts) \n`);
            return;
        }
        console.error('[Polygon Verify] Error:', error.toString());
        console.log(`[Polygon Verify] Skipping verification for ${id} with ${instance.address} due an unknown error.`);
        console.log(`Please proceed with manual verification at https://explorer-${net}.maticvigil.com/address/${instance.address}/contracts`);
        console.log(`- Use the following as encoded constructor params`);
        console.log(encodedConstructorParams);
        console.log(`- Flattened and cleaned source code`);
        console.log(cleanedSourceCode);
    }
};
exports.verifyAtPolygon = verifyAtPolygon;
//# sourceMappingURL=polygon-utils.js.map