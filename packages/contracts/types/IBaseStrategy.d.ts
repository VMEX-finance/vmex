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

interface IBaseStrategyInterface extends ethers.utils.Interface {
  functions: {
    "balanceOf()": FunctionFragment;
    "balanceOfRewards()": FunctionFragment;
    "baseStrategyVersion()": FunctionFragment;
    "calculateAverageRate()": FunctionFragment;
    "emitNonProtectedToken(address)": FunctionFragment;
    "getName()": FunctionFragment;
    "harvest()": FunctionFragment;
    "pause()": FunctionFragment;
    "pull()": FunctionFragment;
    "setWithdrawalMaxDeviationThreshold(uint256)": FunctionFragment;
    "tend()": FunctionFragment;
    "unpause()": FunctionFragment;
    "withdraw(uint256)": FunctionFragment;
    "withdrawAll()": FunctionFragment;
    "withdrawOther(address)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "balanceOf", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "balanceOfRewards",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "baseStrategyVersion",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "calculateAverageRate",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "emitNonProtectedToken",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "getName", values?: undefined): string;
  encodeFunctionData(functionFragment: "harvest", values?: undefined): string;
  encodeFunctionData(functionFragment: "pause", values?: undefined): string;
  encodeFunctionData(functionFragment: "pull", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "setWithdrawalMaxDeviationThreshold",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "tend", values?: undefined): string;
  encodeFunctionData(functionFragment: "unpause", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawAll",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawOther",
    values: [string]
  ): string;

  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "balanceOfRewards",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "baseStrategyVersion",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "calculateAverageRate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "emitNonProtectedToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getName", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "harvest", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pull", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setWithdrawalMaxDeviationThreshold",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "tend", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawOther",
    data: BytesLike
  ): Result;

  events: {
    "SetWithdrawalMaxDeviationThreshold(uint256)": EventFragment;
    "StrategyPullFromLendingPool(address,uint256)": EventFragment;
  };

  getEvent(
    nameOrSignatureOrTopic: "SetWithdrawalMaxDeviationThreshold"
  ): EventFragment;
  getEvent(
    nameOrSignatureOrTopic: "StrategyPullFromLendingPool"
  ): EventFragment;
}

export class IBaseStrategy extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: IBaseStrategyInterface;

  functions: {
    balanceOf(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    "balanceOf()"(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    balanceOfRewards(overrides?: Overrides): Promise<ContractTransaction>;

    "balanceOfRewards()"(overrides?: Overrides): Promise<ContractTransaction>;

    baseStrategyVersion(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "baseStrategyVersion()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    calculateAverageRate(overrides?: CallOverrides): Promise<{
      r: BigNumber;
      0: BigNumber;
    }>;

    "calculateAverageRate()"(overrides?: CallOverrides): Promise<{
      r: BigNumber;
      0: BigNumber;
    }>;

    emitNonProtectedToken(
      _token: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "emitNonProtectedToken(address)"(
      _token: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    getName(overrides?: Overrides): Promise<ContractTransaction>;

    "getName()"(overrides?: Overrides): Promise<ContractTransaction>;

    harvest(overrides?: Overrides): Promise<ContractTransaction>;

    "harvest()"(overrides?: Overrides): Promise<ContractTransaction>;

    pause(overrides?: Overrides): Promise<ContractTransaction>;

    "pause()"(overrides?: Overrides): Promise<ContractTransaction>;

    pull(overrides?: Overrides): Promise<ContractTransaction>;

    "pull()"(overrides?: Overrides): Promise<ContractTransaction>;

    setWithdrawalMaxDeviationThreshold(
      _threshold: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setWithdrawalMaxDeviationThreshold(uint256)"(
      _threshold: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    tend(overrides?: Overrides): Promise<ContractTransaction>;

    "tend()"(overrides?: Overrides): Promise<ContractTransaction>;

    unpause(overrides?: Overrides): Promise<ContractTransaction>;

    "unpause()"(overrides?: Overrides): Promise<ContractTransaction>;

    withdraw(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "withdraw(uint256)"(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    withdrawAll(overrides?: Overrides): Promise<ContractTransaction>;

    "withdrawAll()"(overrides?: Overrides): Promise<ContractTransaction>;

    withdrawOther(
      _asset: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "withdrawOther(address)"(
      _asset: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  balanceOf(overrides?: CallOverrides): Promise<BigNumber>;

  "balanceOf()"(overrides?: CallOverrides): Promise<BigNumber>;

  balanceOfRewards(overrides?: Overrides): Promise<ContractTransaction>;

  "balanceOfRewards()"(overrides?: Overrides): Promise<ContractTransaction>;

  baseStrategyVersion(overrides?: CallOverrides): Promise<string>;

  "baseStrategyVersion()"(overrides?: CallOverrides): Promise<string>;

  calculateAverageRate(overrides?: CallOverrides): Promise<BigNumber>;

  "calculateAverageRate()"(overrides?: CallOverrides): Promise<BigNumber>;

  emitNonProtectedToken(
    _token: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "emitNonProtectedToken(address)"(
    _token: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  getName(overrides?: Overrides): Promise<ContractTransaction>;

  "getName()"(overrides?: Overrides): Promise<ContractTransaction>;

  harvest(overrides?: Overrides): Promise<ContractTransaction>;

  "harvest()"(overrides?: Overrides): Promise<ContractTransaction>;

  pause(overrides?: Overrides): Promise<ContractTransaction>;

  "pause()"(overrides?: Overrides): Promise<ContractTransaction>;

  pull(overrides?: Overrides): Promise<ContractTransaction>;

  "pull()"(overrides?: Overrides): Promise<ContractTransaction>;

  setWithdrawalMaxDeviationThreshold(
    _threshold: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setWithdrawalMaxDeviationThreshold(uint256)"(
    _threshold: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  tend(overrides?: Overrides): Promise<ContractTransaction>;

  "tend()"(overrides?: Overrides): Promise<ContractTransaction>;

  unpause(overrides?: Overrides): Promise<ContractTransaction>;

  "unpause()"(overrides?: Overrides): Promise<ContractTransaction>;

  withdraw(
    _amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "withdraw(uint256)"(
    _amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  withdrawAll(overrides?: Overrides): Promise<ContractTransaction>;

  "withdrawAll()"(overrides?: Overrides): Promise<ContractTransaction>;

  withdrawOther(
    _asset: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "withdrawOther(address)"(
    _asset: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    balanceOf(overrides?: CallOverrides): Promise<BigNumber>;

    "balanceOf()"(overrides?: CallOverrides): Promise<BigNumber>;

    balanceOfRewards(
      overrides?: CallOverrides
    ): Promise<{ token: string; amount: BigNumber; 0: string; 1: BigNumber }[]>;

    "balanceOfRewards()"(
      overrides?: CallOverrides
    ): Promise<{ token: string; amount: BigNumber; 0: string; 1: BigNumber }[]>;

    baseStrategyVersion(overrides?: CallOverrides): Promise<string>;

    "baseStrategyVersion()"(overrides?: CallOverrides): Promise<string>;

    calculateAverageRate(overrides?: CallOverrides): Promise<BigNumber>;

    "calculateAverageRate()"(overrides?: CallOverrides): Promise<BigNumber>;

    emitNonProtectedToken(
      _token: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "emitNonProtectedToken(address)"(
      _token: string,
      overrides?: CallOverrides
    ): Promise<void>;

    getName(overrides?: CallOverrides): Promise<string>;

    "getName()"(overrides?: CallOverrides): Promise<string>;

    harvest(
      overrides?: CallOverrides
    ): Promise<{ token: string; amount: BigNumber; 0: string; 1: BigNumber }[]>;

    "harvest()"(
      overrides?: CallOverrides
    ): Promise<{ token: string; amount: BigNumber; 0: string; 1: BigNumber }[]>;

    pause(overrides?: CallOverrides): Promise<void>;

    "pause()"(overrides?: CallOverrides): Promise<void>;

    pull(overrides?: CallOverrides): Promise<BigNumber>;

    "pull()"(overrides?: CallOverrides): Promise<BigNumber>;

    setWithdrawalMaxDeviationThreshold(
      _threshold: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "setWithdrawalMaxDeviationThreshold(uint256)"(
      _threshold: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    tend(
      overrides?: CallOverrides
    ): Promise<{
      crvTended: BigNumber;
      cvxTended: BigNumber;
      cvxCrvTended: BigNumber;
      extraRewardsTended: BigNumber;
      0: BigNumber;
      1: BigNumber;
      2: BigNumber;
      3: BigNumber;
    }>;

    "tend()"(
      overrides?: CallOverrides
    ): Promise<{
      crvTended: BigNumber;
      cvxTended: BigNumber;
      cvxCrvTended: BigNumber;
      extraRewardsTended: BigNumber;
      0: BigNumber;
      1: BigNumber;
      2: BigNumber;
      3: BigNumber;
    }>;

    unpause(overrides?: CallOverrides): Promise<void>;

    "unpause()"(overrides?: CallOverrides): Promise<void>;

    withdraw(_amount: BigNumberish, overrides?: CallOverrides): Promise<void>;

    "withdraw(uint256)"(
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawAll(overrides?: CallOverrides): Promise<void>;

    "withdrawAll()"(overrides?: CallOverrides): Promise<void>;

    withdrawOther(_asset: string, overrides?: CallOverrides): Promise<void>;

    "withdrawOther(address)"(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    SetWithdrawalMaxDeviationThreshold(
      newMaxDeviationThreshold: null
    ): EventFilter;

    StrategyPullFromLendingPool(lendingPool: null, amount: null): EventFilter;
  };

  estimateGas: {
    balanceOf(overrides?: CallOverrides): Promise<BigNumber>;

    "balanceOf()"(overrides?: CallOverrides): Promise<BigNumber>;

    balanceOfRewards(overrides?: Overrides): Promise<BigNumber>;

    "balanceOfRewards()"(overrides?: Overrides): Promise<BigNumber>;

    baseStrategyVersion(overrides?: CallOverrides): Promise<BigNumber>;

    "baseStrategyVersion()"(overrides?: CallOverrides): Promise<BigNumber>;

    calculateAverageRate(overrides?: CallOverrides): Promise<BigNumber>;

    "calculateAverageRate()"(overrides?: CallOverrides): Promise<BigNumber>;

    emitNonProtectedToken(
      _token: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "emitNonProtectedToken(address)"(
      _token: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    getName(overrides?: Overrides): Promise<BigNumber>;

    "getName()"(overrides?: Overrides): Promise<BigNumber>;

    harvest(overrides?: Overrides): Promise<BigNumber>;

    "harvest()"(overrides?: Overrides): Promise<BigNumber>;

    pause(overrides?: Overrides): Promise<BigNumber>;

    "pause()"(overrides?: Overrides): Promise<BigNumber>;

    pull(overrides?: Overrides): Promise<BigNumber>;

    "pull()"(overrides?: Overrides): Promise<BigNumber>;

    setWithdrawalMaxDeviationThreshold(
      _threshold: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setWithdrawalMaxDeviationThreshold(uint256)"(
      _threshold: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    tend(overrides?: Overrides): Promise<BigNumber>;

    "tend()"(overrides?: Overrides): Promise<BigNumber>;

    unpause(overrides?: Overrides): Promise<BigNumber>;

    "unpause()"(overrides?: Overrides): Promise<BigNumber>;

    withdraw(_amount: BigNumberish, overrides?: Overrides): Promise<BigNumber>;

    "withdraw(uint256)"(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    withdrawAll(overrides?: Overrides): Promise<BigNumber>;

    "withdrawAll()"(overrides?: Overrides): Promise<BigNumber>;

    withdrawOther(_asset: string, overrides?: Overrides): Promise<BigNumber>;

    "withdrawOther(address)"(
      _asset: string,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    balanceOf(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "balanceOf()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    balanceOfRewards(overrides?: Overrides): Promise<PopulatedTransaction>;

    "balanceOfRewards()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    baseStrategyVersion(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "baseStrategyVersion()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    calculateAverageRate(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "calculateAverageRate()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    emitNonProtectedToken(
      _token: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "emitNonProtectedToken(address)"(
      _token: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    getName(overrides?: Overrides): Promise<PopulatedTransaction>;

    "getName()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    harvest(overrides?: Overrides): Promise<PopulatedTransaction>;

    "harvest()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    pause(overrides?: Overrides): Promise<PopulatedTransaction>;

    "pause()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    pull(overrides?: Overrides): Promise<PopulatedTransaction>;

    "pull()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    setWithdrawalMaxDeviationThreshold(
      _threshold: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setWithdrawalMaxDeviationThreshold(uint256)"(
      _threshold: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    tend(overrides?: Overrides): Promise<PopulatedTransaction>;

    "tend()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    unpause(overrides?: Overrides): Promise<PopulatedTransaction>;

    "unpause()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    withdraw(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "withdraw(uint256)"(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    withdrawAll(overrides?: Overrides): Promise<PopulatedTransaction>;

    "withdrawAll()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    withdrawOther(
      _asset: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "withdrawOther(address)"(
      _asset: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}