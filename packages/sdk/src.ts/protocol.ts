import { ethers } from "ethers";
import {
  getLendingPool,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
} from "./contract-getters";
import {
  approveUnderlyingIfFirstInteraction,
  convertToCurrencyDecimals,
} from "./utils";
import { getTotalTranches } from "./analytics";

const MAX_UINT_AMOUNT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export async function borrow(
  params: {
    underlying: string;
    trancheId: number;
    amount: ethers.BigNumber | number | string;
    referrer?: number;
    signer: ethers.Signer;
    network: string;
    test?: boolean;
  },
  callback?: () => Promise<any>
) {
  let tx;
  let amount = await convertToCurrencyDecimals(
    params.underlying,
    params.amount.toString()
  );
  let client = await params.signer.getAddress();
  let lendingPool = await getLendingPool({
    signer: params.signer,
    network: params.network,
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
  return tx?.hash;
}

export async function markReserveAsCollateral(
  params: {
    signer: ethers.Signer;
    network: string;
    asset: string;
    trancheId: number;
    useAsCollateral: boolean;
  },
  callback?: () => Promise<any>
) {
  let tx;
  const client = await params.signer.getAddress();
  const lendingPool = await getLendingPool({
    signer: params.signer,
    network: params.network,
  });
  tx = await lendingPool.setUserUseReserveAsCollateral(
    params.asset,
    params.trancheId,
    params.useAsCollateral
  );

  if (callback) {
    await callback();
  }
  return tx?.hash;
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
  },
  callback?: () => Promise<any>
) {
  let tx;
  let amount = await convertToCurrencyDecimals(
    params.asset,
    params.amount.toString()
  );
  let client = await params.signer.getAddress();
  let to = params.to || client;
  console.log("client: ", client);
  console.log("to: ", to);
  let lendingPool = await getLendingPool({
    signer: params.signer,
    network: params.network,
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

  return tx?.hash;
}

export async function repay(
  params: {
    asset: string;
    trancheId: number;
    signer: ethers.Signer;
    amount: number | ethers.BigNumberish;
    network: string;
    isMax?: boolean;
  },
  callback?: () => Promise<any>
) {
  let tx;
  let amount = await convertToCurrencyDecimals(
    params.asset,
    params.amount.toString()
  );
  let client = await params.signer.getAddress();
  let lendingPool = await getLendingPool({
    signer: params.signer,
    network: params.network,
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
  return tx?.hash;
}

export async function supply(
  params: {
    underlying: string;
    trancheId: number;
    amount: string;
    signer: ethers.Signer;
    network: string;
    referrer?: number;
    collateral?: boolean;
    test?: boolean;
  },
  callback?: () => Promise<any>
) {
  let tx;
  let client = await params.signer.getAddress();
  let amount = await convertToCurrencyDecimals(
    params.underlying,
    params.amount
  );
  let lendingPool = await getLendingPool({
    signer: params.signer,
    network: params.network,
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
    throw new Error("Lending Pool Failed with " + error);
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
  return tx?.hash;
}

// TODO: return transaction hash;
export async function lendingPoolPause(
  params: {
    approvedSigner: ethers.Signer;
    setPause: boolean;
    network: string;
    tranche: number;
  },
  callback?: () => Promise<any>
) {
  const addressProvider = await getLendingPoolAddressesProvider({
    network: params.network,
    signer: params.approvedSigner,
  });
  if (
    (await params.approvedSigner.getAddress()) !==
    (await addressProvider.getPoolAdmin(params.tranche))
  )
    throw new Error("signer must be pool admin");
  const lendingPool = await getLendingPool({
    signer: params.approvedSigner,
    network: params.network,
  });

  try {
    const configurator = await getLendingPoolConfiguratorProxy({
      network: params.network,
      signer: params.approvedSigner,
    });

    await configurator.setPoolPause(false, params.tranche);
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
  },
  callback?: () => Promise<any>
) {
  // assert(params.assetAddresses.length == params.reserveFactors.length, "array lengths not equal");
  // assert(params.assetAddresses.length == params.canBorrow.length, "array lengths not equal");
  // assert(params.assetAddresses.length == params.canBeCollateral.length, "array lengths not equal");
  let tx;
  let mytranche = (
    await getTotalTranches({
      network: params.network,
    })
  ).toString();

  let configurator = await getLendingPoolConfiguratorProxy({
    network: params.network,
    signer: params.admin,
  });

  try {
    await configurator.claimTrancheId(
      params.name,
      await params.admin.getAddress(),
      {
        gasLimit: "8000000",
      }
    );
  } catch (error) {
    throw new Error("Configurator Failed with " + error);
  }

  let initInputParams: {
    underlyingAsset: string;
    treasury: string;
    incentivesController: string;
    interestRateChoice: string; //1,000,000
    reserveFactor: string;
    canBorrow: boolean;
    canBeCollateral: boolean;
  }[] = [];
  for (let i = 0; i < params.assetAddresses.length; i++) {
    initInputParams.push({
      underlyingAsset: params.assetAddresses[i],
      treasury: params.treasuryAddress,
      incentivesController: params.incentivesController,
      interestRateChoice: "0",
      reserveFactor: params.reserveFactors[i],
      canBorrow: params.canBorrow[i],
      canBeCollateral: params.canBeCollateral[i],
    });
  }

  console.log(initInputParams);

  try {
    // Deploy init reserves per tranche
    // tranche CONFIGURATION
    console.log(`- Reserves initialization in ${initInputParams.length} txs`);
    const tx3 = await configurator.batchInitReserve(
      initInputParams,
      mytranche,
      {
        gasLimit: "80000000",
      }
    );

    console.log(`  - Reserve ready for: ${params.assetAddresses.join(", ")}`);
    console.log("    * gasUsed", (await tx3.wait(1)).gasUsed.toString());
    tx = tx3;
  } catch (error) {
    throw new Error("Configurator Failed durining init reserve with " + error);
  }

  if (params.whitelisted.length != 0) {
    try {
      console.log("Setting whitelist");
      const tx4 = await configurator.setWhitelist(
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
      const tx4 = await configurator.setBlacklist(
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

  if (callback) {
    await callback();
  }
  return tx?.hash;
}
