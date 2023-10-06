import {
  tEthereumAddress,
  iMultiPoolsAssets,
  IMarketRates,
  iAssetBase,
  iAssetAggregatorBase,
  SymbolMap,
} from './types';

import { PriceOracle } from '../types/PriceOracle';
import { MockAggregator } from '../types/MockAggregator';
import { deployMockAggregator } from './contracts-deployments';
import { waitForTx } from './misc-utils';
import { registerContractInJsonDb } from './contracts-helpers';

export const setInitialAssetPricesInOracle = async (
  prices: Partial<iAssetBase<tEthereumAddress>>,
  assetsAddresses: Partial<iAssetBase<tEthereumAddress>>,
  priceOracleInstance: PriceOracle
) => {
  for (const [assetSymbol, price] of Object.entries(prices) as [string, string][]) {
    const assetAddressIndex = Object.keys(assetsAddresses).findIndex(
      (value) => value === assetSymbol
    );
    if (assetAddressIndex == -1) continue
    const [, assetAddress] = (Object.entries(assetsAddresses) as [string, string][])[
      assetAddressIndex
    ];
    await waitForTx(await priceOracleInstance.setAssetPrice(assetAddress, price));
  }
};

export const setAssetPricesInOracle = async (
  prices: SymbolMap<string>,
  assetsAddresses: SymbolMap<tEthereumAddress>,
  priceOracleInstance: PriceOracle
) => {
  for (const [assetSymbol, price] of Object.entries(prices) as [string, string][]) {
    const assetAddressIndex = Object.keys(assetsAddresses).findIndex(
      (value) => value === assetSymbol
    );
    const [, assetAddress] = (Object.entries(assetsAddresses) as [string, string][])[
      assetAddressIndex
    ];
    await waitForTx(await priceOracleInstance.setAssetPrice(assetAddress, price));
  }
};

export const deployMockAggregators = async (initialPrices: SymbolMap<string>, verify?: boolean) => {
  const aggregators: { [tokenSymbol: string]: MockAggregator } = {};
  for (const tokenContractName of Object.keys(initialPrices)) {
    if (tokenContractName !== 'ETH') {
      const priceIndex = Object.keys(initialPrices).findIndex(
        (value) => value === tokenContractName
      );
      const [, price] = (Object.entries(initialPrices) as [string, string][])[priceIndex];
      aggregators[tokenContractName] = await deployMockAggregator(price, verify);
    }
  }
  return aggregators;
};

export const deployAllMockAggregators = async (
  initialPrices: Partial<iAssetAggregatorBase<string>>,
  verify?: boolean
) => {
  const aggregators: { [tokenSymbol: string]: MockAggregator } = {};
  for (const tokenContractName of Object.keys(initialPrices)) {
    if (tokenContractName !== 'ETH') {
      const priceIndex = Object.keys(initialPrices).findIndex(
        (value) => value === tokenContractName
      );
      const [, price] = (Object.entries(initialPrices) as [string, string][])[priceIndex];
      aggregators[tokenContractName] = await deployMockAggregator(price, verify);
      await registerContractInJsonDb(
        (tokenContractName+"_Agg").toUpperCase(),
        aggregators[tokenContractName]
      );
    }
  }
  return aggregators;
};
