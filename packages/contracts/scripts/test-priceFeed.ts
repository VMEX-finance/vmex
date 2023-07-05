import { TOKEN_PRICE_CONTRACTS } from "../dist/src.ts/constants";
import BatchPriceArtifact from "../artifacts/contracts/analytics/BatchPriceFeed.sol/BatchPriceFeed.json"
import hre from 'hardhat';
const { ethers, artifacts } = hre;
import _ from "lodash";


async function getPriceFeeds(){
    const provider = new ethers.providers.InfuraProvider('mainnet', 'ca0da016dedf4c5a9ee90bfdbafee233')


    let contractFactory = new ethers.ContractFactory(BatchPriceArtifact.abi, BatchPriceArtifact.bytecode)
    let data = await provider.call({ data: contractFactory.getDeployTransaction(Object.values(TOKEN_PRICE_CONTRACTS)).data });
    let [ethPrices, usdPrices] = await new ethers.utils.AbiCoder().decode(["int256[]", "int256[]"], data)
    console.log(await ethPrices, usdPrices)
}

async function main() {
    console.log(await getPriceFeeds())
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})