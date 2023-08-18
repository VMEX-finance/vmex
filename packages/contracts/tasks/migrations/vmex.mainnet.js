"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const etherscan_verification_1 = require("../../helpers/etherscan-verification");
const configuration_1 = require("../../helpers/configuration");
const misc_utils_1 = require("../../helpers/misc-utils");
const tenderly_utils_1 = require("../../helpers/tenderly-utils");
const contracts_helpers_1 = require("../../helpers/contracts-helpers");
(0, config_1.task)("vmex:mainnet", "Deploy development enviroment")
    .addFlag("verify", "Verify contracts at Etherscan")
    .addFlag("skipRegistry", "Skip addresses provider registration at Addresses Provider Registry")
    .setAction(async ({ verify, skipRegistry }, DRE) => {
    console.log("Network name initial: ", DRE.network.name);
    const POOL_NAME = configuration_1.ConfigNames.Aave;
    await DRE.run("set-DRE");
    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
        (0, etherscan_verification_1.checkVerification)();
    }
    // Fund wallets on tenderly fork
    if ((0, tenderly_utils_1.usingTenderly)()) {
        // const provider = new ethers.providers.JsonRpcProvider(`https://rpc.tenderly.co/fork/${process.env.TENDERLY_FORK_ID}`)
        const provider = DRE.ethers.provider;
        const WALLETS = await (0, contracts_helpers_1.getEthersSignersAddresses)();
        const result = await provider.send("tenderly_setBalance", [
            WALLETS,
            //amount in wei will be set for all wallets
            ethers.utils.hexValue(ethers.utils.parseUnits("1000", "ether").toHexString()),
        ]);
        console.log('\nSuccessfully funded wallets:', result, "\n");
    }
    console.log("Migration started\n");
    console.log("1. Deploy address provider");
    await DRE.run("full:deploy-address-provider", {
        pool: POOL_NAME,
        skipRegistry,
    });
    console.log("1.5. Deploy asset mappings");
    await DRE.run("full:deploy-asset-mappings", { pool: POOL_NAME });
    console.log("2. Deploy lending pool");
    await DRE.run("full:deploy-lending-pool", { pool: POOL_NAME });
    console.log("3. Deploy oracles");
    await DRE.run("full:deploy-oracles", { pool: POOL_NAME });
    console.log("4. Deploy Data Provider");
    await DRE.run("full:data-provider", { pool: POOL_NAME });
    console.log("5. Deploy WETH Gateway");
    await DRE.run("full-deploy-weth-gateway", { pool: POOL_NAME });
    console.log('5.5 Deploy Incentives controller');
    await DRE.run('full-deploy-IncentivesController', { pool: POOL_NAME });
    console.log("6. Initialize lending pool");
    await DRE.run("full:initialize-lending-pool", { pool: POOL_NAME });
    console.log("6.1. Initialize lending pool tranche 0");
    await DRE.run("full:initialize-lending-pool-tranches-0", {
        pool: POOL_NAME,
    });
    console.log("6.2. Initialize lending pool tranche 1");
    await DRE.run("full:initialize-lending-pool-tranches-1", {
        pool: POOL_NAME,
    });
    console.log('7. Begin staking for tranche 0');
    await DRE.run('full-beginStaking', { pool: POOL_NAME });
    if (verify) {
        (0, misc_utils_1.printContracts)();
        console.log("7. Veryfing contracts");
        await DRE.run("verify:general", { all: true, pool: POOL_NAME });
        console.log("8. Veryfing aTokens and debtTokens");
        await DRE.run("verify:tokens", { pool: POOL_NAME });
    }
    // if (usingTenderly()) {
    //   const postDeployHead = DRE.tenderlyNetwork.getHead();
    //   const postDeployFork = DRE.tenderlyNetwork.getFork();
    //   console.log("Tenderly Info");
    //   console.log("- Head", postDeployHead);
    //   console.log("- Fork", postDeployFork);
    // }
    console.log("\nFinished migrations");
    (0, misc_utils_1.printContracts)();
});
//# sourceMappingURL=vmex.mainnet.js.map