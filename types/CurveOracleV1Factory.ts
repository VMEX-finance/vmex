/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { CurveOracleV1 } from "./CurveOracleV1";

export class CurveOracleV1Factory extends ContractFactory {
  constructor(
    linkLibraryAddresses: CurveOracleV1LibraryAddresses,
    signer?: Signer
  ) {
    super(
      _abi,
      CurveOracleV1Factory.linkBytecode(linkLibraryAddresses),
      signer
    );
  }

  static linkBytecode(
    linkLibraryAddresses: CurveOracleV1LibraryAddresses
  ): string {
    let linkedBytecode = _bytecode;

    linkedBytecode = linkedBytecode.replace(
      new RegExp("__\\$fc961522ee25e21dc45bf9241cf35e1d80\\$__", "g"),
      linkLibraryAddresses["__$fc961522ee25e21dc45bf9241cf35e1d80$__"]
        .replace(/^0x/, "")
        .toLowerCase()
    );

    return linkedBytecode;
  }

  deploy(overrides?: Overrides): Promise<CurveOracleV1> {
    return super.deploy(overrides || {}) as Promise<CurveOracleV1>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): CurveOracleV1 {
    return super.attach(address) as CurveOracleV1;
  }
  connect(signer: Signer): CurveOracleV1Factory {
    return super.connect(signer) as CurveOracleV1Factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CurveOracleV1 {
    return new Contract(address, _abi, signerOrProvider) as CurveOracleV1;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "virtual_price",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "prices",
        type: "uint256[]",
      },
    ],
    name: "calculate_v1_token_price",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
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

const _bytecode =
  "0x608060405234801561001057600080fd5b5061039c806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80636dcb6a321461003b57806381651c1714610064575b600080fd5b61004e610049366004610238565b610077565b60405161005b919061031c565b60405180910390f35b61004e6100723660046102a9565b610102565b600080836001600160a01b031663bb7b8b806040518163ffffffff1660e01b815260040160206040518083038186803b1580156100b357600080fd5b505afa1580156100c7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906100eb9190610291565b905060006100f98285610102565b95945050505050565b60008073__$fc961522ee25e21dc45bf9241cf35e1d80$__63d834e619846040518263ffffffff1660e01b815260040161013c91906102d8565b60206040518083038186803b15801561015457600080fd5b505af4158015610168573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061018c9190610291565b90506101988185610325565b949350505050565b600082601f8301126101b0578081fd5b8135602067ffffffffffffffff808311156101cd576101cd610350565b818302604051838282010181811084821117156101ec576101ec610350565b6040528481528381019250868401828801850189101561020a578687fd5b8692505b8583101561022c57803584529284019260019290920191840161020e565b50979650505050505050565b6000806040838503121561024a578182fd5b82356001600160a01b0381168114610260578283fd5b9150602083013567ffffffffffffffff81111561027b578182fd5b610287858286016101a0565b9150509250929050565b6000602082840312156102a2578081fd5b5051919050565b600080604083850312156102bb578182fd5b82359150602083013567ffffffffffffffff81111561027b578182fd5b6020808252825182820181905260009190848201906040850190845b81811015610310578351835292840192918401916001016102f4565b50909695505050505050565b90815260200190565b600081600019048311821515161561034b57634e487b7160e01b81526011600452602481fd5b500290565b634e487b7160e01b600052604160045260246000fdfea2646970667358221220db2d0244d7cf9e24db670ef19e92063b49b085414041af87686bc50edff71f3c64736f6c63430008000033";

export interface CurveOracleV1LibraryAddresses {
  ["__$fc961522ee25e21dc45bf9241cf35e1d80$__"]: string;
}
