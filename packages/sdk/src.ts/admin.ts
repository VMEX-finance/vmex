import { ethers } from "ethers";
import {
  getLendingPoolAddressesProvider, getLendingPoolConfiguratorProxy,
} from "./contract-getters";
import { ConfigureCollateralParamsInput } from "./interfaces";

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

export async function verifyTranche(
  params: {
    signer: ethers.Signer;
    trancheId: number;
    network: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  const lendingPoolConfigurator = await getLendingPoolConfiguratorProxy({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });
  const tx = await lendingPoolConfigurator.verifyTranche(
    params.trancheId
  );

  if (callback) {
    await callback();
  }
  return tx;
}

export async function unverifyTranche(
  params: {
    signer: ethers.Signer;
    trancheId: number;
    network: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  const lendingPoolConfigurator = await getLendingPoolConfiguratorProxy({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });
  const tx = await lendingPoolConfigurator.unverifyTranche(
    params.trancheId
  );

  if (callback) {
    await callback();
  }
  return tx;
}

export async function batchConfigureCollateralParams(
  params: {
    signer: ethers.Signer;
    input: ConfigureCollateralParamsInput[];
    trancheId: number;
    network: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  const lendingPoolConfigurator = await getLendingPoolConfiguratorProxy({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });
  const tx = await lendingPoolConfigurator.batchConfigureCollateralParams(
    params.input,
    params.trancheId
  );

  if (callback) {
    await callback();
  }
  return tx;
}
