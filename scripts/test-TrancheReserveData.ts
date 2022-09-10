import TrancheReserveData from "../artifacts/contracts/analytics/TrancheReserveData.sol/TrancheReserveData.json";
import hre from "hardhat";
const { ethers } = hre;
import _ from "lodash";

(async () => {
    const provider = new ethers.providers.InfuraProvider("mainnet", "ca0da016dedf4c5a9ee90bfdbafee233");
    let contractFactory = new ethers.ContractFactory(TrancheReserveData.abi, TrancheReserveData.bytecode);
    let data = await provider.call({ data: contractFactory.getDeployTransaction("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9").data });
    const [address] = await new ethers.utils.AbiCoder().decode(["address[]"], data);
    console.log(address)
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})