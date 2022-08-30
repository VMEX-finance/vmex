/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

import type { ICurveOracle } from "./ICurveOracle";

export class ICurveOracleFactory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ICurveOracle {
    return new Contract(address, _abi, signerOrProvider) as ICurveOracle;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "curve_pool",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "prices",
        type: "uint256[]",
      },
    ],
    name: "get_price",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
