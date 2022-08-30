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
  PayableOverrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface IWETHGatewayInterface extends ethers.utils.Interface {
  functions: {
    "borrowETH(address,uint8,uint256,uint256,uint16)": FunctionFragment;
    "depositETH(address,uint8,address,uint16)": FunctionFragment;
    "repayETH(address,uint8,uint256,uint256,address)": FunctionFragment;
    "withdrawETH(address,uint8,uint256,address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "borrowETH",
    values: [string, BigNumberish, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "depositETH",
    values: [string, BigNumberish, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "repayETH",
    values: [string, BigNumberish, BigNumberish, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawETH",
    values: [string, BigNumberish, BigNumberish, string]
  ): string;

  decodeFunctionResult(functionFragment: "borrowETH", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "depositETH", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "repayETH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawETH",
    data: BytesLike
  ): Result;

  events: {};
}

export class IWETHGateway extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: IWETHGatewayInterface;

  functions: {
    borrowETH(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      interesRateMode: BigNumberish,
      referralCode: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "borrowETH(address,uint8,uint256,uint256,uint16)"(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      interesRateMode: BigNumberish,
      referralCode: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    depositETH(
      lendingPool: string,
      tranche: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: PayableOverrides
    ): Promise<ContractTransaction>;

    "depositETH(address,uint8,address,uint16)"(
      lendingPool: string,
      tranche: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: PayableOverrides
    ): Promise<ContractTransaction>;

    repayETH(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: PayableOverrides
    ): Promise<ContractTransaction>;

    "repayETH(address,uint8,uint256,uint256,address)"(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: PayableOverrides
    ): Promise<ContractTransaction>;

    withdrawETH(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "withdrawETH(address,uint8,uint256,address)"(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  borrowETH(
    lendingPool: string,
    tranche: BigNumberish,
    amount: BigNumberish,
    interesRateMode: BigNumberish,
    referralCode: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "borrowETH(address,uint8,uint256,uint256,uint16)"(
    lendingPool: string,
    tranche: BigNumberish,
    amount: BigNumberish,
    interesRateMode: BigNumberish,
    referralCode: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  depositETH(
    lendingPool: string,
    tranche: BigNumberish,
    onBehalfOf: string,
    referralCode: BigNumberish,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction>;

  "depositETH(address,uint8,address,uint16)"(
    lendingPool: string,
    tranche: BigNumberish,
    onBehalfOf: string,
    referralCode: BigNumberish,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction>;

  repayETH(
    lendingPool: string,
    tranche: BigNumberish,
    amount: BigNumberish,
    rateMode: BigNumberish,
    onBehalfOf: string,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction>;

  "repayETH(address,uint8,uint256,uint256,address)"(
    lendingPool: string,
    tranche: BigNumberish,
    amount: BigNumberish,
    rateMode: BigNumberish,
    onBehalfOf: string,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction>;

  withdrawETH(
    lendingPool: string,
    tranche: BigNumberish,
    amount: BigNumberish,
    onBehalfOf: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "withdrawETH(address,uint8,uint256,address)"(
    lendingPool: string,
    tranche: BigNumberish,
    amount: BigNumberish,
    onBehalfOf: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    borrowETH(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      interesRateMode: BigNumberish,
      referralCode: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "borrowETH(address,uint8,uint256,uint256,uint16)"(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      interesRateMode: BigNumberish,
      referralCode: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    depositETH(
      lendingPool: string,
      tranche: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "depositETH(address,uint8,address,uint16)"(
      lendingPool: string,
      tranche: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    repayETH(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "repayETH(address,uint8,uint256,uint256,address)"(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawETH(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      onBehalfOf: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "withdrawETH(address,uint8,uint256,address)"(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      onBehalfOf: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    borrowETH(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      interesRateMode: BigNumberish,
      referralCode: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "borrowETH(address,uint8,uint256,uint256,uint16)"(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      interesRateMode: BigNumberish,
      referralCode: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    depositETH(
      lendingPool: string,
      tranche: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: PayableOverrides
    ): Promise<BigNumber>;

    "depositETH(address,uint8,address,uint16)"(
      lendingPool: string,
      tranche: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: PayableOverrides
    ): Promise<BigNumber>;

    repayETH(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: PayableOverrides
    ): Promise<BigNumber>;

    "repayETH(address,uint8,uint256,uint256,address)"(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: PayableOverrides
    ): Promise<BigNumber>;

    withdrawETH(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "withdrawETH(address,uint8,uint256,address)"(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    borrowETH(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      interesRateMode: BigNumberish,
      referralCode: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "borrowETH(address,uint8,uint256,uint256,uint16)"(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      interesRateMode: BigNumberish,
      referralCode: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    depositETH(
      lendingPool: string,
      tranche: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: PayableOverrides
    ): Promise<PopulatedTransaction>;

    "depositETH(address,uint8,address,uint16)"(
      lendingPool: string,
      tranche: BigNumberish,
      onBehalfOf: string,
      referralCode: BigNumberish,
      overrides?: PayableOverrides
    ): Promise<PopulatedTransaction>;

    repayETH(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: PayableOverrides
    ): Promise<PopulatedTransaction>;

    "repayETH(address,uint8,uint256,uint256,address)"(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      rateMode: BigNumberish,
      onBehalfOf: string,
      overrides?: PayableOverrides
    ): Promise<PopulatedTransaction>;

    withdrawETH(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "withdrawETH(address,uint8,uint256,address)"(
      lendingPool: string,
      tranche: BigNumberish,
      amount: BigNumberish,
      onBehalfOf: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
