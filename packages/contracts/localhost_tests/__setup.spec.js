"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = __importDefault(require("hardhat"));
before(async () => {
    await hardhat_1.default.run("set-DRE");
    console.log("\n***************");
    console.log("DRE finished");
    console.log("***************\n");
});
//# sourceMappingURL=__setup.spec.js.map