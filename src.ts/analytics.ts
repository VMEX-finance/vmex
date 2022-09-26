import { Signer } from "@ethersproject/abstract-signer";
import { ContractFactory } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Interface } from "@ethersproject/abi";
import { deployments } from "./constants";
import getUserTokenData from "../artifacts/contracts/analytics/queries/getUserTokenData.sol/TokenReserveData.json";
import _ from "lodash";

export async function getTokenReserveData(signer: Signer) {
    // const provider = new JsonRpcProvider('http://127.0.0.1:8545');
    // const signer = signer.connect(provider);

    let contractFactory = new ContractFactory(getUserTokenData.abi, getUserTokenData.bytecode);
    let data = await signer.provider?.call({
        data: contractFactory.getDeployTransaction(deployments.LendingPoolAddressesProvider.localhost.address, await signer.getAddress()).data
    })

    const iface = new Interface(getUserTokenData.abi);
    const returnData = await iface.decodeFunctionResult("getType", (data as string));
    return returnData['0'];
}


