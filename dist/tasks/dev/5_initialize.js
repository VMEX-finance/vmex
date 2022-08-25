"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const configuration_1 = require("../../helpers/configuration");
const types_1 = require("../../helpers/types");
const misc_utils_1 = require("../../helpers/misc-utils");
const init_helpers_1 = require("../../helpers/init-helpers");
const mock_helpers_1 = require("../../helpers/mock-helpers");
const constants_1 = require("../../helpers/constants");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const contracts_helpers_2 = require("../../helpers/contracts-helpers");
(0, config_1.task)('dev:initialize-lending-pool', 'Initialize lending pool configuration.')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .addParam('pool', `Pool name to retrieve configuration, supported: ${Object.values(configuration_1.ConfigNames)}`)
    .setAction(async ({ verify, pool }, localBRE) => {
    await localBRE.run('set-DRE');
    const network = localBRE.network.name;
    const poolConfig = (0, configuration_1.loadPoolConfig)(pool);
    const { ATokenNamePrefix, StableDebtTokenNamePrefix, VariableDebtTokenNamePrefix, SymbolPrefix, WethGateway, ReservesConfig, } = poolConfig;
    const mockTokens = await (0, contracts_getters_1.getAllMockedTokens)();
    const allTokenAddresses = (0, mock_helpers_1.getAllTokenAddresses)(mockTokens);
    const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
    const protoPoolReservesAddresses = ((0, misc_utils_1.filterMapBy)(allTokenAddresses, (key) => !key.includes('UNI_')));
    const testHelpers = await (0, contracts_deployments_1.deployAaveProtocolDataProvider)(addressesProvider.address, verify);
    const admin = await addressesProvider.getPoolAdmin();
    const treasuryAddress = await (0, configuration_1.getTreasuryAddress)(poolConfig);
    await (0, init_helpers_1.initReservesByHelper)(ReservesConfig, protoPoolReservesAddresses, ATokenNamePrefix, StableDebtTokenNamePrefix, VariableDebtTokenNamePrefix, SymbolPrefix, admin, treasuryAddress, constants_1.ZERO_ADDRESS, pool, verify);
    await (0, init_helpers_1.configureReservesByHelper)(ReservesConfig, protoPoolReservesAddresses, testHelpers, admin);
    const collateralManager = await (0, contracts_deployments_1.deployLendingPoolCollateralManager)(verify);
    await (0, misc_utils_1.waitForTx)(await addressesProvider.setLendingPoolCollateralManager(collateralManager.address));
    const mockFlashLoanReceiver = await (0, contracts_deployments_1.deployMockFlashLoanReceiver)(addressesProvider.address, verify);
    await (0, contracts_helpers_2.insertContractAddressInDb)(types_1.eContractid.MockFlashLoanReceiver, mockFlashLoanReceiver.address);
    await (0, contracts_deployments_1.deployWalletBalancerProvider)(verify);
    await (0, contracts_helpers_2.insertContractAddressInDb)(types_1.eContractid.AaveProtocolDataProvider, testHelpers.address);
    const lendingPoolAddress = await addressesProvider.getLendingPool();
    let gateway = (0, contracts_helpers_1.getParamPerNetwork)(WethGateway, network);
    if (!(0, misc_utils_1.notFalsyOrZeroAddress)(gateway)) {
        gateway = (await (0, contracts_getters_1.getWETHGateway)()).address;
    }
    await (0, contracts_deployments_1.authorizeWETHGateway)(gateway, lendingPoolAddress);
});
