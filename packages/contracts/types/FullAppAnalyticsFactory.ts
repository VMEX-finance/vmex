/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { FullAppAnalytics } from "./FullAppAnalytics";

export class FullAppAnalyticsFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    pool: string,
    user: string,
    tranche: BigNumberish,
    overrides?: Overrides
  ): Promise<FullAppAnalytics> {
    return super.deploy(
      pool,
      user,
      tranche,
      overrides || {}
    ) as Promise<FullAppAnalytics>;
  }
  getDeployTransaction(
    pool: string,
    user: string,
    tranche: BigNumberish,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(pool, user, tranche, overrides || {});
  }
  attach(address: string): FullAppAnalytics {
    return super.attach(address) as FullAppAnalytics;
  }
  connect(signer: Signer): FullAppAnalyticsFactory {
    return super.connect(signer) as FullAppAnalyticsFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FullAppAnalytics {
    return new Contract(address, _abi, signerOrProvider) as FullAppAnalytics;
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
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "tranche",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "getType",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "symbol",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "userBalance",
            type: "uint256",
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: "uint256",
                    name: "data",
                    type: "uint256",
                  },
                ],
                internalType: "struct DataTypes.ReserveConfigurationMap",
                name: "configuration",
                type: "tuple",
              },
              {
                internalType: "uint128",
                name: "liquidityIndex",
                type: "uint128",
              },
              {
                internalType: "uint128",
                name: "variableBorrowIndex",
                type: "uint128",
              },
              {
                internalType: "uint128",
                name: "currentLiquidityRate",
                type: "uint128",
              },
              {
                internalType: "uint128",
                name: "currentVariableBorrowRate",
                type: "uint128",
              },
              {
                internalType: "uint128",
                name: "currentStableBorrowRate",
                type: "uint128",
              },
              {
                internalType: "uint40",
                name: "lastUpdateTimestamp",
                type: "uint40",
              },
              {
                internalType: "address",
                name: "aTokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "stableDebtTokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "variableDebtTokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "interestRateStrategyAddress",
                type: "address",
              },
              {
                internalType: "uint8",
                name: "id",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "tranche",
                type: "uint8",
              },
            ],
            internalType: "struct DataTypes.ReserveData",
            name: "reserveData",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint8",
                name: "collateralRisk",
                type: "uint8",
              },
              {
                internalType: "bool",
                name: "isLendable",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isAllowedCollateralInHigherTranches",
                type: "bool",
              },
              {
                internalType: "enum DataTypes.ReserveAssetType",
                name: "assetType",
                type: "uint8",
              },
            ],
            internalType: "struct DataTypes.AssetData",
            name: "assetData",
            type: "tuple",
          },
        ],
        internalType: "struct TokenData[22]",
        name: "",
        type: "tuple[22]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162000fd638038062000fd6833981016040819052620000349162000ae4565b60006200004e8484846200007e60201b620000591760201c565b905060008160405160200162000065919062000e9a565b6040516020818303038152906040529050805181602001f35b62000088620008ca565b60006200009f620003e360201b620003811760201c565b90506000620000b86200064060201b620005dc1760201c565b90506000866001600160a01b0316630261bf8b6040518163ffffffff1660e01b815260040160206040518083038186803b158015620000f657600080fd5b505afa1580156200010b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062000131919062000ac0565b90506200013d620008ca565b60005b60168160ff161015620003d75760006040518060800160405280868460ff16601681106200017e57634e487b7160e01b600052603260045260246000fd5b60200201518152602001878460ff1660168110620001ac57634e487b7160e01b600052603260045260246000fd5b60200201516001600160a01b03166370a082318c6040518263ffffffff1660e01b8152600401620001de919062000e6a565b60206040518083038186803b158015620001f757600080fd5b505afa1580156200020c573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062000232919062000cbb565b8152602001856001600160a01b0316633629e3cd898660ff16601681106200026a57634e487b7160e01b600052603260045260246000fd5b60200201518c6040518363ffffffff1660e01b81526004016200028f92919062000e7e565b6101a06040518083038186803b158015620002a957600080fd5b505afa158015620002be573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620002e4919062000b9c565b8152602001856001600160a01b0316631652e7b7898660ff16601681106200031c57634e487b7160e01b600052603260045260246000fd5b60200201516040518263ffffffff1660e01b81526004016200033f919062000e6a565b60806040518083038186803b1580156200035857600080fd5b505afa1580156200036d573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062000393919062000b2d565b90529050808360ff841660168110620003bc57634e487b7160e01b600052603260045260246000fd5b60200201525080620003ce8162000fa8565b91505062000140565b50979650505050505050565b620003ed620008fb565b50604080516102c081018252737fc66500c84a76ad7e9c93437bfc5ac33e2ddae98152730d8775f648430679a709e98d2b0cb6250d2887ef6020820152734fabb145d64652a948d72533023f6e7a623c7c5391810191909152736b175474e89094c44da98b954eedeac495271d0f606082015273f629cbd94d3791c9250152bd8dfbdf380e2a3b9c608082015273dd974d5c2e2928dea5f71b9825b8b646686bd20060a082015273514910771af9ca656af840dff83e8264ecf986ca60c0820152730f5d2fb29fb7d3cfee444a200298f468908cc94260e0820152739f8f72aa9304c8b593d555f12ef6589cc3a579a261010082015273408e41876cccdc0f92210600ef50372656052a3861012082015273c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f6101408201527357ab1ec28d129707052df4df418d58a2d46d5f516101608201526e085d4780b73119b644ae5ecd22b376610180820152731f9840a85d5af5bf1d1762f925bdaddc4201f9846101a082015273a0b86991c6218b36c1d19d4a2e9eb0ce3606eb486101c082015273dac17f958d2ee523a2206206994597c13d831ec76101e0820152732260fac5e5542a773aa44fbcfedf7c193bc2c59961020082015273c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2610220820152730bc529c00c6401aef6d220be8c6ea1667f6ad93e61024082015273e41d2489571d322189246dafa5ebde1f4699f498610260820152738798249c2e607446efb7ad49ec89dd1865ff427261028082015273c4ad29ba4b3c580e6d59105fff484999997675ff6102a082015290565b6200064a6200091a565b50604080516103008101825260046102c08201818152634141564560e01b6102e084015282528251808401845260038082526210905560ea1b602083810191909152808501929092528451808601865283815263109554d160e21b8184015284860152845180860186528181526244414960e81b818401526060850152845180860186528181526222a72560e91b81840152608085015284518086018652818152624b4e4360e81b8184015260a085015284518086018652838152634c494e4b60e01b8184015260c085015284518086018652838152634d414e4160e01b8184015260e0850152845180860186528181526226a5a960e91b8184015261010085015284518086018652818152622922a760e91b8184015261012085015284518086018652818152620a69cb60eb1b81840152610140850152845180860186528381526314d554d160e21b818401526101608501528451808601865283815263151554d160e21b818401526101808501528451808601865281815262554e4960e81b818401526101a085015284518086018652838152635553444360e01b818401526101c085015284518086018652838152631554d11560e21b818401526101e085015284518086018652838152635742544360e01b8184015261020085015284518086018652928352630ae8aa8960e31b83830152610220840192909252835180850185528281526259464960e81b8183015261024084015283518085018552918252620b4a4b60eb1b8282015261026083019190915282518084018452600681526578535553484960d01b818301526102808301528251808401909352600a8352696372763363727970746f60b01b908301526102a081019190915290565b604051806102c001604052806016905b620008e462000943565b815260200190600190039081620008da5790505090565b604051806102c001604052806016906020820280368337509192915050565b604051806102c001604052806016905b60608152602001906001900390816200092a5790505090565b60405180608001604052806060815260200160008152602001620009666200097a565b815260200162000975620009ef565b905290565b604051806101a001604052806200099062000a17565b815260006020820181905260408201819052606082018190526080820181905260a0820181905260c0820181905260e0820181905261010082018190526101208201819052610140820181905261016082018190526101809091015290565b6040805160808101825260008082526020820181905291810182905290606082019062000975565b6040518060200160405280600081525090565b80516001600160a01b038116811462000a4257600080fd5b919050565b8051801515811462000a4257600080fd5b60006020828403121562000a6a578081fd5b62000a76602062000f70565b9151825250919050565b80516001600160801b038116811462000a4257600080fd5b805164ffffffffff8116811462000a4257600080fd5b805160ff8116811462000a4257600080fd5b60006020828403121562000ad2578081fd5b62000add8262000a2a565b9392505050565b60008060006060848603121562000af9578182fd5b62000b048462000a2a565b925062000b146020850162000a2a565b915062000b246040850162000aae565b90509250925092565b60006080828403121562000b3f578081fd5b62000b4b608062000f70565b62000b568362000aae565b815262000b666020840162000a47565b602082015262000b796040840162000a47565b604082015260608301516002811062000b90578283fd5b60608201529392505050565b60006101a080838503121562000bb0578182fd5b62000bbb8162000f70565b905062000bc9848462000a58565b815262000bd96020840162000a80565b602082015262000bec6040840162000a80565b604082015262000bff6060840162000a80565b606082015262000c126080840162000a80565b608082015262000c2560a0840162000a80565b60a082015262000c3860c0840162000a98565b60c082015262000c4b60e0840162000a2a565b60e082015261010062000c6081850162000a2a565b9082015261012062000c7484820162000a2a565b9082015261014062000c8884820162000a2a565b9082015261016062000c9c84820162000aae565b9082015261018062000cb084820162000aae565b908201529392505050565b60006020828403121562000ccd578081fd5b5051919050565b6001600160a01b03169052565b60ff815116825260208101511515602083015260408101511515604083015260608101516002811062000d2457634e487b7160e01b600052602160045260246000fd5b806060840152505050565b519052565b62000d4182825162000d2f565b602081015162000d55602084018262000e4b565b50604081015162000d6a604084018262000e4b565b50606081015162000d7f606084018262000e4b565b50608081015162000d94608084018262000e4b565b5060a081015162000da960a084018262000e4b565b5060c081015162000dbe60c084018262000e58565b5060e081015162000dd360e084018262000cd4565b506101008082015162000de98285018262000cd4565b50506101208082015162000e008285018262000cd4565b50506101408082015162000e178285018262000cd4565b50506101608082015162000e2e8285018262000e63565b50506101808082015162000e458285018262000e63565b50505050565b6001600160801b03169052565b64ffffffffff169052565b60ff169052565b6001600160a01b0391909116815260200190565b6001600160a01b0392909216825260ff16602082015260400190565b60208082526000906102e0830183820185845b601681101562000f6457601f198088860301845282516102608151818852805180838a01528a92505b8083101562000ef7578183018a015189840161028001529189019162000ed6565b8083111562000f0a578a610280828b0101525b898401518a8a01526040925082840151915062000f2a838a018362000d34565b6060840151935062000f416101e08a018562000ce1565b601f01909316969096016102800195505050918401919084019060010162000ead565b50919695505050505050565b6040518181016001600160401b038111828210171562000fa057634e487b7160e01b600052604160045260246000fd5b604052919050565b600060ff821660ff81141562000fcc57634e487b7160e01b82526011600452602482fd5b6001019291505056fe";