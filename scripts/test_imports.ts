import { deployments } from "../dist/src.ts/constants";
import FullAppAnalytics from "../artifacts/contracts/analytics/FullAppAnalytics.sol/FullAppAnalytics.json";
import hre from "hardhat";
const { ethers } = hre;
import _ from "lodash";

( async () => {
    const [ signer ] = await ethers.getSigners();
    const address = await signer.getAddress();

    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    let contractFactory = new ethers.ContractFactory(FullAppAnalytics.abi, FullAppAnalytics.bytecode)
    let data = await provider.call({
        data: contractFactory.getDeployTransaction(deployments.LendingPoolAddressesProvider.hardhat.address, address).data
    });

    
    const _iface = new ethers.utils.Interface(FullAppAnalytics.abi);
    let _data = await _iface.decodeFunctionResult("getType", data)
    // const _data = await new ethers.utils.AbiCoder().decode(["tuple(address[])"], data)
    console.log(_data['0'])
})()