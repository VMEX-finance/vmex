"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const etherscan_verification_1 = require("../../helpers/etherscan-verification");
const configuration_1 = require("../../helpers/configuration");
const misc_utils_1 = require("../../helpers/misc-utils");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const types_1 = require("../../helpers/types");
(0, config_1.task)('vmex:upgrade-configurator', 'Deploy development enviroment')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .setAction(async ({ verify }, localBRE) => {
    const POOL_NAME = configuration_1.ConfigNames.Aave;
    await localBRE.run('set-DRE');
    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
        (0, etherscan_verification_1.checkVerification)();
    }
    const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
    const newConfiguratorImpl = await (0, contracts_deployments_1.deployLendingPoolConfigurator)();
    await (0, misc_utils_1.waitForTx)(await addressesProvider.setLendingPoolConfiguratorImpl(newConfiguratorImpl.address));
    const lendingPoolConfiguratorProxy = await (0, contracts_getters_1.getLendingPoolConfiguratorProxy)(await addressesProvider.getLendingPoolConfigurator());
    await (0, contracts_helpers_1.insertContractAddressInDb)(types_1.eContractid.LendingPoolConfigurator, lendingPoolConfiguratorProxy.address);
});
//# sourceMappingURL=upgrade-configurator.js.map