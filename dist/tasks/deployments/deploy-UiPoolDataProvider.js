"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const types_1 = require("../../helpers/types");
const contracts_deployments_1 = require("../../helpers/contracts-deployments");
const process_1 = require("process");
(0, config_1.task)(`deploy-${types_1.eContractid.UiPoolDataProvider}`, `Deploys the UiPoolDataProvider contract`)
    .addFlag('verify', 'Verify UiPoolDataProvider contract via Etherscan API.')
    .setAction(async ({ verify }, localBRE) => {
    await localBRE.run('set-DRE');
    if (!localBRE.network.config.chainId) {
        throw new Error('INVALID_CHAIN_ID');
    }
    const network = localBRE.network.name;
    const addressesByNetwork = {
        [types_1.eEthereumNetwork.kovan]: {
            incentivesController: '0x0000000000000000000000000000000000000000',
            aaveOracle: '0x8fb777d67e9945e2c01936e319057f9d41d559e6',
        },
        [types_1.eEthereumNetwork.main]: {
            incentivesController: '0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5',
            aaveOracle: '0xa50ba011c48153de246e5192c8f9258a2ba79ca9',
        },
        [types_1.ePolygonNetwork.matic]: {
            incentivesController: '0x357D51124f59836DeD84c8a1730D72B749d8BC23',
            aaveOracle: '0x0229F777B0fAb107F9591a41d5F02E4e98dB6f2d',
        },
        [types_1.ePolygonNetwork.mumbai]: {
            incentivesController: '0xd41aE58e803Edf4304334acCE4DC4Ec34a63C644',
            aaveOracle: '0xC365C653f7229894F93994CD0b30947Ab69Ff1D5',
        },
        [types_1.eAvalancheNetwork.fuji]: {
            incentivesController: '0xa1EF206fb9a8D8186157FC817fCddcC47727ED55',
            aaveOracle: '0xD217DdD9f0Af84644dEFe84a0b634621D4617a29',
        },
        [types_1.eAvalancheNetwork.avalanche]: {
            incentivesController: '0x01D83Fe6A10D2f2B7AF17034343746188272cAc9',
            aaveOracle: '0xdC336Cd4769f4cC7E9d726DA53e6d3fC710cEB89',
        },
    };
    const supportedNetworks = Object.keys(addressesByNetwork);
    if (!supportedNetworks.includes(network)) {
        console.error(`[task][error] Network "${network}" not supported, please use one of: ${supportedNetworks.join()}`);
        (0, process_1.exit)(2);
    }
    const oracle = addressesByNetwork[network].aaveOracle;
    const incentivesController = addressesByNetwork[network].incentivesController;
    console.log(`\n- UiPoolDataProvider deployment`);
    const uiPoolDataProvider = await (0, contracts_deployments_1.deployUiPoolDataProvider)([incentivesController, oracle], verify);
    console.log('UiPoolDataProvider deployed at:', uiPoolDataProvider.address);
    console.log(`\tFinished UiPoolDataProvider deployment`);
});
