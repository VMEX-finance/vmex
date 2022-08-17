import { TOKEN_PRICE, TOKEN } from "./constants";
import BatchPriceArtifact from "../artifacts/contracts/misc/BatchPriceFeed.sol/BatchPriceFeed.json";
import { InfuraProvider } from "@ethersproject/providers";
import { ContractFactory } from "@ethersproject/contracts";
import { formatUnits } from "@ethersproject/units";
import { AbiCoder } from "@ethersproject/abi";


async function getTokenPrices() {
    const provider = new InfuraProvider("mainnet", "ca0da016dedf4c5a9ee90bfdbafee233");
    let contractFactory = new ContractFactory(BatchPriceArtifact.abi, BatchPriceArtifact.bytecode);
    let data = await provider.call({ data: contractFactory.getDeployTransaction().data });
    let decoded_data = await new AbiCoder().decode(new Array(21).fill('int256'), data)
    let keys = Object.keys(TOKEN)
    let return_type = decoded_data.map((k, i) => {
        let key = keys[i]
        return [key, formatUnits(k, TOKEN[`${key}`].decimals)]
    })
    let vals = Object.fromEntries(return_type)
    let returnType =  _.mapValues(vals, (o) => {return o * vals.USD})
    returnType.USD = Number(vals.USD);
    return returnType;   
}