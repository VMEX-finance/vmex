/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { MockAToken } from "./MockAToken";

export class MockATokenFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<MockAToken> {
    return super.deploy(overrides || {}) as Promise<MockAToken>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): MockAToken {
    return super.attach(address) as MockAToken;
  }
  connect(signer: Signer): MockATokenFactory {
    return super.connect(signer) as MockATokenFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockAToken {
    return new Contract(address, _abi, signerOrProvider) as MockAToken;
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "BalanceTransfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "Burn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "underlyingAsset",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "pool",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "treasury",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "incentivesController",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "aTokenDecimals",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "string",
        name: "aTokenName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "aTokenSymbol",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "params",
        type: "bytes",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "Mint",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "ATOKEN_REVISION",
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
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "EIP712_REVISION",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PERMIT_TYPEHASH",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "POOL",
    outputs: [
      {
        internalType: "contract ILendingPool",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "RESERVE_TREASURY_ADDRESS",
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
    name: "UNDERLYING_ASSET_ADDRESS",
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
        name: "",
        type: "address",
      },
    ],
    name: "_nonces",
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
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
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
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "balanceOf",
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
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "address",
        name: "receiverOfUnderlying",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getIncentivesController",
    outputs: [
      {
        internalType: "contract IAaveIncentivesController",
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
        name: "user",
        type: "address",
      },
    ],
    name: "getScaledUserBalanceAndSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "handleRepayment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ILendingPool",
        name: "pool",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "treasury",
            type: "address",
          },
          {
            internalType: "address",
            name: "underlyingAsset",
            type: "address",
          },
          {
            internalType: "uint8",
            name: "tranche",
            type: "uint8",
          },
        ],
        internalType: "struct IInitializableAToken.InitializeTreasuryVars",
        name: "vars",
        type: "tuple",
      },
      {
        internalType: "contract IAaveIncentivesController",
        name: "incentivesController",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "aTokenDecimals",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "aTokenName",
        type: "string",
      },
      {
        internalType: "string",
        name: "aTokenSymbol",
        type: "string",
      },
      {
        internalType: "bytes",
        name: "params",
        type: "bytes",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "mintToTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
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
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "scaledBalanceOf",
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
  {
    inputs: [],
    name: "scaledTotalSupply",
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
  {
    inputs: [],
    name: "symbol",
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
    name: "totalSupply",
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
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transferOnLiquidation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferUnderlyingTo",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x6080604052600080553480156200001557600080fd5b50604080518082018252600b8082526a105513d2d15397d253541360aa1b60208084018281528551808701909652928552840152815191929160009162000060916037919062000094565b5081516200007690603890602085019062000094565b506039805460ff191660ff9290921691909117905550620001779050565b828054620000a2906200013a565b90600052602060002090601f016020900481019282620000c6576000855562000111565b82601f10620000e157805160ff191683800117855562000111565b8280016001018555821562000111579182015b8281111562000111578251825591602001919060010190620000f4565b506200011f92915062000123565b5090565b5b808211156200011f576000815560010162000124565b6002810460018216806200014f57607f821691505b602082108114156200017157634e487b7160e01b600052602260045260246000fd5b50919050565b6127e980620001876000396000f3fe608060405234801561001057600080fd5b50600436106101e55760003560e01c80637535d2461161010f578063ae167335116100a2578063d505accf11610071578063d505accf146103b6578063d7020d0a146103c9578063dd62ed3e146103dc578063f866c319146103ef576101e5565b8063ae1673351461038b578063b16a19de14610393578063b1bf962d1461039b578063b9844d8d146103a3576101e5565b806388dd91a1116100de57806388dd91a11461034a57806395d89b411461035d578063a457c2d714610365578063a9059cbb14610378576101e5565b80637535d2461461031257806375d2641314610327578063781603761461032f5780637df5bd3b14610337576101e5565b80631da24f3e116101875780633644e515116101565780633644e515146102d157806339509351146102d95780634efecaa5146102ec57806370a08231146102ff576101e5565b80631da24f3e1461028e57806323b872dd146102a157806330adf81f146102b4578063313ce567146102bc576101e5565b80630bd7ad3b116101c35780630bd7ad3b146102495780630df4f8811461025e578063156e29f61461027357806318160ddd14610286576101e5565b806306fdde03146101ea578063095ea7b3146102085780630afbcdc914610228575b600080fd5b6101f2610402565b6040516101ff91906122ca565b60405180910390f35b61021b610216366004611e68565b610495565b6040516101ff9190612238565b61023b610236366004611d22565b6104b3565b6040516101ff9291906125e5565b6102516104d0565b6040516101ff9190612243565b61027161026c366004611ee7565b6104d5565b005b61021b610281366004611e93565b6107ac565b6102516108ec565b61025161029c366004611d22565b6109a8565b61021b6102af366004611d76565b6109bb565b610251610a7b565b6102c4610a9f565b6040516101ff91906125f3565b610251610aa8565b61021b6102e7366004611e68565b610aae565b6102516102fa366004611e68565b610afc565b61025161030d366004611d22565b610b74565b61031a610c1b565b6040516101ff9190612119565b61031a610c2a565b6101f2610c39565b61027161034536600461205b565b610c56565b610271610358366004611e68565b610d5a565b6101f2610db6565b61021b610373366004611e68565b610dc5565b61021b610386366004611e68565b610e2d565b61031a610e8a565b61031a610e99565b610251610ea8565b6102516103b1366004611d22565b610eb2565b6102716103c4366004611dfb565b610ec4565b6102716103d7366004611db6565b61105c565b6102516103ea366004611d3e565b6111aa565b6102716103fd366004611d76565b6111d5565b6060603780546104119061269b565b80601f016020809104026020016040519081016040528092919081815260200182805461043d9061269b565b801561048a5780601f1061045f5761010080835404028352916020019161048a565b820191906000526020600020905b81548152906001019060200180831161046d57829003601f168201915b505050505090505b90565b60006104a96104a2611278565b848461127c565b5060015b92915050565b6000806104bf83611323565b6104c761133e565b91509150915091565b600181565b60006104df611344565b60015490915060ff16806104f657506104f6611349565b80610502575060005481115b6105275760405162461bcd60e51b815260040161051e906123c2565b60405180910390fd5b60015460ff16158015610546576001805460ff19168117905560008290555b60405146907f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f9061057a908b908b906120d2565b60408051918290038220828201825260018352603160f81b60209384015290516105cb93927fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6918691309101612280565b60408051601f198184030181528282528051602091820120603b55601f8b0181900481028301810190915289825261061e91908b908b908190840183828082843760009201919091525061134f92505050565b61065d87878080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525061136292505050565b6106668a611375565b8c603c60006101000a8154816001600160a01b0302191690836001600160a01b031602179055508b60000151603d60006101000a8154816001600160a01b0302191690836001600160a01b031602179055508b60200151603e60006101000a8154816001600160a01b0302191690836001600160a01b031602179055508a603f60006101000a8154816001600160a01b0302191690836001600160a01b031602179055508b60400151603e60146101000a81548160ff021916908360ff1602179055508c6001600160a01b03168c602001516001600160a01b03167fb19e051f8af41150ccccb3fc2c2d8d15f4a4cf434f32a559ba75fe73d6eea20b8e600001518e8e8e8e8e8e8e8e6040516107849998979695949392919061212d565b60405180910390a350801561079e576001805460ff191690555b505050505050505050505050565b603c546000906001600160a01b03166107c3611278565b6001600160a01b03161460405180604001604052806002815260200161323960f01b815250906108065760405162461bcd60e51b815260040161051e91906122ca565b50600061081285611323565b90506000610820858561138b565b6040805180820190915260028152611a9b60f11b60208201529091508161085a5760405162461bcd60e51b815260040161051e91906122ca565b506108658682611469565b856001600160a01b031660006001600160a01b031660008051602061276f833981519152876040516108979190612243565b60405180910390a3856001600160a01b03167f4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f86866040516108da9291906125e5565b60405180910390a25015949350505050565b6000806108f761133e565b905080610908576000915050610492565b603c54603e5460405163776f689160e01b81526109a2926001600160a01b039081169263776f68919261094b92821691600160a01b900460ff16906004016121d5565b60206040518083038186803b15801561096357600080fd5b505afa158015610977573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061099b9190612043565b8290611570565b91505090565b60006109b382611323565b90505b919050565b60006109c8848484611632565b610a38846109d4611278565b610a3385604051806060016040528060288152602001612747602891396001600160a01b038a16600090815260356020526040812090610a12611278565b6001600160a01b03168152602081019190915260400160002054919061163f565b61127c565b826001600160a01b0316846001600160a01b031660008051602061276f83398151915284604051610a699190612243565b60405180910390a35060019392505050565b7f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c981565b60395460ff1690565b603b5481565b60006104a9610abb611278565b84610a338560356000610acc611278565b6001600160a01b03908116825260208083019390935260409182016000908120918c16815292529020549061166b565b603c546000906001600160a01b0316610b13611278565b6001600160a01b03161460405180604001604052806002815260200161323960f01b81525090610b565760405162461bcd60e51b815260040161051e91906122ca565b50603e54610b6e906001600160a01b03168484611677565b50919050565b603c54603e5460405163776f689160e01b81526000926109b3926001600160a01b039182169263776f689192610bbc9290811691600160a01b90910460ff16906004016121d5565b60206040518083038186803b158015610bd457600080fd5b505afa158015610be8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c0c9190612043565b610c1584611323565b90611570565b603c546001600160a01b031690565b6000610c346116cd565b905090565b604051806040016040528060018152602001603160f81b81525081565b603c546001600160a01b0316610c6a611278565b6001600160a01b03161460405180604001604052806002815260200161323960f01b81525090610cad5760405162461bcd60e51b815260040161051e91906122ca565b5081610cb857610d56565b603d546001600160a01b0316610cd781610cd2858561138b565b611469565b806001600160a01b031660006001600160a01b031660008051602061276f83398151915285604051610d099190612243565b60405180910390a3806001600160a01b03167f4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f8484604051610d4c9291906125e5565b60405180910390a2505b5050565b603c546001600160a01b0316610d6e611278565b6001600160a01b03161460405180604001604052806002815260200161323960f01b81525090610db15760405162461bcd60e51b815260040161051e91906122ca565b505050565b6060603880546104119061269b565b60006104a9610dd2611278565b84610a338560405180606001604052806025815260200161278f6025913960356000610dfc611278565b6001600160a01b03908116825260208083019390935260409182016000908120918d1681529252902054919061163f565b6000610e41610e3a611278565b8484611632565b826001600160a01b0316610e53611278565b6001600160a01b031660008051602061276f83398151915284604051610e799190612243565b60405180910390a350600192915050565b603d546001600160a01b031690565b603e546001600160a01b031690565b6000610c3461133e565b603a6020526000908152604090205481565b6001600160a01b038716610eea5760405162461bcd60e51b815260040161051e9061243c565b83421115610f0a5760405162461bcd60e51b815260040161051e90612410565b6001600160a01b0387166000908152603a6020908152604080832054603b549151909392610f64917f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9918d918d918d9189918e910161224c565b60405160208183030381529060405280519060200120604051602001610f8b9291906120fe565b60405160208183030381529060405280519060200120905060018186868660405160008152602001604052604051610fc694939291906122ac565b6020604051602081039080840390855afa158015610fe8573d6000803e3d6000fd5b505050602060405103516001600160a01b0316896001600160a01b0316146110225760405162461bcd60e51b815260040161051e90612397565b61102d82600161166b565b6001600160a01b038a166000908152603a602052604090205561105189898961127c565b505050505050505050565b603c546001600160a01b0316611070611278565b6001600160a01b03161460405180604001604052806002815260200161323960f01b815250906110b35760405162461bcd60e51b815260040161051e91906122ca565b5060006110c0838361138b565b60408051808201909152600281526106a760f31b6020820152909150816110fa5760405162461bcd60e51b815260040161051e91906122ca565b5061110585826116dc565b603e5461111c906001600160a01b03168585611677565b60006001600160a01b0316856001600160a01b031660008051602061276f8339815191528560405161114e9190612243565b60405180910390a3836001600160a01b0316856001600160a01b03167f5d624aa9c148153ab3446c1b154f660ee7701e549fe9b62dab7171b1c80e6fa2858560405161119b9291906125e5565b60405180910390a35050505050565b6001600160a01b03918216600090815260356020908152604080832093909416825291909152205490565b603c546001600160a01b03166111e9611278565b6001600160a01b03161460405180604001604052806002815260200161323960f01b8152509061122c5760405162461bcd60e51b815260040161051e91906122ca565b5061123a8383836000611761565b816001600160a01b0316836001600160a01b031660008051602061276f8339815191528360405161126b9190612243565b60405180910390a3505050565b3390565b6001600160a01b0383166112a25760405162461bcd60e51b815260040161051e906124e9565b6001600160a01b0382166112c85760405162461bcd60e51b815260040161051e90612320565b6001600160a01b0380841660008181526035602090815260408083209487168084529490915290819020849055517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259061126b908590612243565b6001600160a01b031660009081526034602052604090205490565b60365490565b600290565b303b1590565b8051610d56906037906020840190611c26565b8051610d56906038906020840190611c26565b6039805460ff191660ff92909216919091179055565b604080518082019091526002815261035360f41b6020820152600090826113c55760405162461bcd60e51b815260040161051e91906122ca565b5060006113d3600284612619565b90506b033b2e3c9fd0803ce80000006113ee82600019612658565b6113f89190612619565b84111560405180604001604052806002815260200161068760f31b815250906114345760405162461bcd60e51b815260040161051e91906122ca565b50828161144d6b033b2e3c9fd0803ce800000087612639565b6114579190612601565b6114619190612619565b949350505050565b6001600160a01b03821661148f5760405162461bcd60e51b815260040161051e906125ae565b61149b60008383610db1565b6036546114a8818361166b565b6036556001600160a01b0383166000908152603460205260409020546114ce818461166b565b6001600160a01b0385166000908152603460205260408120919091556114f26116cd565b6001600160a01b03161461156a576115086116cd565b6001600160a01b03166331873e2e8584846040518463ffffffff1660e01b8152600401611537939291906121b4565b600060405180830381600087803b15801561155157600080fd5b505af1158015611565573d6000803e3d6000fd5b505050505b50505050565b600082158061157d575081155b1561158a575060006104ad565b816115a260026b033b2e3c9fd0803ce8000000612619565b6115ae90600019612658565b6115b89190612619565b83111560405180604001604052806002815260200161068760f31b815250906115f45760405162461bcd60e51b815260040161051e91906122ca565b506b033b2e3c9fd0803ce800000061160d600282612619565b6116178486612639565b6116219190612601565b61162b9190612619565b9392505050565b610db18383836001611761565b600081848411156116635760405162461bcd60e51b815260040161051e91906122ca565b505050900390565b600061162b8284612601565b610db18363a9059cbb60e01b848460405160240161169692919061219b565b60408051601f198184030181529190526020810180516001600160e01b03166001600160e01b031990931692909217909152611906565b603f546001600160a01b031690565b6001600160a01b0382166117025760405162461bcd60e51b815260040161051e90612463565b61170e82600083610db1565b60365461171b81836119ea565b6036556001600160a01b03831660009081526034602090815260409182902054825160608101909352602280845290926114ce928692906126ff9083013983919061163f565b603e54603c5460405163776f689160e01b81526001600160a01b0380841693921691600091839163776f6891916117a8918791600160a01b90910460ff16906004016121d5565b60206040518083038186803b1580156117c057600080fd5b505afa1580156117d4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117f89190612043565b9050600061180982610c158a611323565b9050600061181a83610c158a611323565b9050611830898961182b8a8761138b565b6119f6565b85156118ae57603e54604051630c1fc1e960e41b81526001600160a01b0386169163c1fc1e909161187b918991600160a01b90910460ff16908e908e908e908a908a906004016121f1565b600060405180830381600087803b15801561189557600080fd5b505af11580156118a9573d6000803e3d6000fd5b505050505b876001600160a01b0316896001600160a01b03167f4beccb90f994c31aced7a23b5611020728a23d8ec5cddd1a3e9d97b96fda866689866040516118f39291906125e5565b60405180910390a3505050505050505050565b611918826001600160a01b0316611bf5565b6119345760405162461bcd60e51b815260040161051e90612577565b600080836001600160a01b03168360405161194f91906120e2565b6000604051808303816000865af19150503d806000811461198c576040519150601f19603f3d011682016040523d82523d6000602084013e611991565b606091505b5091509150816119b35760405162461bcd60e51b815260040161051e90612362565b80511561156a57808060200190518101906119ce9190611ec7565b61156a5760405162461bcd60e51b815260040161051e9061252d565b600061162b8284612658565b6001600160a01b038316611a1c5760405162461bcd60e51b815260040161051e906124a4565b6001600160a01b038216611a425760405162461bcd60e51b815260040161051e906122dd565b611a4d838383610db1565b600060346000856001600160a01b03166001600160a01b03168152602001908152602001600020549050611a9c826040518060600160405280602681526020016127216026913983919061163f565b6001600160a01b038086166000908152603460205260408082209390935590851681522054611acb818461166b565b6001600160a01b038516600090815260346020526040812091909155611aef6116cd565b6001600160a01b031614611bee57603654611b086116cd565b6001600160a01b03166331873e2e8783866040518463ffffffff1660e01b8152600401611b37939291906121b4565b600060405180830381600087803b158015611b5157600080fd5b505af1158015611b65573d6000803e3d6000fd5b50505050846001600160a01b0316866001600160a01b031614611bec57611b8a6116cd565b6001600160a01b03166331873e2e8683856040518463ffffffff1660e01b8152600401611bb9939291906121b4565b600060405180830381600087803b158015611bd357600080fd5b505af1158015611be7573d6000803e3d6000fd5b505050505b505b5050505050565b600080826001600160a01b0316803b806020016040519081016040528181526000908060200190933c511192915050565b828054611c329061269b565b90600052602060002090601f016020900481019282611c545760008555611c9a565b82601f10611c6d57805160ff1916838001178555611c9a565b82800160010185558215611c9a579182015b82811115611c9a578251825591602001919060010190611c7f565b50611ca6929150611caa565b5090565b5b80821115611ca65760008155600101611cab565b60008083601f840112611cd0578182fd5b50813567ffffffffffffffff811115611ce7578182fd5b602083019150836020828501011115611cff57600080fd5b9250929050565b80356109b6816126e6565b803560ff811681146109b657600080fd5b600060208284031215611d33578081fd5b813561162b816126e6565b60008060408385031215611d50578081fd5b8235611d5b816126e6565b91506020830135611d6b816126e6565b809150509250929050565b600080600060608486031215611d8a578081fd5b8335611d95816126e6565b92506020840135611da5816126e6565b929592945050506040919091013590565b60008060008060808587031215611dcb578081fd5b8435611dd6816126e6565b93506020850135611de6816126e6565b93969395505050506040820135916060013590565b600080600080600080600060e0888a031215611e15578283fd5b8735611e20816126e6565b96506020880135611e30816126e6565b95506040880135945060608801359350611e4c60808901611d11565b925060a0880135915060c0880135905092959891949750929550565b60008060408385031215611e7a578182fd5b8235611e85816126e6565b946020939093013593505050565b600080600060608486031215611ea7578283fd5b8335611eb2816126e6565b95602085013595506040909401359392505050565b600060208284031215611ed8578081fd5b8151801515811461162b578182fd5b6000806000806000806000806000806101208b8d031215611f06578283fd5b611f108b356126e6565b8a35995060608b8d03601f19011215611f27578283fd5b60405167ffffffffffffffff8160608301108160608401111715611f5957634e487b7160e01b85526041600452602485fd5b60608201604052611f6d60208e01356126e6565b60208d01358252611f8160408e01356126e6565b60408d01356020830152611f9760608e01611d11565b6040830152819a50611fab60808e01611d06565b9950611fb960a08e01611d11565b98508060c08e01351115611fcb578485fd5b611fdb8e60c08f01358f01611cbf565b9250809850508196508060e08e01351115611ff4578485fd5b6120048e60e08f01358f01611cbf565b90965094506101008d013591508082111561201d578384fd5b5061202a8d828e01611cbf565b915080935050809150509295989b9194979a5092959850565b600060208284031215612054578081fd5b5051919050565b6000806040838503121561206d578182fd5b50508035926020909101359150565b60008284528282602086013780602084860101526020601f19601f85011685010190509392505050565b600081518084526120be81602086016020860161266f565b601f01601f19169290920160200192915050565b6000828483379101908152919050565b600082516120f481846020870161266f565b9190910192915050565b61190160f01b81526002810192909252602282015260420190565b6001600160a01b0391909116815260200190565b6001600160a01b038a811682528916602082015260ff8816604082015260c060608201819052600090612163908301888a61207c565b828103608084015261217681878961207c565b905082810360a084015261218b81858761207c565b9c9b505050505050505050505050565b6001600160a01b03929092168252602082015260400190565b6001600160a01b039390931683526020830191909152604082015260600190565b6001600160a01b0392909216825260ff16602082015260400190565b6001600160a01b03978816815260ff9690961660208701529386166040860152919094166060840152608083019390935260a082019290925260c081019190915260e00190565b901515815260200190565b90815260200190565b9586526001600160a01b0394851660208701529290931660408501526060840152608083019190915260a082015260c00190565b9485526020850193909352604084019190915260608301526001600160a01b0316608082015260a00190565b93845260ff9290921660208401526040830152606082015260800190565b60006020825261162b60208301846120a6565b60208082526023908201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260408201526265737360e81b606082015260800190565b60208082526022908201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604082015261737360f01b606082015260800190565b6020808252818101527f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564604082015260600190565b602080825260119082015270494e56414c49445f5349474e415455524560781b604082015260600190565b6020808252602e908201527f436f6e747261637420696e7374616e63652068617320616c726561647920626560408201526d195b881a5b9a5d1a585b1a5e995960921b606082015260800190565b60208082526012908201527124a72b20a624a22fa2ac2824a920aa24a7a760711b604082015260600190565b6020808252600d908201526c24a72b20a624a22fa7aba722a960991b604082015260600190565b60208082526021908201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736040820152607360f81b606082015260800190565b60208082526025908201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604082015264647265737360d81b606082015260800190565b60208082526024908201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646040820152637265737360e01b606082015260800190565b6020808252602a908201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6040820152691bdd081cdd58d8d9595960b21b606082015260800190565b6020808252601f908201527f5361666545524332303a2063616c6c20746f206e6f6e2d636f6e747261637400604082015260600190565b6020808252601f908201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604082015260600190565b918252602082015260400190565b60ff91909116815260200190565b60008219821115612614576126146126d0565b500190565b60008261263457634e487b7160e01b81526012600452602481fd5b500490565b6000816000190483118215151615612653576126536126d0565b500290565b60008282101561266a5761266a6126d0565b500390565b60005b8381101561268a578181015183820152602001612672565b8381111561156a5750506000910152565b6002810460018216806126af57607f821691505b60208210811415610b6e57634e487b7160e01b600052602260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b6001600160a01b03811681146126fb57600080fd5b5056fe45524332303a206275726e20616d6f756e7420657863656564732062616c616e636545524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e636545524332303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e6365ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77207a65726fa2646970667358221220d998a8df5a10946f5d301d99a712688a9aae291354a8b1dfdd6bd2e9c1d678bc64736f6c63430008000033";
