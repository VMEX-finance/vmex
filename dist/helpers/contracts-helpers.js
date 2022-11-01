"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractAddressWithJsonFallback = exports.verifyContract = exports.buildParaSwapLiquiditySwapParams = exports.buildFlashLiquidationAdapterParams = exports.buildRepayAdapterParams = exports.buildLiquiditySwapParams = exports.getSignatureFromTypedData = exports.buildPermitParams = exports.convertToCurrencyUnits = exports.convertToCurrencyDecimals = exports.getParamPerPool = exports.getOptionalParamAddressPerNetwork = exports.getParamPerNetwork = exports.linkBytecode = exports.getContract = exports.withSaveAndVerify = exports.deployContract = exports.decodeAbiNumber = exports.getCurrentBlock = exports.getEthersSignersAddresses = exports.getEthersSigners = exports.rawInsertContractAddressInDb = exports.insertContractAddressInDb = exports.registerContractInJsonDb = void 0;
const ethers_1 = require("ethers");
const eth_sig_util_1 = require("eth-sig-util");
const ethereumjs_util_1 = require("ethereumjs-util");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const misc_utils_1 = require("./misc-utils");
const types_1 = require("./types");
const etherscan_verification_1 = require("./etherscan-verification");
const contracts_getters_1 = require("./contracts-getters");
const tenderly_utils_1 = require("./tenderly-utils");
const configuration_1 = require("./configuration");
const constants_1 = require("./constants");
const defender_utils_1 = require("./defender-utils");
const registerContractInJsonDb = async (contractId, contractInstance) => {
    const currentNetwork = misc_utils_1.DRE.network.name;
    const FORK = process.env.FORK;
    if (FORK ||
        (currentNetwork !== "hardhat" && !currentNetwork.includes("coverage"))) {
        // console.log(`*** ${contractId} ***\n`);
        // console.log(`Network: ${currentNetwork}`);
        // console.log(`tx: ${contractInstance.deployTransaction.hash}`);
        // console.log(`contract address: ${contractInstance.address}`);
        // console.log(`deployer address: ${contractInstance.deployTransaction.from}`);
        // console.log(`gas price: ${contractInstance.deployTransaction.gasPrice}`);
        // console.log(`gas used: ${contractInstance.deployTransaction.gasLimit}`);
        // console.log(`\n******`);
        // console.log();
    }
    await (0, misc_utils_1.getDb)()
        .set(`${contractId}.${currentNetwork}`, {
        address: contractInstance.address,
        deployer: contractInstance.deployTransaction.from,
    })
        .write();
};
exports.registerContractInJsonDb = registerContractInJsonDb;
const insertContractAddressInDb = async (id, address) => await (0, misc_utils_1.getDb)()
    .set(`${id}.${misc_utils_1.DRE.network.name}`, {
    address,
})
    .write();
exports.insertContractAddressInDb = insertContractAddressInDb;
const rawInsertContractAddressInDb = async (id, address) => await (0, misc_utils_1.getDb)()
    .set(`${id}.${misc_utils_1.DRE.network.name}`, {
    address,
})
    .write();
exports.rawInsertContractAddressInDb = rawInsertContractAddressInDb;
const getEthersSigners = async () => {
    const ethersSigners = await Promise.all(await misc_utils_1.DRE.ethers.getSigners());
    if ((0, defender_utils_1.usingDefender)()) {
        const [, ...users] = ethersSigners;
        return [await (0, defender_utils_1.getDefenderRelaySigner)(), ...users];
    }
    return ethersSigners;
};
exports.getEthersSigners = getEthersSigners;
const getEthersSignersAddresses = async () => await Promise.all((await (0, exports.getEthersSigners)()).map((signer) => signer.getAddress()));
exports.getEthersSignersAddresses = getEthersSignersAddresses;
const getCurrentBlock = async () => {
    return misc_utils_1.DRE.ethers.provider.getBlockNumber();
};
exports.getCurrentBlock = getCurrentBlock;
const decodeAbiNumber = (data) => parseInt(ethers_1.utils.defaultAbiCoder.decode(["uint256"], data).toString());
exports.decodeAbiNumber = decodeAbiNumber;
const deployContract = async (contractName, args) => {
    const contract = (await (await misc_utils_1.DRE.ethers.getContractFactory(contractName))
        .connect(await (0, contracts_getters_1.getFirstSigner)())
        .deploy(...args));
    await (0, misc_utils_1.waitForTx)(contract.deployTransaction);
    await (0, exports.registerContractInJsonDb)(contractName, contract);
    return contract;
};
exports.deployContract = deployContract;
const withSaveAndVerify = async (instance, id, args, verify) => {
    await (0, misc_utils_1.waitForTx)(instance.deployTransaction);
    await (0, exports.registerContractInJsonDb)(id, instance);
    if (verify) {
        await (0, exports.verifyContract)(id, instance, args);
    }
    return instance;
};
exports.withSaveAndVerify = withSaveAndVerify;
const getContract = async (contractName, address) => (await misc_utils_1.DRE.ethers.getContractAt(contractName, address));
exports.getContract = getContract;
const linkBytecode = (artifact, libraries) => {
    let bytecode = artifact.bytecode;
    for (const [fileName, fileReferences] of Object.entries(artifact.linkReferences)) {
        for (const [libName, fixups] of Object.entries(fileReferences)) {
            const addr = libraries[libName];
            if (addr === undefined) {
                continue;
            }
            for (const fixup of fixups) {
                bytecode =
                    bytecode.substr(0, 2 + fixup.start * 2) +
                        addr.substr(2) +
                        bytecode.substr(2 + (fixup.start + fixup.length) * 2);
            }
        }
    }
    return bytecode;
};
exports.linkBytecode = linkBytecode;
const getParamPerNetwork = (param, network) => {
    const { main, ropsten, kovan, coverage, buidlerevm, tenderly } = param;
    const { matic, mumbai } = param;
    const { xdai } = param;
    const { avalanche, fuji } = param;
    if (process.env.FORK) {
        return param[process.env.FORK];
    }
    switch (network) {
        case types_1.eEthereumNetwork.coverage:
            return coverage;
        case types_1.eEthereumNetwork.buidlerevm:
            return buidlerevm;
        case types_1.eEthereumNetwork.hardhat:
            return buidlerevm;
        case types_1.eEthereumNetwork.kovan:
            return kovan;
        case types_1.eEthereumNetwork.ropsten:
            return ropsten;
        case types_1.eEthereumNetwork.main:
            return main;
        case types_1.eEthereumNetwork.tenderly:
            return tenderly;
        case types_1.ePolygonNetwork.matic:
            return matic;
        case types_1.ePolygonNetwork.mumbai:
            return mumbai;
        case types_1.eXDaiNetwork.xdai:
            return xdai;
        case types_1.eAvalancheNetwork.avalanche:
            return avalanche;
        case types_1.eAvalancheNetwork.fuji:
            return fuji;
    }
};
exports.getParamPerNetwork = getParamPerNetwork;
const getOptionalParamAddressPerNetwork = (param, network) => {
    if (!param) {
        return constants_1.ZERO_ADDRESS;
    }
    return (0, exports.getParamPerNetwork)(param, network);
};
exports.getOptionalParamAddressPerNetwork = getOptionalParamAddressPerNetwork;
const getParamPerPool = ({ proto, amm, matic, avalanche }, pool) => {
    switch (pool) {
        case types_1.AavePools.proto:
            return proto;
        case types_1.AavePools.amm:
            return amm;
        case types_1.AavePools.matic:
            return matic;
        case types_1.AavePools.avalanche:
            return avalanche;
        default:
            return proto;
    }
};
exports.getParamPerPool = getParamPerPool;
const convertToCurrencyDecimals = async (tokenAddress, amount) => {
    const token = await (0, contracts_getters_1.getIErc20Detailed)(tokenAddress);
    let decimals = (await token.decimals()).toString();
    return ethers_1.ethers.utils.parseUnits(amount, decimals);
};
exports.convertToCurrencyDecimals = convertToCurrencyDecimals;
const convertToCurrencyUnits = async (tokenAddress, amount) => {
    const token = await (0, contracts_getters_1.getIErc20Detailed)(tokenAddress);
    let decimals = new bignumber_js_1.default(await token.decimals());
    const currencyUnit = new bignumber_js_1.default(10).pow(decimals);
    const amountInCurrencyUnits = new bignumber_js_1.default(amount).div(currencyUnit);
    return amountInCurrencyUnits.toFixed();
};
exports.convertToCurrencyUnits = convertToCurrencyUnits;
const buildPermitParams = (chainId, token, revision, tokenName, owner, spender, nonce, deadline, value) => ({
    types: {
        EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
        ],
        Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
        ],
    },
    primaryType: "Permit",
    domain: {
        name: tokenName,
        version: revision,
        chainId: chainId,
        verifyingContract: token,
    },
    message: {
        owner,
        spender,
        value,
        nonce,
        deadline,
    },
});
exports.buildPermitParams = buildPermitParams;
const getSignatureFromTypedData = (privateKey, typedData // TODO: should be TypedData, from eth-sig-utils, but TS doesn't accept it
) => {
    const signature = (0, eth_sig_util_1.signTypedData_v4)(Buffer.from(privateKey.substring(2, 66), "hex"), {
        data: typedData,
    });
    return (0, ethereumjs_util_1.fromRpcSig)(signature);
};
exports.getSignatureFromTypedData = getSignatureFromTypedData;
const buildLiquiditySwapParams = (assetToSwapToList, minAmountsToReceive, swapAllBalances, permitAmounts, deadlines, v, r, s, useEthPath) => {
    return ethers_1.ethers.utils.defaultAbiCoder.encode([
        "address[]",
        "uint256[]",
        "bool[]",
        "uint256[]",
        "uint256[]",
        "uint8[]",
        "bytes32[]",
        "bytes32[]",
        "bool[]",
    ], [
        assetToSwapToList,
        minAmountsToReceive,
        swapAllBalances,
        permitAmounts,
        deadlines,
        v,
        r,
        s,
        useEthPath,
    ]);
};
exports.buildLiquiditySwapParams = buildLiquiditySwapParams;
const buildRepayAdapterParams = (collateralAsset, collateralAmount, rateMode, permitAmount, deadline, v, r, s, useEthPath) => {
    return ethers_1.ethers.utils.defaultAbiCoder.encode([
        "address",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint8",
        "bytes32",
        "bytes32",
        "bool",
    ], [
        collateralAsset,
        collateralAmount,
        rateMode,
        permitAmount,
        deadline,
        v,
        r,
        s,
        useEthPath,
    ]);
};
exports.buildRepayAdapterParams = buildRepayAdapterParams;
const buildFlashLiquidationAdapterParams = (collateralAsset, debtAsset, user, debtToCover, useEthPath) => {
    return ethers_1.ethers.utils.defaultAbiCoder.encode(["address", "address", "address", "uint256", "bool"], [collateralAsset, debtAsset, user, debtToCover, useEthPath]);
};
exports.buildFlashLiquidationAdapterParams = buildFlashLiquidationAdapterParams;
const buildParaSwapLiquiditySwapParams = (assetToSwapTo, minAmountToReceive, swapAllBalanceOffset, swapCalldata, augustus, permitAmount, deadline, v, r, s) => {
    return ethers_1.ethers.utils.defaultAbiCoder.encode([
        "address",
        "uint256",
        "uint256",
        "bytes",
        "address",
        "tuple(uint256,uint256,uint8,bytes32,bytes32)",
    ], [
        assetToSwapTo,
        minAmountToReceive,
        swapAllBalanceOffset,
        swapCalldata,
        augustus,
        [permitAmount, deadline, v, r, s],
    ]);
};
exports.buildParaSwapLiquiditySwapParams = buildParaSwapLiquiditySwapParams;
const verifyContract = async (id, instance, args) => {
    if ((0, tenderly_utils_1.usingTenderly)()) {
        await (0, tenderly_utils_1.verifyAtTenderly)(id, instance);
    }
    await (0, etherscan_verification_1.verifyEtherscanContract)(instance.address, args);
    return instance;
};
exports.verifyContract = verifyContract;
const getContractAddressWithJsonFallback = async (id, pool) => {
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
    const network = misc_utils_1.DRE.network.name;
    const db = (0, misc_utils_1.getDb)();
    const contractAtMarketConfig = (0, exports.getOptionalParamAddressPerNetwork)(poolConfig[id], network);
    if ((0, misc_utils_1.notFalsyOrZeroAddress)(contractAtMarketConfig)) {
        return contractAtMarketConfig;
    }
    const contractAtDb = await (0, misc_utils_1.getDb)().get(`${id}.${misc_utils_1.DRE.network.name}`).value();
    if (contractAtDb === null || contractAtDb === void 0 ? void 0 : contractAtDb.address) {
        return contractAtDb.address;
    }
    throw Error(`Missing contract address ${id} at Market config and JSON local db`);
};
exports.getContractAddressWithJsonFallback = getContractAddressWithJsonFallback;
//# sourceMappingURL=contracts-helpers.js.map