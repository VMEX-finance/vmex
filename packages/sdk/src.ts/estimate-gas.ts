import { BigNumber, ethers } from "ethers";
import { MAX_UINT_AMOUNT } from "./constants";
import { getLendingPool } from "./contract-getters";
import { convertToCurrencyDecimals } from "./utils";

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
    const client = await params.signer.getAddress();
    const amount = await convertToCurrencyDecimals(
      params.asset,
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
    switch(params.function) {
      case 'supply': 
        gasCost = await lendingPool.connect(params.signer).estimateGas.deposit(
          params.underlying,
          params.trancheId,
          amount,
          client,
          params.referrer || 0
        );
        break;
      case 'borrow': 
        gasCost = await lendingPool.connect(params.signer).estimateGas.borrow(
          params.underlying,
          params.trancheId,
          amount,
          params.referrer || 0,
          client
        );
        break;
      case 'withdraw': 
        gasCost = await lendingPool.connect(params.signer).estimateGas.withdraw(
          params.asset,
          params.trancheId,
          (params.isMax ? MAX_UINT_AMOUNT : amount),
          client
        );
        break;
      case 'repay': 
        gasCost = await lendingPool.connect(params.signer).estimateGas.withdraw(
          params.asset,
          params.trancheId,
          (params.isMax ? MAX_UINT_AMOUNT : amount),
          client
        );
        break;
    }
    return gasCost;
  } catch (err) {
    console.error(err);
  }
}