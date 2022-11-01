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

interface ICurveRegistryInterface extends ethers.utils.Interface {
  functions: {
    "find_pool_for_coins(address,address,uint256)": FunctionFragment;
    "get_coin_indices(address,address,address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "find_pool_for_coins",
    values: [string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "get_coin_indices",
    values: [string, string, string]
  ): string;

  decodeFunctionResult(
    functionFragment: "find_pool_for_coins",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "get_coin_indices",
    data: BytesLike
  ): Result;

  events: {};
}

export class ICurveRegistry extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: ICurveRegistryInterface;

  functions: {
    find_pool_for_coins(
      _from: string,
      _to: string,
      _index: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "find_pool_for_coins(address,address,uint256)"(
      _from: string,
      _to: string,
      _index: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    get_coin_indices(
      _pool: string,
      _from: string,
      _to: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "get_coin_indices(address,address,address)"(
      _pool: string,
      _from: string,
      _to: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  find_pool_for_coins(
    _from: string,
    _to: string,
    _index: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "find_pool_for_coins(address,address,uint256)"(
    _from: string,
    _to: string,
    _index: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  get_coin_indices(
    _pool: string,
    _from: string,
    _to: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "get_coin_indices(address,address,address)"(
    _pool: string,
    _from: string,
    _to: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    find_pool_for_coins(
      _from: string,
      _to: string,
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    "find_pool_for_coins(address,address,uint256)"(
      _from: string,
      _to: string,
      _index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    get_coin_indices(
      _pool: string,
      _from: string,
      _to: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
      1: BigNumber;
      2: boolean;
    }>;

    "get_coin_indices(address,address,address)"(
      _pool: string,
      _from: string,
      _to: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
      1: BigNumber;
      2: boolean;
    }>;
  };

  filters: {};

  estimateGas: {
    find_pool_for_coins(
      _from: string,
      _to: string,
      _index: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "find_pool_for_coins(address,address,uint256)"(
      _from: string,
      _to: string,
      _index: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    get_coin_indices(
      _pool: string,
      _from: string,
      _to: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "get_coin_indices(address,address,address)"(
      _pool: string,
      _from: string,
      _to: string,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    find_pool_for_coins(
      _from: string,
      _to: string,
      _index: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "find_pool_for_coins(address,address,uint256)"(
      _from: string,
      _to: string,
      _index: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    get_coin_indices(
      _pool: string,
      _from: string,
      _to: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "get_coin_indices(address,address,address)"(
      _pool: string,
      _from: string,
      _to: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}