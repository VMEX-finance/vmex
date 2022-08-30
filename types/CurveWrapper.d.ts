/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface CurveWrapperInterface extends ethers.utils.Interface {
  functions: {
    "BASE_CURRENCY()": FunctionFragment;
    "BASE_CURRENCY_UNIT()": FunctionFragment;
    "getAssetPrice(address)": FunctionFragment;
    "getAssetsPrices(address[])": FunctionFragment;
    "getFallbackOracle()": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "setAddressProvider(address)": FunctionFragment;
    "setFallbackOracle(address)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "BASE_CURRENCY",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "BASE_CURRENCY_UNIT",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAssetPrice",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getAssetsPrices",
    values: [string[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getFallbackOracle",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setAddressProvider",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setFallbackOracle",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;

  decodeFunctionResult(
    functionFragment: "BASE_CURRENCY",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "BASE_CURRENCY_UNIT",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAssetPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAssetsPrices",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getFallbackOracle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setAddressProvider",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setFallbackOracle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;

  events: {
    "AssetSourceUpdated(address,address)": EventFragment;
    "BaseCurrencySet(address,uint256)": EventFragment;
    "FallbackOracleUpdated(address)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AssetSourceUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BaseCurrencySet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FallbackOracleUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export class CurveWrapper extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: CurveWrapperInterface;

  functions: {
    BASE_CURRENCY(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "BASE_CURRENCY()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    BASE_CURRENCY_UNIT(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    "BASE_CURRENCY_UNIT()"(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    getAssetPrice(
      asset: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "getAssetPrice(address)"(
      asset: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    getAssetsPrices(
      assets: string[],
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber[];
    }>;

    "getAssetsPrices(address[])"(
      assets: string[],
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber[];
    }>;

    getFallbackOracle(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "getFallbackOracle()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    owner(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "owner()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    renounceOwnership(overrides?: Overrides): Promise<ContractTransaction>;

    "renounceOwnership()"(overrides?: Overrides): Promise<ContractTransaction>;

    setAddressProvider(
      addressProvider: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setAddressProvider(address)"(
      addressProvider: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setFallbackOracle(
      fallbackOracle: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setFallbackOracle(address)"(
      fallbackOracle: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "transferOwnership(address)"(
      newOwner: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  BASE_CURRENCY(overrides?: CallOverrides): Promise<string>;

  "BASE_CURRENCY()"(overrides?: CallOverrides): Promise<string>;

  BASE_CURRENCY_UNIT(overrides?: CallOverrides): Promise<BigNumber>;

  "BASE_CURRENCY_UNIT()"(overrides?: CallOverrides): Promise<BigNumber>;

  getAssetPrice(asset: string, overrides?: CallOverrides): Promise<BigNumber>;

  "getAssetPrice(address)"(
    asset: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getAssetsPrices(
    assets: string[],
    overrides?: CallOverrides
  ): Promise<BigNumber[]>;

  "getAssetsPrices(address[])"(
    assets: string[],
    overrides?: CallOverrides
  ): Promise<BigNumber[]>;

  getFallbackOracle(overrides?: CallOverrides): Promise<string>;

  "getFallbackOracle()"(overrides?: CallOverrides): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  "owner()"(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(overrides?: Overrides): Promise<ContractTransaction>;

  "renounceOwnership()"(overrides?: Overrides): Promise<ContractTransaction>;

  setAddressProvider(
    addressProvider: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setAddressProvider(address)"(
    addressProvider: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setFallbackOracle(
    fallbackOracle: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setFallbackOracle(address)"(
    fallbackOracle: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "transferOwnership(address)"(
    newOwner: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    BASE_CURRENCY(overrides?: CallOverrides): Promise<string>;

    "BASE_CURRENCY()"(overrides?: CallOverrides): Promise<string>;

    BASE_CURRENCY_UNIT(overrides?: CallOverrides): Promise<BigNumber>;

    "BASE_CURRENCY_UNIT()"(overrides?: CallOverrides): Promise<BigNumber>;

    getAssetPrice(asset: string, overrides?: CallOverrides): Promise<BigNumber>;

    "getAssetPrice(address)"(
      asset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAssetsPrices(
      assets: string[],
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    "getAssetsPrices(address[])"(
      assets: string[],
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    getFallbackOracle(overrides?: CallOverrides): Promise<string>;

    "getFallbackOracle()"(overrides?: CallOverrides): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    "owner()"(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    "renounceOwnership()"(overrides?: CallOverrides): Promise<void>;

    setAddressProvider(
      addressProvider: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "setAddressProvider(address)"(
      addressProvider: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setFallbackOracle(
      fallbackOracle: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "setFallbackOracle(address)"(
      fallbackOracle: string,
      overrides?: CallOverrides
    ): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "transferOwnership(address)"(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    AssetSourceUpdated(
      asset: string | null,
      source: string | null
    ): EventFilter;

    BaseCurrencySet(
      baseCurrency: string | null,
      baseCurrencyUnit: null
    ): EventFilter;

    FallbackOracleUpdated(fallbackOracle: string | null): EventFilter;

    OwnershipTransferred(
      previousOwner: string | null,
      newOwner: string | null
    ): EventFilter;
  };

  estimateGas: {
    BASE_CURRENCY(overrides?: CallOverrides): Promise<BigNumber>;

    "BASE_CURRENCY()"(overrides?: CallOverrides): Promise<BigNumber>;

    BASE_CURRENCY_UNIT(overrides?: CallOverrides): Promise<BigNumber>;

    "BASE_CURRENCY_UNIT()"(overrides?: CallOverrides): Promise<BigNumber>;

    getAssetPrice(asset: string, overrides?: CallOverrides): Promise<BigNumber>;

    "getAssetPrice(address)"(
      asset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAssetsPrices(
      assets: string[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getAssetsPrices(address[])"(
      assets: string[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getFallbackOracle(overrides?: CallOverrides): Promise<BigNumber>;

    "getFallbackOracle()"(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    "owner()"(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(overrides?: Overrides): Promise<BigNumber>;

    "renounceOwnership()"(overrides?: Overrides): Promise<BigNumber>;

    setAddressProvider(
      addressProvider: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setAddressProvider(address)"(
      addressProvider: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setFallbackOracle(
      fallbackOracle: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setFallbackOracle(address)"(
      fallbackOracle: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "transferOwnership(address)"(
      newOwner: string,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    BASE_CURRENCY(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "BASE_CURRENCY()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    BASE_CURRENCY_UNIT(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "BASE_CURRENCY_UNIT()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAssetPrice(
      asset: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getAssetPrice(address)"(
      asset: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAssetsPrices(
      assets: string[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getAssetsPrices(address[])"(
      assets: string[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getFallbackOracle(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "getFallbackOracle()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "owner()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(overrides?: Overrides): Promise<PopulatedTransaction>;

    "renounceOwnership()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    setAddressProvider(
      addressProvider: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setAddressProvider(address)"(
      addressProvider: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setFallbackOracle(
      fallbackOracle: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setFallbackOracle(address)"(
      fallbackOracle: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "transferOwnership(address)"(
      newOwner: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}