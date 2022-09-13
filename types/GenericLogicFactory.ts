/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { GenericLogic } from "./GenericLogic";

export class GenericLogicFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<GenericLogic> {
    return super.deploy(overrides || {}) as Promise<GenericLogic>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): GenericLogic {
    return super.attach(address) as GenericLogic;
  }
  connect(signer: Signer): GenericLogicFactory {
    return super.connect(signer) as GenericLogicFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GenericLogic {
    return new Contract(address, _abi, signerOrProvider) as GenericLogic;
  }
}

const _abi = [
  {
    inputs: [],
    name: "HEALTH_FACTOR_LIQUIDATION_THRESHOLD",
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
  "0x61133561003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106100405760003560e01c8063079f172014610045578063c3525c281461006e575b600080fd5b610058610053366004610fba565b610083565b604051610065919061106f565b60405180910390f35b610076610465565b6040516100659190611146565b600061009c61009736879003870187610f6d565b610471565b158061012357506101218660006100b660208b018b610f35565b6001600160a01b03166001600160a01b0316815260200190815260200160002060008960200160208101906100eb919061103a565b60ff9081168252602082019290925260400160002060070154600160a01b90041661011b36889003880188610f6d565b90610499565b155b156101305750600161045b565b610138610e0b565b61019887600061014b60208c018c610f35565b6001600160a01b03166001600160a01b0316815260200190815260200160002060008a6020016020810190610180919061103a565b60ff168152602081019190915260400160002061050a565b5084525060208301819052151590506101b557600191505061045b565b61022760405180604001604052808a60400160208101906101d69190610f35565b6001600160a01b031681526020018a60200160208101906101f7919061103a565b60ff1690528861020c368a90038a018a610f6d565b88888d60800160208101906102219190610f35565b89610535565b5060808501525060608301819052604083019190915261024b57600191505061045b565b80516103c19061025c90600a6111cd565b6103bb60608b013561027460a08d0160808e01610f35565b6001600160a01b0316631a9dffb38860008f60000160208101906102989190610f35565b6001600160a01b031681526020810191909152604090810160002054905160e083901b6001600160e01b03191681526102de916301000000900460ff169060040161107a565b60206040518083038186803b1580156102f657600080fd5b505afa15801561030a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061032e9190610f51565b6001600160a01b031663b3596f0761034960208f018f610f35565b6040518263ffffffff1660e01b8152600401610365919061105b565b60206040518083038186803b15801561037d57600080fd5b505afa158015610391573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103b59190611022565b90610b88565b90610b9b565b60a0820181905260408201516103d691610ba7565b60c082018190526103eb57600091505061045b565b61042a8160c001516103bb61041184602001518560a00151610b8890919063ffffffff16565b6080850151604086015161042491610b88565b90610ba7565b60e0820181905260c0820151606083015161044492610bb3565b610100909101819052670de0b6b3a7640000111590505b9695505050505050565b670de0b6b3a764000081565b517f555555555555555555555555555555555555555555555555555555555555555516151590565b60006080821060405180604001604052806002815260200161373760f01b815250906104e15760405162461bcd60e51b81526004016104d891906110a2565b60405180910390fd5b506104ed82600261129b565b6104f890600161114f565b83516001911c16151590505b92915050565b5461ffff80821692601083901c821692602081901c831692603082901c60ff169260409290921c1690565b6000806000806000610545610e60565b8c516001600160a01b03166102a082015260208d015160ff166102c082015261056d8b610bdf565b1561058b576000806000806000199550955095509550955050610b79565b6102c081015160ff166101008201525b888161010001511015610ad8576101008101516105b9908c90610be4565b6105c257610ab9565b896000826101000151815260200190815260200160002060009054906101000a90046001600160a01b03168161020001906001600160a01b031690816001600160a01b03168152505060008c60008361020001516001600160a01b03166001600160a01b031681526020019081526020016000206000836102c0015160ff1660ff1681526020019081526020016000209050886001600160a01b0316631a9dffb38960008561020001516001600160a01b03166001600160a01b0316815260200190815260200160002060000160039054906101000a900460ff166040518263ffffffff1660e01b81526004016106b9919061107a565b60206040518083038186803b1580156106d157600080fd5b505afa1580156106e5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107099190610f51565b6001600160a01b03166102808301526102c08201516007820154600160a81b900460ff90811691161461074e5760405162461bcd60e51b81526004016104d8906110f5565b6107578161050a565b5060a0860181905260e08601929092525060c084019190915261077b90600a6111cd565b8260400181815250508161028001516001600160a01b031663b3596f078361020001516040518263ffffffff1660e01b81526004016107ba919061105b565b60206040518083038186803b1580156107d257600080fd5b505afa1580156107e6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061080a9190611022565b602083015260e08201511580159061082e575061010082015161082e908d90610499565b1561094c576004808201546102a08401516040516370a0823160e01b81526001600160a01b03909216926370a082319261086992910161105b565b60206040518083038186803b15801561088157600080fd5b505afa158015610895573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108b99190611022565b60608301819052604083015160208401516108d8926103bb9190610b88565b61026083018190526101408301516108ef91610c3f565b61014083015260c082015161026083015161091a9161090e9190610b88565b61018084015190610c3f565b61018083015260e0820151610260830151610945916109399190610b88565b6101a084015190610c3f565b6101a08301525b61010082015161095d908d90610c4b565b15610ab75760058101546102a08301516040516370a0823160e01b81526001600160a01b03909216916370a08231916109989160040161105b565b60206040518083038186803b1580156109b057600080fd5b505afa1580156109c4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109e89190611022565b608083015260068101546102a08301516040516370a0823160e01b8152610a81926001600160a01b0316916370a0823191610a26919060040161105b565b60206040518083038186803b158015610a3e57600080fd5b505afa158015610a52573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a769190611022565b608084015190610c3f565b6080830181905260408301516020840151610ab092610aa492916103bb91610b88565b61016084015190610c3f565b6101608301525b505b600360ff168161010001818151610ad0919061114f565b90525061059b565b600081610140015111610aec576000610b01565b610140810151610180820151610b0191610b9b565b610180820152610140810151610b18576000610b2d565b6101408101516101a0820151610b2d91610b9b565b6101a08201819052610140820151610160830151610b4a92610bb3565b61012082018190526101408201516101608301516101808401516101a090940151919850965091945090925090505b97509750975097509792505050565b6000610b94828461129b565b9392505050565b6000610b948284611167565b6000610b9482846112ba565b600082610bc35750600019610b94565b610bd783610bd18685610c96565b90610d3d565b949350505050565b511590565b60006080821060405180604001604052806002815260200161373760f01b81525090610c235760405162461bcd60e51b81526004016104d891906110a2565b50610c2f82600261129b565b925190921c600316151592915050565b6000610b94828461114f565b60006080821060405180604001604052806002815260200161373760f01b81525090610c8a5760405162461bcd60e51b81526004016104d891906110a2565b506104f882600261129b565b6000821580610ca3575081155b15610cb057506000610504565b81610cbe6002612710611167565b610cca906000196112ba565b610cd49190611167565b83111560405180604001604052806002815260200161068760f31b81525090610d105760405162461bcd60e51b81526004016104d891906110a2565b50612710610d1f600282611167565b610d29848661129b565b610d33919061114f565b610b949190611167565b604080518082019091526002815261035360f41b602082015260009082610d775760405162461bcd60e51b81526004016104d891906110a2565b506000610d85600284611167565b9050670de0b6b3a7640000610d9c826000196112ba565b610da69190611167565b84111560405180604001604052806002815260200161068760f31b81525090610de25760405162461bcd60e51b81526004016104d891906110a2565b508281610df7670de0b6b3a76400008761129b565b610e01919061114f565b610bd79190611167565b6040518061014001604052806000815260200160008152602001600081526020016000815260200160008152602001600081526020016000815260200160008152602001600081526020016000151581525090565b604051806102e00160405280600060ff168152602001600081526020016000815260200160008152602001600081526020016000815260200160008152602001600081526020016000815260200160008152602001600081526020016000815260200160008152602001600081526020016000815260200160001515815260200160006001600160a01b031681526020016000151581526020016000151581526020016000815260200160006001600160a01b0316815260200160006001600160a01b03168152602001600060ff1681525090565b600060208284031215610f46578081fd5b8135610b94816112e7565b600060208284031215610f62578081fd5b8151610b94816112e7565b600060208284031215610f7e578081fd5b6040516020810181811067ffffffffffffffff82111715610fad57634e487b7160e01b83526041600452602483fd5b6040529135825250919050565b600080600080600080868803610140811215610fd4578283fd5b60a0811215610fe1578283fd5b87965060a08701359550602060bf1982011215610ffc578283fd5b509497939650505060c084019360e0810135935061010081013592610120909101359150565b600060208284031215611033578081fd5b5051919050565b60006020828403121561104b578081fd5b813560ff81168114610b94578182fd5b6001600160a01b0391909116815260200190565b901515815260200190565b602081016002831061109c57634e487b7160e01b600052602160045260246000fd5b91905290565b6000602080835283518082850152825b818110156110ce578581018301518582016040015282016110b2565b818111156110df5783604083870101525b50601f01601f1916929092016040019392505050565b60208082526031908201527f63616c63756c617465557365724163636f756e7444617461207472616e636865604082015270020646f6573206e6f74206c696e6520757607c1b606082015260800190565b90815260200190565b60008219821115611162576111626112d1565b500190565b60008261118257634e487b7160e01b81526012600452602481fd5b500490565b80825b600180861161119957506111c4565b8187048211156111ab576111ab6112d1565b808616156111b857918102915b9490941c93800261118a565b94509492505050565b6000610b9460001984846000826111e657506001610b94565b816111f357506000610b94565b8160018114611209576002811461121357611240565b6001915050610b94565b60ff841115611224576112246112d1565b6001841b91508482111561123a5761123a6112d1565b50610b94565b5060208310610133831016604e8410600b8410161715611273575081810a8381111561126e5761126e6112d1565b610b94565b6112808484846001611187565b808604821115611292576112926112d1565b02949350505050565b60008160001904831182151516156112b5576112b56112d1565b500290565b6000828210156112cc576112cc6112d1565b500390565b634e487b7160e01b600052601160045260246000fd5b6001600160a01b03811681146112fc57600080fd5b5056fea26469706673582212205b53c8c3bdc215ab11fb29dbded8ae5d661e8be6913633dec15c8b7c30df60f664736f6c63430008000033";