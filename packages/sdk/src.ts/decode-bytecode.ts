import ethers from "ethers";

export function decodeConstructorBytecode(abi: any, bytecode: any, provider: any, params: any) {
	let contractFactory = new ethers.ContractFactory(abi, bytecode);
	try {
		let data = await provider.call({
			data: contractFactory.getDeployTransaction(...params).data
		});
		let iface = new ethers.utils.Interface(abi);
		let _data = await iface.decodeFunctionResult("getType", data);
	} catch (error) {
		throw new Error("failed to make eth_call_query");
	}

	return(_data);
}
