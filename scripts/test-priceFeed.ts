import { TOKEN_PRICE, TOKEN } from "../dist/src.ts/constants";
import BatchPriceArtifact from "../artifacts/contracts/misc/BatchPriceFeed.sol/BatchPriceFeed.json"
import hre from 'hardhat';
const { ethers, artifacts } = hre;
import _ from "lodash";


async function getPriceFeeds(){
    const provider = new ethers.providers.InfuraProvider('mainnet', 'ca0da016dedf4c5a9ee90bfdbafee233')
    

    let contractFactory = new ethers.ContractFactory(BatchPriceArtifact.abi, BatchPriceArtifact.bytecode)
    let data = await provider.call({ data: contractFactory.getDeployTransaction().data });
    let decoded_data = await new ethers.utils.AbiCoder().decode(new Array(21).fill('int256'), data)
    let keys = Object.keys(TOKEN)
    let return_type = decoded_data.map((k, i) => {
        let key = keys[i]
        return [key, ethers.utils.formatUnits(k, TOKEN[`${key}`].decimals)]
    })
    let vals = Object.fromEntries(return_type)
    let returnType =  _.mapValues(vals, (o) => {return o * vals.USD})
    returnType.USD = Number(vals.USD);
    return returnType;
}

async function main() {
    console.log(await getPriceFeeds())
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})