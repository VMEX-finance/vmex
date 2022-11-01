/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { TrancheReserveData } from "./TrancheReserveData";

export class TrancheReserveDataFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    pool: string,
    trancheId: BigNumberish,
    overrides?: Overrides
  ): Promise<TrancheReserveData> {
    return super.deploy(
      pool,
      trancheId,
      overrides || {}
    ) as Promise<TrancheReserveData>;
  }
  getDeployTransaction(
    pool: string,
    trancheId: BigNumberish,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(pool, trancheId, overrides || {});
  }
  attach(address: string): TrancheReserveData {
    return super.attach(address) as TrancheReserveData;
  }
  connect(signer: Signer): TrancheReserveDataFactory {
    return super.connect(signer) as TrancheReserveDataFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TrancheReserveData {
    return new Contract(address, _abi, signerOrProvider) as TrancheReserveData;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "trancheId",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5060405161026938038061026983398101604081905261002f916100fc565b60405163f443b71560e01b81526000906001600160a01b0384169063f443b7159061005e908590600401610244565b60006040518083038186803b15801561007657600080fd5b505afa15801561008a573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526100b29190810190610137565b90506000816040516020016100c791906101f7565b6040516020818303038152906040529050805181602001f35b80516001600160a01b03811681146100f757600080fd5b919050565b6000806040838503121561010e578182fd5b610117836100e0565b9150602083015160ff8116811461012c578182fd5b809150509250929050565b60006020808385031215610149578182fd5b82516001600160401b038082111561015f578384fd5b818501915085601f830112610172578384fd5b81518181111561018457610184610252565b838102604051858282010181811085821117156101a3576101a3610252565b604052828152858101935084860182860187018a10156101c1578788fd5b8795505b838610156101ea576101d6816100e0565b8552600195909501949386019386016101c5565b5098975050505050505050565b6020808252825182820181905260009190848201906040850190845b818110156102385783516001600160a01b031683529284019291840191600101610213565b50909695505050505050565b60ff91909116815260200190565b634e487b7160e01b600052604160045260246000fdfe";
