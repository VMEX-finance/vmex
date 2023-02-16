import { BigNumber, ethers } from "ethers";
import { MAX_UINT_AMOUNT } from "./constants";
import { getLendingPool } from "./contract-getters";
import { convertSymbolToAddress, convertToCurrencyDecimals } from "./utils";

// TODO: continue implementing every function in this
export async function estimateGas(
  params: {
    function: 'supply' | 'borrow' | 'withdraw' | 'repay';
    providerRpc?: string;
    signer: ethers.Signer;
    network: string;
    amount?: number | ethers.BigNumberish;
    isMax?: boolean;
    test?: boolean;
    asset?: string;
    trancheId?: number;
    underlying?: string;
    referrer?: number;
  }
) {
  try {
    if(!params.amount || params.amount === 'N/A') return BigNumber.from('0');

    const client = await params.signer.getAddress();
    const tokenAddress = convertSymbolToAddress((params.asset || params.underlying), params.network);
    const amount = await convertToCurrencyDecimals(
      tokenAddress,
      params.amount.toString(),
      params.test,
      params.providerRpc
    );
    const lendingPool = await getLendingPool({
      signer: params.signer,
      network: params.network,
      test: params.test,
      providerRpc: params.providerRpc
    })
    let gasCost = BigNumber.from('0');
    const optionalParams = params.test ? {gasLimit: "8000000"} : {}
    switch(params.function) {
      case 'supply': 
        gasCost = await lendingPool.connect(params.signer).estimateGas.deposit(
          tokenAddress,
          params.trancheId,
          amount,
          client,
          params.referrer || 0,
          optionalParams
        );
        break;
      case 'borrow': 
        gasCost = await lendingPool.connect(params.signer).estimateGas.borrow(
          tokenAddress,
          params.trancheId,
          amount,
          params.referrer || 0,
          client,
          optionalParams
        );
        break;
      case 'withdraw': 
        gasCost = await lendingPool.connect(params.signer).estimateGas.withdraw(
          tokenAddress,
          params.trancheId,
          (params.isMax ? MAX_UINT_AMOUNT : amount),
          client,
          optionalParams
        );
        break;
      case 'repay': 
        gasCost = await lendingPool.connect(params.signer).estimateGas.repay(
          tokenAddress,
          params.trancheId,
          (params.isMax ? MAX_UINT_AMOUNT : amount),
          client,
          optionalParams
        );
        break;
    }   
    return gasCost;
  } catch (err) {
    console.error(err);
  }
}