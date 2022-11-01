import TokenReserveData from "../artifacts/contracts/analytics/queries/getUserTokenData.sol/TokenReserveData.json";
import deployments from "../deployed-contracts.json";
import hre from "hardhat";
const { ethers, network } = hre;

(async () => {
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const [ signer ] = await ethers.getSigners();
    const address = await signer.getAddress();

   const contractFactory = new ethers.ContractFactory(TokenReserveData.abi, TokenReserveData.bytecode);
   let data = await provider.call({
    data: contractFactory.getDeployTransaction(deployments.LendingPoolAddressesProvider.localhost.address, address).data
   })

   const iface = new ethers.utils.Interface(TokenReserveData.abi);
   let _data = await iface.decodeFunctionResult("getType", data);
   console.log(_data['0']);
   
   

})()