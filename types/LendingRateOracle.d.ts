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

interface LendingRateOracleInterface extends ethers.utils.Interface {
  functions: {
    "getMarketBorrowRate(address)": FunctionFragment;
    "getMarketLiquidityRate(address)": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "setMarketBorrowRate(address,uint256)": FunctionFragment;
    "setMarketLiquidityRate(address,uint256)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "getMarketBorrowRate",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getMarketLiquidityRate",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setMarketBorrowRate",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setMarketLiquidityRate",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;

  decodeFunctionResult(
    functionFragment: "getMarketBorrowRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMarketLiquidityRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMarketBorrowRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMarketLiquidityRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;

  events: {
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export class LendingRateOracle extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: LendingRateOracleInterface;

  functions: {
    getMarketBorrowRate(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "getMarketBorrowRate(address)"(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    getMarketLiquidityRate(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "getMarketLiquidityRate(address)"(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    owner(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "owner()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    renounceOwnership(overrides?: Overrides): Promise<ContractTransaction>;

    "renounceOwnership()"(overrides?: Overrides): Promise<ContractTransaction>;

    setMarketBorrowRate(
      _asset: string,
      _rate: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setMarketBorrowRate(address,uint256)"(
      _asset: string,
      _rate: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setMarketLiquidityRate(
      _asset: string,
      _rate: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setMarketLiquidityRate(address,uint256)"(
      _asset: string,
      _rate: BigNumberish,
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

  getMarketBorrowRate(
    _asset: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "getMarketBorrowRate(address)"(
    _asset: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getMarketLiquidityRate(
    _asset: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "getMarketLiquidityRate(address)"(
    _asset: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  owner(overrides?: CallOverrides): Promise<string>;

  "owner()"(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(overrides?: Overrides): Promise<ContractTransaction>;

  "renounceOwnership()"(overrides?: Overrides): Promise<ContractTransaction>;

  setMarketBorrowRate(
    _asset: string,
    _rate: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setMarketBorrowRate(address,uint256)"(
    _asset: string,
    _rate: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setMarketLiquidityRate(
    _asset: string,
    _rate: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setMarketLiquidityRate(address,uint256)"(
    _asset: string,
    _rate: BigNumberish,
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
    getMarketBorrowRate(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getMarketBorrowRate(address)"(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getMarketLiquidityRate(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getMarketLiquidityRate(address)"(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    "owner()"(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    "renounceOwnership()"(overrides?: CallOverrides): Promise<void>;

    setMarketBorrowRate(
      _asset: string,
      _rate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "setMarketBorrowRate(address,uint256)"(
      _asset: string,
      _rate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setMarketLiquidityRate(
      _asset: string,
      _rate: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "setMarketLiquidityRate(address,uint256)"(
      _asset: string,
      _rate: BigNumberish,
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
    OwnershipTransferred(
      previousOwner: string | null,
      newOwner: string | null
    ): EventFilter;
  };

  estimateGas: {
    getMarketBorrowRate(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getMarketBorrowRate(address)"(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getMarketLiquidityRate(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getMarketLiquidityRate(address)"(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    "owner()"(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(overrides?: Overrides): Promise<BigNumber>;

    "renounceOwnership()"(overrides?: Overrides): Promise<BigNumber>;

    setMarketBorrowRate(
      _asset: string,
      _rate: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setMarketBorrowRate(address,uint256)"(
      _asset: string,
      _rate: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setMarketLiquidityRate(
      _asset: string,
      _rate: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setMarketLiquidityRate(address,uint256)"(
      _asset: string,
      _rate: BigNumberish,
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
    getMarketBorrowRate(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getMarketBorrowRate(address)"(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getMarketLiquidityRate(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getMarketLiquidityRate(address)"(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "owner()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(overrides?: Overrides): Promise<PopulatedTransaction>;

    "renounceOwnership()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    setMarketBorrowRate(
      _asset: string,
      _rate: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setMarketBorrowRate(address,uint256)"(
      _asset: string,
      _rate: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setMarketLiquidityRate(
      _asset: string,
      _rate: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setMarketLiquidityRate(address,uint256)"(
      _asset: string,
      _rate: BigNumberish,
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
