"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const etherscan_verification_1 = require("../../helpers/etherscan-verification");
const configuration_1 = require("../../helpers/configuration");
const misc_utils_1 = require("../../helpers/misc-utils");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
const contracts_getters_1 = require("../../helpers/contracts-getters");
const types_1 = require("../../helpers/types");
const ethers_1 = require("ethers");
(0, config_1.task)('vmex:set-oracle', 'Deploy development enviroment')
    .addFlag('verify', 'Verify contracts at Etherscan')
    .setAction(async ({ verify }, localBRE) => {
    const POOL_NAME = configuration_1.ConfigNames.Aave;
    await localBRE.run('set-DRE');
    const [deployer, secondaryWallet] = await (0, contracts_helpers_1.getEthersSigners)();
    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
        (0, etherscan_verification_1.checkVerification)();
    }
    const addressesProvider = await (0, contracts_getters_1.getLendingPoolAddressesProvider)();
    console.log("Previous VMEX oracle in addressesprovider: ", await addressesProvider.getPriceOracle());
    await (0, misc_utils_1.waitForTx)(await addressesProvider.setAddress(ethers_1.ethers.utils.formatBytes32String("VMEX_PRICE_ORACLE"), (await (0, contracts_getters_1.getDbEntry)(types_1.eContractid.VMEXOracle)).address));
    console.log("New VMEX oracle in addressesprovider: ", await addressesProvider.getPriceOracle());
});
//# sourceMappingURL=set-vmex-oracle.js.map