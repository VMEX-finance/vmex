import TrancheReserveData from "../artifacts/contracts/analytics/TrancheReserveData.sol/TrancheReserveData.json";
import { deployments } from "../dist/src.ts/constants";
import hre from "hardhat";
const { ethers } = hre;
import _ from "lodash";

(async () => {
    // const provider = new ethers.providers.InfuraProvider("mainnet", "ca0da016dedf4c5a9ee90bfdbafee233");
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
    let contractFactory = new ethers.ContractFactory(TrancheReserveData.abi, TrancheReserveData.bytecode);
    let data = await provider.call({ data: contractFactory.getDeployTransaction(deployments['LendingPool']["hardhat"]["address"], 1).data });
    const [address, tData, categoryNames] = await new ethers.utils.AbiCoder().decode(["string[20]", "uint128[7][]", "string[7]"], data);
    let labeledData = _.map(tData, (d) => {
        return _.zipObject(categoryNames, d)
    })

    console.log(labeledData)
    console.log(_.zipObject(address, labeledData))
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})