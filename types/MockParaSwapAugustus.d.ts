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

interface MockParaSwapAugustusInterface extends ethers.utils.Interface {
  functions: {
    "expectSwap(address,address,uint256,uint256,uint256)": FunctionFragment;
    "getTokenTransferProxy()": FunctionFragment;
    "swap(address,address,uint256,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "expectSwap",
    values: [string, string, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenTransferProxy",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "swap",
    values: [string, string, BigNumberish, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "expectSwap", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getTokenTransferProxy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "swap", data: BytesLike): Result;

  events: {};
}

export class MockParaSwapAugustus extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: MockParaSwapAugustusInterface;

  functions: {
    expectSwap(
      fromToken: string,
      toToken: string,
      fromAmountMin: BigNumberish,
      fromAmountMax: BigNumberish,
      receivedAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "expectSwap(address,address,uint256,uint256,uint256)"(
      fromToken: string,
      toToken: string,
      fromAmountMin: BigNumberish,
      fromAmountMax: BigNumberish,
      receivedAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    getTokenTransferProxy(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "getTokenTransferProxy()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    swap(
      fromToken: string,
      toToken: string,
      fromAmount: BigNumberish,
      toAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "swap(address,address,uint256,uint256)"(
      fromToken: string,
      toToken: string,
      fromAmount: BigNumberish,
      toAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  expectSwap(
    fromToken: string,
    toToken: string,
    fromAmountMin: BigNumberish,
    fromAmountMax: BigNumberish,
    receivedAmount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "expectSwap(address,address,uint256,uint256,uint256)"(
    fromToken: string,
    toToken: string,
    fromAmountMin: BigNumberish,
    fromAmountMax: BigNumberish,
    receivedAmount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  getTokenTransferProxy(overrides?: CallOverrides): Promise<string>;

  "getTokenTransferProxy()"(overrides?: CallOverrides): Promise<string>;

  swap(
    fromToken: string,
    toToken: string,
    fromAmount: BigNumberish,
    toAmount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "swap(address,address,uint256,uint256)"(
    fromToken: string,
    toToken: string,
    fromAmount: BigNumberish,
    toAmount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    expectSwap(
      fromToken: string,
      toToken: string,
      fromAmountMin: BigNumberish,
      fromAmountMax: BigNumberish,
      receivedAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "expectSwap(address,address,uint256,uint256,uint256)"(
      fromToken: string,
      toToken: string,
      fromAmountMin: BigNumberish,
      fromAmountMax: BigNumberish,
      receivedAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    getTokenTransferProxy(overrides?: CallOverrides): Promise<string>;

    "getTokenTransferProxy()"(overrides?: CallOverrides): Promise<string>;

    swap(
      fromToken: string,
      toToken: string,
      fromAmount: BigNumberish,
      toAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "swap(address,address,uint256,uint256)"(
      fromToken: string,
      toToken: string,
      fromAmount: BigNumberish,
      toAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    expectSwap(
      fromToken: string,
      toToken: string,
      fromAmountMin: BigNumberish,
      fromAmountMax: BigNumberish,
      receivedAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "expectSwap(address,address,uint256,uint256,uint256)"(
      fromToken: string,
      toToken: string,
      fromAmountMin: BigNumberish,
      fromAmountMax: BigNumberish,
      receivedAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    getTokenTransferProxy(overrides?: CallOverrides): Promise<BigNumber>;

    "getTokenTransferProxy()"(overrides?: CallOverrides): Promise<BigNumber>;

    swap(
      fromToken: string,
      toToken: string,
      fromAmount: BigNumberish,
      toAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "swap(address,address,uint256,uint256)"(
      fromToken: string,
      toToken: string,
      fromAmount: BigNumberish,
      toAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    expectSwap(
      fromToken: string,
      toToken: string,
      fromAmountMin: BigNumberish,
      fromAmountMax: BigNumberish,
      receivedAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "expectSwap(address,address,uint256,uint256,uint256)"(
      fromToken: string,
      toToken: string,
      fromAmountMin: BigNumberish,
      fromAmountMax: BigNumberish,
      receivedAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    getTokenTransferProxy(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getTokenTransferProxy()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    swap(
      fromToken: string,
      toToken: string,
      fromAmount: BigNumberish,
      toAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "swap(address,address,uint256,uint256)"(
      fromToken: string,
      toToken: string,
      fromAmount: BigNumberish,
      toAmount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
