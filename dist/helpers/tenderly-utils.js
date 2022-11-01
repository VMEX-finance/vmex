"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAtTenderly = exports.usingTenderly = void 0;
const misc_utils_1 = require("./misc-utils");
const usingTenderly = () => misc_utils_1.DRE &&
    (misc_utils_1.DRE.network.name.includes('tenderly') ||
        process.env.TENDERLY === 'true');
exports.usingTenderly = usingTenderly;
const verifyAtTenderly = async (id, instance) => {
    console.log('\n- Doing Tenderly contract verification of', id);
    await misc_utils_1.DRE.tenderlyNetwork.verify({
        name: id,
        address: instance.address,
    });
    console.log(`  - Verified ${id} at Tenderly!`);
};
exports.verifyAtTenderly = verifyAtTenderly;
//# sourceMappingURL=tenderly-utils.js.map