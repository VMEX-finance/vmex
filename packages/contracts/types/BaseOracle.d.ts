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
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface BaseOracleInterface extends ethers.utils.Interface {
  functions: {
    "WINDOW_SIZE()": FunctionFragment;
    "latest_pool_price()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "WINDOW_SIZE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "latest_pool_price",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "WINDOW_SIZE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "latest_pool_price",
    data: BytesLike
  ): Result;

  events: {};
}

export class BaseOracle extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: BaseOracleInterface;

  functions: {
    WINDOW_SIZE(overrides?: CallOverrides): Promise<{
      0: number;
    }>;

    "WINDOW_SIZE()"(overrides?: CallOverrides): Promise<{
      0: number;
    }>;

    latest_pool_price(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    "latest_pool_price()"(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;
  };

  WINDOW_SIZE(overrides?: CallOverrides): Promise<number>;

  "WINDOW_SIZE()"(overrides?: CallOverrides): Promise<number>;

  latest_pool_price(overrides?: CallOverrides): Promise<BigNumber>;

  "latest_pool_price()"(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    WINDOW_SIZE(overrides?: CallOverrides): Promise<number>;

    "WINDOW_SIZE()"(overrides?: CallOverrides): Promise<number>;

    latest_pool_price(overrides?: CallOverrides): Promise<BigNumber>;

    "latest_pool_price()"(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    WINDOW_SIZE(overrides?: CallOverrides): Promise<BigNumber>;

    "WINDOW_SIZE()"(overrides?: CallOverrides): Promise<BigNumber>;

    latest_pool_price(overrides?: CallOverrides): Promise<BigNumber>;

    "latest_pool_price()"(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    WINDOW_SIZE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "WINDOW_SIZE()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    latest_pool_price(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "latest_pool_price()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}