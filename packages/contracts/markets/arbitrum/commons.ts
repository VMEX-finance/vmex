import { ethers } from 'ethers';
import {
  oneRay,
  ZERO_ADDRESS,
  MOCK_CHAINLINK_AGGREGATORS_PRICES,
  oneEther,
} from '../../helpers/constants';
import { ICommonConfiguration, eArbitrumNetwork} from '../../helpers/types';

// ----------------
// PROTOCOL GLOBAL PARAMS
// ----------------

export const CommonsConfig: ICommonConfiguration = {
  MarketId: 'Commons',
  ATokenNamePrefix: 'Vmex interest bearing',
  VariableDebtTokenNamePrefix: 'Vmex variable debt bearing',
  SymbolPrefix: '',
  ProviderId: 0, // Overriden in index.ts
  OracleQuoteCurrency: 'USD',
  OracleQuoteDecimals: 8,
  OracleQuoteUnit: ethers.utils.parseUnits("1",8).toString(),
  ProtocolGlobalParams: {
    TokenDistributorPercentageBase: '10000',
    MockUsdPriceInWei: '5848466240000000',
    UsdAddress: '0x10F7Fc1F91Ba351f9C629c5947AD69bD03C05b96',
    NilAddress: ZERO_ADDRESS,
    OneAddress: '0x0000000000000000000000000000000000000001',
    AaveReferral: '0',
  },

  // ----------------
  // COMMON PROTOCOL PARAMS ACROSS POOLS AND NETWORKS
  // ----------------

  Mocks: {
    AllAssetsInitialPrices: {
      ...MOCK_CHAINLINK_AGGREGATORS_PRICES,
    },
  },
  // ----------------
  // COMMON PROTOCOL ADDRESSES ACROSS POOLS
  // ----------------

  // If PoolAdmin/emergencyAdmin is set, will take priority over PoolAdminIndex/emergencyAdminIndex
  PoolAdmin: {
    [eArbitrumNetwork.arbitrum]: "0x464eD76C6B2DdeCC9aa1E990211670a81b93474B", 
  },
  PoolAdminIndex: 0,
  EmergencyAdmin: {
    [eArbitrumNetwork.arbitrum]: "0x839d8c6BDB283B72F7bfbb2efa32eD40855dF95c", //filip's address
  },
  EmergencyAdminIndex: 1,
  GlobalAdminMultisig: {
    [eArbitrumNetwork.arbitrum]: "0x0A5611a386249412b3E67ef009C905689E4bF0D7", 
  },
  ProviderRegistry: {
    [eArbitrumNetwork.arbitrum]: "",
  },
  ProviderRegistryOwner: {
    [eArbitrumNetwork.arbitrum]: "0x464eD76C6B2DdeCC9aa1E990211670a81b93474B",
  },
  LendingPoolAddressesProvider: {
    [eArbitrumNetwork.arbitrum]: "",
  },
  AssetMappingsImpl: {
    [eArbitrumNetwork.arbitrum]: "",
  },
  AssetMappings: {
    [eArbitrumNetwork.arbitrum]: "",
  },
  LendingPoolCollateralManager: { //this is the impl
    [eArbitrumNetwork.arbitrum]: '',
  },
  LendingPoolConfigurator: { //this is the impl
    [eArbitrumNetwork.arbitrum]: '',
  },
  LendingPool: { //this is the impl
    [eArbitrumNetwork.arbitrum]: '',
  },
  WethGateway: {
    [eArbitrumNetwork.arbitrum]: '',
  },
  TokenDistributor: {
    [eArbitrumNetwork.arbitrum]: '',
  },
  FallbackOracle: {
    [eArbitrumNetwork.arbitrum]: '',
  },
  UniswapV3OracleAddresses: {
    [eArbitrumNetwork.arbitrum]: {},
  },
  UniswapV3OracleTargets: {
    [eArbitrumNetwork.arbitrum]: {},
  },
  CurveMetadata: {
    [eArbitrumNetwork.arbitrum]: {
      "2CRV": {
        _reentrancyType: 0,
        _poolSize: '2',
        _curvePool: "0x7f90122bf0700f9e7e1f688fe926940e8839f353"
      },
      "wstETHCRV": {
        _reentrancyType: 4,
        _poolSize: '2',
        _curvePool: "0x6eb2dc694eb516b16dc9fbc678c60052bbdd7d80"
      },
      "FRAXBPCRV-f": {
        _reentrancyType: 0,
        _poolSize: '2',
        _curvePool: "0xc9b8a3fdecb9d5b218d02555a8baf332e5b740d5"
      },
    },
  },
  BeethovenMetadata: {
    [eArbitrumNetwork.arbitrum]: {
      "wstETH-WETH-BPT": {
        _typeOfPool: "1",
        _legacy: false,
        _exists: true,
      },
      "rETH-WETH-BPT": {
        _typeOfPool: "1",
        _legacy: false,
        _exists: true,
      },
    },
  },
  ChainlinkAggregator: {
    [eArbitrumNetwork.arbitrum]: {
      "USDC.e": {
        feed: '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3',
        heartbeat: 86400
      },
      WETH: {
        feed: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
        heartbeat: 86400
      },
      wstETH: {
        feed: '0x945fD405773973d286De54E44649cc0d9e264F78',
        heartbeat: 86400
      },
      WBTC: {
        feed: '0xd0C7101eACbB49F3deCcCc166d238410D6D46d57',
        heartbeat: 86400
      },
      USDT: {
        feed: '0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7',
        heartbeat: 86400
      },
      USDC: {
        feed: '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3',
        heartbeat: 86400
      },
      DAI: {
        feed: '0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB',
        heartbeat: 86400
      },
      ARB: {
        feed: '0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6',
        heartbeat: 86400
      },
      rETH: {
        feed: '0x04c28D6fE897859153eA753f986cc249Bf064f71',
        heartbeat: 86400
      },
      LUSD: {
        feed: '0x0411D28c94d85A36bC72Cb0f875dfA8371D8fFfF',
        heartbeat: 86400
      },
      FRAX: {
        feed: '0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8',
        heartbeat: 86400
      },
    },
  },
  ReserveAssets: {
    [eArbitrumNetwork.arbitrum]: {},
  },
  ReservesConfig: {},
  ATokenDomainSeparator: {
    [eArbitrumNetwork.arbitrum]: '',
  },
  WETH: {
    [eArbitrumNetwork.arbitrum]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  WrappedNativeToken: {
    [eArbitrumNetwork.arbitrum]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  IncentivesController: {
    [eArbitrumNetwork.arbitrum]: ZERO_ADDRESS,
  },
  VMEXTreasury: {
    [eArbitrumNetwork.arbitrum]: "0x88c3112a6D029a2b738e72C2B2ec33E496E78C82", 
  },
  VMEXRewardsVault: {
    [eArbitrumNetwork.arbitrum]: "0x00C1aB6ac0cA3F3De7511b147d9E4F455af72657", 
  },
  SequencerUptimeFeed: {
    [eArbitrumNetwork.arbitrum]: "0xBCF85224fc0756B9Fa45aA7892530B47e10b6433"
  },
  RETHOracle: {
    [eArbitrumNetwork.arbitrum]: ""
  },
  ExternalStakingContracts: {
    [eArbitrumNetwork.arbitrum]: {
      "2CRV": {
        address: "0xce5f24b7a95e9cba7df4b54e911b4a3dc8cdaf6f",
        type: 4,
      },
      "wstETHCRV": {
        address: "0x098ef55011b6b8c99845128114a9d9159777d697",
        type: 4,
      },
      "FRAXBPCRV-f": {
        address: "0x95285ea6ff14f80a2fd3989a6bab993bd6b5fa13",
        type: 4,
      },
      "wstETH-WETH-BPT": {
        address: "0xa7bdad177d474f946f3cdeb4bcea9d24cf017471",
        type: 3, //aura
      },
      "rETH-WETH-BPT": {
        address: "0x129a44ac6ff0f965c907579f96f2ed682e52c84a",
        type: 3, //aura
      },
      // "vAMM-WETH/USDC": {
      //   address: "0xdb74aE9C3d1b96326BDAb8E1da9c5e98281d576e",
      //   type: 5,
      // },
      // "vAMM-WETH/USDT": {
      //   address: "0xC4c063941Ba3b130f99769AB7e801ACB7b09E29F",
      //   type: 5,
      // },
      "CMLT-ARB-ETH": {
        address: "0x9FFC53cE956Bf040c4465B73B3cfC04569EDaEf1",
        type: 6
      },
      "CMLT-ETH-USDC.e": {
        address: "0x6BC938abA940fB828D39Daa23A94dfc522120C11",
        type: 6
      },
      "CMLT-USDT-USDC.e": {
        address: "0xcC9f28dAD9b85117AB5237df63A5EE6fC50B02B7",
        type: 6
      },
      "CMLT-wstETH-ETH": {
        address: "0x32B18B8ccD84983C7ddc14c215A42caC098BA714",
        type: 6
      },
      "CMLT-LUSD-USDC.e": {
        address: "0xd74C89229FfE9516aC34030DEa348DABAe46366d",
        type: 6
      },
    },
  }
};