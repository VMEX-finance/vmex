import { bytecode, abi } from "../artifacts/contracts/analytics-utilities/UserBalanceAcrossTranches.sol/UserBalanceAcrossTranches.json";
import hre from "hardhat";
import deployments from "../deployed-contracts.json"
const { ethers, artifacts } = hre;

(async() => {
	const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545"); 
	const [signer] = await ethers.getSigners();
	const user = await signer.getAddress();
	const balanceProvider = deployments.WalletBalanceProvider.localhost.address;
	const _provider = deployments.LendingPoolAddressesProvider.localhost.address;	
	let contractFactory = new ethers.ContractFactory(abi, bytecode);
	let data = await provider.call({
		data: contractFactory.getDeployTransaction(user, _provider, balanceProvider).data 
	});
	let iface = new ethers.utils.Interface(abi);
	let _data = await iface.decodeFunctionResult("getType", data);
	console.log(_data);
})();
