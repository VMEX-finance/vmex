"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../dist/src.ts/constants");
const BatchPriceFeed_json_1 = __importDefault(require("../artifacts/contracts/analytics/BatchPriceFeed.sol/BatchPriceFeed.json"));
const hardhat_1 = __importDefault(require("hardhat"));
const { ethers, artifacts } = hardhat_1.default;
async function getPriceFeeds() {
    const provider = new ethers.providers.InfuraProvider('mainnet', 'ca0da016dedf4c5a9ee90bfdbafee233');
    let contractFactory = new ethers.ContractFactory(BatchPriceFeed_json_1.default.abi, BatchPriceFeed_json_1.default.bytecode);
    let data = await provider.call({ data: contractFactory.getDeployTransaction(Object.values(constants_1.TOKEN_PRICE_CONTRACTS)).data });
    let [ethPrices, usdPrices] = await new ethers.utils.AbiCoder().decode(["int256[]", "int256[]"], data);
    console.log(await ethPrices, usdPrices);
}
async function main() {
    console.log(await getPriceFeeds());
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=test-priceFeed.js.map