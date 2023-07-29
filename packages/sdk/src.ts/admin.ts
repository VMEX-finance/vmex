import { ethers } from "ethers";
import {
  getLendingPoolAddressesProvider,
} from "./contract-getters";

export async function setGlobalAdmin(
  params: {
    signer: ethers.Signer;
    newGlobalAdmin: ethers.BigNumberish;
    network: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  const lendingPoolAddressesProvider = await getLendingPoolAddressesProvider({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });
  const tx = await lendingPoolAddressesProvider.setGlobalAdmin(
    params.newGlobalAdmin
  );

  if (callback) {
    await callback();
  }
  return tx;
}
