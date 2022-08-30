/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { LendingPoolAddressesProvider } from "./LendingPoolAddressesProvider";

export class LendingPoolAddressesProviderFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    marketId: string,
    overrides?: Overrides
  ): Promise<LendingPoolAddressesProvider> {
    return super.deploy(
      marketId,
      overrides || {}
    ) as Promise<LendingPoolAddressesProvider>;
  }
  getDeployTransaction(
    marketId: string,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(marketId, overrides || {});
  }
  attach(address: string): LendingPoolAddressesProvider {
    return super.attach(address) as LendingPoolAddressesProvider;
  }
  connect(signer: Signer): LendingPoolAddressesProviderFactory {
    return super.connect(signer) as LendingPoolAddressesProviderFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): LendingPoolAddressesProvider {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as LendingPoolAddressesProvider;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "marketId",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "hasProxy",
        type: "bool",
      },
    ],
    name: "AddressSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "ConfigurationAdminUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "CurveAddressProviderUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "CurvePriceOracleUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "CurvePriceOracleWrapperUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "EmergencyAdminUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "LendingPoolCollateralManagerUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "LendingPoolConfiguratorUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "LendingPoolUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "LendingRateOracleUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "newMarketId",
        type: "string",
      },
    ],
    name: "MarketIdSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "PriceOracleUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "ProxyCreated",
    type: "event",
  },
  {
    inputs: [],
    name: "getAavePriceOracle",
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
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "getAddress",
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
    inputs: [],
    name: "getCurveAddressProvider",
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
    inputs: [],
    name: "getCurvePriceOracle",
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
    inputs: [],
    name: "getCurvePriceOracleWrapper",
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
    inputs: [],
    name: "getEmergencyAdmin",
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
    inputs: [],
    name: "getLendingPool",
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
    inputs: [],
    name: "getLendingPoolCollateralManager",
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
    inputs: [],
    name: "getLendingPoolConfigurator",
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
    inputs: [],
    name: "getLendingRateOracle",
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
    inputs: [],
    name: "getMarketId",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPoolAdmin",
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
        internalType: "enum DataTypes.ReserveAssetType",
        name: "assetType",
        type: "uint8",
      },
    ],
    name: "getPriceOracle",
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
    inputs: [],
    name: "owner",
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
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "priceOracle",
        type: "address",
      },
    ],
    name: "setAavePriceOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "setAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "implementationAddress",
        type: "address",
      },
    ],
    name: "setAddressAsProxy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addressProvider",
        type: "address",
      },
    ],
    name: "setCurveAddressProvider",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "priceOracle",
        type: "address",
      },
    ],
    name: "setCurvePriceOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "priceOracle",
        type: "address",
      },
    ],
    name: "setCurvePriceOracleWrapper",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "emergencyAdmin",
        type: "address",
      },
    ],
    name: "setEmergencyAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "manager",
        type: "address",
      },
    ],
    name: "setLendingPoolCollateralManager",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "configurator",
        type: "address",
      },
    ],
    name: "setLendingPoolConfiguratorImpl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    name: "setLendingPoolImpl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "lendingRateOracle",
        type: "address",
      },
    ],
    name: "setLendingRateOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "marketId",
        type: "string",
      },
    ],
    name: "setMarketId",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "setPoolAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b506040516200215338038062002153833981016040819052620000349162000198565b6000620000406200009c565b600080546001600160a01b0319166001600160a01b0383169081178255604051929350917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a3506200009581620000a0565b5062000301565b3390565b8051620000b5906001906020840190620000f2565b507f5e667c32fd847cf8bce48ab3400175cbf107bdc82b2dea62e3364909dfaee79981604051620000e7919062000246565b60405180910390a150565b8280546200010090620002ae565b90600052602060002090601f0160209004810192826200012457600085556200016f565b82601f106200013f57805160ff19168380011785556200016f565b828001600101855582156200016f579182015b828111156200016f57825182559160200191906001019062000152565b506200017d92915062000181565b5090565b5b808211156200017d576000815560010162000182565b600060208284031215620001aa578081fd5b81516001600160401b0380821115620001c1578283fd5b818401915084601f830112620001d5578283fd5b815181811115620001ea57620001ea620002eb565b604051601f8201601f191681016020018381118282101715620002115762000211620002eb565b60405281815283820160200187101562000229578485fd5b6200023c8260208301602087016200027b565b9695505050505050565b6000602082528251806020840152620002678160408501602087016200027b565b601f01601f19169190910160400192915050565b60005b83811015620002985781810151838201526020016200027e565b83811115620002a8576000848401525b50505050565b600281046001821680620002c357607f821691505b60208210811415620002e557634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052604160045260246000fd5b611e4280620003116000396000f3fe608060405234801561001057600080fd5b50600436106101cf5760003560e01c8063820d127411610104578063ba61fe31116100a2578063e4bc9d6411610071578063e4bc9d6414610350578063f139dc8114610363578063f2fde38b1461036b578063f67b18471461037e576101cf565b8063ba61fe311461031a578063c12542df14610322578063ca446dd914610335578063ddcaa9ea14610348576101cf565b8063985420f4116100de578063985420f4146102e4578063992ecae7146102f75780639bc3d098146102ff578063aecda37814610312576101cf565b8063820d1274146102c157806385c858b1146102d45780638da5cb5b146102dc576101cf565b8063398e5553116101715780635aef021f1161014b5780635aef021f1461028b5780635dcc528c1461029e578063712d9171146102b1578063715018a6146102b9576101cf565b8063398e55531461025b578063568ef4701461026e57806359696e1614610283576101cf565b806321f8a721116101ad57806321f8a7211461021a578063283d62ad1461022d57806335da3394146102405780633618abba14610253576101cf565b80630261bf8b146101d45780630aafb34e146101f25780631a9dffb314610207575b600080fd5b6101dc610391565b6040516101e99190611405565b60405180910390f35b610205610200366004611296565b6103b0565b005b6101dc6102153660046112fa565b610476565b6101dc6102283660046112b7565b6104fb565b61020561023b366004611296565b610516565b61020561024e366004611296565b6105cb565b6101dc610685565b610205610269366004611296565b6106a6565b610276610763565b6040516101e9919061145e565b6101dc6107f5565b610205610299366004611296565b610819565b6102056102ac3660046112cf565b61089e565b6101dc610925565b610205610945565b6102056102cf366004611296565b6109c4565b6101dc610a82565b6101dc610aa9565b6102056102f2366004611296565b610ab8565b6101dc610b74565b61020561030d366004611296565b610b9f565b6101dc610c60565b6101dc610c78565b610205610330366004611296565b610c98565b6102056103433660046112cf565b610d2a565b6101dc610dbb565b61020561035e366004611296565b610dd8565b6101dc610ea0565b610205610379366004611296565b610ebf565b61020561038c366004611319565b610f75565b60006103ab6b13115391125391d7d413d3d360a21b6104fb565b905090565b6103b8610fb6565b6000546001600160a01b039081169116146103ee5760405162461bcd60e51b81526004016103e5906114ec565b60405180910390fd5b7143555256455f50524943455f4f5241434c4560701b600090815260026020527f3fe8fa200186c06bf51ac9abb48147cc71c50f607ea29e3c5f76b5ca94da976180546001600160a01b0319166001600160a01b03841690811790915560405190917f8c33dfc72b6bb4000c8d46a05672981deed3f1f7df3532ca2811f6e5e2eba43491a250565b60008082600181111561049957634e487b7160e01b600052602160045260246000fd5b14156104ae576104a7610ea0565b90506104f6565b60018260018111156104d057634e487b7160e01b600052602160045260246000fd5b14156104de576104a7610b74565b60405162461bcd60e51b81526004016103e5906114b7565b919050565b6000908152600260205260409020546001600160a01b031690565b61051e610fb6565b6000546001600160a01b0390811691161461054b5760405162461bcd60e51b81526004016103e5906114ec565b692827a7a62fa0a226a4a760b11b600090815260026020527f8625fbc469bac10fd11de1d783dcd446542784dbcc535ef64a1da61860fda74c80546001600160a01b0319166001600160a01b03841690811790915560405190917fc20a317155a9e7d84e06b716b4b355d47742ab9f8c5d630e7f556553f582430d91a250565b6105d3610fb6565b6000546001600160a01b039081169116146106005760405162461bcd60e51b81526004016103e5906114ec565b6e22a6a2a923a2a721acafa0a226a4a760891b600090815260026020527f767aa9c986e1d88108b2558f00fbd21b689a0397581446e2e868cd70421026cc80546001600160a01b0319166001600160a01b03841690811790915560405190917fe19673fc861bfeb894cf2d6b7662505497ef31c0f489b742db24ee331082691691a250565b60006103ab724c454e44494e475f524154455f4f5241434c4560681b6104fb565b6106ae610fb6565b6000546001600160a01b039081169116146106db5760405162461bcd60e51b81526004016103e5906114ec565b7121a7a62620aa22a920a62fa6a0a720a3a2a960711b600090815260026020527f65e3f3080e9127c1765503a54b8dbb495249e66169f096dfc87ee63bed17e22c80546001600160a01b0319166001600160a01b03841690811790915560405190917f991888326f0eab3df6084aadb82bee6781b5c9aa75379e8bc50ae8693454163891a250565b60606001805461077290611521565b80601f016020809104026020016040519081016040528092919081815260200182805461079e90611521565b80156107eb5780601f106107c0576101008083540402835291602001916107eb565b820191906000526020600020905b8154815290600101906020018083116107ce57829003601f168201915b5050505050905090565b60006103ab7521aaa92b22afa0a2222922a9a9afa82927ab24a222a960511b6104fb565b610821610fb6565b6000546001600160a01b0390811691161461084e5760405162461bcd60e51b81526004016103e5906114ec565b6108676b13115391125391d7d413d3d360a21b82610fba565b6040516001600160a01b038216907fc4e6c6cdf28d0edbd8bcf071d724d33cc2e7a30be7d06443925656e9cb492aa490600090a250565b6108a6610fb6565b6000546001600160a01b039081169116146108d35760405162461bcd60e51b81526004016103e5906114ec565b6108dd8282610fba565b806001600160a01b03167ff2689d5d5cd0c639e137642cae5d40afced201a1a0327e7ac9358461dc9fff3183600160405161091992919061144e565b60405180910390a25050565b60006103ab7121a7a62620aa22a920a62fa6a0a720a3a2a960711b6104fb565b61094d610fb6565b6000546001600160a01b0390811691161461097a5760405162461bcd60e51b81526004016103e5906114ec565b600080546040516001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908390a3600080546001600160a01b0319169055565b6109cc610fb6565b6000546001600160a01b039081169116146109f95760405162461bcd60e51b81526004016103e5906114ec565b724c454e44494e475f524154455f4f5241434c4560681b600090815260026020527f10f0e20294ece4bd93e7a467dbf22ab9ab1740ebd0a532cc53066601e880c0cf80546001600160a01b0319166001600160a01b03841690811790915560405190917f5c29179aba6942020a8a2d38f65de02fb6b7f784e7f049ed3a3cab97621859b591a250565b60006103ab782622a72224a723afa827a7a62fa1a7a72324a3aaa920aa27a960391b6104fb565b6000546001600160a01b031690565b610ac0610fb6565b6000546001600160a01b03908116911614610aed5760405162461bcd60e51b81526004016103e5906114ec565b70414156455f50524943455f4f5241434c4560781b600090815260026020527f815929b2da778f5b1a996f183c1990b1d30082a644534882dc5413b0304babb480546001600160a01b0319166001600160a01b03841690811790915560405190917fefe8ab924ca486283a79dc604baa67add51afb82af1db8ac386ebbba643cdffd91a250565b60006103ab7f43555256455f50524943455f4f5241434c455f575241505045520000000000006104fb565b610ba7610fb6565b6000546001600160a01b03908116911614610bd45760405162461bcd60e51b81526004016103e5906114ec565b7521aaa92b22afa0a2222922a9a9afa82927ab24a222a960511b600090815260026020527fce5354b4da2d1f06de4a9f7b2deeef43cba51d4dff6634d5264618ae4bb4c04980546001600160a01b0319166001600160a01b03841690811790915560405190917f7166d082414cade059fb4745f4c1dfc868d0fc5746f42bef9155894ae89d5a5091a250565b60006103ab692827a7a62fa0a226a4a760b11b6104fb565b60006103ab7143555256455f50524943455f4f5241434c4560701b6104fb565b610ca0610fb6565b6000546001600160a01b03908116911614610ccd5760405162461bcd60e51b81526004016103e5906114ec565b610cf3782622a72224a723afa827a7a62fa1a7a72324a3aaa920aa27a960391b82610fba565b6040516001600160a01b038216907fdfabe479bad36782fb1e77fbfddd4e382671713527e4786cfc93a022ae76372990600090a250565b610d32610fb6565b6000546001600160a01b03908116911614610d5f5760405162461bcd60e51b81526004016103e5906114ec565b60008281526002602052604080822080546001600160a01b0319166001600160a01b038516908117909155905190917ff2689d5d5cd0c639e137642cae5d40afced201a1a0327e7ac9358461dc9fff319161091991869161144e565b60006103ab6e22a6a2a923a2a721acafa0a226a4a760891b6104fb565b610de0610fb6565b6000546001600160a01b03908116911614610e0d5760405162461bcd60e51b81526004016103e5906114ec565b7f43555256455f50524943455f4f5241434c455f57524150504552000000000000600090815260026020527f22970f252131634989001ca7056a884658fd6ca7a37531f6ba43143065cb34d580546001600160a01b0319166001600160a01b03841690811790915560405190917f04ea57a8cd6dd44097a5b4fae3066e20515f5f081462af5eeeeca134b4f6730391a250565b60006103ab70414156455f50524943455f4f5241434c4560781b6104fb565b610ec7610fb6565b6000546001600160a01b03908116911614610ef45760405162461bcd60e51b81526004016103e5906114ec565b6001600160a01b038116610f1a5760405162461bcd60e51b81526004016103e590611471565b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b0319166001600160a01b0392909216919091179055565b610f7d610fb6565b6000546001600160a01b03908116911614610faa5760405162461bcd60e51b81526004016103e5906114ec565b610fb38161118b565b50565b3390565b6000828152600260205260408082205490516001600160a01b03909116918291610fe8903090602401611405565b60408051601f198184030181529190526020810180516001600160e01b031663189acdbd60e31b17905290506001600160a01b038316611123573060405161102f906111d9565b6110399190611405565b604051809103906000f080158015611055573d6000803e3d6000fd5b5060405163347d5e2560e21b81529092506001600160a01b0383169063d1f57894906110879087908590600401611419565b600060405180830381600087803b1580156110a157600080fd5b505af11580156110b5573d6000803e3d6000fd5b5050506000868152600260205260409081902080546001600160a01b0319166001600160a01b03861690811790915590519091507f1eb35cb4b5bbb23d152f3b4016a5a46c37a07ae930ed0956aba951e23114243890611116908890611445565b60405180910390a2611184565b60405163278f794360e11b81526001600160a01b03831690634f1ef286906111519087908590600401611419565b600060405180830381600087803b15801561116b57600080fd5b505af115801561117f573d6000803e3d6000fd5b505050505b5050505050565b805161119e9060019060208401906111e6565b507f5e667c32fd847cf8bce48ab3400175cbf107bdc82b2dea62e3364909dfaee799816040516111ce919061145e565b60405180910390a150565b61089a8061157383390190565b8280546111f290611521565b90600052602060002090601f016020900481019282611214576000855561125a565b82601f1061122d57805160ff191683800117855561125a565b8280016001018555821561125a579182015b8281111561125a57825182559160200191906001019061123f565b5061126692915061126a565b5090565b5b80821115611266576000815560010161126b565b80356001600160a01b03811681146104f657600080fd5b6000602082840312156112a7578081fd5b6112b08261127f565b9392505050565b6000602082840312156112c8578081fd5b5035919050565b600080604083850312156112e1578081fd5b823591506112f16020840161127f565b90509250929050565b60006020828403121561130b578081fd5b8135600281106112b0578182fd5b6000602080838503121561132b578182fd5b823567ffffffffffffffff80821115611342578384fd5b818501915085601f830112611355578384fd5b8135818111156113675761136761155c565b604051601f8201601f191681018501838111828210171561138a5761138a61155c565b60405281815283820185018810156113a0578586fd5b818585018683013790810190930193909352509392505050565b60008151808452815b818110156113df576020818501810151868301820152016113c3565b818111156113f05782602083870101525b50601f01601f19169290920160200192915050565b6001600160a01b0391909116815260200190565b6001600160a01b038316815260406020820181905260009061143d908301846113ba565b949350505050565b90815260200190565b9182521515602082015260400190565b6000602082526112b060208301846113ba565b60208082526026908201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160408201526564647265737360d01b606082015260800190565b6020808252818101527f6572726f722064657465726d696e696e67206f7261636c652061646472657373604082015260600190565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b60028104600182168061153557607f821691505b6020821081141561155657634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052604160045260246000fdfe60a060405234801561001057600080fd5b5060405161089a38038061089a83398101604081905261002f91610044565b60601b6001600160601b031916608052610072565b600060208284031215610055578081fd5b81516001600160a01b038116811461006b578182fd5b9392505050565b60805160601c6107e86100b26000396000818160ff01528181610149015281816102020152818161034f01528181610378015261048a01526107e86000f3fe60806040526004361061004a5760003560e01c80633659cfe6146100545780634f1ef286146100745780635c60da1b14610087578063d1f57894146100b2578063f851a440146100c5575b6100526100da565b005b34801561006057600080fd5b5061005261006f36600461051a565b6100f4565b61005261008236600461053b565b61013e565b34801561009357600080fd5b5061009c6101f5565b6040516100a991906106b6565b60405180910390f35b6100526100c03660046105b9565b610242565b3480156100d157600080fd5b5061009c610342565b6100e261039c565b6100f26100ed6103a4565b6103c9565b565b336001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614156101335761012e816103ed565b61013b565b61013b6100da565b50565b336001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614156101e857610178836103ed565b6000836001600160a01b0316838360405161019492919061066d565b600060405180830381855af49150503d80600081146101cf576040519150601f19603f3d011682016040523d82523d6000602084013e6101d4565b606091505b50509050806101e257600080fd5b506101f0565b6101f06100da565b505050565b6000336001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161415610237576102306103a4565b905061023f565b61023f6100da565b90565b600061024c6103a4565b6001600160a01b03161461025f57600080fd5b61028a60017f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbd610779565b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc146102c657634e487b7160e01b600052600160045260246000fd5b6102cf8261042d565b80511561033e576000826001600160a01b0316826040516102f0919061067d565b600060405180830381855af49150503d806000811461032b576040519150601f19603f3d011682016040523d82523d6000602084013e610330565b606091505b50509050806101f057600080fd5b5050565b6000336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016141561023757507f000000000000000000000000000000000000000000000000000000000000000061023f565b6100f261047f565b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc5490565b3660008037600080366000845af43d6000803e8080156103e8573d6000f35b3d6000fd5b6103f68161042d565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b610436816104d0565b61045b5760405162461bcd60e51b81526004016104529061071c565b60405180910390fd5b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc55565b336001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614156104c85760405162461bcd60e51b8152600401610452906106ca565b6100f26100f2565b600080826001600160a01b0316803b806020016040519081016040528181526000908060200190933c511190505b919050565b80356001600160a01b03811681146104fe57600080fd5b60006020828403121561052b578081fd5b61053482610503565b9392505050565b60008060006040848603121561054f578182fd5b61055884610503565b9250602084013567ffffffffffffffff80821115610574578384fd5b818601915086601f830112610587578384fd5b813581811115610595578485fd5b8760208285010111156105a6578485fd5b6020830194508093505050509250925092565b600080604083850312156105cb578182fd5b6105d483610503565b915060208084013567ffffffffffffffff808211156105f1578384fd5b818601915086601f830112610604578384fd5b8135818111156106165761061661079c565b604051601f8201601f19168101850183811182821017156106395761063961079c565b604052818152838201850189101561064f578586fd5b81858501868301378585838301015280955050505050509250929050565b6000828483379101908152919050565b60008251815b8181101561069d5760208186018101518583015201610683565b818111156106ab5782828501525b509190910192915050565b6001600160a01b0391909116815260200190565b60208082526032908201527f43616e6e6f742063616c6c2066616c6c6261636b2066756e6374696f6e20667260408201527137b6903a343290383937bc3c9030b236b4b760711b606082015260800190565b6020808252603b908201527f43616e6e6f742073657420612070726f787920696d706c656d656e746174696f60408201527f6e20746f2061206e6f6e2d636f6e747261637420616464726573730000000000606082015260800190565b60008282101561079757634e487b7160e01b81526011600452602481fd5b500390565b634e487b7160e01b600052604160045260246000fdfea2646970667358221220b6a7a859ff3946b0cc43269438fa4ca5171736127e5799775fffab8b5195306064736f6c63430008000033a2646970667358221220d6feee61e6b8fe24acc917d9328b6678d1838ab0424b5bc12e4c520f4734e13864736f6c63430008000033";
