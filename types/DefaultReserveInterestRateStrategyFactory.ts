/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { DefaultReserveInterestRateStrategy } from "./DefaultReserveInterestRateStrategy";

export class DefaultReserveInterestRateStrategyFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    provider: string,
    optimalUtilizationRate: BigNumberish,
    baseVariableBorrowRate: BigNumberish,
    variableRateSlope1: BigNumberish,
    variableRateSlope2: BigNumberish,
    stableRateSlope1: BigNumberish,
    stableRateSlope2: BigNumberish,
    overrides?: Overrides
  ): Promise<DefaultReserveInterestRateStrategy> {
    return super.deploy(
      provider,
      optimalUtilizationRate,
      baseVariableBorrowRate,
      variableRateSlope1,
      variableRateSlope2,
      stableRateSlope1,
      stableRateSlope2,
      overrides || {}
    ) as Promise<DefaultReserveInterestRateStrategy>;
  }
  getDeployTransaction(
    provider: string,
    optimalUtilizationRate: BigNumberish,
    baseVariableBorrowRate: BigNumberish,
    variableRateSlope1: BigNumberish,
    variableRateSlope2: BigNumberish,
    stableRateSlope1: BigNumberish,
    stableRateSlope2: BigNumberish,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(
      provider,
      optimalUtilizationRate,
      baseVariableBorrowRate,
      variableRateSlope1,
      variableRateSlope2,
      stableRateSlope1,
      stableRateSlope2,
      overrides || {}
    );
  }
  attach(address: string): DefaultReserveInterestRateStrategy {
    return super.attach(address) as DefaultReserveInterestRateStrategy;
  }
  connect(signer: Signer): DefaultReserveInterestRateStrategyFactory {
    return super.connect(signer) as DefaultReserveInterestRateStrategyFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DefaultReserveInterestRateStrategy {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as DefaultReserveInterestRateStrategy;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "contract ILendingPoolAddressesProvider",
        name: "provider",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "optimalUtilizationRate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "baseVariableBorrowRate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "variableRateSlope1",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "variableRateSlope2",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "stableRateSlope1",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "stableRateSlope2",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "EXCESS_UTILIZATION_RATE",
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
    name: "OPTIMAL_UTILIZATION_RATE",
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
    name: "addressesProvider",
    outputs: [
      {
        internalType: "contract ILendingPoolAddressesProvider",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "baseVariableBorrowRate",
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
        name: "reserve",
        type: "address",
      },
      {
        internalType: "address",
        name: "aToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "liquidityAdded",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "liquidityTaken",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalStableDebt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalVariableDebt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "averageStableBorrowRate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "reserveFactor",
        type: "uint256",
      },
    ],
    name: "calculateInterestRates",
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
        name: "reserve",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "availableLiquidity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalStableDebt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalVariableDebt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "averageStableBorrowRate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "reserveFactor",
        type: "uint256",
      },
    ],
    name: "calculateInterestRates",
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
    name: "getMaxVariableBorrowRate",
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
    name: "stableRateSlope1",
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
    name: "stableRateSlope2",
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
    name: "variableRateSlope1",
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
    name: "variableRateSlope2",
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
  "0x61018060405234801561001157600080fd5b50604051610f95380380610f95833981016040819052610030916100b8565b85608081815250506100608661004e61009560201b6107d91760201c565b6100a560201b6107e91790919060201c565b60a05260609690961b6001600160601b03191660c05260e0939093526101009190915261012052610140525061016052610142565b6b033b2e3c9fd0803ce800000090565b60006100b1828461011f565b9392505050565b600080600080600080600060e0888a0312156100d2578283fd5b87516001600160a01b03811681146100e8578384fd5b602089015160408a015160608b015160808c015160a08d015160c0909d0151949e939d50919b909a50909850965090945092505050565b60008282101561013d57634e487b7160e01b81526011600452602481fd5b500390565b60805160a05160c05160601c60e05161010051610120516101405161016051610d746102216000396000818161051e01526107b70152600081816101500152818161054e0152610638015260008181610255015281816102a2015261057f015260008181610279015281816102e7015281816105ca01526106a20152600081816102c6015281816105a9015281816106c8015261076f015260008181610376015261079301526000818161017401526104b801526000818161048c015281816104dc015281816106040152818161067c015261074b0152610d746000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c806380031e371161007157806380031e37146101065780639584df281461010e578063a15f30ac14610121578063b258954414610129578063c72c4d1014610131578063ccab01a314610146576100a9565b80630bdf953f146100ae57806317319873146100cc57806329db497d146100d457806365614f81146100f65780637b832f58146100fe575b600080fd5b6100b661014e565b6040516100c39190610c83565b60405180910390f35b6100b6610172565b6100e76100e2366004610b4f565b610196565b6040516100c393929190610c8c565b6100b6610253565b6100b6610277565b6100b661029b565b6100e761011c366004610bb9565b610316565b6100b6610749565b6100b661076d565b610139610791565b6040516100c39190610c1c565b6100b66107b5565b7f000000000000000000000000000000000000000000000000000000000000000090565b7f000000000000000000000000000000000000000000000000000000000000000081565b6000806000808b6001600160a01b03166370a082318c6040518263ffffffff1660e01b81526004016101c89190610c1c565b60206040518083038186803b1580156101e057600080fd5b505afa1580156101f4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102189190610c04565b905061022e89610228838d6107fe565b906107e9565b905061023e8c828a8a8a8a610316565b93509350935050985098509895505050505050565b7f000000000000000000000000000000000000000000000000000000000000000090565b7f000000000000000000000000000000000000000000000000000000000000000090565b60006103117f000000000000000000000000000000000000000000000000000000000000000061030b7f00000000000000000000000000000000000000000000000000000000000000007f00000000000000000000000000000000000000000000000000000000000000006107fe565b906107fe565b905090565b6000806000610323610afd565b61032d88886107fe565b808252600060208301819052604083018190526060830152156103685780516103639061035b908b906107fe565b82519061080a565b61036b565b60005b8160800181815250507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316633618abba6040518163ffffffff1660e01b815260040160206040518083038186803b1580156103cd57600080fd5b505afa1580156103e1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104059190610b2c565b6001600160a01b031663bb85c0bb8b6040518263ffffffff1660e01b81526004016104309190610c1c565b60206040518083038186803b15801561044857600080fd5b505afa15801561045c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104809190610c04565b604082015260808101517f000000000000000000000000000000000000000000000000000000000000000010156105f95760006105147f000000000000000000000000000000000000000000000000000000000000000061050e7f000000000000000000000000000000000000000000000000000000000000000085608001516107e990919063ffffffff16565b9061080a565b90506105726105437f0000000000000000000000000000000000000000000000000000000000000000836108f1565b604084015161030b907f00000000000000000000000000000000000000000000000000000000000000006107fe565b60408301526105ee6105a47f0000000000000000000000000000000000000000000000000000000000000000836108f1565b61030b7f00000000000000000000000000000000000000000000000000000000000000007f00000000000000000000000000000000000000000000000000000000000000006107fe565b6020830152506106f3565b61066861065d6106367f0000000000000000000000000000000000000000000000000000000000000000846080015161080a90919063ffffffff16565b7f0000000000000000000000000000000000000000000000000000000000000000906108f1565b6040830151906107fe565b604082015260808101516106ed906106c6907f00000000000000000000000000000000000000000000000000000000000000009061050e907f00000000000000000000000000000000000000000000000000000000000000006108f1565b7f0000000000000000000000000000000000000000000000000000000000000000906107fe565b60208201525b610726610702612710876107e9565b610720836080015161071a8c8c87602001518d6109ac565b906108f1565b90610a11565b606082018190526040820151602090920151909b919a5098509650505050505050565b7f000000000000000000000000000000000000000000000000000000000000000081565b7f000000000000000000000000000000000000000000000000000000000000000090565b7f000000000000000000000000000000000000000000000000000000000000000081565b7f000000000000000000000000000000000000000000000000000000000000000090565b6b033b2e3c9fd0803ce800000090565b60006107f58284610cf9565b90505b92915050565b60006107f58284610ca2565b604080518082019091526002815261035360f41b60208201526000908261084d5760405162461bcd60e51b81526004016108449190610c30565b60405180910390fd5b50600061085b600284610cba565b90506b033b2e3c9fd0803ce800000061087682600019610cf9565b6108809190610cba565b84111560405180604001604052806002815260200161068760f31b815250906108bc5760405162461bcd60e51b81526004016108449190610c30565b5082816108d56b033b2e3c9fd0803ce800000087610cda565b6108df9190610ca2565b6108e99190610cba565b949350505050565b60008215806108fe575081155b1561090b575060006107f8565b8161092360026b033b2e3c9fd0803ce8000000610cba565b61092f90600019610cf9565b6109399190610cba565b83111560405180604001604052806002815260200161068760f31b815250906109755760405162461bcd60e51b81526004016108449190610c30565b506b033b2e3c9fd0803ce800000061098e600282610cba565b6109988486610cda565b6109a29190610ca2565b6107f59190610cba565b6000806109b986866107fe565b9050806109ca5760009150506108e9565b60006109d98561071a88610a9a565b905060006109ea8561071a8a610a9a565b90506000610a046109fa85610a9a565b61050e85856107fe565b9998505050505050505050565b6000821580610a1e575081155b15610a2b575060006107f8565b81610a396002612710610cba565b610a4590600019610cf9565b610a4f9190610cba565b83111560405180604001604052806002815260200161068760f31b81525090610a8b5760405162461bcd60e51b81526004016108449190610c30565b5061271061098e600282610cba565b600080610aab633b9aca0084610cda565b905082610abc633b9aca0083610cba565b1460405180604001604052806002815260200161068760f31b81525090610af65760405162461bcd60e51b81526004016108449190610c30565b5092915050565b6040518060a0016040528060008152602001600081526020016000815260200160008152602001600081525090565b600060208284031215610b3d578081fd5b8151610b4881610d26565b9392505050565b600080600080600080600080610100898b031215610b6b578384fd5b8835610b7681610d26565b97506020890135610b8681610d26565b979a9799505050506040860135956060810135956080820135955060a0820135945060c0820135935060e0909101359150565b60008060008060008060c08789031215610bd1578182fd5b8635610bdc81610d26565b9860208801359850604088013597606081013597506080810135965060a00135945092505050565b600060208284031215610c15578081fd5b5051919050565b6001600160a01b0391909116815260200190565b6000602080835283518082850152825b81811015610c5c57858101830151858201604001528201610c40565b81811115610c6d5783604083870101525b50601f01601f1916929092016040019392505050565b90815260200190565b9283526020830191909152604082015260600190565b60008219821115610cb557610cb5610d10565b500190565b600082610cd557634e487b7160e01b81526012600452602481fd5b500490565b6000816000190483118215151615610cf457610cf4610d10565b500290565b600082821015610d0b57610d0b610d10565b500390565b634e487b7160e01b600052601160045260246000fd5b6001600160a01b0381168114610d3b57600080fd5b5056fea2646970667358221220e7a55590e54a0b472b82b041390f9e22f8648c2781de15d81698baa775b2730f64736f6c63430008000033";
