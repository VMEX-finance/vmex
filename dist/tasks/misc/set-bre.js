"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const misc_utils_1 = require("../../helpers/misc-utils");
(0, config_1.task)(`set-DRE`, `Inits the DRE, to have access to all the plugins' objects`).setAction(async (_, _DRE) => {
    var _a, _b, _c, _d, _e, _f;
    if (misc_utils_1.DRE) {
        return;
    }
    if (_DRE.network.name.includes('tenderly') ||
        process.env.TENDERLY === 'true') {
        console.log('- Setting up Tenderly provider');
        const net = _DRE.tenderly.network();
        if (process.env.TENDERLY_FORK_ID && process.env.TENDERLY_HEAD_ID) {
            console.log('- Connecting to a Tenderly Fork');
            await net.setFork(process.env.TENDERLY_FORK_ID);
            await net.setHead(process.env.TENDERLY_HEAD_ID);
        }
        else {
            console.log('- Creating a new Tenderly Fork');
            await net.initializeFork();
        }
        const provider = new _DRE.ethers.providers.Web3Provider(net);
        _DRE.ethers.provider = provider;
        console.log('- Initialized Tenderly fork:');
        console.log('  - Fork: ', net.getFork());
        console.log('  - Head: ', net.getHead());
    }
    console.log('- Enviroment');
    if (process.env.FORK) {
        console.log('  - Fork Mode activated at network: ', process.env.FORK);
        if ((_d = (_c = (_b = (_a = _DRE === null || _DRE === void 0 ? void 0 : _DRE.config) === null || _a === void 0 ? void 0 : _a.networks) === null || _b === void 0 ? void 0 : _b.hardhat) === null || _c === void 0 ? void 0 : _c.forking) === null || _d === void 0 ? void 0 : _d.url) {
            console.log('  - Provider URL:', (_f = (_e = _DRE.config.networks.hardhat.forking) === null || _e === void 0 ? void 0 : _e.url) === null || _f === void 0 ? void 0 : _f.split('/')[2]);
        }
        else {
            console.error(`[FORK][Error], missing Provider URL for "${_DRE.network.name}" network. Fill the URL at './helper-hardhat-config.ts' file`);
        }
    }
    console.log('  - Network :', _DRE.network.name);
    (0, misc_utils_1.setDRE)(_DRE);
    return _DRE;
});
