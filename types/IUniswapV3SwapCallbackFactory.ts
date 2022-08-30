/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

import type { IUniswapV3SwapCallback } from "./IUniswapV3SwapCallback";

export class IUniswapV3SwapCallbackFactory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IUniswapV3SwapCallback {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as IUniswapV3SwapCallback;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "int256",
        name: "amount0Delta",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "amount1Delta",
        type: "int256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "uniswapV3SwapCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
