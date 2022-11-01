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

interface IBaseRewardsPoolInterface extends ethers.utils.Interface {
  functions: {
    "balanceOf(address)": FunctionFragment;
    "earned(address)": FunctionFragment;
    "extraRewards(uint256)": FunctionFragment;
    "extraRewardsLength()": FunctionFragment;
    "getReward()": FunctionFragment;
    "periodFinish()": FunctionFragment;
    "rewards(address)": FunctionFragment;
    "stake(uint256)": FunctionFragment;
    "stakeFor(address,uint256)": FunctionFragment;
    "stakingToken()": FunctionFragment;
    "withdraw(uint256,bool)": FunctionFragment;
    "withdrawAllAndUnwrap(bool)": FunctionFragment;
    "withdrawAndUnwrap(uint256,bool)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "balanceOf", values: [string]): string;
  encodeFunctionData(functionFragment: "earned", values: [string]): string;
  encodeFunctionData(
    functionFragment: "extraRewards",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "extraRewardsLength",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "getReward", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "periodFinish",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "rewards", values: [string]): string;
  encodeFunctionData(functionFragment: "stake", values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: "stakeFor",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "stakingToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawAllAndUnwrap",
    values: [boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawAndUnwrap",
    values: [BigNumberish, boolean]
  ): string;

  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "earned", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "extraRewards",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "extraRewardsLength",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getReward", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "periodFinish",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "rewards", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "stake", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "stakeFor", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "stakingToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawAllAndUnwrap",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawAndUnwrap",
    data: BytesLike
  ): Result;

  events: {};
}

export class IBaseRewardsPool extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: IBaseRewardsPoolInterface;

  functions: {
    balanceOf(
      _account: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "balanceOf(address)"(
      _account: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    earned(
      _account: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "earned(address)"(
      _account: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    extraRewards(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "extraRewards(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    extraRewardsLength(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    "extraRewardsLength()"(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    "getReward()"(overrides?: Overrides): Promise<ContractTransaction>;

    "getReward(address,bool)"(
      _account: string,
      _claimExtras: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    periodFinish(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    "periodFinish()"(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    rewards(
      _account: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "rewards(address)"(
      _account: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    stake(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "stake(uint256)"(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    stakeFor(
      _account: string,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "stakeFor(address,uint256)"(
      _account: string,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    stakingToken(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "stakingToken()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    withdraw(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "withdraw(uint256,bool)"(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    withdrawAllAndUnwrap(
      claim: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "withdrawAllAndUnwrap(bool)"(
      claim: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    withdrawAndUnwrap(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "withdrawAndUnwrap(uint256,bool)"(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  balanceOf(_account: string, overrides?: CallOverrides): Promise<BigNumber>;

  "balanceOf(address)"(
    _account: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  earned(_account: string, overrides?: CallOverrides): Promise<BigNumber>;

  "earned(address)"(
    _account: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  extraRewards(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

  "extraRewards(uint256)"(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  extraRewardsLength(overrides?: CallOverrides): Promise<BigNumber>;

  "extraRewardsLength()"(overrides?: CallOverrides): Promise<BigNumber>;

  "getReward()"(overrides?: Overrides): Promise<ContractTransaction>;

  "getReward(address,bool)"(
    _account: string,
    _claimExtras: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  periodFinish(overrides?: CallOverrides): Promise<BigNumber>;

  "periodFinish()"(overrides?: CallOverrides): Promise<BigNumber>;

  rewards(_account: string, overrides?: CallOverrides): Promise<BigNumber>;

  "rewards(address)"(
    _account: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  stake(
    _amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "stake(uint256)"(
    _amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  stakeFor(
    _account: string,
    _amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "stakeFor(address,uint256)"(
    _account: string,
    _amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  stakingToken(overrides?: CallOverrides): Promise<string>;

  "stakingToken()"(overrides?: CallOverrides): Promise<string>;

  withdraw(
    _amount: BigNumberish,
    _claim: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "withdraw(uint256,bool)"(
    _amount: BigNumberish,
    _claim: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  withdrawAllAndUnwrap(
    claim: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "withdrawAllAndUnwrap(bool)"(
    claim: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  withdrawAndUnwrap(
    _amount: BigNumberish,
    _claim: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "withdrawAndUnwrap(uint256,bool)"(
    _amount: BigNumberish,
    _claim: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    balanceOf(_account: string, overrides?: CallOverrides): Promise<BigNumber>;

    "balanceOf(address)"(
      _account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    earned(_account: string, overrides?: CallOverrides): Promise<BigNumber>;

    "earned(address)"(
      _account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    extraRewards(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    "extraRewards(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    extraRewardsLength(overrides?: CallOverrides): Promise<BigNumber>;

    "extraRewardsLength()"(overrides?: CallOverrides): Promise<BigNumber>;

    "getReward()"(overrides?: CallOverrides): Promise<boolean>;

    "getReward(address,bool)"(
      _account: string,
      _claimExtras: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;

    periodFinish(overrides?: CallOverrides): Promise<BigNumber>;

    "periodFinish()"(overrides?: CallOverrides): Promise<BigNumber>;

    rewards(_account: string, overrides?: CallOverrides): Promise<BigNumber>;

    "rewards(address)"(
      _account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    stake(_amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;

    "stake(uint256)"(
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    stakeFor(
      _account: string,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "stakeFor(address,uint256)"(
      _account: string,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    stakingToken(overrides?: CallOverrides): Promise<string>;

    "stakingToken()"(overrides?: CallOverrides): Promise<string>;

    withdraw(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "withdraw(uint256,bool)"(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;

    withdrawAllAndUnwrap(
      claim: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    "withdrawAllAndUnwrap(bool)"(
      claim: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawAndUnwrap(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "withdrawAndUnwrap(uint256,bool)"(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {};

  estimateGas: {
    balanceOf(_account: string, overrides?: CallOverrides): Promise<BigNumber>;

    "balanceOf(address)"(
      _account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    earned(_account: string, overrides?: CallOverrides): Promise<BigNumber>;

    "earned(address)"(
      _account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    extraRewards(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "extraRewards(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    extraRewardsLength(overrides?: CallOverrides): Promise<BigNumber>;

    "extraRewardsLength()"(overrides?: CallOverrides): Promise<BigNumber>;

    "getReward()"(overrides?: Overrides): Promise<BigNumber>;

    "getReward(address,bool)"(
      _account: string,
      _claimExtras: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    periodFinish(overrides?: CallOverrides): Promise<BigNumber>;

    "periodFinish()"(overrides?: CallOverrides): Promise<BigNumber>;

    rewards(_account: string, overrides?: CallOverrides): Promise<BigNumber>;

    "rewards(address)"(
      _account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    stake(_amount: BigNumberish, overrides?: Overrides): Promise<BigNumber>;

    "stake(uint256)"(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    stakeFor(
      _account: string,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "stakeFor(address,uint256)"(
      _account: string,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    stakingToken(overrides?: CallOverrides): Promise<BigNumber>;

    "stakingToken()"(overrides?: CallOverrides): Promise<BigNumber>;

    withdraw(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "withdraw(uint256,bool)"(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    withdrawAllAndUnwrap(
      claim: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "withdrawAllAndUnwrap(bool)"(
      claim: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    withdrawAndUnwrap(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "withdrawAndUnwrap(uint256,bool)"(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    balanceOf(
      _account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "balanceOf(address)"(
      _account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    earned(
      _account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "earned(address)"(
      _account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    extraRewards(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "extraRewards(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    extraRewardsLength(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "extraRewardsLength()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getReward()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    "getReward(address,bool)"(
      _account: string,
      _claimExtras: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    periodFinish(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "periodFinish()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    rewards(
      _account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "rewards(address)"(
      _account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    stake(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "stake(uint256)"(
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    stakeFor(
      _account: string,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "stakeFor(address,uint256)"(
      _account: string,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    stakingToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "stakingToken()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    withdraw(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "withdraw(uint256,bool)"(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    withdrawAllAndUnwrap(
      claim: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "withdrawAllAndUnwrap(bool)"(
      claim: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    withdrawAndUnwrap(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "withdrawAndUnwrap(uint256,bool)"(
      _amount: BigNumberish,
      _claim: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
