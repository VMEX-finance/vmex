import { BigNumber, ethers } from "ethers";
import {
  getLendingPool,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
} from "./contract-getters";
import {
  approveUnderlyingIfFirstInteraction,
  chunk,
  convertListSymbolToAddress,
  convertSymbolToAddress,
  convertToCurrencyDecimals,
} from "./utils";
import { getTotalTranches } from "./analytics";
import { SetAddress } from "./interfaces";
import { MAX_UINT_AMOUNT } from "./constants";

export async function borrow(
  params: {
    underlying: string;
    trancheId: number;
    amount: ethers.BigNumber | number | string;
    referrer?: number;
    signer: ethers.Signer;
    network: string;
    isMax?: boolean;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  params.underlying = convertSymbolToAddress(params.underlying,params.network);
  let tx, amount;
  if(params.isMax) {
    amount = MAX_UINT_AMOUNT;
  } else{
    amount = await convertToCurrencyDecimals(
      params.underlying,
      params.amount.toString(),
      params.test,
      params.providerRpc
    );
  }
  let client = await params.signer.getAddress();
  let lendingPool = await getLendingPool({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });
  if (params.test) {
    tx = await lendingPool.borrow(
      params.underlying,
      params.trancheId,
      amount,
      params.referrer || 0,
      client,
      {
        gasLimit: "8000000",
      }
    );
  } else {
    tx = await lendingPool.borrow(
      params.underlying,
      params.trancheId,
      amount,
      params.referrer || 0,
      client
    );
  }

  if (callback) {
    await callback().catch((error) => {
      console.error("CALLBACK_ERROR: \n", error);
    });
  }
  return tx;
}

export async function markReserveAsCollateral(
  params: {
    signer: ethers.Signer;
    network: string;
    asset: string;
    trancheId: number;
    useAsCollateral: boolean;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  params.asset = convertSymbolToAddress(params.asset,params.network);
  let tx;
  const client = await params.signer.getAddress();
  const lendingPool = await getLendingPool({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });
  tx = await lendingPool.setUserUseReserveAsCollateral(
    params.asset,
    params.trancheId,
    params.useAsCollateral
  );

  if (callback) {
    await callback();
  }
  return tx;
}

export async function withdraw(
  params: {
    asset: string;
    to?: string;
    trancheId: number;
    signer: ethers.Signer;
    interestRateMode: number;
    referralCode?: number;
    network: string;
    amount: number | ethers.BigNumberish;
    isMax?: boolean;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  params.asset = convertSymbolToAddress(params.asset,params.network);
  let tx;
  let amount = await convertToCurrencyDecimals(
    params.asset,
    params.amount.toString(),
    params.test,
    params.providerRpc
  );
  let client = await params.signer.getAddress();
  let to = params.to || client;
  console.log("client: ", client);
  console.log("to: ", to);
  let lendingPool = await getLendingPool({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });
  if (params.isMax) {
    tx = await lendingPool.withdraw(
      params.asset,
      params.trancheId,
      MAX_UINT_AMOUNT,
      client
    );
  } else {
    tx = await lendingPool.withdraw(
      params.asset,
      params.trancheId,
      amount,
      client
    );
  }

  if (callback) {
    await callback().catch((error) => {
      console.error("CALLBACK_ERROR: \n", error);
    });
  }

  return tx;
}

export async function repay(
  params: {
    asset: string;
    trancheId: number;
    signer: ethers.Signer;
    amount: number | ethers.BigNumberish;
    network: string;
    isMax?: boolean;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  params.asset = convertSymbolToAddress(params.asset,params.network);
  console.log("Repay: ",params);
  let tx;
  let amount = await convertToCurrencyDecimals(
    params.asset,
    params.amount.toString(),
    params.test,
    params.providerRpc
  );
  let client = await params.signer.getAddress();
  let lendingPool = await getLendingPool({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  try {
    await approveUnderlyingIfFirstInteraction(
      params.signer,
      params.asset,
      lendingPool.address
    );
  } catch (error) {
    throw new Error(
      "failed to approve spend for underlying asset, error: " +
        error +
        " amount is " +
        amount.toString()
    );
  }
  if (params.isMax) {
    tx = await lendingPool.repay(
      params.asset,
      params.trancheId,
      MAX_UINT_AMOUNT,
      client
    );
  } else {
    tx = await lendingPool.repay(
      params.asset,
      params.trancheId,
      amount,
      client
    );
  }

  if (callback) {
    await callback().catch((error) => {
      console.error("CALLBACK_ERROR: \n", error);
    });
  }
  return tx;
}

export async function supply(
  params: {
    underlying: string;
    trancheId: number;
    amount: string;
    signer: ethers.Signer;
    network: string;
    isMax?: boolean;
    referrer?: number;
    collateral?: boolean;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  params.underlying = convertSymbolToAddress(params.underlying,params.network);
  let tx;
  let client = await params.signer.getAddress();
  let amount;
  if(params.isMax) {
    amount = MAX_UINT_AMOUNT;
  } else{
    amount = await convertToCurrencyDecimals(
      params.underlying,
      params.amount,
      params.test,
      params.providerRpc
    );
  }
  let lendingPool = await getLendingPool({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  try {
    await approveUnderlyingIfFirstInteraction(
      params.signer,
      params.underlying,
      lendingPool.address
    );
  } catch (error) {
    throw new Error(
      "failed to approve spend for underlying asset, error: " +
        error +
        " amount is " +
        amount.toString()
    );
  }

  try {
    if (params.test) {
      tx = await lendingPool.deposit(
        params.underlying,
        params.trancheId,
        amount,
        client,
        params.referrer || 0,
        {
          gasLimit: "8000000",
        }
      );
    } else {
      tx = await lendingPool.deposit(
        params.underlying,
        params.trancheId,
        amount,
        client,
        params.referrer || 0
      );
    }
  } catch (error) {
    console.log("Lending Pool Failed with ")
    throw new Error(error);
  }

  if (params.collateral === false) {
    await lendingPool.setUserUseReserveAsCollateral(
      params.underlying,
      params.trancheId,
      params.collateral
    );
  }

  if (callback) {
    await callback();
  }
  return tx;
}

// TODO: return transaction hash;
export async function lendingPoolPause(
  params: {
    approvedSigner: ethers.Signer;
    setPause: boolean;
    network: string;
    tranche: number;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  console.log(params)
  const addressProvider = await getLendingPoolAddressesProvider({
    network: params.network,
    signer: params.approvedSigner,
    test: params.test,
    providerRpc: params.providerRpc,
  });
  if (
    (await params.approvedSigner.getAddress()) !==
    (await addressProvider.getTrancheAdmin(params.tranche))
  )
    throw new Error("signer must be pool admin");
  const lendingPool = await getLendingPool({
    signer: params.approvedSigner,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  try {
    const configurator = await getLendingPoolConfiguratorProxy({
      network: params.network,
      signer: params.approvedSigner,
      test: params.test,
      providerRpc: params.providerRpc,
    });

    await configurator.setTranchePause(false, params.tranche);
    return await lendingPool.paused(params.tranche);
  } catch (error) {
    console.log(error);
    throw error;
    // throw new Error("Failed to set LendingPool Pause Status")
  }
}

// export async function claimTrancheId(params: {
//     name: string;
//     admin: ethers.Signer;
//     network: string;
// }, callback?: () => Promise<any>) {
//     let configurator = await getLendingPoolConfiguratorProxy({
//       network: params.network,
//       signer: params.admin
//      });

//     if (callback) {
//         return await callback()
//     }
// }

export async function initNewReserves(
  params: {
    trancheId: string;
    assetAddresses: string[];
    reserveFactors: string[];
    canBorrow: boolean[];
    canBeCollateral: boolean[];
    admin: ethers.Signer;
    incentivesController: string;
    network: string;
    test?: boolean;
    providerRpc?: string;
    chunks?: number;
  },
  callback?: () => Promise<any>
) {
  let tx;
  const mytranche = params.trancheId;
  let configurator = await getLendingPoolConfiguratorProxy({
    network: params.network,
    signer: params.admin,
    test: params.test,
    providerRpc: params.providerRpc,
  });
  let initInputParams: {
    underlyingAsset: string;
    incentivesController: string;
    interestRateChoice: string; //1,000,000
    reserveFactor: string;
    canBorrow: boolean;
    canBeCollateral: boolean;
  }[] = [];
  for (let i = 0; i < params.assetAddresses.length; i++) {
    initInputParams.push({
      underlyingAsset: params.assetAddresses[i],
      incentivesController: params.incentivesController,
      interestRateChoice: "0",
      reserveFactor: params.reserveFactors[i],
      canBorrow: params.canBorrow[i],
      canBeCollateral: params.canBeCollateral[i],
    });
  }

  let initChunks = params.chunks ? params.chunks : 5;

  const chunkedSymbols = chunk(params.assetAddresses, initChunks);
  const chunkedInitInputParams = chunk(initInputParams, initChunks);

  try {
    // Deploy init reserves per tranche
    // tranche CONFIGURATION

    console.log(
      `- Reserves initialization in ${chunkedInitInputParams.length} txs`
    );
    for (
      let chunkIndex = 0;
      chunkIndex < chunkedInitInputParams.length;
      chunkIndex++
    ) {
      const tx3 = await configurator.batchInitReserve(
        chunkedInitInputParams[chunkIndex],
        mytranche
      );

      console.log(`  - Reserve ready for: ${chunkedSymbols[chunkIndex].join(", ")}`);
      console.log("    * gasUsed", (await tx3.wait(1)).gasUsed.toString());
      tx = tx3;
    }

  } catch (error) {
    throw new Error("Configurator Failed durining init reserve with " + error);
  }

  if (callback) {
    await callback();
  }
  return tx;
}

export async function initTranche(
  params: {
    name: string;
    whitelisted: string[];
    blacklisted: string[];
    assetAddresses: string[];
    reserveFactors: string[];
    canBorrow: boolean[];
    canBeCollateral: boolean[];
    admin: ethers.Signer;
    treasuryAddress: string;
    incentivesController: string;
    network: string;
    test?: boolean;
    providerRpc?: string;
    chunks?: number;
  },
  callback?: () => Promise<any>
) {

  params.assetAddresses = convertListSymbolToAddress(params.assetAddresses,params.network);
  // assert(params.assetAddresses.length == params.reserveFactors.length, "array lengths not equal");
  // assert(params.assetAddresses.length == params.canBorrow.length, "array lengths not equal");
  // assert(params.assetAddresses.length == params.canBeCollateral.length, "array lengths not equal");
  let tx;
  let mytranche = (
    await getTotalTranches({
      network: params.network,
      test: params.test,
      providerRpc: params.providerRpc
    })
  ).toString();

  let configurator = await getLendingPoolConfiguratorProxy({
    network: params.network,
    signer: params.admin,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  try {
    let tx = await configurator.claimTrancheId(
      params.name,
      await params.admin.getAddress()
    );

    await tx.wait();  // wait 1 network confirmation
  } catch (error) {
    throw new Error("Configurator Failed with " + error);
  }

  try {
    let tx = await configurator.updateTreasuryAddress(
      params.treasuryAddress,
      mytranche
    );

    await tx.wait();  // wait 1 network confirmation
  } catch (error) {
    throw new Error("Configurator Failed updating treasury address with " + error);
  }

  if (params.whitelisted.length != 0) {
    try {
      console.log("Setting whitelist");
      const tx4 = await configurator.setTrancheWhitelist(
        mytranche,
        params.whitelisted,
        new Array(params.whitelisted.length).fill(true)
      );
      console.log("    * gasUsed", (await tx4.wait(1)).gasUsed.toString());
    } catch (error) {
      throw new Error(
        "Configurator Failed during setting whitelist with " + error
      );
    }
  }
  if (params.blacklisted.length != 0) {
    try {
      console.log("Setting blacklisted");
      const tx4 = await configurator.setTrancheBlacklist(
        mytranche,
        params.blacklisted,
        new Array(params.blacklisted.length).fill(true)
      );
      console.log("    * gasUsed", (await tx4.wait(1)).gasUsed.toString());
    } catch (error) {
      throw new Error(
        "Configurator Failed during setting blacklisted with " + error
      );
    }
  }
  return initNewReserves(
    {
      trancheId: mytranche,
      ...params
    }, callback
  );
}

export async function configureExistingTranche(
  params: {
    trancheId: string;
    newName?: string | undefined; //undefined if no change
    isTrancheWhitelisted?: boolean | undefined;
    whitelisted?: SetAddress[];
    blacklisted?: SetAddress[];
    reserveFactors?: SetAddress[];
    canBorrow?: SetAddress[];
    canBeCollateral?: SetAddress[];
    isFrozen?: SetAddress[];
    admin: ethers.Signer;
    newTreasuryAddress?: string | undefined;
    network: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  //configure existing
  console.log(params)
  let tx;
  const mytranche = params.trancheId;
  let configurator = await getLendingPoolConfiguratorProxy({
    network: params.network,
    signer: params.admin,
    test: params.test,
    providerRpc: params.providerRpc,
  });
  if(params.newName){
    try {
    console.log("Setting new name");
      const tx4 = await configurator.changeTrancheName(
        mytranche,
        params.newName
      );
      console.log("    * gasUsed", (await tx4.wait(1)).gasUsed.toString());
    } catch (error) {
      throw new Error(
        "Configurator Failed during setting new name with " + error
      );
    }
  }
  if(params.newTreasuryAddress){
    try {
    console.log("Setting new treasury address");
      const tx4 = await configurator.updateTreasuryAddress(
        params.newTreasuryAddress,
        mytranche,
      );
      console.log("    * gasUsed", (await tx4.wait(1)).gasUsed.toString());
    } catch (error) {
      throw new Error(
        "Configurator Failed during setting new treasury address with " + error
      );
    }
  }
  if(params.isTrancheWhitelisted !== undefined){
    try {
    console.log("Setting isTrancheWhitelisted");
      const tx4 = await configurator.setTrancheWhitelistEnabled(
        mytranche,
        params.isTrancheWhitelisted
      );
      console.log("    * gasUsed", (await tx4.wait(1)).gasUsed.toString());
    } catch (error) {
      throw new Error(
        "Configurator Failed during setting isTrancheWhitelisted with " + error
      );
    }
  }
  if (params.whitelisted && params.whitelisted.length != 0) {
    try {
      console.log("Setting whitelist");
      const tx4 = await configurator.setTrancheWhitelist(
        mytranche,
        params.whitelisted.map((el:SetAddress) => el.addr),
        params.whitelisted.map((el:SetAddress) => el.newValue)
      );
      console.log("    * gasUsed", (await tx4.wait(1)).gasUsed.toString());
    } catch (error) {
      throw new Error(
        "Configurator Failed during setting whitelist with " + error
      );
    }
  }
  if (params.blacklisted && params.blacklisted.length != 0) {
    try {
      console.log("Setting blacklisted");
      const tx4 = await configurator.setTrancheBlacklist(
        mytranche,
        params.blacklisted.map((el:SetAddress) => el.addr),
        params.blacklisted.map((el:SetAddress) => el.newValue)
      );
      console.log("    * gasUsed", (await tx4.wait(1)).gasUsed.toString());
    } catch (error) {
      throw new Error(
        "Configurator Failed during setting blacklisted with " + error
      );
    }
  }

  // The below el.addr refers to the token that needs to be set. When calling sdk, you pass in the token symbol like "USDC", so here we need to convert that
  if (params.reserveFactors && params.reserveFactors.length != 0) {
    try {
      console.log("Setting reserveFactors: ",params.reserveFactors.map((el:SetAddress) => convertSymbolToAddress(el.addr,params.network)), params.reserveFactors.map((el:SetAddress) => el.newValue));
      const tx4 = await configurator.setReserveFactor(
        params.reserveFactors.map((el:SetAddress) => convertSymbolToAddress(el.addr,params.network)),
        mytranche,
        params.reserveFactors.map((el:SetAddress) => el.newValue)
      );
      console.log("    * gasUsed", (await tx4.wait(1)).gasUsed.toString());
    } catch (error) {
      throw new Error(
        "Configurator Failed during setting reserve factors with " + error
      );
    }
  }
  if (params.canBorrow && params.canBorrow.length != 0) {
    try {
      console.log("Setting canBorrow");
      const tx4 = await configurator.setBorrowingOnReserve(
        params.canBorrow.map((el:SetAddress) => convertSymbolToAddress(el.addr,params.network)),
        mytranche,
        params.canBorrow.map((el:SetAddress) => el.newValue)
      );
      console.log("    * gasUsed", (await tx4.wait(1)).gasUsed.toString());
    } catch (error) {
      throw new Error(
        "Configurator Failed during setting can borrow with " + error
      );
    }
  }
  if (params.canBeCollateral && params.canBeCollateral.length != 0) {
    try {
      console.log("Setting canBeCollateral");
      const tx4 = await configurator.setCollateralEnabledOnReserve(
        params.canBeCollateral.map((el:SetAddress) => convertSymbolToAddress(el.addr,params.network)),
        mytranche,
        params.canBeCollateral.map((el:SetAddress) => el.newValue)
      );
      console.log("    * gasUsed", (await tx4.wait(1)).gasUsed.toString());
    } catch (error) {
      throw new Error(
        "Configurator Failed during setting canBeCollateral with " + error
      );
    }
  }
  if (params.isFrozen && params.isFrozen.length != 0) {
    try {
      console.log("Setting frozen");
      const tx4 = await configurator.setFreezeReserve(
        params.isFrozen.map((el:SetAddress) => convertSymbolToAddress(el.addr,params.network)),
        mytranche,
        params.isFrozen.map((el:SetAddress) => el.newValue)
      );
      console.log("    * gasUsed", (await tx4.wait(1)).gasUsed.toString());
    } catch (error) {
      throw new Error(
        "Configurator Failed during setting isFrozen with " + error
      );
    }
  }
}