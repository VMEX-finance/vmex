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

interface ILendingPoolAddressesProviderInterface
  extends ethers.utils.Interface {
  functions: {
    "getAavePriceOracle()": FunctionFragment;
    "getAddress(bytes32)": FunctionFragment;
    "getCurveAddressProvider()": FunctionFragment;
    "getCurvePriceOracle()": FunctionFragment;
    "getCurvePriceOracleWrapper()": FunctionFragment;
    "getEmergencyAdmin()": FunctionFragment;
    "getLendingPool()": FunctionFragment;
    "getLendingPoolCollateralManager()": FunctionFragment;
    "getLendingPoolConfigurator()": FunctionFragment;
    "getLendingRateOracle()": FunctionFragment;
    "getMarketId()": FunctionFragment;
    "getPoolAdmin()": FunctionFragment;
    "getPriceOracle(uint8)": FunctionFragment;
    "setAavePriceOracle(address)": FunctionFragment;
    "setAddress(bytes32,address)": FunctionFragment;
    "setAddressAsProxy(bytes32,address)": FunctionFragment;
    "setCurveAddressProvider(address)": FunctionFragment;
    "setCurvePriceOracle(address)": FunctionFragment;
    "setCurvePriceOracleWrapper(address)": FunctionFragment;
    "setEmergencyAdmin(address)": FunctionFragment;
    "setLendingPoolCollateralManager(address)": FunctionFragment;
    "setLendingPoolConfiguratorImpl(address)": FunctionFragment;
    "setLendingPoolImpl(address)": FunctionFragment;
    "setLendingRateOracle(address)": FunctionFragment;
    "setMarketId(string)": FunctionFragment;
    "setPoolAdmin(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "getAavePriceOracle",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAddress",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getCurveAddressProvider",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCurvePriceOracle",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCurvePriceOracleWrapper",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getEmergencyAdmin",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getLendingPool",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getLendingPoolCollateralManager",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getLendingPoolConfigurator",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getLendingRateOracle",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getMarketId",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getPoolAdmin",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getPriceOracle",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setAavePriceOracle",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setAddress",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setAddressAsProxy",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setCurveAddressProvider",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setCurvePriceOracle",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setCurvePriceOracleWrapper",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setEmergencyAdmin",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setLendingPoolCollateralManager",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setLendingPoolConfiguratorImpl",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setLendingPoolImpl",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setLendingRateOracle",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "setMarketId", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setPoolAdmin",
    values: [string]
  ): string;

  decodeFunctionResult(
    functionFragment: "getAavePriceOracle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getAddress", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getCurveAddressProvider",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCurvePriceOracle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCurvePriceOracleWrapper",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getEmergencyAdmin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLendingPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLendingPoolCollateralManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLendingPoolConfigurator",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLendingRateOracle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMarketId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPoolAdmin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPriceOracle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setAavePriceOracle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setAddress", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setAddressAsProxy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setCurveAddressProvider",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setCurvePriceOracle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setCurvePriceOracleWrapper",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setEmergencyAdmin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setLendingPoolCollateralManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setLendingPoolConfiguratorImpl",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setLendingPoolImpl",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setLendingRateOracle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMarketId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPoolAdmin",
    data: BytesLike
  ): Result;

  events: {
    "AddressSet(bytes32,address,bool)": EventFragment;
    "ConfigurationAdminUpdated(address)": EventFragment;
    "CurveAddressProviderUpdated(address)": EventFragment;
    "CurvePriceOracleUpdated(address)": EventFragment;
    "CurvePriceOracleWrapperUpdated(address)": EventFragment;
    "EmergencyAdminUpdated(address)": EventFragment;
    "LendingPoolCollateralManagerUpdated(address)": EventFragment;
    "LendingPoolConfiguratorUpdated(address)": EventFragment;
    "LendingPoolUpdated(address)": EventFragment;
    "LendingRateOracleUpdated(address)": EventFragment;
    "MarketIdSet(string)": EventFragment;
    "PriceOracleUpdated(address)": EventFragment;
    "ProxyCreated(bytes32,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AddressSet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ConfigurationAdminUpdated"): EventFragment;
  getEvent(
    nameOrSignatureOrTopic: "CurveAddressProviderUpdated"
  ): EventFragment;
  getEvent(nameOrSignatureOrTopic: "CurvePriceOracleUpdated"): EventFragment;
  getEvent(
    nameOrSignatureOrTopic: "CurvePriceOracleWrapperUpdated"
  ): EventFragment;
  getEvent(nameOrSignatureOrTopic: "EmergencyAdminUpdated"): EventFragment;
  getEvent(
    nameOrSignatureOrTopic: "LendingPoolCollateralManagerUpdated"
  ): EventFragment;
  getEvent(
    nameOrSignatureOrTopic: "LendingPoolConfiguratorUpdated"
  ): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LendingPoolUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LendingRateOracleUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "MarketIdSet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PriceOracleUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProxyCreated"): EventFragment;
}

export class ILendingPoolAddressesProvider extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: ILendingPoolAddressesProviderInterface;

  functions: {
    getAavePriceOracle(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "getAavePriceOracle()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    getAddress(
      id: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "getAddress(bytes32)"(
      id: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    getCurveAddressProvider(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "getCurveAddressProvider()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    getCurvePriceOracle(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "getCurvePriceOracle()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    getCurvePriceOracleWrapper(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "getCurvePriceOracleWrapper()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    getEmergencyAdmin(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "getEmergencyAdmin()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    getLendingPool(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "getLendingPool()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    getLendingPoolCollateralManager(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "getLendingPoolCollateralManager()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    getLendingPoolConfigurator(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "getLendingPoolConfigurator()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    getLendingRateOracle(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "getLendingRateOracle()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    getMarketId(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "getMarketId()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    getPoolAdmin(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "getPoolAdmin()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    getPriceOracle(
      assetType: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "getPriceOracle(uint8)"(
      assetType: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    setAavePriceOracle(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setAavePriceOracle(address)"(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setAddress(
      id: BytesLike,
      newAddress: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setAddress(bytes32,address)"(
      id: BytesLike,
      newAddress: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setAddressAsProxy(
      id: BytesLike,
      impl: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setAddressAsProxy(bytes32,address)"(
      id: BytesLike,
      impl: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setCurveAddressProvider(
      addressProvider: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setCurveAddressProvider(address)"(
      addressProvider: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setCurvePriceOracle(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setCurvePriceOracle(address)"(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setCurvePriceOracleWrapper(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setCurvePriceOracleWrapper(address)"(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setEmergencyAdmin(
      admin: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setEmergencyAdmin(address)"(
      admin: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setLendingPoolCollateralManager(
      manager: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setLendingPoolCollateralManager(address)"(
      manager: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setLendingPoolConfiguratorImpl(
      configurator: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setLendingPoolConfiguratorImpl(address)"(
      configurator: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setLendingPoolImpl(
      pool: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setLendingPoolImpl(address)"(
      pool: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setLendingRateOracle(
      lendingRateOracle: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setLendingRateOracle(address)"(
      lendingRateOracle: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setMarketId(
      marketId: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setMarketId(string)"(
      marketId: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setPoolAdmin(
      admin: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setPoolAdmin(address)"(
      admin: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  getAavePriceOracle(overrides?: CallOverrides): Promise<string>;

  "getAavePriceOracle()"(overrides?: CallOverrides): Promise<string>;

  getAddress(id: BytesLike, overrides?: CallOverrides): Promise<string>;

  "getAddress(bytes32)"(
    id: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  getCurveAddressProvider(overrides?: CallOverrides): Promise<string>;

  "getCurveAddressProvider()"(overrides?: CallOverrides): Promise<string>;

  getCurvePriceOracle(overrides?: CallOverrides): Promise<string>;

  "getCurvePriceOracle()"(overrides?: CallOverrides): Promise<string>;

  getCurvePriceOracleWrapper(overrides?: CallOverrides): Promise<string>;

  "getCurvePriceOracleWrapper()"(overrides?: CallOverrides): Promise<string>;

  getEmergencyAdmin(overrides?: CallOverrides): Promise<string>;

  "getEmergencyAdmin()"(overrides?: CallOverrides): Promise<string>;

  getLendingPool(overrides?: CallOverrides): Promise<string>;

  "getLendingPool()"(overrides?: CallOverrides): Promise<string>;

  getLendingPoolCollateralManager(overrides?: CallOverrides): Promise<string>;

  "getLendingPoolCollateralManager()"(
    overrides?: CallOverrides
  ): Promise<string>;

  getLendingPoolConfigurator(overrides?: CallOverrides): Promise<string>;

  "getLendingPoolConfigurator()"(overrides?: CallOverrides): Promise<string>;

  getLendingRateOracle(overrides?: CallOverrides): Promise<string>;

  "getLendingRateOracle()"(overrides?: CallOverrides): Promise<string>;

  getMarketId(overrides?: CallOverrides): Promise<string>;

  "getMarketId()"(overrides?: CallOverrides): Promise<string>;

  getPoolAdmin(overrides?: CallOverrides): Promise<string>;

  "getPoolAdmin()"(overrides?: CallOverrides): Promise<string>;

  getPriceOracle(
    assetType: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  "getPriceOracle(uint8)"(
    assetType: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  setAavePriceOracle(
    priceOracle: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setAavePriceOracle(address)"(
    priceOracle: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setAddress(
    id: BytesLike,
    newAddress: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setAddress(bytes32,address)"(
    id: BytesLike,
    newAddress: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setAddressAsProxy(
    id: BytesLike,
    impl: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setAddressAsProxy(bytes32,address)"(
    id: BytesLike,
    impl: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setCurveAddressProvider(
    addressProvider: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setCurveAddressProvider(address)"(
    addressProvider: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setCurvePriceOracle(
    priceOracle: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setCurvePriceOracle(address)"(
    priceOracle: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setCurvePriceOracleWrapper(
    priceOracle: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setCurvePriceOracleWrapper(address)"(
    priceOracle: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setEmergencyAdmin(
    admin: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setEmergencyAdmin(address)"(
    admin: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setLendingPoolCollateralManager(
    manager: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setLendingPoolCollateralManager(address)"(
    manager: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setLendingPoolConfiguratorImpl(
    configurator: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setLendingPoolConfiguratorImpl(address)"(
    configurator: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setLendingPoolImpl(
    pool: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setLendingPoolImpl(address)"(
    pool: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setLendingRateOracle(
    lendingRateOracle: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setLendingRateOracle(address)"(
    lendingRateOracle: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setMarketId(
    marketId: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setMarketId(string)"(
    marketId: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setPoolAdmin(
    admin: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setPoolAdmin(address)"(
    admin: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    getAavePriceOracle(overrides?: CallOverrides): Promise<string>;

    "getAavePriceOracle()"(overrides?: CallOverrides): Promise<string>;

    getAddress(id: BytesLike, overrides?: CallOverrides): Promise<string>;

    "getAddress(bytes32)"(
      id: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    getCurveAddressProvider(overrides?: CallOverrides): Promise<string>;

    "getCurveAddressProvider()"(overrides?: CallOverrides): Promise<string>;

    getCurvePriceOracle(overrides?: CallOverrides): Promise<string>;

    "getCurvePriceOracle()"(overrides?: CallOverrides): Promise<string>;

    getCurvePriceOracleWrapper(overrides?: CallOverrides): Promise<string>;

    "getCurvePriceOracleWrapper()"(overrides?: CallOverrides): Promise<string>;

    getEmergencyAdmin(overrides?: CallOverrides): Promise<string>;

    "getEmergencyAdmin()"(overrides?: CallOverrides): Promise<string>;

    getLendingPool(overrides?: CallOverrides): Promise<string>;

    "getLendingPool()"(overrides?: CallOverrides): Promise<string>;

    getLendingPoolCollateralManager(overrides?: CallOverrides): Promise<string>;

    "getLendingPoolCollateralManager()"(
      overrides?: CallOverrides
    ): Promise<string>;

    getLendingPoolConfigurator(overrides?: CallOverrides): Promise<string>;

    "getLendingPoolConfigurator()"(overrides?: CallOverrides): Promise<string>;

    getLendingRateOracle(overrides?: CallOverrides): Promise<string>;

    "getLendingRateOracle()"(overrides?: CallOverrides): Promise<string>;

    getMarketId(overrides?: CallOverrides): Promise<string>;

    "getMarketId()"(overrides?: CallOverrides): Promise<string>;

    getPoolAdmin(overrides?: CallOverrides): Promise<string>;

    "getPoolAdmin()"(overrides?: CallOverrides): Promise<string>;

    getPriceOracle(
      assetType: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    "getPriceOracle(uint8)"(
      assetType: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    setAavePriceOracle(
      priceOracle: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "setAavePriceOracle(address)"(
      priceOracle: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setAddress(
      id: BytesLike,
      newAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "setAddress(bytes32,address)"(
      id: BytesLike,
      newAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setAddressAsProxy(
      id: BytesLike,
      impl: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "setAddressAsProxy(bytes32,address)"(
      id: BytesLike,
      impl: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setCurveAddressProvider(
      addressProvider: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "setCurveAddressProvider(address)"(
      addressProvider: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setCurvePriceOracle(
      priceOracle: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "setCurvePriceOracle(address)"(
      priceOracle: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setCurvePriceOracleWrapper(
      priceOracle: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "setCurvePriceOracleWrapper(address)"(
      priceOracle: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setEmergencyAdmin(admin: string, overrides?: CallOverrides): Promise<void>;

    "setEmergencyAdmin(address)"(
      admin: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setLendingPoolCollateralManager(
      manager: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "setLendingPoolCollateralManager(address)"(
      manager: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setLendingPoolConfiguratorImpl(
      configurator: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "setLendingPoolConfiguratorImpl(address)"(
      configurator: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setLendingPoolImpl(pool: string, overrides?: CallOverrides): Promise<void>;

    "setLendingPoolImpl(address)"(
      pool: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setLendingRateOracle(
      lendingRateOracle: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "setLendingRateOracle(address)"(
      lendingRateOracle: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setMarketId(marketId: string, overrides?: CallOverrides): Promise<void>;

    "setMarketId(string)"(
      marketId: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setPoolAdmin(admin: string, overrides?: CallOverrides): Promise<void>;

    "setPoolAdmin(address)"(
      admin: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    AddressSet(
      id: null,
      newAddress: string | null,
      hasProxy: null
    ): EventFilter;

    ConfigurationAdminUpdated(newAddress: string | null): EventFilter;

    CurveAddressProviderUpdated(newAddress: string | null): EventFilter;

    CurvePriceOracleUpdated(newAddress: string | null): EventFilter;

    CurvePriceOracleWrapperUpdated(newAddress: string | null): EventFilter;

    EmergencyAdminUpdated(newAddress: string | null): EventFilter;

    LendingPoolCollateralManagerUpdated(newAddress: string | null): EventFilter;

    LendingPoolConfiguratorUpdated(newAddress: string | null): EventFilter;

    LendingPoolUpdated(newAddress: string | null): EventFilter;

    LendingRateOracleUpdated(newAddress: string | null): EventFilter;

    MarketIdSet(newMarketId: null): EventFilter;

    PriceOracleUpdated(newAddress: string | null): EventFilter;

    ProxyCreated(id: null, newAddress: string | null): EventFilter;
  };

  estimateGas: {
    getAavePriceOracle(overrides?: CallOverrides): Promise<BigNumber>;

    "getAavePriceOracle()"(overrides?: CallOverrides): Promise<BigNumber>;

    getAddress(id: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;

    "getAddress(bytes32)"(
      id: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getCurveAddressProvider(overrides?: CallOverrides): Promise<BigNumber>;

    "getCurveAddressProvider()"(overrides?: CallOverrides): Promise<BigNumber>;

    getCurvePriceOracle(overrides?: CallOverrides): Promise<BigNumber>;

    "getCurvePriceOracle()"(overrides?: CallOverrides): Promise<BigNumber>;

    getCurvePriceOracleWrapper(overrides?: CallOverrides): Promise<BigNumber>;

    "getCurvePriceOracleWrapper()"(
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getEmergencyAdmin(overrides?: CallOverrides): Promise<BigNumber>;

    "getEmergencyAdmin()"(overrides?: CallOverrides): Promise<BigNumber>;

    getLendingPool(overrides?: CallOverrides): Promise<BigNumber>;

    "getLendingPool()"(overrides?: CallOverrides): Promise<BigNumber>;

    getLendingPoolCollateralManager(
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getLendingPoolCollateralManager()"(
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getLendingPoolConfigurator(overrides?: CallOverrides): Promise<BigNumber>;

    "getLendingPoolConfigurator()"(
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getLendingRateOracle(overrides?: CallOverrides): Promise<BigNumber>;

    "getLendingRateOracle()"(overrides?: CallOverrides): Promise<BigNumber>;

    getMarketId(overrides?: CallOverrides): Promise<BigNumber>;

    "getMarketId()"(overrides?: CallOverrides): Promise<BigNumber>;

    getPoolAdmin(overrides?: CallOverrides): Promise<BigNumber>;

    "getPoolAdmin()"(overrides?: CallOverrides): Promise<BigNumber>;

    getPriceOracle(
      assetType: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getPriceOracle(uint8)"(
      assetType: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setAavePriceOracle(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setAavePriceOracle(address)"(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setAddress(
      id: BytesLike,
      newAddress: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setAddress(bytes32,address)"(
      id: BytesLike,
      newAddress: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setAddressAsProxy(
      id: BytesLike,
      impl: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setAddressAsProxy(bytes32,address)"(
      id: BytesLike,
      impl: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setCurveAddressProvider(
      addressProvider: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setCurveAddressProvider(address)"(
      addressProvider: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setCurvePriceOracle(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setCurvePriceOracle(address)"(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setCurvePriceOracleWrapper(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setCurvePriceOracleWrapper(address)"(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setEmergencyAdmin(admin: string, overrides?: Overrides): Promise<BigNumber>;

    "setEmergencyAdmin(address)"(
      admin: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setLendingPoolCollateralManager(
      manager: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setLendingPoolCollateralManager(address)"(
      manager: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setLendingPoolConfiguratorImpl(
      configurator: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setLendingPoolConfiguratorImpl(address)"(
      configurator: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setLendingPoolImpl(pool: string, overrides?: Overrides): Promise<BigNumber>;

    "setLendingPoolImpl(address)"(
      pool: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setLendingRateOracle(
      lendingRateOracle: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setLendingRateOracle(address)"(
      lendingRateOracle: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setMarketId(marketId: string, overrides?: Overrides): Promise<BigNumber>;

    "setMarketId(string)"(
      marketId: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setPoolAdmin(admin: string, overrides?: Overrides): Promise<BigNumber>;

    "setPoolAdmin(address)"(
      admin: string,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getAavePriceOracle(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getAavePriceOracle()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAddress(
      id: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getAddress(bytes32)"(
      id: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCurveAddressProvider(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getCurveAddressProvider()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCurvePriceOracle(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getCurvePriceOracle()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCurvePriceOracleWrapper(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getCurvePriceOracleWrapper()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getEmergencyAdmin(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "getEmergencyAdmin()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getLendingPool(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "getLendingPool()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getLendingPoolCollateralManager(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getLendingPoolCollateralManager()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getLendingPoolConfigurator(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getLendingPoolConfigurator()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getLendingRateOracle(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getLendingRateOracle()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getMarketId(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "getMarketId()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getPoolAdmin(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "getPoolAdmin()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getPriceOracle(
      assetType: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getPriceOracle(uint8)"(
      assetType: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setAavePriceOracle(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setAavePriceOracle(address)"(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setAddress(
      id: BytesLike,
      newAddress: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setAddress(bytes32,address)"(
      id: BytesLike,
      newAddress: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setAddressAsProxy(
      id: BytesLike,
      impl: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setAddressAsProxy(bytes32,address)"(
      id: BytesLike,
      impl: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setCurveAddressProvider(
      addressProvider: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setCurveAddressProvider(address)"(
      addressProvider: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setCurvePriceOracle(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setCurvePriceOracle(address)"(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setCurvePriceOracleWrapper(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setCurvePriceOracleWrapper(address)"(
      priceOracle: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setEmergencyAdmin(
      admin: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setEmergencyAdmin(address)"(
      admin: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setLendingPoolCollateralManager(
      manager: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setLendingPoolCollateralManager(address)"(
      manager: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setLendingPoolConfiguratorImpl(
      configurator: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setLendingPoolConfiguratorImpl(address)"(
      configurator: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setLendingPoolImpl(
      pool: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setLendingPoolImpl(address)"(
      pool: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setLendingRateOracle(
      lendingRateOracle: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setLendingRateOracle(address)"(
      lendingRateOracle: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setMarketId(
      marketId: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setMarketId(string)"(
      marketId: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setPoolAdmin(
      admin: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setPoolAdmin(address)"(
      admin: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}