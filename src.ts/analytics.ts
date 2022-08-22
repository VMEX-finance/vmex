import { Signer } from "@ethersproject/abstract-signer";
import { ContractFactory, ethers } from "ethers";
import UserTokenBalance from "../artifacts/contracts/analytics/UserTokenBalance.sol/UserTokenBalance.json";
import { TOKEN_ADDR_MAINNET } from "./constants";
export async function getUserTokenBalances(signer: Signer) {
    if (!signer.provider) return { response: { balances: null }}
    let contractFactory = new ContractFactory(UserTokenBalance.abi, UserTokenBalance.bytecode);
    let data = await signer.provider.call({ data: contractFactory.getDeployTransaction(await signer.getAddress(), Object.values(TOKEN_ADDR_MAINNET)).data});
    let [ balances] = await new ethers.utils.AbiCoder().decode(["uint256[]"], data);
    return { response: { balances }}
}

async function userTrancheData() {

}

async function tokenTrancheData() {
    
}