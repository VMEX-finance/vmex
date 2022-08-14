import { TOKEN_PRICE } from "../dist/src.ts/constants";
import BatchPriceArtifact from "../artifacts/contracts/misc/BatchPriceFeed.sol/BatchPriceFeed.json"
import hre from 'hardhat';
const { ethers, artifacts } = hre;


async function getPriceFeeds(){
    const provider = new ethers.providers.InfuraProvider('mainnet', 'ca0da016dedf4c5a9ee90bfdbafee233')
    artifacts
    let contractFactory = new ethers.ContractFactory(BatchPriceArtifact.abi, BatchPriceArtifact.bytecode)
    let data = await provider.call({ data: contractFactory.getDeployTransaction().data });
    let decoded_data = new ethers.utils.AbiCoder().decode(['int256', 'int256'], data)
    console.log(await decoded_data)
}

async function main() {
    await getPriceFeeds()
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})