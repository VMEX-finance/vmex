import {
  eNetwork,
  iMultiPoolsAssets,
  IReserveParams,
  tEthereumAddress,
  ICurveMetadata,
  IBeethovenMetadata,
  CurveMetadata,
  BeethovenMetadata,
} from "./types";
import { chunk, getDb, waitForTx } from "./misc-utils";
import {
  getAToken,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
  getAssetMappings,
} from "./contracts-getters";
import {
  rawInsertContractAddressInDb,
} from "./contracts-helpers";
import { BigNumberish, ethers, Signer } from "ethers";
import { deployRateStrategy } from "./contracts-deployments";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

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

//create another initReserves that initializes the curve v2, or just use this.
//called by aave:fork mainnet setup where they know the addresses of the tokens.
// initializes more reserves that are not lendable, have no stable and variable debt, no interest rate strategy, governance needs to give them a risk
export const initAssetData = async (
  reservesParams: iMultiPoolsAssets<IReserveParams>,
  tokenAddresses: { [symbol: string]: tEthereumAddress },
  admin: SignerWithAddress | Signer,
  verify: boolean,
  curveMetadata?: iMultiPoolsAssets<ICurveMetadata>,
  beethovenMetadata?: iMultiPoolsAssets<IBeethovenMetadata>
) => {
  // initTrancheMultiplier();
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
  }[] = [];

  let strategyRates: [
    string, // addresses provider
    string,
    string,
    string,
    string
  ];
  let rateStrategies: Record<string, typeof strategyRates> = {};
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

    const {
      optimalUtilizationRate,
      baseVariableBorrowRate,
      variableRateSlope1,
      variableRateSlope2,
    } = strategy;
    if (!strategyAddresses[strategy.name]) {
      // Strategy does not exist, create a new one
      rateStrategies[strategy.name] = [
        addressProvider.address,
        optimalUtilizationRate,
        baseVariableBorrowRate,
        variableRateSlope1,
        variableRateSlope2,
      ];
      strategyAddresses[strategy.name] = await deployRateStrategy(
        strategy.name,
        rateStrategies[strategy.name],
        verify
      );

      // This causes the last strategy to be printed twice, once under "DefaultReserveInterestRateStrategy"
      // and once under the actual `strategyASSET` key.
      rawInsertContractAddressInDb(
        strategy.name,
        strategyAddresses[strategy.name]
      );
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
  const tx3 = await waitForTx(
    await assetMappings.connect(admin).addAssetMapping(initInputParams)
  );

  console.log("    * gasUsed", tx3.gasUsed.toString());

  if (curveMetadata) {
    let curveToken: string[] = [];
    let curveParams: CurveMetadata[] = [];

    for (let [symbol, params] of Object.entries(curveMetadata)) {
      if (!tokenAddresses[symbol]) {
        console.log(
          `- Skipping init of ${symbol} due token address is not set at markets config`
        );
        continue;
      }
      curveToken.push(tokenAddresses[symbol]);
      curveParams.push(params);
    }
    console.log("- Setting curve metadata");

    const tx4 = await waitForTx(
      await assetMappings
        .connect(admin)
        .setCurveMetadata(curveToken, curveParams)
    );

    console.log("    * gasUsed", tx4.gasUsed.toString());
  }

  if (beethovenMetadata) {
    let beethovenToken: string[] = [];
    let beethovenParams: BeethovenMetadata[] = [];

    for (let [symbol, params] of Object.entries(beethovenMetadata)) {
      if (!tokenAddresses[symbol]) {
        console.log(
          `- Skipping init of ${symbol} due token address is not set at markets config`
        );
        continue;
      }
      beethovenToken.push(tokenAddresses[symbol]);
      beethovenParams.push(params);
    }
    console.log("- Setting beethoven metadata");

    const tx4 = await waitForTx(
      await assetMappings
        .connect(admin)
        .setBeethovenMetadata(beethovenToken, beethovenParams)
    );

    console.log("    * gasUsed", tx4.gasUsed.toString());
  }
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

export const getTranche0MockedDataOP = (allReservesAddresses: {
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


export const getTranche1MockedDataOP = (allReservesAddresses: {
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


export const getTranche0MockedDataBase = (allReservesAddresses: {
  [symbol: string]: tEthereumAddress;
}): [tEthereumAddress[], string[], boolean[], boolean[]] => {
  let assets0: tEthereumAddress[] = [
    allReservesAddresses["USDbC"],
    allReservesAddresses["WETH"],
    allReservesAddresses["cbETH"],
    allReservesAddresses["vAMM-WETH/USDbC"],
    allReservesAddresses["vAMM-cbETH/WETH"],
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


export const getTranche0MockedDataArbitrum = (allReservesAddresses: {
  [symbol: string]: tEthereumAddress;
}): [tEthereumAddress[], string[], boolean[], boolean[]] => {
  let assets0: tEthereumAddress[] = Object.values(allReservesAddresses);

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