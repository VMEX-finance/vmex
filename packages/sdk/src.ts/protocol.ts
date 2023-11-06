import { BigNumber, BigNumberish, ethers } from "ethers";
import {
  getIncentivesController,
  getLendingPool,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
  getProvider,
  getVariableDebtToken,
  getWETHGateway,
} from "./contract-getters";
import {
  approveUnderlyingIfFirstInteraction,
  chunk,
  convertListSymbolToAddress,
  convertSymbolToAddress,
  convertToCurrencyDecimals,
  getUserTokenBalance,
} from "./utils";
import { getTotalTranches } from "./analytics";
import { RewardConfig, SetAddress, UserRewards } from "./interfaces";
import { MAX_UINT_AMOUNT, ZERO_ADDRESS } from "./constants";

export async function borrow(
  params: {
    underlying: string;
    trancheId: number;
    amount: ethers.BigNumber | number | string;
    referrer?: number;
    signer: ethers.Signer;
    network: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  params.underlying = convertSymbolToAddress(params.underlying, params.network);
  let tx, amount;

  amount = await convertToCurrencyDecimals(
    params.underlying,
    params.amount.toString(),
    params.test,
    params.providerRpc
  );

  let client = await params.signer.getAddress();
  let lendingPool = getLendingPool({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  let gateway = getWETHGateway({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  if (params.underlying == ZERO_ADDRESS) {
    //native eth
    try {
      const WETH = await convertSymbolToAddress("WETH", params.network);
      const reserveDat = await lendingPool.getReserveData(
        WETH,
        params.trancheId
      );
      const variableDebtTokenAddress = reserveDat.variableDebtTokenAddress;
      const varDebtToken = getVariableDebtToken({
        address: variableDebtTokenAddress,
        network: params.network,
        providerRpc: params.providerRpc,
      });
      const allowance = await varDebtToken
        .connect(params.signer)
        .borrowAllowance(client, gateway.address);
      console.log("gateway's allowance: ", allowance);
      if (allowance.lt(amount)) {
        console.log("setting allowance: ");
        await varDebtToken
          .connect(params.signer)
          .approveDelegation(gateway.address, MAX_UINT_AMOUNT);
      }
      const gasEstimate = await gateway.estimateGas.borrowETH(
        lendingPool.address,
        params.trancheId,
        amount,
        params.referrer || 0
      );
      tx = await gateway.borrowETH(
        lendingPool.address,
        params.trancheId,
        amount,
        params.referrer || 0,
        { gasLimit: gasEstimate.mul(12).div(10) }
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  } else {
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
      const gasEstimate = await lendingPool.estimateGas.borrow(
        params.underlying,
        params.trancheId,
        amount,
        params.referrer || 0,
        client
      );
      tx = await lendingPool.borrow(
        params.underlying,
        params.trancheId,
        amount,
        params.referrer || 0,
        client,
        { gasLimit: gasEstimate.mul(12).div(10) }
      );
    }
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
  if (params.asset == "ETH") params.asset = "WETH";
  params.asset = convertSymbolToAddress(params.asset, params.network);
  let tx;

  const lendingPool = getLendingPool({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });
  console.log("params: ", params);
  const gasEstimate =
    await lendingPool.estimateGas.setUserUseReserveAsCollateral(
      params.asset,
      params.trancheId,
      params.useAsCollateral
    );
  tx = await lendingPool.setUserUseReserveAsCollateral(
    params.asset,
    params.trancheId,
    params.useAsCollateral,
    { gasLimit: gasEstimate.mul(12).div(10) }
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
    amount: number | ethers.BigNumberish;
    signer: ethers.Signer;
    referralCode?: number;
    network: string;
    isMax?: boolean;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  params.asset = convertSymbolToAddress(params.asset, params.network);
  let tx;
  let amount;

  if (params.isMax) {
    amount = MAX_UINT_AMOUNT; //can do max here
  } else {
    amount = await convertToCurrencyDecimals(
      params.asset,
      params.amount.toString(),
      params.test,
      params.providerRpc
    );
  }
  let client = await params.signer.getAddress();
  let to = params.to || client;
  console.log("client: ", client);
  console.log("to: ", to);
  let lendingPool = getLendingPool({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  let gateway = getWETHGateway({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  if (params.asset == ZERO_ADDRESS) {
    //native eth
    try {
      const WETH = convertSymbolToAddress("WETH", params.network);
      const reserveDat = await lendingPool.getReserveData(
        WETH,
        params.trancheId
      );
      const aWETH = reserveDat.aTokenAddress;
      await approveUnderlyingIfFirstInteraction(
        //need to approve the aWETH to gateway so it can withdraw
        params.signer,
        aWETH,
        gateway.address, //approving the gateway
        amount
      );
    } catch (error) {
      throw new Error(
        "failed to approve spend for aWETH, error: " +
          error +
          " amount is " +
          amount.toString()
      );
    }
    try {
      const gasEstimate = await gateway.estimateGas.withdrawETH(
        lendingPool.address,
        params.trancheId,
        amount,
        client
      );
      tx = await gateway.withdrawETH(
        lendingPool.address,
        params.trancheId,
        amount,
        client,
        { gasLimit: gasEstimate.mul(12).div(10) }
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  } else {
    const gasEstimate = await lendingPool.estimateGas.withdraw(
      params.asset,
      params.trancheId,
      amount,
      client
    );
    tx = await lendingPool.withdraw(
      params.asset,
      params.trancheId,
      amount,
      client,
      { gasLimit: gasEstimate.mul(12).div(10) }
    );
  }

  if (callback) {
    await callback();
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
  params.asset = convertSymbolToAddress(params.asset, params.network);
  let tx;
  let amount;
  if (params.isMax) {
    amount = MAX_UINT_AMOUNT;
  } else {
    amount = await convertToCurrencyDecimals(
      params.asset,
      params.amount.toString(),
      params.test,
      params.providerRpc
    );
  }
  let client = await params.signer.getAddress();
  let lendingPool = getLendingPool({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  let gateway = getWETHGateway({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  if (params.asset == ZERO_ADDRESS) {
    //native eth
    if (amount == MAX_UINT_AMOUNT) {
      const WETH = await convertSymbolToAddress("WETH", params.network);
      const reserveDat = await lendingPool.getReserveData(
        WETH,
        params.trancheId
      );
      const debtToken = reserveDat.variableDebtTokenAddress;
      amount = await getUserTokenBalance(
        //can't set the max cause for native eth, it won't be able to pass the  gateway
        debtToken,
        client,
        params.test,
        params.providerRpc
      );
    }
    console.log("During repay, trying to pay: ", amount);
    try {
      const gasEstimate = await gateway.estimateGas.repayETH(
        lendingPool.address,
        params.trancheId,
        amount,
        client,
        { value: amount }
      );
      tx = await gateway.repayETH(
        lendingPool.address,
        params.trancheId,
        amount,
        client,
        {
          value: amount,
          gasLimit: gasEstimate.mul(12).div(10),
        }
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  } else {
    try {
      await approveUnderlyingIfFirstInteraction(
        params.signer,
        params.asset,
        lendingPool.address,
        amount
      );
    } catch (error) {
      throw new Error(
        "failed to approve spend for underlying asset, error: " +
          error +
          " amount is " +
          amount.toString()
      );
    }
    const gasEstimate = await lendingPool.estimateGas.repay(
      params.asset,
      params.trancheId,
      amount,
      client
    );
    tx = await lendingPool.repay(
      params.asset,
      params.trancheId,
      amount,
      client,
      { gasLimit: gasEstimate.mul(12).div(10) }
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
    collateralBefore?: boolean;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  params.underlying = convertSymbolToAddress(params.underlying, params.network);
  let tx;
  let client = await params.signer.getAddress();
  let amount;
  if (params.isMax) {
    amount = await getUserTokenBalance(
      //can't set the max cause for native eth, it won't be able to pass the  gateway
      params.underlying,
      client,
      params.test,
      params.providerRpc
    );
  } else {
    amount = await convertToCurrencyDecimals(
      params.underlying,
      params.amount,
      params.test,
      params.providerRpc
    );
  }
  let lendingPool = getLendingPool({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  let gateway = getWETHGateway({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  if (params.underlying == ZERO_ADDRESS) {
    //native eth
    try {
      console.log("initial amount: ", amount);
      if (params.isMax) {
        // const estimation = await gateway.estimateGas.depositETH(
        //   lendingPool.address,
        //   params.trancheId,
        //   client,
        //   params.referrer || 0,
        //   { value: ethers.utils.parseEther("0.000001") }
        // )
        // console.log("Estimated gas: ", estimation)
        amount = amount.mul(9).div(10); //90%
        console.log("new amount: ", amount);
      }

      const gasEstimate = await gateway.estimateGas.depositETH(
        lendingPool.address,
        params.trancheId,
        client,
        params.referrer || 0,
        { value: amount }
      );

      tx = await gateway.depositETH(
        lendingPool.address,
        params.trancheId,
        client,
        params.referrer || 0,
        { value: amount, gasLimit: gasEstimate.mul(12).div(10) }
      );

      params.underlying = await convertSymbolToAddress("WETH", params.network);
    } catch (error) {
      console.log(error);
      throw error;
    }
  } else {
    try {
      await approveUnderlyingIfFirstInteraction(
        params.signer,
        params.underlying,
        lendingPool.address,
        amount
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
        const gasEstimate = await lendingPool.estimateGas.deposit(
          params.underlying,
          params.trancheId,
          amount,
          client,
          params.referrer || 0
        );
        tx = await lendingPool.deposit(
          params.underlying,
          params.trancheId,
          amount,
          client,
          params.referrer || 0,
          { gasLimit: gasEstimate.mul(12).div(10) }
        );
      }
    } catch (error) {
      console.log("Lending Pool Failed with ", error);
      throw new Error(error);
    }

    if (params.collateral !== params.collateralBefore) {
      // need to update user reserve as collateral
      await tx.wait();
      // fix edge case where this transaction runs out of gas
      let gasEstimate: BigNumber =
        await lendingPool.estimateGas.setUserUseReserveAsCollateral(
          params.underlying,
          params.trancheId,
          params.collateral
        );
      await lendingPool.setUserUseReserveAsCollateral(
        params.underlying,
        params.trancheId,
        params.collateral,
        {
          gasLimit: gasEstimate.mul("12").div("10"),
        }
      );
    }
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
  console.log(params);
  const addressProvider = getLendingPoolAddressesProvider({
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
  const lendingPool = getLendingPool({
    signer: params.approvedSigner,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  try {
    const configurator = getLendingPoolConfiguratorProxy({
      network: params.network,
      signer: params.approvedSigner,
      test: params.test,
      providerRpc: params.providerRpc,
    });

    const gasEstimate = await configurator.estimateGas.setTranchePause(
      false,
      params.tranche
    );
    await configurator.setTranchePause(false, params.tranche, {
      gasLimit: gasEstimate.mul(12).div(10),
    });
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
  let configurator = getLendingPoolConfiguratorProxy({
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
      const gasEstimate = await configurator.estimateGas.batchInitReserve(
        chunkedInitInputParams[chunkIndex],
        mytranche
      );
      const tx3 = await configurator.batchInitReserve(
        chunkedInitInputParams[chunkIndex],
        mytranche,
        { gasLimit: gasEstimate.mul(12).div(10) }
      );

      console.log(
        `  - Reserve ready for: ${chunkedSymbols[chunkIndex].join(", ")}`
      );
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
  params.assetAddresses = convertListSymbolToAddress(
    params.assetAddresses,
    params.network
  );
  // assert(params.assetAddresses.length == params.reserveFactors.length, "array lengths not equal");
  // assert(params.assetAddresses.length == params.canBorrow.length, "array lengths not equal");
  // assert(params.assetAddresses.length == params.canBeCollateral.length, "array lengths not equal");
  let tx;
  let mytranche = (
    await getTotalTranches({
      network: params.network,
      test: params.test,
      providerRpc: params.providerRpc,
    })
  ).toString();

  let configurator = getLendingPoolConfiguratorProxy({
    network: params.network,
    signer: params.admin,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  try {
    const address = await params.admin.getAddress();
    const gasEstimate = await configurator.estimateGas.claimTrancheId(
      params.name,
      address
    );
    let tx = await configurator.claimTrancheId(params.name, address, {
      gasLimit: gasEstimate.mul(12).div(10),
    });

    await tx.wait(); // wait 1 network confirmation
  } catch (error) {
    throw new Error("Configurator Failed with " + error);
  }

  try {
    const gasEstimate = await configurator.estimateGas.updateTreasuryAddress(
      params.treasuryAddress,
      mytranche
    );
    let tx = await configurator.updateTreasuryAddress(
      params.treasuryAddress,
      mytranche,
      { gasLimit: gasEstimate.mul(12).div(10) }
    );

    await tx.wait(); // wait 1 network confirmation
  } catch (error) {
    throw new Error(
      "Configurator Failed updating treasury address with " + error
    );
  }

  if (params.whitelisted.length != 0) {
    try {
      console.log("Setting whitelist");
      const gasEstimate = await configurator.estimateGas.setTrancheWhitelist(
        mytranche,
        params.whitelisted,
        new Array(params.whitelisted.length).fill(true)
      );
      const tx4 = await configurator.setTrancheWhitelist(
        mytranche,
        params.whitelisted,
        new Array(params.whitelisted.length).fill(true),
        { gasLimit: gasEstimate.mul(12).div(10) }
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
      const gasEstimate = await configurator.estimateGas.setTrancheBlacklist(
        mytranche,
        params.blacklisted,
        new Array(params.blacklisted.length).fill(true)
      );
      const tx4 = await configurator.setTrancheBlacklist(
        mytranche,
        params.blacklisted,
        new Array(params.blacklisted.length).fill(true),
        { gasLimit: gasEstimate.mul(12).div(10) }
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
      ...params,
    },
    callback
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
  console.log(params);
  let tx;
  const mytranche = params.trancheId;
  let configurator = getLendingPoolConfiguratorProxy({
    network: params.network,
    signer: params.admin,
    test: params.test,
    providerRpc: params.providerRpc,
  });
  if (params.newName) {
    try {
      console.log("Setting new name");
      const gasEstimate = await configurator.estimateGas.changeTrancheName(
        mytranche,
        params.newName
      );
      const tx4 = await configurator.changeTrancheName(
        mytranche,
        params.newName,
        { gasLimit: gasEstimate.mul(12).div(10) }
      );
      console.log("    * gasUsed", (await tx4.wait(1)).gasUsed.toString());
    } catch (error) {
      throw new Error(
        "Configurator Failed during setting new name with " + error
      );
    }
  }
  if (params.newTreasuryAddress) {
    try {
      console.log("Setting new treasury address");
      const gasEstimate = await configurator.estimateGas.updateTreasuryAddress(
        params.newTreasuryAddress,
        mytranche
      );
      const tx4 = await configurator.updateTreasuryAddress(
        params.newTreasuryAddress,
        mytranche,
        { gasLimit: gasEstimate.mul(12).div(10) }
      );
      console.log("    * gasUsed", (await tx4.wait(1)).gasUsed.toString());
    } catch (error) {
      throw new Error(
        "Configurator Failed during setting new treasury address with " + error
      );
    }
  }
  if (params.isTrancheWhitelisted !== undefined) {
    try {
      console.log("Setting isTrancheWhitelisted");
      const gasEstimate =
        await configurator.estimateGas.setTrancheWhitelistEnabled(
          mytranche,
          params.isTrancheWhitelisted
        );
      const tx4 = await configurator.setTrancheWhitelistEnabled(
        mytranche,
        params.isTrancheWhitelisted,
        { gasLimit: gasEstimate.mul(12).div(10) }
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
      const gasEstimate = await configurator.estimateGas.setTrancheWhitelist(
        mytranche,
        params.whitelisted.map((el: SetAddress) => el.addr),
        params.whitelisted.map((el: SetAddress) => el.newValue)
      );
      const tx4 = await configurator.setTrancheWhitelist(
        mytranche,
        params.whitelisted.map((el: SetAddress) => el.addr),
        params.whitelisted.map((el: SetAddress) => el.newValue),
        { gasLimit: gasEstimate.mul(12).div(10) }
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
      const gasEstimate = await configurator.estimateGas.setTrancheBlacklist(
        mytranche,
        params.blacklisted.map((el: SetAddress) => el.addr),
        params.blacklisted.map((el: SetAddress) => el.newValue)
      );
      const tx4 = await configurator.setTrancheBlacklist(
        mytranche,
        params.blacklisted.map((el: SetAddress) => el.addr),
        params.blacklisted.map((el: SetAddress) => el.newValue),
        { gasLimit: gasEstimate.mul(12).div(10) }
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
      console.log(
        "Setting reserveFactors: ",
        params.reserveFactors.map((el: SetAddress) =>
          convertSymbolToAddress(el.addr, params.network)
        ),
        params.reserveFactors.map((el: SetAddress) => el.newValue)
      );
      const gasEstimate = await configurator.estimateGas.setReserveFactor(
        params.reserveFactors.map((el: SetAddress) =>
          convertSymbolToAddress(el.addr, params.network)
        ),
        mytranche,
        params.reserveFactors.map((el: SetAddress) => el.newValue)
      );
      const tx4 = await configurator.setReserveFactor(
        params.reserveFactors.map((el: SetAddress) =>
          convertSymbolToAddress(el.addr, params.network)
        ),
        mytranche,
        params.reserveFactors.map((el: SetAddress) => el.newValue),
        { gasLimit: gasEstimate.mul(12).div(10) }
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
      const gasEstimate = await configurator.estimateGas.setBorrowingOnReserve(
        params.canBorrow.map((el: SetAddress) =>
          convertSymbolToAddress(el.addr, params.network)
        ),
        mytranche,
        params.canBorrow.map((el: SetAddress) => el.newValue)
      );
      const tx4 = await configurator.setBorrowingOnReserve(
        params.canBorrow.map((el: SetAddress) =>
          convertSymbolToAddress(el.addr, params.network)
        ),
        mytranche,
        params.canBorrow.map((el: SetAddress) => el.newValue),
        { gasLimit: gasEstimate.mul(12).div(10) }
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
      const gasEstimate =
        await configurator.estimateGas.setCollateralEnabledOnReserve(
          params.canBeCollateral.map((el: SetAddress) =>
            convertSymbolToAddress(el.addr, params.network)
          ),
          mytranche,
          params.canBeCollateral.map((el: SetAddress) => el.newValue)
        );
      const tx4 = await configurator.setCollateralEnabledOnReserve(
        params.canBeCollateral.map((el: SetAddress) =>
          convertSymbolToAddress(el.addr, params.network)
        ),
        mytranche,
        params.canBeCollateral.map((el: SetAddress) => el.newValue),
        { gasLimit: gasEstimate.mul(12).div(10) }
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
      const gasEstimate = await configurator.estimateGas.setFreezeReserve(
        params.isFrozen.map((el: SetAddress) =>
          convertSymbolToAddress(el.addr, params.network)
        ),
        mytranche,
        params.isFrozen.map((el: SetAddress) => el.newValue)
      );
      const tx4 = await configurator.setFreezeReserve(
        params.isFrozen.map((el: SetAddress) =>
          convertSymbolToAddress(el.addr, params.network)
        ),
        mytranche,
        params.isFrozen.map((el: SetAddress) => el.newValue),
        { gasLimit: gasEstimate.mul(12).div(10) }
      );
      console.log("    * gasUsed", (await tx4.wait(1)).gasUsed.toString());
    } catch (error) {
      throw new Error(
        "Configurator Failed during setting isFrozen with " + error
      );
    }
  }
}

export async function claimIncentives(
  params: {
    incentivizedATokens: BigNumberish[];
    signer: ethers.Signer;
    to: BigNumberish;
    network: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  if (
    !params.incentivizedATokens ||
    !params.signer ||
    !params.to ||
    !params.network
  ) {
    return;
  }

  let incentivesController = getIncentivesController({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  const gasEstimate = await incentivesController.estimateGas.claimAllRewards(
    params.incentivizedATokens,
    params.to
  );

  const tx = await incentivesController.claimAllRewards(
    params.incentivizedATokens,
    params.to,
    { gasLimit: gasEstimate.mul(12).div(10) }
  );

  if (callback) {
    await callback().catch((error) => {
      console.error("CALLBACK_ERROR: \n", error);
    });
  }
  return tx;
}

export async function setIncentives(
  params: {
    rewardConfigs: RewardConfig[];
    signer: ethers.Signer;
    network: string;
    rewardsVaultSigner: ethers.Signer;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  let incentivesController = getIncentivesController({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  const gasEstimate = await incentivesController.estimateGas.configureRewards(
    params.rewardConfigs
  );
  const tx = await incentivesController.configureRewards(params.rewardConfigs, {
    gasLimit: gasEstimate.mul(12).div(10),
  });

  const rewardsVault = await incentivesController.REWARDS_VAULT();
  if (rewardsVault != (await params.signer.getAddress())) {
    console.error(
      "INVARIANT FAILED: rewards vault is not the same as the emissions manager"
    );
    return;
  }

  params.rewardConfigs.map((config) => {
    approveUnderlyingIfFirstInteraction(
      params.signer,
      config.reward.toString(),
      incentivesController.address,
      MAX_UINT_AMOUNT
    );
  });

  if (callback) {
    await callback().catch((error) => {
      console.error("CALLBACK_ERROR: \n", error);
    });
  }
  return tx;
}

export async function getUserIncentives(
  params: {
    user: string;
    incentivizedATokens: string[];
    network: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
): Promise<UserRewards> {
  let incentivesController = getIncentivesController({
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  const rewardsInfo = await incentivesController.getPendingRewards(
    params.incentivizedATokens,
    params.user
  );

  if (callback) {
    await callback().catch((error) => {
      console.error("CALLBACK_ERROR: \n", error);
    });
  }

  return {
    rewardTokens: rewardsInfo[0],
    rewardAmounts: rewardsInfo[1],
  };
}

export async function setExternalIncentives(
  params: {
    incentivizedATokens: string[];
    stakingContracts: string[];
    signer: ethers.Signer;
    network: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  let incentivesController = getIncentivesController({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  const gasEstimate =
    await incentivesController.estimateGas.batchBeginStakingRewards(
      params.incentivizedATokens,
      params.stakingContracts
    );
  const tx = await incentivesController.batchBeginStakingRewards(
    params.incentivizedATokens,
    params.stakingContracts,
    { gasLimit: gasEstimate.mul(12).div(10) }
  );

  if (callback) {
    await callback().catch((error) => {
      console.error("CALLBACK_ERROR: \n", error);
    });
  }

  return tx;
}

export async function removeExternalIncentives(
  params: {
    incentivizedAToken: string;
    signer: ethers.Signer;
    network: string;
    test?: boolean;
    providerRpc?: string;
  },
  callback?: () => Promise<any>
) {
  let incentivesController = getIncentivesController({
    signer: params.signer,
    network: params.network,
    test: params.test,
    providerRpc: params.providerRpc,
  });

  const gasEstimate =
    await incentivesController.estimateGas.removeStakingReward(
      params.incentivizedAToken
    );
  const tx = await incentivesController.removeStakingReward(
    params.incentivizedAToken,
    { gasLimit: gasEstimate.mul(12).div(10) }
  );

  if (callback) {
    await callback().catch((error) => {
      console.error("CALLBACK_ERROR: \n", error);
    });
  }

  return tx;
}

export async function claimExternalRewards(
  signer: ethers.Signer,
  network: string,
  address: string,
  rewardToken: string,
  claimable: string,
  proof: string[],
  test?: boolean,
  providerRpc?: string
) {
  const incentivesController = getIncentivesController({
    signer: signer,
    network: network,
    test: test,
    providerRpc: providerRpc,
  });

  const gasEstimate = await incentivesController.estimateGas.claim(
    address,
    rewardToken,
    claimable,
    proof
  );

  return incentivesController.claim(address, rewardToken, claimable, proof, {
    gasLimit: gasEstimate.mul(12).div(10),
  });
}
