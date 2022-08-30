/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { BaseImmutableAdminUpgradeabilityProxy } from "./BaseImmutableAdminUpgradeabilityProxy";

export class BaseImmutableAdminUpgradeabilityProxyFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    admin: string,
    overrides?: Overrides
  ): Promise<BaseImmutableAdminUpgradeabilityProxy> {
    return super.deploy(
      admin,
      overrides || {}
    ) as Promise<BaseImmutableAdminUpgradeabilityProxy>;
  }
  getDeployTransaction(
    admin: string,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(admin, overrides || {});
  }
  attach(address: string): BaseImmutableAdminUpgradeabilityProxy {
    return super.attach(address) as BaseImmutableAdminUpgradeabilityProxy;
  }
  connect(signer: Signer): BaseImmutableAdminUpgradeabilityProxyFactory {
    return super.connect(
      signer
    ) as BaseImmutableAdminUpgradeabilityProxyFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BaseImmutableAdminUpgradeabilityProxy {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as BaseImmutableAdminUpgradeabilityProxy;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "implementation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address",
      },
    ],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

const _bytecode =
  "0x60a060405234801561001057600080fd5b5060405161064e38038061064e83398101604081905261002f91610044565b60601b6001600160601b031916608052610072565b600060208284031215610055578081fd5b81516001600160a01b038116811461006b578182fd5b9392505050565b60805160601c61059c6100b26000396000818160e10152818161012b015281816101e4015281816102310152818161025a0152610289015261059c6000f3fe60806040526004361061003f5760003560e01c80633659cfe6146100495780634f1ef286146100695780635c60da1b1461007c578063f851a440146100a7575b6100476100bc565b005b34801561005557600080fd5b506100476100643660046103f4565b6100d6565b610047610077366004610415565b610120565b34801561008857600080fd5b506100916101d7565b60405161009e91906104a3565b60405180910390f35b3480156100b357600080fd5b50610091610224565b6100c461027e565b6100d46100cf6102d8565b6102fd565b565b336001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614156101155761011081610321565b61011d565b61011d6100bc565b50565b336001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614156101ca5761015a83610321565b6000836001600160a01b03168383604051610176929190610493565b600060405180830381855af49150503d80600081146101b1576040519150601f19603f3d011682016040523d82523d6000602084013e6101b6565b606091505b50509050806101c457600080fd5b506101d2565b6101d26100bc565b505050565b6000336001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161415610219576102126102d8565b9050610221565b6102216100bc565b90565b6000336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016141561021957507f0000000000000000000000000000000000000000000000000000000000000000610221565b336001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614156102d05760405162461bcd60e51b81526004016102c7906104b7565b60405180910390fd5b6100d46100d4565b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc5490565b3660008037600080366000845af43d6000803e80801561031c573d6000f35b3d6000fd5b61032a81610361565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b61036a816103aa565b6103865760405162461bcd60e51b81526004016102c790610509565b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc55565b600080826001600160a01b0316803b806020016040519081016040528181526000908060200190933c511190505b919050565b80356001600160a01b03811681146103d857600080fd5b600060208284031215610405578081fd5b61040e826103dd565b9392505050565b600080600060408486031215610429578182fd5b610432846103dd565b9250602084013567ffffffffffffffff8082111561044e578384fd5b818601915086601f830112610461578384fd5b81358181111561046f578485fd5b876020828501011115610480578485fd5b6020830194508093505050509250925092565b6000828483379101908152919050565b6001600160a01b0391909116815260200190565b60208082526032908201527f43616e6e6f742063616c6c2066616c6c6261636b2066756e6374696f6e20667260408201527137b6903a343290383937bc3c9030b236b4b760711b606082015260800190565b6020808252603b908201527f43616e6e6f742073657420612070726f787920696d706c656d656e746174696f60408201527f6e20746f2061206e6f6e2d636f6e74726163742061646472657373000000000060608201526080019056fea26469706673582212209776475c163196e575766e451feffa10841fc18df80bcb3b0277f7b21faacf0164736f6c63430008000033";
