/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { UiPoolDataProviderV2V3 } from "./UiPoolDataProviderV2V3";

export class UiPoolDataProviderV2V3Factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _networkBaseTokenPriceInUsdProxyAggregator: string,
    _marketReferenceCurrencyPriceInUsdProxyAggregator: string,
    overrides?: Overrides
  ): Promise<UiPoolDataProviderV2V3> {
    return super.deploy(
      _networkBaseTokenPriceInUsdProxyAggregator,
      _marketReferenceCurrencyPriceInUsdProxyAggregator,
      overrides || {}
    ) as Promise<UiPoolDataProviderV2V3>;
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
  attach(address: string): UiPoolDataProviderV2V3 {
    return super.attach(address) as UiPoolDataProviderV2V3;
  }
  connect(signer: Signer): UiPoolDataProviderV2V3Factory {
    return super.connect(signer) as UiPoolDataProviderV2V3Factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): UiPoolDataProviderV2V3 {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as UiPoolDataProviderV2V3;
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
      {
        internalType: "uint64",
        name: "trancheId",
        type: "uint64",
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
          {
            internalType: "bool",
            name: "isPaused",
            type: "bool",
          },
          {
            internalType: "uint128",
            name: "accruedToTreasury",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "unbacked",
            type: "uint128",
          },
          {
            internalType: "uint128",
            name: "isolationModeTotalDebt",
            type: "uint128",
          },
          {
            internalType: "uint256",
            name: "debtCeiling",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "debtCeilingDecimals",
            type: "uint256",
          },
          {
            internalType: "uint8",
            name: "eModeCategoryId",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "borrowCap",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "supplyCap",
            type: "uint256",
          },
          {
            internalType: "uint16",
            name: "eModeLtv",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "eModeLiquidationThreshold",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "eModeLiquidationBonus",
            type: "uint16",
          },
          {
            internalType: "address",
            name: "eModePriceSource",
            type: "address",
          },
          {
            internalType: "string",
            name: "eModeLabel",
            type: "string",
          },
          {
            internalType: "bool",
            name: "borrowableInIsolation",
            type: "bool",
          },
        ],
        internalType: "struct IUiPoolDataProviderV3.AggregatedReserveData[]",
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
        internalType: "struct IUiPoolDataProviderV3.BaseCurrencyInfo",
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
      {
        internalType: "uint64",
        name: "trancheId",
        type: "uint64",
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
        internalType: "uint64",
        name: "trancheId",
        type: "uint64",
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
        internalType: "struct IUiPoolDataProviderV3.UserReserveData[]",
        name: "",
        type: "tuple[]",
      },
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
  "0x60c06040523480156200001157600080fd5b506040516200292f3803806200292f833981016040819052620000349162000070565b6001600160601b0319606092831b8116608052911b1660a052620000a7565b80516001600160a01b03811681146200006b57600080fd5b919050565b6000806040838503121562000083578182fd5b6200008e8362000053565b91506200009e6020840162000053565b90509250929050565b60805160601c60a05160601c612840620000ef6000396000818161136601528181611424015261179301526000818161110d015281816111a701526114d901526128406000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80635ae18ec81161005b5780635ae18ec8146101025780639201de55146101225780639dd9e2ce14610142578063d22cf68a1461014a57610088565b80630496f53a1461008d57806315dd8963146100ab57806336aa379d146100cc5780633c1740ed146100ed575b600080fd5b610095610152565b6040516100a291906126c9565b60405180910390f35b6100be6100b9366004611e88565b61015e565b6040516100a29291906125fd565b6100df6100da366004611e50565b6108b7565b6040516100a292919061225d565b6100f56114d7565b6040516100a291906121da565b610115610110366004611e50565b6114fb565b6040516100a29190612210565b610135610130366004611e20565b6115fb565b6040516100a291906126b6565b6100f5611779565b6100f5611791565b670de0b6b3a764000081565b6060600080856001600160a01b0316630261bf8b6040518163ffffffff1660e01b815260040160206040518083038186803b15801561019c57600080fd5b505afa1580156101b0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d49190611d4b565b90506000816001600160a01b03166313f9cf37876040518263ffffffff1660e01b815260040161020491906126d2565b60006040518083038186803b15801561021c57600080fd5b505afa158015610230573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526102589190810190611d6e565b90506000826001600160a01b031663e87549f487896040518363ffffffff1660e01b815260040161028a9291906121ee565b60206040518083038186803b1580156102a257600080fd5b505afa1580156102b6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102da91906120be565b905060006001600160a01b0387166102f35760006102f6565b82515b6001600160401b0381111561031b57634e487b7160e01b600052604160045260246000fd5b60405190808252806020026020018201604052801561035457816020015b610341611aaf565b8152602001906001900390816103395790505b50905060005b83518110156108a7576000856001600160a01b0316637ba497fe86848151811061039457634e487b7160e01b600052603260045260246000fd5b60200260200101518c6040518363ffffffff1660e01b81526004016103ba9291906121ee565b6102206040518083038186803b1580156103d357600080fd5b505afa1580156103e7573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061040b9190611f80565b9050896001600160401b03168161018001516001600160401b03161461044157634e487b7160e01b600052600160045260246000fd5b84828151811061046157634e487b7160e01b600052603260045260246000fd5b602002602001015183838151811061048957634e487b7160e01b600052603260045260246000fd5b60209081029190910101516001600160a01b03918216905260e0820151604051630ed1279f60e11b8152911690631da24f3e906104ca908c906004016121da565b60206040518083038186803b1580156104e257600080fd5b505afa1580156104f6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061051a9190611e38565b83838151811061053a57634e487b7160e01b600052603260045260246000fd5b602090810291909101810151015261055284836117b5565b83838151811061057257634e487b7160e01b600052603260045260246000fd5b60209081029190910101519015156040909101526105908483611824565b15610894578061012001516001600160a01b0316631da24f3e8a6040518263ffffffff1660e01b81526004016105c691906121da565b60206040518083038186803b1580156105de57600080fd5b505afa1580156105f2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106169190611e38565b83838151811061063657634e487b7160e01b600052603260045260246000fd5b602002602001015160800181815250508061010001516001600160a01b031663c634dfaa8a6040518263ffffffff1660e01b815260040161067791906121da565b60206040518083038186803b15801561068f57600080fd5b505afa1580156106a3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106c79190611e38565b8383815181106106e757634e487b7160e01b600052603260045260246000fd5b602002602001015160a001818152505082828151811061071757634e487b7160e01b600052603260045260246000fd5b602002602001015160a00151600014610894578061010001516001600160a01b031663e78c9b3b8a6040518263ffffffff1660e01b815260040161075b91906121da565b60206040518083038186803b15801561077357600080fd5b505afa158015610787573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107ab9190611e38565b8383815181106107cb57634e487b7160e01b600052603260045260246000fd5b602002602001015160600181815250508061010001516001600160a01b03166379ce6b8c8a6040518263ffffffff1660e01b815260040161080c91906121da565b60206040518083038186803b15801561082457600080fd5b505afa158015610838573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061085c9190612117565b64ffffffffff1683838151811061088357634e487b7160e01b600052603260045260246000fd5b602002602001015160c00181815250505b508061089f81612776565b91505061035a565b5098600098509650505050505050565b60606108c1611af7565b6000846001600160a01b0316630261bf8b6040518163ffffffff1660e01b815260040160206040518083038186803b1580156108fc57600080fd5b505afa158015610910573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109349190611d4b565b90506000816001600160a01b03166313f9cf37866040518263ffffffff1660e01b815260040161096491906126d2565b60006040518083038186803b15801561097c57600080fd5b505afa158015610990573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526109b89190810190611d6e565b9050600081516001600160401b038111156109e357634e487b7160e01b600052604160045260246000fd5b604051908082528060200260200182016040528015610a1c57816020015b610a09611b22565b815260200190600190039081610a015790505b50905060005b8251811015611102576000828281518110610a4d57634e487b7160e01b600052603260045260246000fd5b60200260200101519050838281518110610a7757634e487b7160e01b600052603260045260246000fd5b602002602001015181600001906001600160a01b031690816001600160a01b0316815250506000896001600160a01b0316631a9dffb3876001600160a01b0316631652e7b7888781518110610adc57634e487b7160e01b600052603260045260246000fd5b60200260200101516040518263ffffffff1660e01b8152600401610b0091906121da565b60206040518083038186803b158015610b1857600080fd5b505afa158015610b2c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b509190611ed2565b6040518263ffffffff1660e01b8152600401610b6c919061268e565b60206040518083038186803b158015610b8457600080fd5b505afa158015610b98573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bbc9190611d4b565b8251604051633dd24bff60e11b81529192506000916001600160a01b03891691637ba497fe91610bf191908e906004016121ee565b6102206040518083038186803b158015610c0a57600080fd5b505afa158015610c1e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c429190611f80565b9050896001600160401b03168161018001516001600160401b031614610c7857634e487b7160e01b600052600160045260246000fd5b60208101516001600160801b039081166101a085015260408083015182166101c0860152606083015182166101e08601526080830151821661020086015260a083015190911661022085015260c082015164ffffffffff1661024085015260e08201516001600160a01b03908116610260860152610100830151811661028086015261012083015181166102a086015261014083015181166102c08601528451915163b3596f0760e01b81529084169163b3596f0791610d3b91906004016121da565b60206040518083038186803b158015610d5357600080fd5b505afa158015610d67573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d8b9190611e38565b61038084015282516102608401516040516370a0823160e01b81526001600160a01b03909216916370a0823191610dc4916004016121da565b60206040518083038186803b158015610ddc57600080fd5b505afa158015610df0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e149190611e38565b836102e00181815250508261028001516001600160a01b031663797743386040518163ffffffff1660e01b815260040160806040518083038186803b158015610e5c57600080fd5b505afa158015610e70573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e9491906120d9565b64ffffffffff16610340870152610320860152506103008401526102a08301516040805163b1bf962d60e01b815290516001600160a01b039092169163b1bf962d91600480820192602092909190829003018186803b158015610ef657600080fd5b505afa158015610f0a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f2e9190611e38565b61036084015282516001600160a01b0316739f8f72aa9304c8b593d555f12ef6589cc3a579a21415610fe757600083600001516001600160a01b03166395d89b416040518163ffffffff1660e01b815260040160206040518083038186803b158015610f9957600080fd5b505afa158015610fad573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fd19190611e38565b9050610fdc816115fb565b604085015250611066565b82600001516001600160a01b03166395d89b416040518163ffffffff1660e01b815260040160006040518083038186803b15801561102457600080fd5b505afa158015611038573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526110609190810190611ef1565b60408401525b80516110719061186f565b60e0880152606087015260c086015260a0850152608084015280516110959061189a565b1515610140870152151561012086015215156101808501521515610160840152608083015115156101008401526102c08301516110d1906118d6565b6104008701526103e08601526103c08501526103a090930192909252508190506110fa81612776565b915050610a22565b5061110b611af7565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166350d25bcd6040518163ffffffff1660e01b815260040160206040518083038186803b15801561116457600080fd5b505afa158015611178573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061119c9190611e38565b8160400181815250507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663313ce5676040518163ffffffff1660e01b815260040160206040518083038186803b1580156111fe57600080fd5b505afa158015611212573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112369190612131565b60ff1660608201526040805163f139dc8160e01b815290516001600160a01b038a169163f139dc81916004808301926020929190829003018186803b15801561127e57600080fd5b505afa158015611292573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112b69190611d4b565b6001600160a01b0316638c89b64f6040518163ffffffff1660e01b815260040160206040518083038186803b1580156112ee57600080fd5b505afa92505050801561131e575060408051601f3d908101601f1916820190925261131b91810190611e38565b60015b611400573d80801561134c576040519150601f19603f3d011682016040523d82523d6000602084013e611351565b606091505b50670de0b6b3a76400008260000181815250507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166350d25bcd6040518163ffffffff1660e01b815260040160206040518083038186803b1580156113bd57600080fd5b505afa1580156113d1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113f59190611e38565b6020830152506114ca565b80670de0b6b3a764000014156114bd57670de0b6b3a76400008260000181815250507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166350d25bcd6040518163ffffffff1660e01b815260040160206040518083038186803b15801561147b57600080fd5b505afa15801561148f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114b39190611e38565b60208301526114c8565b808252602082018190525b505b9097909650945050505050565b7f000000000000000000000000000000000000000000000000000000000000000081565b60606000836001600160a01b0316630261bf8b6040518163ffffffff1660e01b815260040160206040518083038186803b15801561153857600080fd5b505afa15801561154c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115709190611d4b565b6040516313f9cf3760e01b81529091506001600160a01b038216906313f9cf379061159f9086906004016126d2565b60006040518083038186803b1580156115b757600080fd5b505afa1580156115cb573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526115f39190810190611d6e565b949350505050565b606060005b60208160ff161080156116425750828160ff166020811061163157634e487b7160e01b600052603260045260246000fd5b1a60f81b6001600160f81b03191615155b15611659578061165181612791565b915050611600565b60008160ff166001600160401b0381111561168457634e487b7160e01b600052604160045260246000fd5b6040519080825280601f01601f1916602001820160405280156116ae576020820181803683370190505b509050600091505b60208260ff161080156116f85750838260ff16602081106116e757634e487b7160e01b600052603260045260246000fd5b1a60f81b6001600160f81b03191615155b1561177057838260ff166020811061172057634e487b7160e01b600052603260045260246000fd5b1a60f81b818360ff168151811061174757634e487b7160e01b600052603260045260246000fd5b60200101906001600160f81b031916908160001a9053508161176881612791565b9250506116b6565b9150505b919050565b739f8f72aa9304c8b593d555f12ef6589cc3a579a281565b7f000000000000000000000000000000000000000000000000000000000000000081565b60006080821060405180604001604052806002815260200161373760f01b815250906117fd5760405162461bcd60e51b81526004016117f491906126b6565b60405180910390fd5b50611809826002612727565b61181490600161270f565b925190921c600116151592915050565b60006080821060405180604001604052806002815260200161373760f01b815250906118635760405162461bcd60e51b81526004016117f491906126b6565b50611814826002612727565b5161ffff80821692601083901c821692602081901c831692603082901c60ff169260409290921c1690565b51670100000000000000811615159167020000000000000082161515916704000000000000008116151591670800000000000000909116151590565b600080600080846001600160a01b0316637b832f586040518163ffffffff1660e01b815260040160206040518083038186803b15801561191557600080fd5b505afa158015611929573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061194d9190611e38565b856001600160a01b03166365614f816040518163ffffffff1660e01b815260040160206040518083038186803b15801561198657600080fd5b505afa15801561199a573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119be9190611e38565b866001600160a01b0316630bdf953f6040518163ffffffff1660e01b815260040160206040518083038186803b1580156119f757600080fd5b505afa158015611a0b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611a2f9190611e38565b876001600160a01b031663ccab01a36040518163ffffffff1660e01b815260040160206040518083038186803b158015611a6857600080fd5b505afa158015611a7c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611aa09190611e38565b93509350935093509193509193565b6040518060e0016040528060006001600160a01b0316815260200160008152602001600015158152602001600081526020016000815260200160008152602001600081525090565b6040518060800160405280600081526020016000815260200160008152602001600060ff1681525090565b604080516106008101825260008082526060602083018190529282018390528282018190526080820181905260a0820181905260c0820181905260e08201819052610100820181905261012082018190526101408201819052610160820181905261018082018190526101a082018190526101c082018190526101e08201819052610200820181905261022082018190526102408201819052610260820181905261028082018190526102a082018190526102c082018190526102e08201819052610300820181905261032082018190526103408201819052610360820181905261038082018190526103a082018190526103c082018190526103e08201819052610400820181905261042082018190526104408201819052610460820181905261048082018190526104a082018190526104c082018190526104e08201819052610500820181905261052082018190526105408201819052610560820181905261058082018190526105a082018190526105c08201929092526105e081019190915290565b8051611774816127dd565b8051801515811461177457600080fd5b600060208284031215611cd4578081fd5b604051602081018181106001600160401b0382111715611cf657611cf66127c7565b6040529151825250919050565b80516001600160801b038116811461177457600080fd5b805164ffffffffff8116811461177457600080fd5b8051611774816127f5565b805160ff8116811461177457600080fd5b600060208284031215611d5c578081fd5b8151611d67816127dd565b9392505050565b60006020808385031215611d80578182fd5b82516001600160401b0380821115611d96578384fd5b818501915085601f830112611da9578384fd5b815181811115611dbb57611dbb6127c7565b8381029150611dcb8483016126e6565b8181528481019084860184860187018a1015611de5578788fd5b8795505b83861015611e135780519450611dfe856127dd565b84835260019590950194918601918601611de9565b5098975050505050505050565b600060208284031215611e31578081fd5b5035919050565b600060208284031215611e49578081fd5b5051919050565b60008060408385031215611e62578081fd5b8235611e6d816127dd565b91506020830135611e7d816127f5565b809150509250929050565b600080600060608486031215611e9c578081fd5b8335611ea7816127dd565b92506020840135611eb7816127f5565b91506040840135611ec7816127dd565b809150509250925092565b600060208284031215611ee3578081fd5b815160028110611d67578182fd5b600060208284031215611f02578081fd5b81516001600160401b0380821115611f18578283fd5b818401915084601f830112611f2b578283fd5b815181811115611f3d57611f3d6127c7565b611f50601f8201601f19166020016126e6565b9150808252856020828501011115611f66578384fd5b611f77816020840160208601612746565b50949350505050565b6000610220808385031215611f93578182fd5b611f9c816126e6565b9050611fa88484611cc3565b8152611fb660208401611d03565b6020820152611fc760408401611d03565b6040820152611fd860608401611d03565b6060820152611fe960808401611d03565b6080820152611ffa60a08401611d03565b60a082015261200b60c08401611d1a565b60c082015261201c60e08401611ca8565b60e082015261010061202f818501611ca8565b90820152610120612041848201611ca8565b90820152610140612053848201611ca8565b90820152610160612065848201611d3a565b90820152610180612077848201611d2f565b908201526101a083810151908201526101c0612094818501611cb3565b908201526101e06120a6848201611cb3565b90820152610200928301519281019290925250919050565b6000602082840312156120cf578081fd5b611d678383611cc3565b600080600080608085870312156120ee578182fd5b84519350602085015192506040850151915061210c60608601611d1a565b905092959194509250565b600060208284031215612128578081fd5b611d6782611d1a565b600060208284031215612142578081fd5b611d6782611d3a565b6001600160a01b03169052565b15159052565b60008151808452612176816020860160208601612746565b601f01601f19169290920160200192915050565b80518252602081015160208301526040810151604083015260ff60608201511660608301525050565b6001600160801b03169052565b61ffff169052565b64ffffffffff169052565b60ff169052565b6001600160a01b0391909116815260200190565b6001600160a01b039290921682526001600160401b0316602082015260400190565b6020808252825182820181905260009190848201906040850190845b818110156122515783516001600160a01b03168352928401929184019160010161222c565b50909695505050505050565b60a080825283518282018190526000919060c09081850190602080820287018401818a01875b848110156125df5760bf198a840301865281516106006122a485835161214b565b8582015181878701526122b98287018261215e565b915050604080830151868303828801526122d3838261215e565b9250505060608083015181870152506080808301518187015250898201518a860152888201518986015260e08083015181870152506101008083015161231b82880182612158565b50506101208083015161233082880182612158565b50506101408083015161234582880182612158565b50506101608083015161235a82880182612158565b50506101808083015161236f82880182612158565b50506101a080830151612384828801826121b3565b50506101c080830151612399828801826121b3565b50506101e0808301516123ae828801826121b3565b5050610200808301516123c3828801826121b3565b5050610220808301516123d8828801826121b3565b5050610240808301516123ed828801826121c8565b5050610260808301516124028288018261214b565b5050610280808301516124178288018261214b565b50506102a08083015161242c8288018261214b565b50506102c0808301516124418288018261214b565b50506102e08281015190860152610300808301519086015261032080830151908601526103408083015190860152610360808301519086015261038080830151908601526103a080830151908601526103c080830151908601526103e080830151908601526104008083015190860152610420808301516124c482880182612158565b5050610440808301516124d9828801826121b3565b5050610460808301516124ee828801826121b3565b505061048080830151612503828801826121b3565b50506104a082810151908601526104c080830151908601526104e08083015161252e828801826121d3565b50506105008281015190860152610520808301519086015261054080830151612559828801826121c0565b50506105608083015161256e828801826121c0565b505061058080830151612583828801826121c0565b50506105a0808301516125988288018261214b565b50506105c080830151868303828801526125b2838261215e565b925050506105e08083015192506125cb81870184612158565b509685019693505090830190600101612283565b5050809650506125f18188018961218a565b50505050509392505050565b6040808252835182820181905260009190606090818501906020808901865b8381101561267d57815180516001600160a01b0316865283810151848701528781015115158887015286810151878701526080808201519087015260a0808201519087015260c0908101519086015260e0909401939082019060010161261c565b50508295506125f1818801896121d3565b60208101600283106126b057634e487b7160e01b600052602160045260246000fd5b91905290565b600060208252611d67602083018461215e565b90815260200190565b6001600160401b0391909116815260200190565b6040518181016001600160401b0381118282101715612707576127076127c7565b604052919050565b60008219821115612722576127226127b1565b500190565b6000816000190483118215151615612741576127416127b1565b500290565b60005b83811015612761578181015183820152602001612749565b83811115612770576000848401525b50505050565b600060001982141561278a5761278a6127b1565b5060010190565b600060ff821660ff8114156127a8576127a86127b1565b60010192915050565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6001600160a01b03811681146127f257600080fd5b50565b6001600160401b03811681146127f257600080fdfea26469706673582212203ecdba6d51b8f92a37190f9eab73f6f7cb4b64dd3e393d849ef9dcfc006db49364736f6c63430008000033";
