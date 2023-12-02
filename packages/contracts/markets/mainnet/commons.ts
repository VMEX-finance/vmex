import { ethers } from 'ethers';
import {
  oneRay,
  ZERO_ADDRESS,
  MOCK_CHAINLINK_AGGREGATORS_PRICES,
  oneEther,
} from '../../helpers/constants';
import { ICommonConfiguration, eMainnetNetwork, eEthereumNetwork, eOptimismNetwork } from '../../helpers/types';

// ----------------
// PROTOCOL GLOBAL PARAMS
// ----------------

export const CommonsConfig: ICommonConfiguration = {
  MarketId: 'Commons',
  ATokenNamePrefix: 'Vmex interest bearing',
  VariableDebtTokenNamePrefix: 'Vmex variable debt bearing',
  SymbolPrefix: '',
  ProviderId: 0, // Overriden in index.ts
  OracleQuoteCurrency: 'ETH',
  OracleQuoteDecimals: 18,
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
    [eMainnetNetwork.mainnet]: "", 
  },
  PoolAdminIndex: 0,
  EmergencyAdmin: {
    [eMainnetNetwork.mainnet]: "0xeB8c1d8DF7aded11B3406ae16965E7CC34ae9bfC", //filip's address
  },
  EmergencyAdminIndex: 1,
  GlobalAdminMultisig: {
    [eMainnetNetwork.mainnet]: "", 
  },
  ProviderRegistry: {
    [eMainnetNetwork.mainnet]: "",
  },
  ProviderRegistryOwner: {
    [eMainnetNetwork.mainnet]: "",
  },
  LendingPoolAddressesProvider: {
    [eMainnetNetwork.mainnet]: "",
  },
  AssetMappingsImpl: {
    [eMainnetNetwork.mainnet]: "",
  },
  AssetMappings: {
    [eMainnetNetwork.mainnet]: "",
  },
  LendingPoolCollateralManager: { //this is the impl
    [eMainnetNetwork.mainnet]: '',
  },
  LendingPoolConfigurator: { //this is the impl
    [eMainnetNetwork.mainnet]: '',
  },
  LendingPool: { //this is the impl
    [eMainnetNetwork.mainnet]: '',
  },
  WethGateway: {
    [eMainnetNetwork.mainnet]: '',
  },
  TokenDistributor: {
    [eMainnetNetwork.mainnet]: '',
  },
  FallbackOracle: {
    [eMainnetNetwork.mainnet]: '',
  },
  UniswapV3OracleAddresses: {
    [eMainnetNetwork.mainnet]: {},
  },
  UniswapV3OracleTargets: {
    [eMainnetNetwork.mainnet]: {},
  },
  CurveMetadata: {
    [eMainnetNetwork.mainnet]: {
      "stETHCRV": {
        _reentrancyType: 4, //REMOVE_LIQUIDITY_2_RETURNS
        _poolSize: "2",
        _curvePool: "0xdc24316b9ae028f1497c275eb9192a3ea0f67022",
      },
      "stETHv2CRV": {
        _reentrancyType: 4, //REMOVE_LIQUIDITY_2_RETURNS
        _poolSize: "2",
        _curvePool: "0x21e27a5e5513d6e65c4f830167390997aa84843a",
      },
      "rETHCRV": {
        _reentrancyType: 3, //REMOVE_LIQUIDITY_2
        _poolSize: "2",
        _curvePool: "0x0f3159811670c117c372428d4e69ac32325e4d0f",
      },
    },
  },
  BeethovenMetadata: {
    [eMainnetNetwork.mainnet]: {
      "BPT-WSTETH-WETH": {
        _typeOfPool: "1",
        _legacy: false,  // since uses actual supply, not total supply
        _exists: true,
      },
      "BPT-rETH-ETH": {
        _typeOfPool: "1",
        _legacy: true,
        _exists: true,
      }
    },
  },
  ChainlinkAggregator: {
    [eMainnetNetwork.mainnet]: {
      stETH: {
        feed: '0x86392dC19c0b719886221c78AB11eb8Cf5c52812',
        heartbeat: 86400
      },
      wstETH: {
        feed: '0x86392dC19c0b719886221c78AB11eb8Cf5c52812',
        heartbeat: 86400
      },
      rETH: {
        feed: '0x536218f9E9Eb48863970252233c8F271f554C2d0',
        heartbeat: 86400
      },
    },
  },
  ReserveAssets: {
    [eMainnetNetwork.mainnet]: {},
  },
  ReservesConfig: {},
  ATokenDomainSeparator: {
    [eMainnetNetwork.mainnet]: '',
  },
  WETH: {
    [eMainnetNetwork.mainnet]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  WrappedNativeToken: {
    [eMainnetNetwork.mainnet]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  IncentivesController: {
    [eMainnetNetwork.mainnet]: ZERO_ADDRESS,
  },
  VMEXTreasury: {
    [eMainnetNetwork.mainnet]: "",
  },
  VMEXRewardsVault: {
    [eMainnetNetwork.mainnet]: "",
  },
  SequencerUptimeFeed: {
    [eMainnetNetwork.mainnet]: ""
  },
  RETHOracle: {
    [eMainnetNetwork.mainnet]: ""
  },
  ExternalStakingContracts: {
    [eMainnetNetwork.mainnet]: {
    },
  }
};
