/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

import type { CrvDepositor } from "./CrvDepositor";

export class CrvDepositorFactory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CrvDepositor {
    return new Contract(address, _abi, signerOrProvider) as CrvDepositor;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_lock",
        type: "bool",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];