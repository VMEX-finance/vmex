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

interface ICurvePoolTokenInterface extends ethers.utils.Interface {
  functions: {
    "allowance(address,address)": FunctionFragment;
    "approve(address,uint256)": FunctionFragment;
    "balanceOf(address)": FunctionFragment;
    "burn(uint256)": FunctionFragment;
    "burnFrom(address,uint256)": FunctionFragment;
    "decimals()": FunctionFragment;
    "mint(address,uint256)": FunctionFragment;
    "name()": FunctionFragment;
    "set_minter(address)": FunctionFragment;
    "symbol()": FunctionFragment;
    "totalSupply()": FunctionFragment;
    "transfer(address,uint256)": FunctionFragment;
    "transferFrom(address,address,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "allowance",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "approve",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "balanceOf", values: [string]): string;
  encodeFunctionData(functionFragment: "burn", values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: "burnFrom",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(functionFragment: "set_minter", values: [string]): string;
  encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transfer",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferFrom",
    values: [string, string, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "burn", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "burnFrom", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "set_minter", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferFrom",
    data: BytesLike
  ): Result;

  events: {};
}

export class ICurvePoolToken extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: ICurvePoolTokenInterface;

  functions: {
    allowance(
      _owner: string,
      _spender: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "allowance(address,address)"(
      _owner: string,
      _spender: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    approve(
      _spender: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "approve(address,uint256)"(
      _spender: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    balanceOf(
      arg0: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "balanceOf(address)"(
      arg0: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    burn(
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "burn(uint256)"(
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    burnFrom(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "burnFrom(address,uint256)"(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    decimals(overrides?: Overrides): Promise<ContractTransaction>;

    "decimals()"(overrides?: Overrides): Promise<ContractTransaction>;

    mint(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "mint(address,uint256)"(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    name(overrides?: Overrides): Promise<ContractTransaction>;

    "name()"(overrides?: Overrides): Promise<ContractTransaction>;

    set_minter(
      _minter: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "set_minter(address)"(
      _minter: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    symbol(overrides?: Overrides): Promise<ContractTransaction>;

    "symbol()"(overrides?: Overrides): Promise<ContractTransaction>;

    totalSupply(overrides?: Overrides): Promise<ContractTransaction>;

    "totalSupply()"(overrides?: Overrides): Promise<ContractTransaction>;

    transfer(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "transfer(address,uint256)"(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    transferFrom(
      _from: string,
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "transferFrom(address,address,uint256)"(
      _from: string,
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  allowance(
    _owner: string,
    _spender: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "allowance(address,address)"(
    _owner: string,
    _spender: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  approve(
    _spender: string,
    _value: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "approve(address,uint256)"(
    _spender: string,
    _value: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  balanceOf(arg0: string, overrides?: Overrides): Promise<ContractTransaction>;

  "balanceOf(address)"(
    arg0: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  burn(
    _value: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "burn(uint256)"(
    _value: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  burnFrom(
    _to: string,
    _value: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "burnFrom(address,uint256)"(
    _to: string,
    _value: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  decimals(overrides?: Overrides): Promise<ContractTransaction>;

  "decimals()"(overrides?: Overrides): Promise<ContractTransaction>;

  mint(
    _to: string,
    _value: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "mint(address,uint256)"(
    _to: string,
    _value: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  name(overrides?: Overrides): Promise<ContractTransaction>;

  "name()"(overrides?: Overrides): Promise<ContractTransaction>;

  set_minter(
    _minter: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "set_minter(address)"(
    _minter: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  symbol(overrides?: Overrides): Promise<ContractTransaction>;

  "symbol()"(overrides?: Overrides): Promise<ContractTransaction>;

  totalSupply(overrides?: Overrides): Promise<ContractTransaction>;

  "totalSupply()"(overrides?: Overrides): Promise<ContractTransaction>;

  transfer(
    _to: string,
    _value: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "transfer(address,uint256)"(
    _to: string,
    _value: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  transferFrom(
    _from: string,
    _to: string,
    _value: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "transferFrom(address,address,uint256)"(
    _from: string,
    _to: string,
    _value: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    allowance(
      _owner: string,
      _spender: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "allowance(address,address)"(
      _owner: string,
      _spender: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    approve(
      _spender: string,
      _value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "approve(address,uint256)"(
      _spender: string,
      _value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    balanceOf(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    "balanceOf(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    burn(_value: BigNumberish, overrides?: CallOverrides): Promise<void>;

    "burn(uint256)"(
      _value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    burnFrom(
      _to: string,
      _value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "burnFrom(address,uint256)"(
      _to: string,
      _value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    decimals(overrides?: CallOverrides): Promise<BigNumber>;

    "decimals()"(overrides?: CallOverrides): Promise<BigNumber>;

    mint(
      _to: string,
      _value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "mint(address,uint256)"(
      _to: string,
      _value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    name(overrides?: CallOverrides): Promise<string>;

    "name()"(overrides?: CallOverrides): Promise<string>;

    set_minter(_minter: string, overrides?: CallOverrides): Promise<void>;

    "set_minter(address)"(
      _minter: string,
      overrides?: CallOverrides
    ): Promise<void>;

    symbol(overrides?: CallOverrides): Promise<string>;

    "symbol()"(overrides?: CallOverrides): Promise<string>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    "totalSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

    transfer(
      _to: string,
      _value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "transfer(address,uint256)"(
      _to: string,
      _value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    transferFrom(
      _from: string,
      _to: string,
      _value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "transferFrom(address,address,uint256)"(
      _from: string,
      _to: string,
      _value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {};

  estimateGas: {
    allowance(
      _owner: string,
      _spender: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "allowance(address,address)"(
      _owner: string,
      _spender: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    approve(
      _spender: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "approve(address,uint256)"(
      _spender: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    balanceOf(arg0: string, overrides?: Overrides): Promise<BigNumber>;

    "balanceOf(address)"(
      arg0: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    burn(_value: BigNumberish, overrides?: Overrides): Promise<BigNumber>;

    "burn(uint256)"(
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    burnFrom(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "burnFrom(address,uint256)"(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    decimals(overrides?: Overrides): Promise<BigNumber>;

    "decimals()"(overrides?: Overrides): Promise<BigNumber>;

    mint(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "mint(address,uint256)"(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    name(overrides?: Overrides): Promise<BigNumber>;

    "name()"(overrides?: Overrides): Promise<BigNumber>;

    set_minter(_minter: string, overrides?: Overrides): Promise<BigNumber>;

    "set_minter(address)"(
      _minter: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    symbol(overrides?: Overrides): Promise<BigNumber>;

    "symbol()"(overrides?: Overrides): Promise<BigNumber>;

    totalSupply(overrides?: Overrides): Promise<BigNumber>;

    "totalSupply()"(overrides?: Overrides): Promise<BigNumber>;

    transfer(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "transfer(address,uint256)"(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    transferFrom(
      _from: string,
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "transferFrom(address,address,uint256)"(
      _from: string,
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    allowance(
      _owner: string,
      _spender: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "allowance(address,address)"(
      _owner: string,
      _spender: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    approve(
      _spender: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "approve(address,uint256)"(
      _spender: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    balanceOf(
      arg0: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "balanceOf(address)"(
      arg0: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    burn(
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "burn(uint256)"(
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    burnFrom(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "burnFrom(address,uint256)"(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    decimals(overrides?: Overrides): Promise<PopulatedTransaction>;

    "decimals()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    mint(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "mint(address,uint256)"(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    name(overrides?: Overrides): Promise<PopulatedTransaction>;

    "name()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    set_minter(
      _minter: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "set_minter(address)"(
      _minter: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    symbol(overrides?: Overrides): Promise<PopulatedTransaction>;

    "symbol()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    totalSupply(overrides?: Overrides): Promise<PopulatedTransaction>;

    "totalSupply()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    transfer(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "transfer(address,uint256)"(
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    transferFrom(
      _from: string,
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "transferFrom(address,address,uint256)"(
      _from: string,
      _to: string,
      _value: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}