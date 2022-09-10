"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSuite = exports.initializeMakeSuite = void 0;
const misc_utils_1 = require("../../../helpers/misc-utils");
const contracts_getters_1 = require("../../../helpers/contracts-getters");
const chai_1 = __importDefault(require("chai"));
// @ts-ignore
const chai_bignumber_1 = __importDefault(require("chai-bignumber"));
const almost_equal_1 = require("./almost-equal");
const contracts_helpers_1 = require("../../../helpers/contracts-helpers");
const contracts_helpers_2 = require("../../../helpers/contracts-helpers");
const ethereum_waffle_1 = require("ethereum-waffle");
const aave_1 = require("../../../markets/aave");
const tenderly_utils_1 = require("../../../helpers/tenderly-utils");
chai_1.default.use((0, chai_bignumber_1.default)());
chai_1.default.use((0, almost_equal_1.almostEqual)());
chai_1.default.use(ethereum_waffle_1.solidity);
let buidlerevmSnapshotId = "0x1";
const setBuidlerevmSnapshotId = (id) => {
    buidlerevmSnapshotId = id;
};
const testEnv = {
    deployer: {},
    users: [],
    pool: {},
    configurator: {},
    helpersContract: {},
    oracle: {},
    weth: {},
    aWETH: {},
    dai: {},
    aDai: {},
    usdc: {},
    aave: {},
    addressesProvider: {},
    uniswapLiquiditySwapAdapter: {},
    uniswapRepayAdapter: {},
    flashLiquidationAdapter: {},
    paraswapLiquiditySwapAdapter: {},
    registry: {},
    wethGateway: {},
};
async function initializeMakeSuite() {
    var _a, _b, _c, _d, _e, _f;
    const [_deployer, ...restSigners] = await (0, contracts_helpers_1.getEthersSigners)();
    const deployer = {
        address: await _deployer.getAddress(),
        signer: _deployer,
    };
    for (const signer of restSigners) {
        testEnv.users.push({
            signer,
            address: await signer.getAddress(),
        });
    }
    testEnv.deployer = deployer;
    testEnv.pool = await (0, contracts_getters_1.getLendingPool)();
    testEnv.configurator = await (0, contracts_getters_1.getLendingPoolConfiguratorProxy)();
    testEnv.addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
    if (process.env.FORK) {
        testEnv.registry = await (0, contracts_getters_1.getLendingPoolAddressesProviderRegistry)((0, contracts_helpers_2.getParamPerNetwork)(aave_1.AaveConfig.ProviderRegistry, process.env.FORK));
    }
    else {
        testEnv.registry = await (0, contracts_getters_1.getLendingPoolAddressesProviderRegistry)();
        testEnv.oracle = await (0, contracts_getters_1.getPriceOracle)();
    }
    testEnv.helpersContract = await (0, contracts_getters_1.getAaveProtocolDataProvider)();
    const allTokens = await testEnv.helpersContract.getAllATokens();
    const aDaiAddress = (_a = allTokens.find((aToken) => aToken.symbol === "aDAI0")) === null || _a === void 0 ? void 0 : _a.tokenAddress; //choose tranche
    const aWEthAddress = (_b = allTokens.find((aToken) => aToken.symbol === "aWETH0")) === null || _b === void 0 ? void 0 : _b.tokenAddress;
    const reservesTokens = await testEnv.helpersContract.getAllReservesTokens();
    const daiAddress = (_c = reservesTokens.find((token) => token.symbol === "DAI")) === null || _c === void 0 ? void 0 : _c.tokenAddress;
    const usdcAddress = (_d = reservesTokens.find((token) => token.symbol === "USDC")) === null || _d === void 0 ? void 0 : _d.tokenAddress;
    const aaveAddress = (_e = reservesTokens.find((token) => token.symbol === "AAVE")) === null || _e === void 0 ? void 0 : _e.tokenAddress;
    const wethAddress = (_f = reservesTokens.find((token) => token.symbol === "WETH")) === null || _f === void 0 ? void 0 : _f.tokenAddress;
    if (!aDaiAddress || !aWEthAddress) {
        process.exit(1);
    }
    if (!daiAddress || !usdcAddress || !aaveAddress || !wethAddress) {
        process.exit(1);
    }
    testEnv.aDai = await (0, contracts_getters_1.getAToken)(aDaiAddress);
    testEnv.aWETH = await (0, contracts_getters_1.getAToken)(aWEthAddress);
    testEnv.dai = await (0, contracts_getters_1.getMintableERC20)(daiAddress);
    testEnv.usdc = await (0, contracts_getters_1.getMintableERC20)(usdcAddress);
    testEnv.aave = await (0, contracts_getters_1.getMintableERC20)(aaveAddress);
    testEnv.weth = await (0, contracts_getters_1.getWETHMocked)(wethAddress);
    testEnv.wethGateway = await (0, contracts_getters_1.getWETHGateway)();
    testEnv.uniswapLiquiditySwapAdapter = await (0, contracts_getters_1.getUniswapLiquiditySwapAdapter)();
    testEnv.uniswapRepayAdapter = await (0, contracts_getters_1.getUniswapRepayAdapter)();
    testEnv.flashLiquidationAdapter = await (0, contracts_getters_1.getFlashLiquidationAdapter)();
    testEnv.paraswapLiquiditySwapAdapter =
        await (0, contracts_getters_1.getParaSwapLiquiditySwapAdapter)();
}
exports.initializeMakeSuite = initializeMakeSuite;
const setSnapshot = async () => {
    const hre = misc_utils_1.DRE;
    if ((0, tenderly_utils_1.usingTenderly)()) {
        setBuidlerevmSnapshotId((await hre.tenderlyNetwork.getHead()) || "0x1");
        return;
    }
    setBuidlerevmSnapshotId(await (0, misc_utils_1.evmSnapshot)());
};
const revertHead = async () => {
    const hre = misc_utils_1.DRE;
    if ((0, tenderly_utils_1.usingTenderly)()) {
        await hre.tenderlyNetwork.setHead(buidlerevmSnapshotId);
        return;
    }
    await (0, misc_utils_1.evmRevert)(buidlerevmSnapshotId);
};
function makeSuite(name, tests) {
    describe(name, () => {
        before(async () => {
            await setSnapshot();
        });
        tests(testEnv);
        after(async () => {
            await revertHead();
        });
    });
}
exports.makeSuite = makeSuite;
