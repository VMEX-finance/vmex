import { ethers } from 'ethers';
import {
  oneRay,
  ZERO_ADDRESS,
  MOCK_CHAINLINK_AGGREGATORS_PRICES,
  oneEther,
} from '../../helpers/constants';
import { ICommonConfiguration, eBaseNetwork, eEthereumNetwork, eOptimismNetwork } from '../../helpers/types';

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
    [eBaseNetwork.base]: "0x464eD76C6B2DdeCC9aa1E990211670a81b93474B", 
  },
  PoolAdminIndex: 0,
  EmergencyAdmin: {
    [eBaseNetwork.base]: "0x839d8c6BDB283B72F7bfbb2efa32eD40855dF95c", //filip's address
  },
  EmergencyAdminIndex: 1,
  GlobalAdminMultisig: {
    [eBaseNetwork.base]: "0x06408654FDdEaaF341191F56a474659b92F075D1", 
  },
  ProviderRegistry: {
    [eBaseNetwork.base]: "0xEB125b3386322886769f43B7744327B9983A24Da",
  },
  ProviderRegistryOwner: {
    [eBaseNetwork.base]: "0x464eD76C6B2DdeCC9aa1E990211670a81b93474B",
  },
  LendingPoolAddressesProvider: {
    [eBaseNetwork.base]: "0xFC2748D74703cf6f2CE8ca9C8F388C3DAB1856f0",
  },
  AssetMappingsImpl: {
    [eBaseNetwork.base]: "0x4cE76015b2A994A42d4dC4695070c2E6D2c0Ce71",
  },
  AssetMappings: {
    [eBaseNetwork.base]: "0x48CB441A85d6EA9798C72c4a1829658D786F3027",
  },
  LendingPoolCollateralManager: { //this is the impl
    [eBaseNetwork.base]: '0x993A082292d55f2F44AA43bE08837199AD6eC169',
  },
  LendingPoolConfigurator: { //this is the impl
    [eBaseNetwork.base]: '0x47E405ed60cec87cbcc4B21C20b908e6b1ECE49E',
  },
  LendingPool: { //this is the impl
    [eBaseNetwork.base]: '0x8AA00F73410269e8064fEA966EaE164f4458B9bC',
  },
  WethGateway: {
    [eBaseNetwork.base]: '0xBE72D961317dD1B59f48f50EE4131C8a7eef1803',
  },
  TokenDistributor: {
    [eBaseNetwork.base]: '',
  },
  FallbackOracle: {
    [eBaseNetwork.base]: '0x0c3E4a646363b91b8b956cF5D1fe761521C1E1ff',
  },
  UniswapV3OracleAddresses: {
    [eBaseNetwork.base]: {},
  },
  UniswapV3OracleTargets: {
    [eBaseNetwork.base]: {},
  },
  CurveMetadata: {
    [eBaseNetwork.base]: {
      "cbETHWETHCRV": {
        _reentrancyType: 7, //CLAIM_ADMIN_FEES
        _poolSize: "2",
        _curvePool: "0x11c1fbd4b3de66bc0565779b35171a6cf3e71f59",
      },
    },
  },
  BeethovenMetadata: {
    [eBaseNetwork.base]: {
      "cbETH-WETH-BPT": {
        _typeOfPool: "1",
        _legacy: false, // since uses actual supply, not total supply
        _exists: true,
      },
      "rETH-WETH-BPT": {
        _typeOfPool: "1",
        _legacy: false, // since uses actual supply, not total supply
        _exists: true,
      }
    },
  },
  ChainlinkAggregator: {
    [eBaseNetwork.base]: {
      USDbC: {
        feed: '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B',
        heartbeat: 86400
      },
      WETH: {
        feed: '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70',
        heartbeat: 86400
      },
      cbETH: {
        feed: '0xd7818272B9e248357d13057AAb0B417aF31E817d',
        heartbeat: 1200
      },
      DAI: {
        feed: '0x591e79239a7d679378ec8c847e5038150364c78f',
        heartbeat: 86400
      },
      USDC: {
        feed: '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B',
        heartbeat: 86400
      },
      bIB01: {
        feed: '0xB376D14d3dd93318A21E4Dd49fDdEC0e8574FA81',
        heartbeat: 86400
      },
      bIBTA: {
        feed: '0x426F41474098f567562ce8FEfB0eE7AA990aa0F9',
        heartbeat: 86400
      },
      rETH: {
        feed: '0x6e61c5e4626C682f6174e0d992C2d0971Ed1A734',
        heartbeat: 86400
      },
      wstETH: {
        feed: '0x945fD405773973d286De54E44649cc0d9e264F78',
        heartbeat: 86400
      },
    },
  },
  ReserveAssets: {
    [eBaseNetwork.base]: {},
  },
  ReservesConfig: {},
  ATokenDomainSeparator: {
    [eBaseNetwork.base]: '',
  },
  WETH: {
    [eBaseNetwork.base]: '0x4200000000000000000000000000000000000006',
  },
  WrappedNativeToken: {
    [eBaseNetwork.base]: '0x4200000000000000000000000000000000000006',
  },
  IncentivesController: {
    [eBaseNetwork.base]: ZERO_ADDRESS,
  },
  VMEXTreasury: {
    [eBaseNetwork.base]: "0xF0AcEf51a106125E75Bf6C3034Ca818F4B85Dc51",
  },
  VMEXRewardsVault: {
    [eBaseNetwork.base]: "0x2490C1e1fb9fB680c0Bd95727A9D1Ec2e87C40F3",
  },
  SequencerUptimeFeed: {
    [eBaseNetwork.base]: "0xBCF85224fc0756B9Fa45aA7892530B47e10b6433"
  },
  RETHOracle: {
    [eBaseNetwork.base]: ""
  },
  ExternalStakingContracts: {
    [eBaseNetwork.base]: {
      "vAMM-WETH/USDbC": {
        address: "0xeca7Ff920E7162334634c721133F3183B83B0323",
        type: 2,
      },
      "vAMM-cbETH/WETH": {
        address: "0xDf9D427711CCE46b52fEB6B2a20e4aEaeA12B2b7",
        type: 2,
      },
      "sAMM-DAI/USDbC": {
        address: "0xCF1D5Aa63083fda05c7f8871a9fDbfed7bA49060",
        type: 2,
      },
      "sAMM-USDC/USDbC": {
        address: "0x1cfc45c5221a07da0de958098a319a29fbbd66fe",
        type: 2,
      },
      "vAMM-WETH/DAI": {
        address: "0x36bda777ccbefe881ed729aff7f1f06779f4199a",
        type: 2,
      },
      "cbETHWETHCRV": {
        address: "0xe9c898ba654dec2ba440392028d2e7a194e6dc3e",
        type: 4,
      },
      "vAMM-wstETH/WETH": {
        address: "0xdf7c8f17ab7d47702a4a4b6d951d2a4c90f99bf4",
        type: 2,
      },
    },
  }
};
