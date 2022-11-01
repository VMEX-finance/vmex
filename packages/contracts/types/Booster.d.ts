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

interface BoosterInterface extends ethers.utils.Interface {
  functions: {
    "addPool(uint256,address)": FunctionFragment;
    "claimRewards(uint256,address)": FunctionFragment;
    "deposit(uint256,uint256,bool)": FunctionFragment;
    "poolInfo(uint256)": FunctionFragment;
    "withdraw(uint256,uint256)": FunctionFragment;
    "withdrawAll(uint256)": FunctionFragment;
    "withdrawTo(uint256,uint256,address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addPool",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "claimRewards",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "deposit",
    values: [BigNumberish, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "poolInfo",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawAll",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawTo",
    values: [BigNumberish, BigNumberish, string]
  ): string;

  decodeFunctionResult(functionFragment: "addPool", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "claimRewards",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "poolInfo", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdrawTo", data: BytesLike): Result;

  events: {};
}

export class Booster extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: BoosterInterface;

  functions: {
    addPool(
      _pid: BigNumberish,
      _baseRewardsPool: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "addPool(uint256,address)"(
      _pid: BigNumberish,
      _baseRewardsPool: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    claimRewards(
      _pid: BigNumberish,
      _gauge: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "claimRewards(uint256,address)"(
      _pid: BigNumberish,
      _gauge: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    deposit(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _stake: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "deposit(uint256,uint256,bool)"(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _stake: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    poolInfo(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      lptoken: string;
      token: string;
      gauge: string;
      crvRewards: string;
      stash: string;
      shutdown: boolean;
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
      5: boolean;
    }>;

    "poolInfo(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      lptoken: string;
      token: string;
      gauge: string;
      crvRewards: string;
      stash: string;
      shutdown: boolean;
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
      5: boolean;
    }>;

    withdraw(
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "withdraw(uint256,uint256)"(
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    withdrawAll(
      _pid: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "withdrawAll(uint256)"(
      _pid: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    withdrawTo(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _to: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "withdrawTo(uint256,uint256,address)"(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _to: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  addPool(
    _pid: BigNumberish,
    _baseRewardsPool: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "addPool(uint256,address)"(
    _pid: BigNumberish,
    _baseRewardsPool: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  claimRewards(
    _pid: BigNumberish,
    _gauge: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "claimRewards(uint256,address)"(
    _pid: BigNumberish,
    _gauge: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  deposit(
    _pid: BigNumberish,
    _amount: BigNumberish,
    _stake: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "deposit(uint256,uint256,bool)"(
    _pid: BigNumberish,
    _amount: BigNumberish,
    _stake: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  poolInfo(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<{
    lptoken: string;
    token: string;
    gauge: string;
    crvRewards: string;
    stash: string;
    shutdown: boolean;
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: boolean;
  }>;

  "poolInfo(uint256)"(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<{
    lptoken: string;
    token: string;
    gauge: string;
    crvRewards: string;
    stash: string;
    shutdown: boolean;
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: boolean;
  }>;

  withdraw(
    _pid: BigNumberish,
    _amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "withdraw(uint256,uint256)"(
    _pid: BigNumberish,
    _amount: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  withdrawAll(
    _pid: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "withdrawAll(uint256)"(
    _pid: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  withdrawTo(
    _pid: BigNumberish,
    _amount: BigNumberish,
    _to: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "withdrawTo(uint256,uint256,address)"(
    _pid: BigNumberish,
    _amount: BigNumberish,
    _to: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    addPool(
      _pid: BigNumberish,
      _baseRewardsPool: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "addPool(uint256,address)"(
      _pid: BigNumberish,
      _baseRewardsPool: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    claimRewards(
      _pid: BigNumberish,
      _gauge: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "claimRewards(uint256,address)"(
      _pid: BigNumberish,
      _gauge: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    deposit(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _stake: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "deposit(uint256,uint256,bool)"(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _stake: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;

    poolInfo(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      lptoken: string;
      token: string;
      gauge: string;
      crvRewards: string;
      stash: string;
      shutdown: boolean;
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
      5: boolean;
    }>;

    "poolInfo(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      lptoken: string;
      token: string;
      gauge: string;
      crvRewards: string;
      stash: string;
      shutdown: boolean;
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
      5: boolean;
    }>;

    withdraw(
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "withdraw(uint256,uint256)"(
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    withdrawAll(
      _pid: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "withdrawAll(uint256)"(
      _pid: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    withdrawTo(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _to: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "withdrawTo(uint256,uint256,address)"(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _to: string,
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {};

  estimateGas: {
    addPool(
      _pid: BigNumberish,
      _baseRewardsPool: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "addPool(uint256,address)"(
      _pid: BigNumberish,
      _baseRewardsPool: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    claimRewards(
      _pid: BigNumberish,
      _gauge: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "claimRewards(uint256,address)"(
      _pid: BigNumberish,
      _gauge: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    deposit(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _stake: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "deposit(uint256,uint256,bool)"(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _stake: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    poolInfo(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    "poolInfo(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdraw(
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "withdraw(uint256,uint256)"(
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    withdrawAll(_pid: BigNumberish, overrides?: Overrides): Promise<BigNumber>;

    "withdrawAll(uint256)"(
      _pid: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    withdrawTo(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _to: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "withdrawTo(uint256,uint256,address)"(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _to: string,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addPool(
      _pid: BigNumberish,
      _baseRewardsPool: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "addPool(uint256,address)"(
      _pid: BigNumberish,
      _baseRewardsPool: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    claimRewards(
      _pid: BigNumberish,
      _gauge: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "claimRewards(uint256,address)"(
      _pid: BigNumberish,
      _gauge: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    deposit(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _stake: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "deposit(uint256,uint256,bool)"(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _stake: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    poolInfo(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "poolInfo(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    withdraw(
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "withdraw(uint256,uint256)"(
      _pid: BigNumberish,
      _amount: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    withdrawAll(
      _pid: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "withdrawAll(uint256)"(
      _pid: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    withdrawTo(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _to: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "withdrawTo(uint256,uint256,address)"(
      _pid: BigNumberish,
      _amount: BigNumberish,
      _to: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
