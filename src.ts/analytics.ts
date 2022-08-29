import { Signer } from "@ethersproject/abstract-signer";
import { ContractFactory, ethers, providers } from "ethers";
import { formatUnits } from "@ethersproject/units";
import _ from "lodash";

import UserTokenBalance from "../artifacts/contracts/analytics/UserTokenBalance.sol/UserTokenBalance.json";
import TrancheReserveData from "../artifacts/contracts/analytics/TrancheReserveData.sol/TrancheReserveData.json";
import { TOKEN_ADDR_MAINNET } from "./constants";
export async function getUserTokenBalances(signer: Signer) {
    if (!signer.provider) return { response: { balances: null }}
    let contractFactory = new ContractFactory(UserTokenBalance.abi, UserTokenBalance.bytecode);
    let data = await signer.provider.call({ data: contractFactory.getDeployTransaction(await signer.getAddress(), Object.values(TOKEN_ADDR_MAINNET)).data});
    let [ balances] = await new ethers.utils.AbiCoder().decode(["uint256[]"], data);
    const _balances = balances.map((bal) => formatUnits(bal, 18))
    const format_response = _.zipObject(Object.keys(TOKEN_ADDR_MAINNET), _balances)
    return { response: { format_response }}
}

async function userTrancheReserveData(signer: Signer, tranche: number) {
    if (!signer.provider) return { response: { data: null }};
    let contractFactory = new ContractFactory(TrancheReserveData.abi, TrancheReserveData.bytecode);
    let _data = await signer.provider.call({data: contractFactory.getDeployTransaction("0xda24DebbEcECe2270a5Ff889AEfC71Dcf4B8A3D5", tranche).data});
    const [ address, tData ] = await new ethers.utils.AbiCoder().decode(["string[20]", "uint128[7][]"], _data);
    return {
        response: {
            data: _.zipObject(address, tData)
        }
    }
}

async function tokenTrancheData() {
    
}