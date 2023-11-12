import {
  eNetwork,
  iMultiPoolsAssets,
  IReserveParams,
  tEthereumAddress,
  ICurveMetadata,
  IBeethovenMetadata,
  CurveMetadata,
  BeethovenMetadata,
  IInterestRateStrategyParams,
} from "./types";
import { DRE, chunk, getDb, waitForTx } from "./misc-utils";
import {
  getAToken,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
  getAssetMappings,
  getDbEntry,
} from "./contracts-getters";
import {
  rawInsertContractAddressInDb,
} from "./contracts-helpers";
import { BigNumberish, ethers, Signer } from "ethers";
import { deployRateStrategy } from "./contracts-deployments";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as fs from 'fs';

export const getATokenExtraParams = async (
  aTokenName: string,
  tokenAddress: tEthereumAddress
) => {
  console.log(aTokenName);
  switch (aTokenName) {
    default:
      return "0x10";
  }
};

export const claimTrancheId = async (
  name: string,
  admin: SignerWithAddress
) => {
  const configurator = await getLendingPoolConfiguratorProxy();

  let ret = await waitForTx(
    await configurator.claimTrancheId(name, admin.address)
  );

  console.log(`-${ret}:${name} claimed for ${admin.address}`);
  console.log("    * gasUsed", ret.gasUsed.toString());
};

const deployRateStrategyHelper = async (
  strategy: IInterestRateStrategyParams,
  addressesProvider: tEthereumAddress,
  verify: boolean
 ): Promise<tEthereumAddress> => {
  // Strategy does not exist, create a new one
  const rateStrategy: [
    string, // addresses provider
    string,
    string,
    string,
    string
  ] = [
    addressesProvider,
    strategy.optimalUtilizationRate,
    strategy.baseVariableBorrowRate,
    strategy.variableRateSlope1,
    strategy.variableRateSlope2,
  ];
  const newStrategyAddresses = await deployRateStrategy(
    strategy.name,
    rateStrategy,
    verify
  );

  // This causes the last strategy to be printed twice, once under "DefaultReserveInterestRateStrategy"
  // and once under the actual `strategyASSET` key.
  rawInsertContractAddressInDb(
    strategy.name,
    newStrategyAddresses
  );

  return newStrategyAddresses
}

const submitCurveMetadata = async (
  tokenAddresses: { [symbol: string]: tEthereumAddress },
  admin: SignerWithAddress | Signer,
  submitTx: boolean,
  curveMetadata?: iMultiPoolsAssets<ICurveMetadata>,
) => {
  if (curveMetadata) {
    const assetMappings = await getAssetMappings();
    let curveToken: string[] = [];
    let curveParams: CurveMetadata[] = [];

    for (let [symbol, params] of Object.entries(curveMetadata)) {
      if (!tokenAddresses[symbol]) {
        console.log(
          `- Skipping init of ${symbol} due token address is not set at markets config`
        );
        continue;
      }
      const existingCurveMetadata = await assetMappings.getCurveMetadata(tokenAddresses[symbol])
      console.log("existingCurveMetadata: ", existingCurveMetadata)
      if(!existingCurveMetadata && !DRE.network.name.includes("localhost")) continue
      curveToken.push(tokenAddresses[symbol]);
      curveParams.push(params);
    }
    console.log("- Setting curve metadata");
    if(submitTx) {
      const tx4 = await waitForTx(
        await assetMappings
          .connect(admin)
          .setCurveMetadata(curveToken, curveParams)
      );

      console.log("    * gasUsed", tx4.gasUsed.toString());
    } else if(curveToken.length != 0) {
      const setCurveMetadataData = assetMappings.interface.encodeFunctionData("setCurveMetadata", [curveToken, curveParams])
      console.log("setCurveMetadataData: ", setCurveMetadataData);
    }
  }
}

const submitBeethovenMetadata = async (
  tokenAddresses: { [symbol: string]: tEthereumAddress },
  admin: SignerWithAddress | Signer,
  submitTx: boolean,
  beethovenMetadata?: iMultiPoolsAssets<IBeethovenMetadata>,
) => {
  if (beethovenMetadata) {
    const assetMappings = await getAssetMappings();
    let beethovenToken: string[] = [];
    let beethovenParams: BeethovenMetadata[] = [];

    for (let [symbol, params] of Object.entries(beethovenMetadata)) {
      if (!tokenAddresses[symbol]) {
        console.log(
          `- Skipping init of ${symbol} due token address is not set at markets config`
        );
        continue;
      }
      const isAssetInMappings = await assetMappings.isAssetInMappings(tokenAddresses[symbol])

      if(isAssetInMappings && !DRE.network.name.includes("localhost")) continue
      console.log("adding beethoven metadata for symbol: ", symbol)
      beethovenToken.push(tokenAddresses[symbol]);
      beethovenParams.push(params);
    }
    console.log("- Setting beethoven metadata");

    if(submitTx) {
      const tx4 = await waitForTx(
        await assetMappings
          .connect(admin)
          .setBeethovenMetadata(beethovenToken, beethovenParams)
      );

      console.log("    * gasUsed", tx4.gasUsed.toString());

    } else if(beethovenToken.length != 0) {
      const setBeethovenMetadataData = assetMappings.interface.encodeFunctionData("setBeethovenMetadata", [beethovenToken, beethovenParams])
      console.log("setBeethovenMetadataData: ", setBeethovenMetadataData);
    }
  }
}

//create another initReserves that initializes the curve v2, or just use this.
//called by aave:fork mainnet setup where they know the addresses of the tokens.
// initializes more reserves that are not lendable, have no stable and variable debt, no interest rate strategy, governance needs to give them a risk
export const initAssetData = async (
  reservesParams: iMultiPoolsAssets<IReserveParams>,
  tokenAddresses: { [symbol: string]: tEthereumAddress },
  admin: SignerWithAddress | Signer,
  verify: boolean,
  curveMetadata?: iMultiPoolsAssets<ICurveMetadata>,
  beethovenMetadata?: iMultiPoolsAssets<IBeethovenMetadata>,
  submitTx: boolean = true //if false, prints tx hash to console instead of submitting it. This is for the purpose of submitting in multisig
) => {
  const addressProvider = await getLendingPoolAddressesProvider();

  // Initialize variables for future reserves initialization
  let reserveSymbols: string[] = [];

  let underlying: string[] = [];

  let initInputParams: {
    asset: string;
    defaultInterestRateStrategyAddress: string;
    supplyCap: BigNumberish; //1,000,000
    borrowCap: BigNumberish; //1,000,000
    baseLTV: BigNumberish;
    liquidationThreshold: BigNumberish;
    liquidationBonus: BigNumberish;
    borrowFactor: BigNumberish;
    borrowingEnabled: boolean;
    assetType: BigNumberish;
    VMEXReserveFactor: BigNumberish;
    tokenSymbol: string;
  }[] = [];

  let strategyAddresses: Record<string, tEthereumAddress> = {};

  const reserves = Object.entries(reservesParams);

  // Deploy init reserves per tranche
  // tranche CONFIGURATION
  const assetMappings = await getAssetMappings();

  for (let [symbol, params] of reserves) {
    if (!tokenAddresses[symbol]) {
      console.log(
        `- Skipping init of ${symbol} due token address is not set at markets config`
      );
      continue;
    }
    const {
      strategy,
      assetType,
      supplyCap, //1,000,000
      borrowCap,
      reserveDecimals,
      baseLTVAsCollateral,
      borrowFactor,
      liquidationBonus,
      liquidationThreshold,
      borrowingEnabled,
      reserveFactor,
    } = params;

    const isAssetInMappings = await assetMappings.isAssetInMappings(tokenAddresses[symbol])

    if(isAssetInMappings) {
      console.log("already have ", symbol, " in mappings. skipping")
      const existingMapping = await assetMappings.getAssetMapping(tokenAddresses[symbol])
      strategyAddresses[strategy.name] = existingMapping.defaultInterestRateStrategyAddress
      continue
    }
    console.log("Attempting to process new asset: ", symbol)

    const dbEntry = await getDbEntry(strategy.name);
    if(dbEntry && !DRE.network.name.includes("localhost")){
      console.log("db already has ", strategy.name, " as ",dbEntry.address)
      strategyAddresses[strategy.name] = dbEntry.address
    }

    if (!strategyAddresses[strategy.name]) {
      strategyAddresses[strategy.name] = await deployRateStrategyHelper(strategy, addressProvider.address, verify)
    }
    // Prepare input parameters
    reserveSymbols.push(symbol);
    underlying.push(tokenAddresses[symbol]);
    const input = {
      asset: tokenAddresses[symbol],
      defaultInterestRateStrategyAddress: strategyAddresses[strategy.name],
      assetType: assetType,
      supplyCap: ethers.utils.parseUnits(supplyCap, reserveDecimals), 
      borrowCap: ethers.utils.parseUnits(borrowCap, reserveDecimals), 
      baseLTV: baseLTVAsCollateral,
      liquidationThreshold: liquidationThreshold,
      liquidationBonus: liquidationBonus,
      borrowFactor: borrowFactor,
      borrowingEnabled: borrowingEnabled,
      VMEXReserveFactor: reserveFactor,
      tokenSymbol: symbol
    }
    initInputParams.push(input);
  }

  console.log(`- AssetData initialization`);
  if(submitTx) {
    const tx3 = await waitForTx(
      await assetMappings.connect(admin).addAssetMapping(initInputParams)
    );

    console.log("    * gasUsed", tx3.gasUsed.toString());
  } else {
    const addAssetMappingCall = assetMappings.interface.encodeFunctionData("addAssetMapping", [initInputParams])

    console.log("addAssetMappingCall: ", addAssetMappingCall);
  }

  await submitCurveMetadata(tokenAddresses, admin, submitTx, curveMetadata)
  await submitBeethovenMetadata(tokenAddresses, admin, submitTx, beethovenMetadata)
};

//create another initReserves that initializes the curve v2, or just use this.
//called by aave:fork mainnet setup where they know the addresses of the tokens.
// initializes more reserves that are not lendable, have no stable and variable debt, no interest rate strategy, governance needs to give them a risk
export const initReservesByHelper = async (
  assetAddresses: tEthereumAddress[],
  reserveFactors: string[],
  canBorrow: boolean[],
  canBeCollateral: boolean[],
  admin: SignerWithAddress,
  treasuryAddress: tEthereumAddress,
  trancheId: BigNumberish
) => {
  // Initialize variables for future reserves initialization
  let initInputParams: {
    underlyingAsset: string;
    reserveFactor: string;
    canBorrow: boolean;
    canBeCollateral: boolean;
  }[] = [];
  for (let i = 0; i < assetAddresses.length; i++) {
    initInputParams.push(
      {
        underlyingAsset: assetAddresses[i],
        reserveFactor: reserveFactors[i],
        canBorrow: canBorrow[i],
        canBeCollateral: canBeCollateral[i],
      }
    );
  }

  // Deploy init reserves per tranche
  // tranche CONFIGURATION
  const configurator = await getLendingPoolConfiguratorProxy();
  let initChunks = 5;
  const chunkedSymbols = chunk(assetAddresses, initChunks);
  const chunkedInitInputParams = chunk(initInputParams, initChunks);

  console.log(
    `- Reserves initialization in ${chunkedInitInputParams.length} txs`
  );
  for (
    let chunkIndex = 0;
    chunkIndex < chunkedInitInputParams.length;
    chunkIndex++
  ) {
    const tx3 = await waitForTx(
      await configurator
        .connect(admin)
        .batchInitReserve(chunkedInitInputParams[chunkIndex], trancheId)
    );

    await configurator
      .connect(admin)
      .updateTreasuryAddress(treasuryAddress, trancheId);

    console.log(
      `  - Reserve ready for: ${chunkedSymbols[chunkIndex].join(", ")}`
    );
    console.log("    * gasUsed", tx3.gasUsed.toString());
  }
};

export const getPairsTokenAggregator = (
  allAssetsAddresses: {
    [tokenSymbol: string]: tEthereumAddress;
  },
  aggregatorsAddresses: { [tokenSymbol: string]: tEthereumAddress }
): [string[], string[]] => {
  const { ETH, USD, WETH, ...assetsAddressesWithoutEth } = allAssetsAddresses;

  const pairs = Object.entries(assetsAddressesWithoutEth).map(
    ([tokenSymbol, tokenAddress]) => {
      if (tokenSymbol !== "WETH" && tokenSymbol !== "ETH") {
        const aggregatorAddressIndex = Object.keys(
          aggregatorsAddresses
        ).findIndex((value) => value === tokenSymbol);
        const [, aggregatorAddress] = (
          Object.entries(aggregatorsAddresses) as [string, tEthereumAddress][]
        )[aggregatorAddressIndex];
        return [tokenAddress, aggregatorAddress];
      }
    }
  ) as [string, string][];

  const mappedPairs = pairs.map(([asset]) => asset);
  const mappedAggregators = pairs.map(([, source]) => source);

  return [mappedPairs, mappedAggregators];
};

const getAddressById = async (
  id: string,
  network: eNetwork
): Promise<tEthereumAddress | undefined> =>
  (await getDb().get(`${id}.${network}`).value())?.address || undefined;

// Function deprecated
const isErc20SymbolCorrect = async (
  token: tEthereumAddress,
  symbol: string
) => {
  const erc20 = await getAToken(token); // using aToken for ERC20 interface
  const erc20Symbol = await erc20.symbol();
  return symbol === erc20Symbol;
};


export const getAllMockedData = (allReservesAddresses: {
  [symbol: string]: tEthereumAddress;
}): [tEthereumAddress[], string[], boolean[], boolean[]] => {
  let assets0: tEthereumAddress[] =  Object.values(allReservesAddresses);
  let reserveFactors0: string[] = [];
  let canBorrow0: boolean[] = [];
  let canBeCollateral0: boolean[] = [];
  for (let i = 0; i < assets0.length; i++) {
    reserveFactors0.push("0");
    canBorrow0.push(true);
    canBeCollateral0.push(true);
  }

  return [assets0, reserveFactors0, canBorrow0, canBeCollateral0];
};

export const getTranche0MockedData = (allReservesAddresses: {
  [symbol: string]: tEthereumAddress;
}): [tEthereumAddress[], string[], boolean[], boolean[]] => {
  let assets0: tEthereumAddress[] = [
    allReservesAddresses["DAI"],
    allReservesAddresses["TUSD"],
    allReservesAddresses["USDC"],
    allReservesAddresses["USDT"],
    allReservesAddresses["sUSD"],
    allReservesAddresses["AAVE"],
    allReservesAddresses["BAT"],
    allReservesAddresses["LINK"],
    allReservesAddresses["KNC"],
    allReservesAddresses["WBTC"],
    allReservesAddresses["MANA"],
    allReservesAddresses["ZRX"],
    allReservesAddresses["SNX"],
    allReservesAddresses["BUSD"],
    allReservesAddresses["WETH"],
    allReservesAddresses["YFI"],
    allReservesAddresses["UNI"],
    allReservesAddresses["REN"],
    allReservesAddresses["ENJ"],
  ];

  let reserveFactors0: string[] = [];
  let canBorrow0: boolean[] = [];
  let canBeCollateral0: boolean[] = [];
  for (let i = 0; i < assets0.length; i++) {
    reserveFactors0.push("100000000000000000");
    canBorrow0.push(true);
    canBeCollateral0.push(true);
  }

  return [assets0, reserveFactors0, canBorrow0, canBeCollateral0];
};

export const getTranche1MockedData = (allReservesAddresses: {
  [symbol: string]: tEthereumAddress;
}): [tEthereumAddress[], string[], boolean[], boolean[]] => {
  let assets0: tEthereumAddress[] = [
    allReservesAddresses["DAI"],
    allReservesAddresses["TUSD"],
    allReservesAddresses["USDC"],
    allReservesAddresses["USDT"],
    allReservesAddresses["sUSD"],
    allReservesAddresses["AAVE"],
    allReservesAddresses["BAT"],
    allReservesAddresses["LINK"],
    allReservesAddresses["KNC"],
    allReservesAddresses["WBTC"],
    allReservesAddresses["MANA"],
    allReservesAddresses["MKR"],
    allReservesAddresses["ZRX"],
    allReservesAddresses["SNX"],
    allReservesAddresses["BUSD"],
    allReservesAddresses["WETH"],
    allReservesAddresses["YFI"],
    allReservesAddresses["UNI"],
    allReservesAddresses["REN"],
    allReservesAddresses["ENJ"],
    //delete in production, will not accept these
    // allReservesAddresses["Tricrypto2"],
    // allReservesAddresses["ThreePool"],
    // allReservesAddresses["StethEth"],
    // allReservesAddresses["FraxUSDC"],
    // allReservesAddresses["Frax3Crv"],

    allReservesAddresses["yvTricrypto2"],
    allReservesAddresses["yvThreePool"],
    allReservesAddresses["yvStethEth"],
    allReservesAddresses["Steth"],
    allReservesAddresses["yvFraxUSDC"],
    allReservesAddresses["yvFrax3Crv"],
    allReservesAddresses["FRAX"],
    allReservesAddresses["BAL"],
    allReservesAddresses["CRV"],
    allReservesAddresses["CVX"],
    allReservesAddresses["BADGER"],
    allReservesAddresses["LDO"],
    allReservesAddresses["ALCX"],
    allReservesAddresses["Oneinch"],
  ];

  let reserveFactors0: string[] = [];
  let canBorrow0: boolean[] = [];
  let canBeCollateral0: boolean[] = [];
  for (let i = 0; i < assets0.length; i++) {
    reserveFactors0.push("100000000000000000");
    canBorrow0.push(true);
    canBeCollateral0.push(true);
  }

  return [assets0, reserveFactors0, canBorrow0, canBeCollateral0];
};

export const getTranche0DataOP = (allReservesAddresses: {
  [symbol: string]: tEthereumAddress;
}): [tEthereumAddress[], string[], boolean[], boolean[]] => {
  let assets0: tEthereumAddress[] = [
    allReservesAddresses["USDC"],
    allReservesAddresses["USDT"],
    allReservesAddresses["WETH"],
    allReservesAddresses["wstETH"],

    allReservesAddresses["3CRV"],
    allReservesAddresses["sUSD3CRV-f"],
    allReservesAddresses["wstETHCRV"],
    allReservesAddresses["mooCurveWSTETH"],
    allReservesAddresses["vAMMV2-wstETH/WETH"],
    allReservesAddresses["sAMMV2-USDC/sUSD"],
    allReservesAddresses["vAMMV2-WETH/USDC"],
    allReservesAddresses["sAMMV2-USDC/DAI"],
    allReservesAddresses["vAMMV2-WETH/LUSD"],
    allReservesAddresses["sAMMV2-USDC/LUSD"],
    allReservesAddresses["BPT-WSTETH-WETH"],
    allReservesAddresses["BPT-rETH-ETH"],
    allReservesAddresses["yvUSDC"],
    allReservesAddresses["yvUSDT"],
    allReservesAddresses["yvDAI"],
    allReservesAddresses["yvWETH"],
  ];

  let reserveFactors0: string[] = [];
  let canBorrow0: boolean[] = [];
  let canBeCollateral0: boolean[] = [];
  for (let i = 0; i < assets0.length; i++) {
    reserveFactors0.push("0");
    canBorrow0.push(true);
    canBeCollateral0.push(true);
  }

  return [assets0, reserveFactors0, canBorrow0, canBeCollateral0];
};


export const getTranche1DataOP = (allReservesAddresses: {
  [symbol: string]: tEthereumAddress;
}): [tEthereumAddress[], string[], boolean[], boolean[]] => {
  let assets0: tEthereumAddress[] = [
    allReservesAddresses["DAI"],
    allReservesAddresses["sUSD"],
    allReservesAddresses["USDC"],
    allReservesAddresses["USDT"],
    allReservesAddresses["WBTC"],
    allReservesAddresses["WETH"],
    allReservesAddresses["wstETH"],
    allReservesAddresses["FRAX"],
    allReservesAddresses["OP"],
    allReservesAddresses["rETH"],
    allReservesAddresses["LUSD"],
  ];

  let reserveFactors0: string[] = [];
  let canBorrow0: boolean[] = [];
  let canBeCollateral0: boolean[] = [];
  for (let i = 0; i < assets0.length; i++) {
    reserveFactors0.push("0");
    canBorrow0.push(true);
    canBeCollateral0.push(true);
  }

  return [assets0, reserveFactors0, canBorrow0, canBeCollateral0];
};


export const getTranche0DataBase = (allReservesAddresses: {
  [symbol: string]: tEthereumAddress;
}): [tEthereumAddress[], string[], boolean[], boolean[]] => {
  let assets0: tEthereumAddress[] = [
    allReservesAddresses["USDbC"],
    allReservesAddresses["WETH"],
    allReservesAddresses["cbETH"],
    allReservesAddresses["DAI"],
    allReservesAddresses["USDC"],
    allReservesAddresses["USDbC"],
    allReservesAddresses["sAMM-DAI/USDbC"],
    allReservesAddresses["sAMM-USDC/USDbC"],
    allReservesAddresses["cbETH-WETH-BPT"],
  ]
  let reserveFactors0: string[] = [];
  let canBorrow0: boolean[] = [];
  let canBeCollateral0: boolean[] = [];
  for (let i = 0; i < assets0.length; i++) {
    reserveFactors0.push("0");
    canBorrow0.push(true);
    canBeCollateral0.push(true);
  }

  return [assets0, reserveFactors0, canBorrow0, canBeCollateral0];
};

export const getTranche1DataArbitrum = (allReservesAddresses: {
  [symbol: string]: tEthereumAddress;
}): [tEthereumAddress[], string[], boolean[], boolean[]] => {
  let assets0: tEthereumAddress[] = [
    allReservesAddresses["DAI"],
    allReservesAddresses["ARB"],
    allReservesAddresses["USDC"],
    allReservesAddresses["USDT"],
    allReservesAddresses["WBTC"],
    allReservesAddresses["WETH"],
    allReservesAddresses["wstETH"],
    allReservesAddresses["FRAX"],
    allReservesAddresses["USDC.e"],
    allReservesAddresses["rETH"],
    allReservesAddresses["LUSD"],
  ];

  let reserveFactors0: string[] = [];
  let canBorrow0: boolean[] = [];
  let canBeCollateral0: boolean[] = [];
  for (let i = 0; i < assets0.length; i++) {
    reserveFactors0.push("0");
    canBorrow0.push(true);
    canBeCollateral0.push(true);
  }

  return [assets0, reserveFactors0, canBorrow0, canBeCollateral0];
};


export const getTranche0DataArbitrum = (allReservesAddresses: {
  [symbol: string]: tEthereumAddress;
}): [tEthereumAddress[], string[], boolean[], boolean[]] => {
  let assets0: tEthereumAddress[] = [
    allReservesAddresses["USDC.e"],
    allReservesAddresses["USDC"],
    allReservesAddresses["USDT"],
    allReservesAddresses["WETH"],
    allReservesAddresses["wstETH"],

    allReservesAddresses["2CRV"],
    allReservesAddresses["FRAXBPCRV-f"],
    allReservesAddresses["wstETHCRV"],
    allReservesAddresses["rETH-WETH-BPT"],
    allReservesAddresses["wstETH-WETH-BPT"],

    allReservesAddresses["CMLT-ARB-ETH"],
    allReservesAddresses["CMLT-ETH-USDC.e"],
    allReservesAddresses["CMLT-USDT-USDC.e"],
    allReservesAddresses["CMLT-wstETH-ETH"],
    allReservesAddresses["CMLT-LUSD-USDC.e"],
  ];

  let reserveFactors0: string[] = [];
  let canBorrow0: boolean[] = [];
  let canBeCollateral0: boolean[] = [];
  for (let i = 0; i < assets0.length; i++) {
    reserveFactors0.push("0");
    canBorrow0.push(true);
    canBeCollateral0.push(true);
  }

  return [assets0, reserveFactors0, canBorrow0, canBeCollateral0];
};