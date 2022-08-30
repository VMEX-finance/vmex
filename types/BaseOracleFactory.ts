/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { BaseOracle } from "./BaseOracle";

export class BaseOracleFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _pool: string,
    _token_to_price: BigNumberish,
    decimals: BigNumberish,
    overrides?: Overrides
  ): Promise<BaseOracle> {
    return super.deploy(
      _pool,
      _token_to_price,
      decimals,
      overrides || {}
    ) as Promise<BaseOracle>;
  }
  getDeployTransaction(
    _pool: string,
    _token_to_price: BigNumberish,
    decimals: BigNumberish,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(
      _pool,
      _token_to_price,
      decimals,
      overrides || {}
    );
  }
  attach(address: string): BaseOracle {
    return super.attach(address) as BaseOracle;
  }
  connect(signer: Signer): BaseOracleFactory {
    return super.connect(signer) as BaseOracleFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BaseOracle {
    return new Contract(address, _abi, signerOrProvider) as BaseOracle;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_pool",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "_token_to_price",
        type: "uint8",
      },
      {
        internalType: "int256",
        name: "decimals",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "WINDOW_SIZE",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latest_pool_price",
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
  "0x60a06040523480156200001157600080fd5b5060405162000f3038038062000f30833981016040819052620000349162000113565b60ff821615806200004857508160ff166001145b620000705760405162461bcd60e51b8152600401620000679062000168565b60405180910390fd5b600080546001600160a01b0319166001600160a01b0385161760ff60a01b1916600160a01b60ff851602178155811215620000d757620000b08162000315565b620000bd90600a620001fe565b620000d190670de0b6b3a7640000620002f3565b620000f8565b620000e481600a620001fe565b620000f890670de0b6b3a764000062000190565b6001600160801b0319608091821b1690525062000348915050565b60008060006060848603121562000128578283fd5b83516001600160a01b03811681146200013f578384fd5b602085015190935060ff8116811462000156578283fd5b80925050604084015190509250925092565b6020808252600e908201526d6d7573742062652030206f72203160901b604082015260600190565b600082620001ac57634e487b7160e01b81526012600452602481fd5b500490565b80825b6001808611620001c55750620001f5565b818704821115620001da57620001da62000332565b80861615620001e857918102915b9490941c938002620001b4565b94509492505050565b60006200020f600019848462000216565b9392505050565b60008262000227575060016200020f565b8162000236575060006200020f565b81600181146200024f57600281146200025a576200028e565b60019150506200020f565b60ff8411156200026e576200026e62000332565b6001841b91508482111562000287576200028762000332565b506200020f565b5060208310610133831016604e8410600b8410161715620002c6575081810a83811115620002c057620002c062000332565b6200020f565b620002d58484846001620001b1565b808604821115620002ea57620002ea62000332565b02949350505050565b600081600019048311821515161562000310576200031062000332565b500290565b6000600160ff1b8214156200032e576200032e62000332565b0390565b634e487b7160e01b600052601160045260246000fd5b60805160801c610bc26200036e600039600081816101be01526101f10152610bc26000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80633c691aad1461003b578063509ef27c14610059575b600080fd5b61004361006e565b6040516100509190610af6565b60405180910390f35b610061610222565b6040516100509190610aff565b600080548190610088906001600160a01b031660b4610227565b905060008060009054906101000a90046001600160a01b03166001600160a01b0316630dfe16816040518163ffffffff1660e01b815260040160206040518083038186803b1580156100d957600080fd5b505afa1580156100ed573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101119190610991565b905060008060009054906101000a90046001600160a01b03166001600160a01b031663d21220a76040518163ffffffff1660e01b815260040160206040518083038186803b15801561016257600080fd5b505afa158015610176573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061019a9190610991565b905060008060149054906101000a900460ff1660ff16600114156101eb576101e4847f00000000000000000000000000000000000000000000000000000000000000008486610447565b905061021a565b610217847f00000000000000000000000000000000000000000000000000000000000000008585610447565b90505b935050505090565b60b481565b600063ffffffff82166102555760405162461bcd60e51b815260040161024c90610abf565b60405180910390fd5b604080516002808252606082018352600092602083019080368337019050509050828160008151811061029857634e487b7160e01b600052603260045260246000fd5b602002602001019063ffffffff16908163ffffffff16815250506000816001815181106102d557634e487b7160e01b600052603260045260246000fd5b63ffffffff9092166020928302919091019091015260405163883bdbfd60e01b81526000906001600160a01b0386169063883bdbfd90610319908590600401610a75565b60006040518083038186803b15801561033157600080fd5b505afa158015610345573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261036d91908101906109ad565b50905060008160008151811061039357634e487b7160e01b600052603260045260246000fd5b6020026020010151826001815181106103bc57634e487b7160e01b600052603260045260246000fd5b60200260200101510390508463ffffffff1660060b8160060b816103f057634e487b7160e01b600052601260045260246000fd5b05935060008160060b12801561043157508463ffffffff1660060b8160060b8161042a57634e487b7160e01b600052601260045260246000fd5b0760060b15155b1561043e57600019909301925b50505092915050565b6000806104538661053e565b90506001600160801b036001600160a01b038216116104c2576001600160a01b03808216800290848116908616106104a25761049d600160c01b876001600160801b03168361086b565b6104ba565b6104ba81876001600160801b0316600160c01b61086b565b925050610535565b60006104e16001600160a01b038316806801000000000000000061086b565b9050836001600160a01b0316856001600160a01b03161061051957610514600160801b876001600160801b03168361086b565b610531565b61053181876001600160801b0316600160801b61086b565b9250505b50949350505050565b60008060008360020b12610555578260020b61055d565b8260020b6000035b9050620d89e88111156105825760405162461bcd60e51b815260040161024c90610adb565b60006001821661059657600160801b6105a8565b6ffffcb933bd6fad37aa2d162d1a5940015b70ffffffffffffffffffffffffffffffffff16905060028216156105dc576ffff97272373d413259a46990580e213a0260801c5b60048216156105fb576ffff2e50f5f656932ef12357cf3c7fdcc0260801c5b600882161561061a576fffe5caca7e10e4e61c3624eaa0941cd00260801c5b6010821615610639576fffcb9843d60f6159c9db58835c9266440260801c5b6020821615610658576fff973b41fa98c081472e6896dfb254c00260801c5b6040821615610677576fff2ea16466c96a3843ec78b326b528610260801c5b6080821615610696576ffe5dee046a99a2a811c461f1969c30530260801c5b6101008216156106b6576ffcbe86c7900a88aedcffc83b479aa3a40260801c5b6102008216156106d6576ff987a7253ac413176f2b074cf7815e540260801c5b6104008216156106f6576ff3392b0822b70005940c7a398e4b70f30260801c5b610800821615610716576fe7159475a2c29b7443b29c7fa6e889d90260801c5b611000821615610736576fd097f3bdfd2022b8845ad8f792aa58250260801c5b612000821615610756576fa9f746462d870fdf8a65dc1f90e061e50260801c5b614000821615610776576f70d869a156d2a1b890bb3df62baf32f70260801c5b618000821615610796576f31be135f97d08fd981231505542fcfa60260801c5b620100008216156107b7576f09aa508b5b7a84e1c677de54f3e99bc90260801c5b620200008216156107d7576e5d6af8dedb81196699c329225ee6040260801c5b620400008216156107f6576d2216e584f5fa1ea926041bedfe980260801c5b62080000821615610813576b048a170391f7dc42444e8fa20260801c5b60008460020b131561084257806000198161083e57634e487b7160e01b600052601260045260246000fd5b0490505b640100000000810615610856576001610859565b60005b60ff16602082901c0192505050919050565b60008080600019858709868602925082811090839003039050806108a1576000841161089657600080fd5b508290049050610915565b8084116108ad57600080fd5b600084868809851960019081018716968790049682860381900495909211909303600082900391909104909201919091029190911760038402600290811880860282030280860282030280860282030280860282030280860282030280860290910302029150505b9392505050565b600082601f83011261092c578081fd5b8151602061094161093c83610b3a565b610b10565b828152818101908583018385028701840188101561095d578586fd5b855b8581101561098457815161097281610b74565b8452928401929084019060010161095f565b5090979650505050505050565b6000602082840312156109a2578081fd5b815161091581610b74565b600080604083850312156109bf578081fd5b825167ffffffffffffffff808211156109d6578283fd5b818501915085601f8301126109e9578283fd5b815160206109f961093c83610b3a565b82815281810190858301838502870184018b1015610a15578788fd5b8796505b84871015610a455780518060060b8114610a31578889fd5b835260019690960195918301918301610a19565b5091880151919650909350505080821115610a5e578283fd5b50610a6b8582860161091c565b9150509250929050565b6020808252825182820181905260009190848201906040850190845b81811015610ab357835163ffffffff1683529284019291840191600101610a91565b50909695505050505050565b602080825260029082015261042560f41b604082015260600190565b6020808252600190820152601560fa1b604082015260600190565b90815260200190565b63ffffffff91909116815260200190565b60405181810167ffffffffffffffff81118282101715610b3257610b32610b5e565b604052919050565b600067ffffffffffffffff821115610b5457610b54610b5e565b5060209081020190565b634e487b7160e01b600052604160045260246000fd5b6001600160a01b0381168114610b8957600080fd5b5056fea26469706673582212201f10942c9d8e2235463bd4934c711379fc5097e79f597047cb384329375f0d3064736f6c63430008000033";