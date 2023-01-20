import {
  eContractid,
  eNetwork,
  iMultiPoolsAssets,
  IReserveParams,
  tEthereumAddress,
  ITrancheInitParams
} from "./types";
import { AaveProtocolDataProvider } from "../types/AaveProtocolDataProvider";
import { chunk, getDb, waitForTx } from "./misc-utils";
import {
  getAToken,
  // getATokensAndRatesHelper,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
  getAssetMappings,
} from "./contracts-getters";
import {
  getContractAddressWithJsonFallback,
  rawInsertContractAddressInDb,
} from "./contracts-helpers";
import { BigNumberish } from "ethers";
import { ConfigNames } from "./configuration";
import { deployRateStrategy } from "./contracts-deployments";
import BigNumber from "bignumber.js";
import { oneRay } from "./constants";
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
    await configurator.claimTrancheId(
      name,
      admin.address
    )
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
  aTokenNamePrefix: string,
  stableDebtTokenNamePrefix: string,
  variableDebtTokenNamePrefix: string,
  symbolPrefix: string,
  admin: SignerWithAddress,
  verify: boolean
) => {
  // initTrancheMultiplier();
  const addressProvider = await getLendingPoolAddressesProvider();

  // Initialize variables for future reserves initialization
  let reserveSymbols: string[] = [];

  let underlying: string[] = [];

  let initInputParams: {
    underlyingAssetDecimals: BigNumberish;
    underlyingAssetName: string;
    // underlyingAsset: string;
    // treasury: string;
    // incentivesController: string;
    aTokenName: string;
    aTokenSymbol: string;
    variableDebtTokenName: string;
    variableDebtTokenSymbol: string;
    assetType: BigNumberish;
    supplyCap: string; //1,000,000
    borrowCap: string; //1,000,000
    baseLTV: BigNumberish;
    liquidationThreshold: BigNumberish;
    liquidationBonus: BigNumberish;
    borrowFactor: string;
    borrowingEnabled: boolean;
    isAllowed: boolean;
    VMEXReserveFactor: string;
  }[] = [];

  let interestRateStrategyAddress: string[] = [];

  let strategyRates: [
    string, // addresses provider
    string,
    string,
    string,
    string,
    string,
    string
  ];
  let rateStrategies: Record<string, typeof strategyRates> = {};
  let strategyAddresses: Record<string, tEthereumAddress> = {};

  const reserves = Object.entries(reservesParams);

  for (let [symbol, params] of reserves) {
    if (!tokenAddresses[symbol]) {
      console.log(
        `- Skipping init of ${symbol} due token address is not set at markets config`
      );
      continue;
    }
    const {
      strategy,
      aTokenImpl,
      reserveDecimals,
      assetType,
      supplyCap, //1,000,000
      borrowCap,
      baseLTVAsCollateral,
      borrowFactor,
      liquidationBonus,
      liquidationThreshold,
      stableBorrowRateEnabled,
      borrowingEnabled,
      reserveFactor,
    } = params;

    const {
      optimalUtilizationRate,
      baseVariableBorrowRate,
      variableRateSlope1,
      variableRateSlope2,
      stableRateSlope1,
      stableRateSlope2,
    } = strategy;
    if (!strategyAddresses[strategy.name]) {
      // Strategy does not exist, create a new one
      rateStrategies[strategy.name] = [
        addressProvider.address,
        optimalUtilizationRate,
        baseVariableBorrowRate,
        variableRateSlope1,
        variableRateSlope2,
        stableRateSlope1,
        stableRateSlope2,
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
interestRateStrategyAddress.push(strategyAddresses[strategy.name]);
    initInputParams.push({
      underlyingAssetDecimals: reserveDecimals,
      underlyingAssetName: symbol,
      aTokenName: `${aTokenNamePrefix} ${symbol}`,
      aTokenSymbol: `a${symbolPrefix}${symbol}`,
      variableDebtTokenName: `${variableDebtTokenNamePrefix} ${symbolPrefix}${symbol}`,
      variableDebtTokenSymbol: `variableDebt${symbolPrefix}${symbol}`,
      assetType: assetType,
      supplyCap: supplyCap, //1,000,000
      borrowCap: borrowCap, //1,000,000
      baseLTV: baseLTVAsCollateral,
      liquidationThreshold: liquidationThreshold,
      liquidationBonus: liquidationBonus,
      borrowFactor: borrowFactor,
      borrowingEnabled: borrowingEnabled,
      isAllowed: true,
      VMEXReserveFactor: reserveFactor
    });
  }

  // Deploy init reserves per tranche
  // tranche CONFIGURATION
  const assetMappings = await getAssetMappings();

  console.log(
    `- AssetData initialization`
  );
  const tx3 = await waitForTx(
    await assetMappings
      .connect(admin)
      .setAssetMapping(underlying, initInputParams, interestRateStrategyAddress )
  );

  console.log("    * gasUsed", tx3.gasUsed.toString());

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
  incentivesController: tEthereumAddress,
  trancheId: BigNumberish
) => {
  // Initialize variables for future reserves initialization

  let initInputParams: {
    underlyingAsset: string;
    treasury: string;
    incentivesController: string;
    interestRateChoice: string; //1,000,000
    reserveFactor: string;
    canBorrow: boolean;
    canBeCollateral: boolean;
  }[] = [];
  for (let i=0;i<assetAddresses.length; i++) {
    initInputParams.push({
      underlyingAsset: assetAddresses[i],
      treasury: treasuryAddress,
      incentivesController: incentivesController,
      interestRateChoice: "0",
      reserveFactor: reserveFactors[i],
      canBorrow: canBorrow[i],
      canBeCollateral: canBeCollateral[i]
    });
  }

  // Deploy init reserves per tranche
  // tranche CONFIGURATION
  const configurator = await getLendingPoolConfiguratorProxy();
  let initChunks = 20;
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

export const getTranche0MockedData = (
  allReservesAddresses: { [symbol: string]: tEthereumAddress },
): [tEthereumAddress[], string[], boolean[], boolean[]] => {
  let assets0:tEthereumAddress[] = [
    allReservesAddresses["DAI"],
    allReservesAddresses["TUSD"],
    allReservesAddresses["USDC"],
    allReservesAddresses["USDT"],
    allReservesAddresses["SUSD"],
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

  let reserveFactors0:string[] = [];
  let canBorrow0:boolean[] = [];
  let canBeCollateral0:boolean[] = [];
  for(let i =0;i<assets0.length;i++){
    reserveFactors0.push("1000")
    canBorrow0.push(true);
    canBeCollateral0.push(true);
  }

  return [assets0, reserveFactors0, canBorrow0, canBeCollateral0]
}



export const getTranche1MockedData = (
  allReservesAddresses: { [symbol: string]: tEthereumAddress },
): [tEthereumAddress[], string[], boolean[], boolean[]] => {
  let assets0:tEthereumAddress[] = [
    allReservesAddresses["DAI"],
    allReservesAddresses["TUSD"],
    allReservesAddresses["USDC"],
    allReservesAddresses["USDT"],
    allReservesAddresses["SUSD"],
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
    allReservesAddresses["Frax"],
    allReservesAddresses["BAL"],
    allReservesAddresses["CRV"],
    allReservesAddresses["CVX"],
    allReservesAddresses["BADGER"],
    allReservesAddresses["LDO"],
    allReservesAddresses["ALCX"],
    allReservesAddresses["Oneinch"],
  ];

  let reserveFactors0:string[] = [];
  let canBorrow0:boolean[] = [];
  let canBeCollateral0:boolean[] = [];
  for(let i =0;i<assets0.length;i++){
    reserveFactors0.push("1000")
    canBorrow0.push(true);
    canBeCollateral0.push(true);
  }

  return [assets0, reserveFactors0, canBorrow0, canBeCollateral0]
}
