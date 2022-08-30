/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { VariableDebtToken } from "./VariableDebtToken";

export class VariableDebtTokenFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<VariableDebtToken> {
    return super.deploy(overrides || {}) as Promise<VariableDebtToken>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): VariableDebtToken {
    return super.attach(address) as VariableDebtToken;
  }
  connect(signer: Signer): VariableDebtTokenFactory {
    return super.connect(signer) as VariableDebtTokenFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VariableDebtToken {
    return new Contract(address, _abi, signerOrProvider) as VariableDebtToken;
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
        name: "fromUser",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "toUser",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "BorrowAllowanceDelegated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
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
        name: "incentivesController",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "debtTokenDecimals",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "string",
        name: "debtTokenName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "debtTokenSymbol",
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
        indexed: true,
        internalType: "address",
        name: "onBehalfOf",
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
    name: "DEBT_TOKEN_REVISION",
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
        name: "delegatee",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approveDelegation",
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
        name: "fromUser",
        type: "address",
      },
      {
        internalType: "address",
        name: "toUser",
        type: "address",
      },
    ],
    name: "borrowAllowance",
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
        internalType: "address",
        name: "underlyingAsset",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "tranche",
        type: "uint8",
      },
      {
        internalType: "contract IAaveIncentivesController",
        name: "incentivesController",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "debtTokenDecimals",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "debtTokenName",
        type: "string",
      },
      {
        internalType: "string",
        name: "debtTokenSymbol",
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
        internalType: "address",
        name: "onBehalfOf",
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
];

const _bytecode =
  "0x608060405260006006553480156200001657600080fd5b50604080518082018252600e8082526d111150951513d2d15397d253541360921b60208084018281528551808701909652928552840152815191929160009162000064916003919062000098565b5081516200007a90600490602085019062000098565b506005805460ff191660ff92909216919091179055506200017b9050565b828054620000a6906200013e565b90600052602060002090601f016020900481019282620000ca576000855562000115565b82601f10620000e557805160ff191683800117855562000115565b8280016001018555821562000115579182015b8281111562000115578251825591602001919060010190620000f8565b506200012392915062000127565b5090565b5b8082111562000123576000815560010162000128565b6002810460018216806200015357607f821691505b602082108114156200017557634e487b7160e01b600052602260045260246000fd5b50919050565b611723806200018b6000396000f3fe608060405234801561001057600080fd5b506004361061014d5760003560e01c80637535d246116100c3578063b1bf962d1161007c578063b1bf962d1461028a578063b3f1c93d14610292578063b9a7b622146102a5578063c04a8a10146102ad578063dd62ed3e146102c0578063f5298aca146102ce5761014d565b80637535d2461461024f57806375d264131461026457806395d89b411461026c578063a457c2d714610216578063a9059cbb14610274578063b16a19de146102825761014d565b80631da24f3e116101155780631da24f3e146101db57806323b872dd146101ee578063313ce5671461020157806339509351146102165780636bd76d241461022957806370a082311461023c5761014d565b806304bf53061461015257806306fdde0314610167578063095ea7b3146101855780630afbcdc9146101a557806318160ddd146101c6575b600080fd5b61016561016036600461121a565b6102e1565b005b61016f610471565b60405161017c9190611449565b60405180910390f35b6101986101933660046111bb565b610503565b60405161017c919061143e565b6101b86101b33660046110e2565b61051d565b60405161017c9291906115c2565b6101ce61053a565b60405161017c91906115b9565b6101ce6101e93660046110e2565b6105e5565b6101986101fc366004611136565b6105f8565b610209610612565b60405161017c91906115d0565b6101986102243660046111bb565b61061b565b6101ce6102373660046110fe565b610635565b6101ce61024a3660046110e2565b610662565b610257610720565b60405161017c919061135e565b61025761072f565b61016f610739565b6101986101fc3660046111bb565b610257610748565b6101ce610757565b6101986102a0366004611176565b610761565b6101ce6108e6565b6101656102bb3660046111bb565b6108eb565b6101ce6102243660046110fe565b6101656102dc3660046111e6565b61097d565b60006102eb610ac0565b60075490915060ff16806103025750610302610ac5565b8061030e575060065481115b6103335760405162461bcd60e51b815260040161032a906114c3565b60405180910390fd5b60075460ff16158015610353576007805460ff1916600117905560068290555b61035c86610acb565b61036585610ae2565b61036e87610af5565b8a603b60006101000a8154816001600160a01b0302191690836001600160a01b0316021790555089603c60006101000a8154816001600160a01b0302191690836001600160a01b0316021790555088603c60146101000a81548160ff021916908360ff16021790555087603d60006101000a8154816001600160a01b0302191690836001600160a01b031602179055508a6001600160a01b03168a6001600160a01b03167f40251fbfb6656cfa65a00d7879029fec1fad21d28fdcff2f4f68f52795b74f2c8a8a8a8a8a8a60405161044b969594939291906113c8565b60405180910390a38015610464576007805460ff191690555b5050505050505050505050565b6060600380546104809061164c565b80601f01602080910402602001604051908101604052809291908181526020018280546104ac9061164c565b80156104f95780601f106104ce576101008083540402835291602001916104f9565b820191906000526020600020905b8154815290600101906020018083116104dc57829003601f168201915b5050505050905090565b600060405162461bcd60e51b815260040161032a90611552565b60008061052983610b0b565b610531610b26565b91509150915091565b603b54603c5460405163013351ef60e01b81526000926105e0926001600160a01b039182169263013351ef926105829290811691600160a01b90910460ff16906004016113ac565b60206040518083038186803b15801561059a57600080fd5b505afa1580156105ae573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105d291906112fb565b6105da610b26565b90610b2c565b905090565b60006105f082610b0b565b90505b919050565b600060405162461bcd60e51b815260040161032a9061145c565b60055460ff1690565b600060405162461bcd60e51b815260040161032a9061148c565b6001600160a01b038083166000908152603a60209081526040808320938516835292905220545b92915050565b60008061066e83610b0b565b90508061067f5760009150506105f3565b603b54603c5460405163013351ef60e01b8152610719926001600160a01b039081169263013351ef926106c292821691600160a01b900460ff16906004016113ac565b60206040518083038186803b1580156106da57600080fd5b505afa1580156106ee573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061071291906112fb565b8290610b2c565b9392505050565b603b546001600160a01b031690565b60006105e0610be7565b6060600480546104809061164c565b603c546001600160a01b031690565b60006105e0610b26565b600061076b610720565b6001600160a01b031661077c610bf6565b6001600160a01b03161460405180604001604052806002815260200161323960f01b815250906107bf5760405162461bcd60e51b815260040161032a9190611449565b50836001600160a01b0316856001600160a01b0316146107e4576107e4848685610bfa565b60006107ef85610b0b565b905060006107fd8585610cb8565b6040805180820190915260028152611a9b60f11b6020820152909150816108375760405162461bcd60e51b815260040161032a9190611449565b506108428682610d96565b856001600160a01b031660006001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8760405161088691906115b9565b60405180910390a3856001600160a01b0316876001600160a01b03167f2f00e3cdd69a77be7ed215ec7b2a36784dd158f921fca79ac29deffa353fe6ee87876040516108d39291906115c2565b60405180910390a3501595945050505050565b600181565b80603a60006108f8610bf6565b6001600160a01b0390811682526020808301939093526040918201600090812091871680825291909352912091909155610930610bf6565b6001600160a01b03167fda919360433220e13b51e8c211e490d148e61a3bd53de8c097194e458b97f3e1610962610748565b84604051610971929190611372565b60405180910390a35050565b610985610720565b6001600160a01b0316610996610bf6565b6001600160a01b03161460405180604001604052806002815260200161323960f01b815250906109d95760405162461bcd60e51b815260040161032a9190611449565b5060006109e68383610cb8565b60408051808201909152600281526106a760f31b602082015290915081610a205760405162461bcd60e51b815260040161032a9190611449565b50610a2b8482610e9d565b60006001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef85604051610a6f91906115b9565b60405180910390a3836001600160a01b03167f49995e5dd6158cf69ad3e9777c46755a1a826a446c6416992167462dad033b2a8484604051610ab29291906115c2565b60405180910390a250505050565b600190565b303b1590565b8051610ade906003906020840190610f65565b5050565b8051610ade906004906020840190610f65565b6005805460ff191660ff92909216919091179055565b6001600160a01b031660009081526020819052604090205490565b60025490565b6000821580610b39575081155b15610b465750600061065c565b81610b5e60026b033b2e3c9fd0803ce80000006115f6565b610b6a90600019611635565b610b7491906115f6565b83111560405180604001604052806002815260200161068760f31b81525090610bb05760405162461bcd60e51b815260040161032a9190611449565b506b033b2e3c9fd0803ce8000000610bc96002826115f6565b610bd38486611616565b610bdd91906115de565b61071991906115f6565b603d546001600160a01b031690565b3390565b6040805180820182526002815261353960f01b6020808301919091526001600160a01b038087166000908152603a83528481209187168152915291822054610c43918490610f1c565b6001600160a01b038086166000818152603a60209081526040808320948916808452949091529020839055919250907fda919360433220e13b51e8c211e490d148e61a3bd53de8c097194e458b97f3e1610c9b610748565b84604051610caa929190611372565b60405180910390a350505050565b604080518082019091526002815261035360f41b602082015260009082610cf25760405162461bcd60e51b815260040161032a9190611449565b506000610d006002846115f6565b90506b033b2e3c9fd0803ce8000000610d1b82600019611635565b610d2591906115f6565b84111560405180604001604052806002815260200161068760f31b81525090610d615760405162461bcd60e51b815260040161032a9190611449565b508281610d7a6b033b2e3c9fd0803ce800000087611616565b610d8491906115de565b610d8e91906115f6565b949350505050565b6001600160a01b038216610dbc5760405162461bcd60e51b815260040161032a90611582565b610dc860008383610f48565b600254610dd58183610f4d565b6002556001600160a01b038316600090815260208190526040902054610dfb8184610f4d565b6001600160a01b038516600090815260208190526040812091909155610e1f610be7565b6001600160a01b031614610e9757610e35610be7565b6001600160a01b03166331873e2e8584846040518463ffffffff1660e01b8152600401610e649392919061138b565b600060405180830381600087803b158015610e7e57600080fd5b505af1158015610e92573d6000803e3d6000fd5b505050505b50505050565b6001600160a01b038216610ec35760405162461bcd60e51b815260040161032a90611511565b610ecf82600083610f48565b600254610edc8183610f59565b6002556001600160a01b038316600090815260208181526040918290205482516060810190935260228084529092610dfb928692906116cc908301398391905b60008184841115610f405760405162461bcd60e51b815260040161032a9190611449565b505050900390565b505050565b600061071982846115de565b60006107198284611635565b828054610f719061164c565b90600052602060002090601f016020900481019282610f935760008555610fd9565b82601f10610fac57805160ff1916838001178555610fd9565b82800160010185558215610fd9579182015b82811115610fd9578251825591602001919060010190610fbe565b50610fe5929150610fe9565b5090565b5b80821115610fe55760008155600101610fea565b80356105f3816116b3565b60008083601f84011261101a578081fd5b50813567ffffffffffffffff811115611031578182fd5b60208301915083602082850101111561104957600080fd5b9250929050565b600082601f830112611060578081fd5b813567ffffffffffffffff8082111561107b5761107b61169d565b604051601f8301601f19168101602001828111828210171561109f5761109f61169d565b6040528281528483016020018610156110b6578384fd5b82602086016020830137918201602001929092529392505050565b803560ff811681146105f357600080fd5b6000602082840312156110f3578081fd5b8135610719816116b3565b60008060408385031215611110578081fd5b823561111b816116b3565b9150602083013561112b816116b3565b809150509250929050565b60008060006060848603121561114a578081fd5b8335611155816116b3565b92506020840135611165816116b3565b929592945050506040919091013590565b6000806000806080858703121561118b578081fd5b8435611196816116b3565b935060208501356111a6816116b3565b93969395505050506040820135916060013590565b600080604083850312156111cd578182fd5b82356111d8816116b3565b946020939093013593505050565b6000806000606084860312156111fa578283fd5b8335611205816116b3565b95602085013595506040909401359392505050565b60008060008060008060008060006101008a8c031215611238578485fd5b6112418a610ffe565b985061124f60208b01610ffe565b975061125d60408b016110d1565b965061126b60608b01610ffe565b955061127960808b016110d1565b945060a08a013567ffffffffffffffff80821115611295578586fd5b6112a18d838e01611050565b955060c08c01359150808211156112b6578485fd5b6112c28d838e01611050565b945060e08c01359150808211156112d7578384fd5b506112e48c828d01611009565b915080935050809150509295985092959850929598565b60006020828403121561130c578081fd5b5051919050565b60008151808452815b818110156113385760208185018101518683018201520161131c565b818111156113495782602083870101525b50601f01601f19169290920160200192915050565b6001600160a01b0391909116815260200190565b6001600160a01b03929092168252602082015260400190565b6001600160a01b039390931683526020830191909152604082015260600190565b6001600160a01b0392909216825260ff16602082015260400190565b6001600160a01b038716815260ff8616602082015260a0604082018190526000906113f590830187611313565b82810360608401526114078187611313565b905082810360808401528381528385602083013781602085830101526020601f19601f860116820101915050979650505050505050565b901515815260200190565b6000602082526107196020830184611313565b6020808252601690820152751514905394d1915497d393d517d4d5541413d495115160521b604082015260600190565b60208082526017908201527f414c4c4f57414e43455f4e4f545f535550504f52544544000000000000000000604082015260600190565b6020808252602e908201527f436f6e747261637420696e7374616e63652068617320616c726561647920626560408201526d195b881a5b9a5d1a585b1a5e995960921b606082015260800190565b60208082526021908201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736040820152607360f81b606082015260800190565b6020808252601690820152751054141493d5905317d393d517d4d5541413d495115160521b604082015260600190565b6020808252601f908201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604082015260600190565b90815260200190565b918252602082015260400190565b60ff91909116815260200190565b600082198211156115f1576115f1611687565b500190565b60008261161157634e487b7160e01b81526012600452602481fd5b500490565b600081600019048311821515161561163057611630611687565b500290565b60008282101561164757611647611687565b500390565b60028104600182168061166057607f821691505b6020821081141561168157634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b03811681146116c857600080fd5b5056fe45524332303a206275726e20616d6f756e7420657863656564732062616c616e6365a26469706673582212207fcb4534c4d1a731dd4d74bf60502c7f12b6810a32d59e16a91861fde80098f564736f6c63430008000033";
