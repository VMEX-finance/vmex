import UserLendingPoolFeed from "../artifacts/contracts/analytics/UserLendingPoolFeed.sol/UserLendingPoolFeed.json";
import hre from "hardhat";
const { ethers } = hre;
import _ from "lodash";

(async () => {
    const [signer] = await ethers.getSigners();
    const _address = await signer.getAddress();
    const provider = new ethers.providers.InfuraProvider("mainnet", "ca0da016dedf4c5a9ee90bfdbafee233");
    let contractFactory = new ethers.ContractFactory(UserLendingPoolFeed.abi, UserLendingPoolFeed.bytecode);
    let data = await provider.call({ data: contractFactory.getDeployTransaction(_address, "0xc3dd7a5CAC7EbAEa8356da9DE8E04ceFE7E5C075").data });
    const [address] = await new ethers.utils.AbiCoder().decode(["uint256[6][]"], data);
    console.log(address)
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})