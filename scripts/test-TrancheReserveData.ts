import TrancheReserveData from "../artifacts/contracts/analytics/TrancheReserveData.sol/TrancheReserveData.json";
import hre from "hardhat";
const { ethers } = hre;
import _ from "lodash";

(async () => {
    // const provider = new ethers.providers.InfuraProvider("mainnet", "ca0da016dedf4c5a9ee90bfdbafee233");
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
    let contractFactory = new ethers.ContractFactory(TrancheReserveData.abi, TrancheReserveData.bytecode);
    let data = await provider.call({ data: contractFactory.getDeployTransaction("0xda24DebbEcECe2270a5Ff889AEfC71Dcf4B8A3D5", 1).data });
    const [address, tData] = await new ethers.utils.AbiCoder().decode(["string[20]", "uint128[7][]"], data);
    console.log(_.zipObject(address, tData))
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})