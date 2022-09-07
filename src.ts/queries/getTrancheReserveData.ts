import { Signer } from "@ethersproject/abstract-signer";
import { ContractFactory, ethers, providers } from "ethers";
import getTokenReserveData from "../../artifacts/contracts/analytics/queries/getTokenReserveData.sol/getTokenReserveData.json";
import { deployments } from "../constants";
import _ from "lodash";

/**
 * gets tranche reserve data for all deployed tokens over each tranch.
 * uses a batch request RPC to loop over all three tranches as one request.
 * @param signer 
 * @returns returnData
 */
async function getTrancheReserveData(signer: Signer) {
    if (!signer.provider) return { response: { data: null }};
    let contractFactory = new ContractFactory(getTokenReserveData.abi, getTokenReserveData.bytecode);
    let data = await signer.provider.call({ 
        data: contractFactory.getDeployTransaction(deployments.LendingPoolAddressesProvider.hardhat.address, 0).data
    })
    
    const iFace = new ethers.utils.Interface(getTokenReserveData.abi);
    const returnData = await iFace.decodeFunctionResult("getType", data);
    return(_.uniq(returnData['0']));
}


export default getTrancheReserveData;

