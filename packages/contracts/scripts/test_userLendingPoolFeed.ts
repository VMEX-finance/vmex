import UserLendingPoolFeed from "../artifacts/contracts/analytics/UserLendingPoolFeed.sol/UserLendingPoolFeed.json";
import hre from "hardhat";
const { ethers } = hre;
import _ from "lodash";

(async () => {
    const [signer] = await ethers.getSigners();
    const _address = await signer.getAddress();
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    let contractFactory = new ethers.ContractFactory(UserLendingPoolFeed.abi, UserLendingPoolFeed.bytecode);
    let data = await provider.call({ data: contractFactory.getDeployTransaction(_address, "0xda24DebbEcECe2270a5Ff889AEfC71Dcf4B8A3D5").data });
    const [address] = await new ethers.utils.AbiCoder().decode(["uint256[6][]"], data);
    console.log(address)
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})