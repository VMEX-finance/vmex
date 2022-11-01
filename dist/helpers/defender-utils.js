"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefenderRelaySigner = exports.usingDefender = void 0;
const units_1 = require("@ethersproject/units");
const ethers_1 = require("defender-relay-client/lib/ethers");
const misc_utils_1 = require("./misc-utils");
const tenderly_utils_1 = require("./tenderly-utils");
const usingDefender = () => process.env.DEFENDER === 'true';
exports.usingDefender = usingDefender;
const getDefenderRelaySigner = async () => {
    const { DEFENDER_API_KEY, DEFENDER_SECRET_KEY } = process.env;
    let defenderSigner;
    if (!DEFENDER_API_KEY || !DEFENDER_SECRET_KEY) {
        throw new Error('Defender secrets required');
    }
    const credentials = { apiKey: DEFENDER_API_KEY, apiSecret: DEFENDER_SECRET_KEY };
    defenderSigner = new ethers_1.DefenderRelaySigner(credentials, new ethers_1.DefenderRelayProvider(credentials), {
        speed: 'fast',
    });
    const defenderAddress = await defenderSigner.getAddress();
    console.log('  - Using Defender Relay: ', defenderAddress);
    // Replace signer if FORK=main is active
    if (process.env.FORK === 'main') {
        console.log('  - Impersonating Defender Relay');
        await (0, misc_utils_1.impersonateAccountsHardhat)([defenderAddress]);
        defenderSigner = await misc_utils_1.DRE.ethers.getSigner(defenderAddress);
    }
    // Replace signer if Tenderly network is active
    if ((0, tenderly_utils_1.usingTenderly)()) {
        console.log('  - Impersonating Defender Relay via Tenderly');
        defenderSigner = await misc_utils_1.DRE.ethers.getSigner(defenderAddress);
    }
    console.log('  - Balance: ', (0, units_1.formatEther)(await defenderSigner.getBalance()));
    return defenderSigner;
};
exports.getDefenderRelaySigner = getDefenderRelaySigner;
//# sourceMappingURL=defender-utils.js.map