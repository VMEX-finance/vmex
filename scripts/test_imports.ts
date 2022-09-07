import { deployments } from "../dist/src.ts/constants";
import getTokenReserveData from "../artifacts/contracts/analytics/queries/getTokenReserveData.sol/getTokenReserveData.json";
import hre from "hardhat";
const { ethers } = hre;
import _ from "lodash";

( async () => {
    const [ signer ] = await ethers.getSigners();
    const address = await signer.getAddress();

    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    let contractFactory = new ethers.ContractFactory(getTokenReserveData.abi, getTokenReserveData.bytecode)
    let data = await provider.call({
        data: contractFactory.getDeployTransaction(deployments.LendingPoolAddressesProvider.hardhat.address, 0).data
    });

    
    // const _data = await new ethers.utils.AbiCoder().decode(["string[22]"], data)
    const _iface = new ethers.utils.Interface(getTokenReserveData.abi);
    let _data = await _iface.decodeFunctionResult("getType", data)
    console.log(_.uniq(_data['0']))
})()