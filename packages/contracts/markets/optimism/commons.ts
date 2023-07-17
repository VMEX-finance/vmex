import { ethers } from 'ethers';
import {
  oneRay,
  ZERO_ADDRESS,
  MOCK_CHAINLINK_AGGREGATORS_PRICES,
  oneEther,
} from '../../helpers/constants';
import { ICommonConfiguration, eEthereumNetwork, eOptimismNetwork } from '../../helpers/types';

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
    [eOptimismNetwork.optimism]: undefined,
  },
  PoolAdminIndex: 0,
  EmergencyAdmin: {
    [eOptimismNetwork.optimism]: undefined,
  },
  EmergencyAdminIndex: 1,
  ProviderRegistry: {
    [eOptimismNetwork.optimism]: undefined,
  },
  ProviderRegistryOwner: {
    [eOptimismNetwork.optimism]: undefined,
  },
  LendingPoolCollateralManager: {
    [eOptimismNetwork.optimism]: '',
  },
  LendingPoolConfigurator: {
    [eOptimismNetwork.optimism]: '',
  },
  LendingPool: {
    [eOptimismNetwork.optimism]: '',
  },
  WethGateway: {
    [eOptimismNetwork.optimism]: '',
  },
  TokenDistributor: {
    [eOptimismNetwork.optimism]: '',
  },
  FallbackOracle: {
    [eOptimismNetwork.optimism]: '',
  },
  UniswapV3OracleAddresses: {
    [eOptimismNetwork.optimism]: {},
  },
  UniswapV3OracleTargets: {
    [eOptimismNetwork.optimism]: {},
  },
  CurveMetadata: {
    [eOptimismNetwork.optimism]: {
      ThreeCRV: {
        _reentrancyType: 0, //0 means no check needed
        _poolSize: '3',
        _curvePool: '0x1337BedC9D22ecbe766dF105c9623922A27963EC'
      },
      sUSD3CRV: {
        _reentrancyType: 0,
        _poolSize: '2',
        _curvePool: '0x061b87122Ed14b9526A813209C8a59a633257bAb'
      },
      wstETHCRV: {
        _reentrancyType: 4, //REMOVE_LIQUIDITY_2_RETURNS
        _poolSize: '2',
        _curvePool: '0xB90B9B1F91a01Ea22A182CD84C1E22222e39B415'
      },
    },
  },
  BeethovenMetadata: {
    [eOptimismNetwork.optimism]: {
      // beethoven_USDCDAI: {
      //   _typeOfPool: "2",
      //   _legacy: false,
      //   _exists: true,
      // },
      beethoven_wstETHETH: {
        _typeOfPool: "1",
        _legacy: true,
        _exists: true,
      },
      beethoven_rETHETH: {
        _typeOfPool: "1",
        _legacy: true,
        _exists: true,
      },
    },
  },
  ChainlinkAggregator: {
    [eOptimismNetwork.optimism]: {
      DAI: {
        feed: '0x8dBa75e83DA73cc766A7e5a0ee71F656BAb470d6',
        heartbeat: 86400
      },
      SNX: {
        feed: '0x2FCF37343e916eAEd1f1DdaaF84458a359b53877',
        heartbeat: 1200
      },
      SUSD: {
        feed: '0x7f99817d87baD03ea21E05112Ca799d715730efe',
        heartbeat: 86400
      },
      USDC:{
        feed: '0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3',
        heartbeat: 86400,
      },
      USDT:{
        feed: '0xECef79E109e997bCA29c1c0897ec9d7b03647F5E',
        heartbeat: 86400,
      },
      WBTC:{
        feed: '0x718A5788b89454aAE3A028AE9c111A29Be6c2a6F',
        heartbeat: 1200,
      },
      WETH:{
        feed: '0x13e3Ee699D1909E989722E753853AE30b17e08c5',
        heartbeat: 1200,
      },
      wstETH:{
        feed: '0x698B585CbC4407e2D54aa898B2600B53C68958f7',
        heartbeat: 86400,
      },
      FRAX:{
        feed: '0xc7D132BeCAbE7Dcc4204841F33bae45841e41D9C',
        heartbeat: 86400,
      },
      OP:{
        feed: '0x0D276FC14719f9292D5C1eA2198673d1f4269246',
        heartbeat: 1200,
      }
    },
  },
  ReserveAssets: {
    [eOptimismNetwork.optimism]: {},
  },
  ReservesConfig: {},
  ATokenDomainSeparator: {
    [eOptimismNetwork.optimism]: '',
  },
  WETH: {
    [eOptimismNetwork.optimism]: '',
  },
  WrappedNativeToken: {
    [eOptimismNetwork.optimism]: '',
  },
  ReserveFactorTreasuryAddress: {
    [eOptimismNetwork.optimism]: '0xEFd23344F89F7215417DC6F9E9627aBFfE69d2EE',
  },
  IncentivesController: {
    [eOptimismNetwork.optimism]: ZERO_ADDRESS,
  },
  VMEXTreasury: {
    [eOptimismNetwork.optimism]: "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49",
  },
  SequencerUptimeFeed: {
    [eOptimismNetwork.optimism]: "0x371EAD81c9102C9BF4874A9075FFFf170F2Ee389"
  },
  RETHOracle: {
    [eOptimismNetwork.optimism]: "0x1a8F81c256aee9C640e14bB0453ce247ea0DFE6F"
  },
  ExternalStakingContracts: {
    [eOptimismNetwork.optimism]: {
      yvUSDC: {
        address: "0xB2c04C55979B6CA7EB10e666933DE5ED84E6876b",
        type: 1,
      },
      yvUSDT: {
        address: "0xf66932f225ca48856b7f97b6f060f4c0d244af8e",
        type: 1,
      },
      yvDAI: {
        address: "0xf8126ef025651e1b313a6893fcf4034f4f4bd2aa",
        type: 1,
      },
      yvWETH: {
        address: "0xe35fec3895dcecc7d2a91e8ae4ff3c0d43ebffe0",
        type: 1,
      },
      velo_rETHWETH: {
        address: "0xd0E434831a765839051DA9C0B9B99C6b0Fb87201",
        type: 2,
      },
      velo_wstETHWETH: {
        address: "0x9f82A8b19804141161C582CfEa1b84853340A246",
        type: 2,
      },
      velo_ETHUSDC: {
        address: "0xe7630c9560c59ccbf5eed8f33dd0cca2e67a3981",
        type: 2,
      },
      velo_OPETH: {
        address: "0xcc53cd0a8ec812d46f0e2c7cc5aadd869b6f0292",
        type: 2,
      },
      velo_OPUSDC: {
        address: "0x36691b39ec8fa915204ba1e1a4a3596994515639",
        type: 2,
      },
      beethoven_rETHETH: {
        address: "0x61ac9315a1Ae71633E95Fb35601B59180eC8d61d",
        type: 3,
      },
      beethoven_wstETHETH: {
        address: "0xe110b862E4D076596707892c0C5163BC183eb161",
        type: 3,
      },
    },
  }
};
