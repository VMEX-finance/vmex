/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { UiPoolDataProviderV2 } from "./UiPoolDataProviderV2";

export class UiPoolDataProviderV2Factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _networkBaseTokenPriceInUsdProxyAggregator: string,
    _marketReferenceCurrencyPriceInUsdProxyAggregator: string,
    overrides?: Overrides
  ): Promise<UiPoolDataProviderV2> {
    return super.deploy(
      _networkBaseTokenPriceInUsdProxyAggregator,
      _marketReferenceCurrencyPriceInUsdProxyAggregator,
      overrides || {}
    ) as Promise<UiPoolDataProviderV2>;
  }
  getDeployTransaction(
    _networkBaseTokenPriceInUsdProxyAggregator: string,
    _marketReferenceCurrencyPriceInUsdProxyAggregator: string,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(
      _networkBaseTokenPriceInUsdProxyAggregator,
      _marketReferenceCurrencyPriceInUsdProxyAggregator,
      overrides || {}
    );
  }
  attach(address: string): UiPoolDataProviderV2 {
    return super.attach(address) as UiPoolDataProviderV2;
  }
  connect(signer: Signer): UiPoolDataProviderV2Factory {
    return super.connect(signer) as UiPoolDataProviderV2Factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): UiPoolDataProviderV2 {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as UiPoolDataProviderV2;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IChainlinkAggregator",
        name: "_networkBaseTokenPriceInUsdProxyAggregator",
        type: "address",
      },
      {
        internalType: "contract IChainlinkAggregator",
        name: "_marketReferenceCurrencyPriceInUsdProxyAggregator",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ETH_CURRENCY_UNIT",
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
    name: "MKRAddress",
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
        name: "_bytes32",
        type: "bytes32",
      },
    ],
    name: "bytes32ToString",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ILendingPoolAddressesProvider",
        name: "provider",
        type: "address",
      },
    ],
    name: "getReservesData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "underlyingAsset",
            type: "address",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "symbol",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "decimals",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "baseLTVasCollateral",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserveLiquidationThreshold",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserveLiquidationBonus",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserveFactor",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "usageAsCollateralEnabled",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "borrowingEnabled",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "stableBorrowRateEnabled",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isFrozen",
            type: "bool",
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
            name: "liquidityRate",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "variableBorrowRate",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "stableBorrowRate",
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
            internalType: "uint256",
            name: "availableLiquidity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalPrincipalStableDebt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "averageStableRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "stableDebtLastUpdateTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalScaledVariableDebt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "priceInMarketReferenceCurrency",
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
        internalType: "struct IUiPoolDataProviderV2.AggregatedReserveData[]",
        name: "",
        type: "tuple[]",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "marketReferenceCurrencyUnit",
            type: "uint256",
          },
          {
            internalType: "int256",
            name: "marketReferenceCurrencyPriceInUsd",
            type: "int256",
          },
          {
            internalType: "int256",
            name: "networkBaseTokenPriceInUsd",
            type: "int256",
          },
          {
            internalType: "uint8",
            name: "networkBaseTokenPriceDecimals",
            type: "uint8",
          },
        ],
        internalType: "struct IUiPoolDataProviderV2.BaseCurrencyInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ILendingPoolAddressesProvider",
        name: "provider",
        type: "address",
      },
    ],
    name: "getReservesList",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ILendingPoolAddressesProvider",
        name: "provider",
        type: "address",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserReservesData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "underlyingAsset",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "scaledATokenBalance",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "usageAsCollateralEnabledOnUser",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "stableBorrowRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "scaledVariableDebt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "principalStableDebt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "stableBorrowLastUpdateTimestamp",
            type: "uint256",
          },
        ],
        internalType: "struct IUiPoolDataProviderV2.UserReserveData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "marketReferenceCurrencyPriceInUsdProxyAggregator",
    outputs: [
      {
        internalType: "contract IChainlinkAggregator",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "networkBaseTokenPriceInUsdProxyAggregator",
    outputs: [
      {
        internalType: "contract IChainlinkAggregator",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60c06040523480156200001157600080fd5b50604051620025ad380380620025ad833981016040819052620000349162000070565b6001600160601b0319606092831b8116608052911b1660a052620000a7565b80516001600160a01b03811681146200006b57600080fd5b919050565b6000806040838503121562000083578182fd5b6200008e8362000053565b91506200009e6020840162000053565b90509250929050565b60805160601c60a05160601c6124be620000ef60003960008181610b52015281816114f001526115ae01526000818161015f0152818161130701526113a101526124be6000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80639201de551161005b5780639201de55146101005780639dd9e2ce14610120578063d22cf68a14610128578063ec489c211461013057610088565b80630496f53a1461008d5780633c1740ed146100ab57806351974cc0146100c0578063586c1442146100e0575b600080fd5b610095610151565b6040516100a2919061234f565b60405180910390f35b6100b361015d565b6040516100a29190611faf565b6100d36100ce366004611cd8565b610181565b6040516100a291906122af565b6100f36100ee366004611cbc565b6108cd565b6040516100a29190611fdf565b61011361010e366004611c8c565b6109c2565b6040516100a2919061233c565b6100b3610b38565b6100b3610b50565b61014361013e366004611cbc565b610b74565b6040516100a292919061202c565b670de0b6b3a764000081565b7f000000000000000000000000000000000000000000000000000000000000000081565b60606000836001600160a01b0316630261bf8b6040518163ffffffff1660e01b815260040160206040518083038186803b1580156101be57600080fd5b505afa1580156101d2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101f69190611bb6565b90506000816001600160a01b031663d1946dbc6040518163ffffffff1660e01b815260040160006040518083038186803b15801561023357600080fd5b505afa158015610247573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261026f9190810190611bd9565b90506000826001600160a01b0316634417a583866040518263ffffffff1660e01b815260040161029f9190611faf565b60206040518083038186803b1580156102b757600080fd5b505afa1580156102cb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102ef9190611ea2565b905060006001600160a01b03861661030857600061030b565b82515b67ffffffffffffffff81111561033157634e487b7160e01b600052604160045260246000fd5b60405190808252806020026020018201604052801561036a57816020015b61035761195b565b81526020019060019003908161034f5790505b50905060005b83518110156108c2576000610386600383612424565b90506000866001600160a01b0316633629e3cd8785815181106103b957634e487b7160e01b600052603260045260246000fd5b6020026020010151846040518363ffffffff1660e01b81526004016103df929190611fc3565b6101a06040518083038186803b1580156103f857600080fd5b505afa15801561040c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104309190611da0565b90508160ff1681610180015160ff161461045a57634e487b7160e01b600052600160045260246000fd5b85838151811061047a57634e487b7160e01b600052603260045260246000fd5b60200260200101518484815181106104a257634e487b7160e01b600052603260045260246000fd5b60209081029190910101516001600160a01b03918216905260e0820151604051630ed1279f60e11b8152911690631da24f3e906104e3908c90600401611faf565b60206040518083038186803b1580156104fb57600080fd5b505afa15801561050f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105339190611ca4565b84848151811061055357634e487b7160e01b600052603260045260246000fd5b602090810291909101810151015261056b8584611661565b84848151811061058b57634e487b7160e01b600052603260045260246000fd5b60209081029190910101519015156040909101526105a985846116d0565b156108ad578061012001516001600160a01b0316631da24f3e8a6040518263ffffffff1660e01b81526004016105df9190611faf565b60206040518083038186803b1580156105f757600080fd5b505afa15801561060b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061062f9190611ca4565b84848151811061064f57634e487b7160e01b600052603260045260246000fd5b602002602001015160800181815250508061010001516001600160a01b031663c634dfaa8a6040518263ffffffff1660e01b81526004016106909190611faf565b60206040518083038186803b1580156106a857600080fd5b505afa1580156106bc573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106e09190611ca4565b84848151811061070057634e487b7160e01b600052603260045260246000fd5b602002602001015160a001818152505083838151811061073057634e487b7160e01b600052603260045260246000fd5b602002602001015160a001516000146108ad578061010001516001600160a01b031663e78c9b3b8a6040518263ffffffff1660e01b81526004016107749190611faf565b60206040518083038186803b15801561078c57600080fd5b505afa1580156107a0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107c49190611ca4565b8484815181106107e457634e487b7160e01b600052603260045260246000fd5b602002602001015160600181815250508061010001516001600160a01b03166379ce6b8c8a6040518263ffffffff1660e01b81526004016108259190611faf565b60206040518083038186803b15801561083d57600080fd5b505afa158015610851573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108759190611efb565b64ffffffffff1684848151811061089c57634e487b7160e01b600052603260045260246000fd5b602002602001015160c00181815250505b505080806108ba906123e9565b915050610370565b509695505050505050565b60606000826001600160a01b0316630261bf8b6040518163ffffffff1660e01b815260040160206040518083038186803b15801561090a57600080fd5b505afa15801561091e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109429190611bb6565b9050806001600160a01b031663d1946dbc6040518163ffffffff1660e01b815260040160006040518083038186803b15801561097d57600080fd5b505afa158015610991573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526109b99190810190611bd9565b9150505b919050565b606060005b60208160ff16108015610a095750828160ff16602081106109f857634e487b7160e01b600052603260045260246000fd5b1a60f81b6001600160f81b03191615155b15610a205780610a1881612404565b9150506109c7565b60008160ff1667ffffffffffffffff811115610a4c57634e487b7160e01b600052604160045260246000fd5b6040519080825280601f01601f191660200182016040528015610a76576020820181803683370190505b509050600091505b60208260ff16108015610ac05750838260ff1660208110610aaf57634e487b7160e01b600052603260045260246000fd5b1a60f81b6001600160f81b03191615155b156109b957838260ff1660208110610ae857634e487b7160e01b600052603260045260246000fd5b1a60f81b818360ff1681518110610b0f57634e487b7160e01b600052603260045260246000fd5b60200101906001600160f81b031916908160001a90535081610b3081612404565b925050610a7e565b739f8f72aa9304c8b593d555f12ef6589cc3a579a281565b7f000000000000000000000000000000000000000000000000000000000000000081565b6060610b7e6119a3565b6000836001600160a01b031663f139dc816040518163ffffffff1660e01b815260040160206040518083038186803b158015610bb957600080fd5b505afa158015610bcd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bf19190611bb6565b90506000846001600160a01b0316630261bf8b6040518163ffffffff1660e01b815260040160206040518083038186803b158015610c2e57600080fd5b505afa158015610c42573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c669190611bb6565b90506000816001600160a01b031663d1946dbc6040518163ffffffff1660e01b815260040160006040518083038186803b158015610ca357600080fd5b505afa158015610cb7573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610cdf9190810190611bd9565b90506000815167ffffffffffffffff811115610d0b57634e487b7160e01b600052604160045260246000fd5b604051908082528060200260200182016040528015610d4457816020015b610d316119ce565b815260200190600190039081610d295790505b50905060005b82518110156112fc576000828281518110610d7557634e487b7160e01b600052603260045260246000fd5b60200260200101519050838281518110610d9f57634e487b7160e01b600052603260045260246000fd5b60209081029190910101516001600160a01b031681526000610dc2600384612424565b8251604051633629e3cd60e01b81529192506000916001600160a01b03891691633629e3cd91610df791908690600401611fc3565b6101a06040518083038186803b158015610e1057600080fd5b505afa158015610e24573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e489190611da0565b90508160ff1681610180015160ff1614610e7257634e487b7160e01b600052600160045260246000fd5b60208101516001600160801b039081166101a085015260408083015182166101c0860152606083015182166101e08601526080830151821661020086015260a083015190911661022085015260c082015164ffffffffff1661024085015260e08201516001600160a01b03908116610260860152610100830151811661028086015261012083015181166102a086015261014083015181166102c08601528451915163b3596f0760e01b8152908a169163b3596f0791610f359190600401611faf565b60206040518083038186803b158015610f4d57600080fd5b505afa158015610f61573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f859190611ca4565b61038084015282516102608401516040516370a0823160e01b81526001600160a01b03909216916370a0823191610fbe91600401611faf565b60206040518083038186803b158015610fd657600080fd5b505afa158015610fea573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061100e9190611ca4565b836102e00181815250508261028001516001600160a01b031663797743386040518163ffffffff1660e01b815260040160806040518083038186803b15801561105657600080fd5b505afa15801561106a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061108e9190611ebd565b64ffffffffff16610340870152610320860152506103008401526102a08301516040805163b1bf962d60e01b815290516001600160a01b039092169163b1bf962d91600480820192602092909190829003018186803b1580156110f057600080fd5b505afa158015611104573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111289190611ca4565b61036084015282516001600160a01b0316739f8f72aa9304c8b593d555f12ef6589cc3a579a214156111e157600083600001516001600160a01b03166395d89b416040518163ffffffff1660e01b815260040160206040518083038186803b15801561119357600080fd5b505afa1580156111a7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906111cb9190611ca4565b90506111d6816109c2565b604085015250611260565b82600001516001600160a01b03166395d89b416040518163ffffffff1660e01b815260040160006040518083038186803b15801561121e57600080fd5b505afa158015611232573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261125a9190810190611d10565b60408401525b805161126b9061171b565b60e0880152606087015260c086015260a08501526080840152805161128f90611746565b1515610140870152151561012086015215156101808501521515610160840152608083015115156101008401526102c08301516112cb90611782565b6104008701526103e08601526103c08501526103a090930192909252508190506112f4816123e9565b915050610d4a565b506113056119a3565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166350d25bcd6040518163ffffffff1660e01b815260040160206040518083038186803b15801561135e57600080fd5b505afa158015611372573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113969190611ca4565b8160400181815250507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663313ce5676040518163ffffffff1660e01b815260040160206040518083038186803b1580156113f857600080fd5b505afa15801561140c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114309190611f15565b60ff16606082015260408051638c89b64f60e01b815290516001600160a01b03871691638c89b64f916004808301926020929190829003018186803b15801561147857600080fd5b505afa9250505080156114a8575060408051601f3d908101601f191682019092526114a591810190611ca4565b60015b61158a573d8080156114d6576040519150601f19603f3d011682016040523d82523d6000602084013e6114db565b606091505b50670de0b6b3a76400008260000181815250507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166350d25bcd6040518163ffffffff1660e01b815260040160206040518083038186803b15801561154757600080fd5b505afa15801561155b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061157f9190611ca4565b602083015250611654565b80670de0b6b3a7640000141561164757670de0b6b3a76400008260000181815250507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166350d25bcd6040518163ffffffff1660e01b815260040160206040518083038186803b15801561160557600080fd5b505afa158015611619573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061163d9190611ca4565b6020830152611652565b808252602082018190525b505b9095509350505050915091565b60006080821060405180604001604052806002815260200161373760f01b815250906116a95760405162461bcd60e51b81526004016116a0919061233c565b60405180910390fd5b506116b582600261239a565b6116c0906001612382565b925190921c600116151592915050565b60006080821060405180604001604052806002815260200161373760f01b8152509061170f5760405162461bcd60e51b81526004016116a0919061233c565b506116c082600261239a565b5161ffff80821692601083901c821692602081901c831692603082901c60ff169260409290921c1690565b51670100000000000000811615159167020000000000000082161515916704000000000000008116151591670800000000000000909116151590565b600080600080846001600160a01b0316637b832f586040518163ffffffff1660e01b815260040160206040518083038186803b1580156117c157600080fd5b505afa1580156117d5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117f99190611ca4565b856001600160a01b03166365614f816040518163ffffffff1660e01b815260040160206040518083038186803b15801561183257600080fd5b505afa158015611846573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061186a9190611ca4565b866001600160a01b0316630bdf953f6040518163ffffffff1660e01b815260040160206040518083038186803b1580156118a357600080fd5b505afa1580156118b7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118db9190611ca4565b876001600160a01b031663ccab01a36040518163ffffffff1660e01b815260040160206040518083038186803b15801561191457600080fd5b505afa158015611928573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061194c9190611ca4565b93509350935093509193509193565b6040518060e0016040528060006001600160a01b0316815260200160008152602001600015158152602001600081526020016000815260200160008152602001600081525090565b6040518060800160405280600081526020016000815260200160008152602001600060ff1681525090565b60405180610420016040528060006001600160a01b031681526020016060815260200160608152602001600081526020016000815260200160008152602001600081526020016000815260200160001515815260200160001515815260200160001515815260200160001515815260200160001515815260200160006001600160801b0316815260200160006001600160801b0316815260200160006001600160801b0316815260200160006001600160801b0316815260200160006001600160801b03168152602001600064ffffffffff16815260200160006001600160a01b0316815260200160006001600160a01b0316815260200160006001600160a01b0316815260200160006001600160a01b03168152602001600081526020016000815260200160008152602001600081526020016000815260200160008152602001600081526020016000815260200160008152602001600081525090565b80516109bd81612470565b600060208284031215611b49578081fd5b6040516020810181811067ffffffffffffffff82111715611b6c57611b6c61245a565b6040529151825250919050565b80516001600160801b03811681146109bd57600080fd5b805164ffffffffff811681146109bd57600080fd5b805160ff811681146109bd57600080fd5b600060208284031215611bc7578081fd5b8151611bd281612470565b9392505050565b60006020808385031215611beb578182fd5b825167ffffffffffffffff80821115611c02578384fd5b818501915085601f830112611c15578384fd5b815181811115611c2757611c2761245a565b8381029150611c37848301612358565b8181528481019084860184860187018a1015611c51578788fd5b8795505b83861015611c7f5780519450611c6a85612470565b84835260019590950194918601918601611c55565b5098975050505050505050565b600060208284031215611c9d578081fd5b5035919050565b600060208284031215611cb5578081fd5b5051919050565b600060208284031215611ccd578081fd5b8135611bd281612470565b60008060408385031215611cea578081fd5b8235611cf581612470565b91506020830135611d0581612470565b809150509250929050565b600060208284031215611d21578081fd5b815167ffffffffffffffff80821115611d38578283fd5b818401915084601f830112611d4b578283fd5b815181811115611d5d57611d5d61245a565b611d70601f8201601f1916602001612358565b9150808252856020828501011115611d86578384fd5b611d978160208401602086016123b9565b50949350505050565b60006101a0808385031215611db3578182fd5b611dbc81612358565b9050611dc88484611b38565b8152611dd660208401611b79565b6020820152611de760408401611b79565b6040820152611df860608401611b79565b6060820152611e0960808401611b79565b6080820152611e1a60a08401611b79565b60a0820152611e2b60c08401611b90565b60c0820152611e3c60e08401611b2d565b60e0820152610100611e4f818501611b2d565b90820152610120611e61848201611b2d565b90820152610140611e73848201611b2d565b90820152610160611e85848201611ba5565b90820152610180611e97848201611ba5565b908201529392505050565b600060208284031215611eb3578081fd5b611bd28383611b38565b60008060008060808587031215611ed2578182fd5b845193506020850151925060408501519150611ef060608601611b90565b905092959194509250565b600060208284031215611f0c578081fd5b611bd282611b90565b600060208284031215611f26578081fd5b611bd282611ba5565b6001600160a01b03169052565b15159052565b60008151808452611f5a8160208601602086016123b9565b601f01601f19169290920160200192915050565b80518252602081015160208301526040810151604083015260ff60608201511660608301525050565b6001600160801b03169052565b64ffffffffff169052565b6001600160a01b0391909116815260200190565b6001600160a01b0392909216825260ff16602082015260400190565b6020808252825182820181905260009190848201906040850190845b818110156120205783516001600160a01b031683529284019291840191600101611ffb565b50909695505050505050565b60a080825283518282018190526000919060c09081850190602080820287018401818a01875b848110156122915760bf198a84030186528151610420612073858351611f2f565b85820151818787015261208882870182611f42565b915050604080830151868303828801526120a28382611f42565b9250505060608083015181870152506080808301518187015250898201518a860152888201518986015260e0808301518187015250610100808301516120ea82880182611f3c565b5050610120808301516120ff82880182611f3c565b50506101408083015161211482880182611f3c565b50506101608083015161212982880182611f3c565b50506101808083015161213e82880182611f3c565b50506101a08083015161215382880182611f97565b50506101c08083015161216882880182611f97565b50506101e08083015161217d82880182611f97565b50506102008083015161219282880182611f97565b5050610220808301516121a782880182611f97565b5050610240808301516121bc82880182611fa4565b5050610260808301516121d182880182611f2f565b5050610280808301516121e682880182611f2f565b50506102a0808301516121fb82880182611f2f565b50506102c08083015161221082880182611f2f565b50506102e08281015190860152610300808301519086015261032080830151908601526103408083015190860152610360808301519086015261038080830151908601526103a080830151908601526103c080830151908601526103e080830151908601526104009182015191909401529483019490830190600101612052565b5050809650506122a381880189611f6e565b50505050509392505050565b602080825282518282018190526000919060409081850190868401855b8281101561232f57815180516001600160a01b03168552868101518786015285810151151586860152606080820151908601526080808201519086015260a0808201519086015260c0908101519085015260e090930192908501906001016122cc565b5091979650505050505050565b600060208252611bd26020830184611f42565b90815260200190565b60405181810167ffffffffffffffff8111828210171561237a5761237a61245a565b604052919050565b6000821982111561239557612395612444565b500190565b60008160001904831182151516156123b4576123b4612444565b500290565b60005b838110156123d45781810151838201526020016123bc565b838111156123e3576000848401525b50505050565b60006000198214156123fd576123fd612444565b5060010190565b600060ff821660ff81141561241b5761241b612444565b60010192915050565b60008261243f57634e487b7160e01b81526012600452602481fd5b500690565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b038116811461248557600080fd5b5056fea2646970667358221220f5bd182a099569fdb5797d659cdd088ace7026f97f47fc58be60a41403aeae5d64736f6c63430008000033";