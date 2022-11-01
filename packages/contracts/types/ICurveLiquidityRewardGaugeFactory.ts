/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

import type { ICurveLiquidityRewardGauge } from "./ICurveLiquidityRewardGauge";

export class ICurveLiquidityRewardGaugeFactory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ICurveLiquidityRewardGauge {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ICurveLiquidityRewardGauge;
  }
}

const _abi = [
  {
    inputs: [],
    name: "rewarded_token",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "arg0",
        type: "address",
      },
    ],
    name: "rewards_for",
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