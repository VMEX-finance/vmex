import {
  oneRay,
  ZERO_ADDRESS,
  MOCK_CHAINLINK_AGGREGATORS_PRICES,
  oneEther,
} from '../../helpers/constants';
import { ICommonConfiguration, eEthereumNetwork } from '../../helpers/types';

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
  OracleQuoteUnit: oneEther.toString(),
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
    [eEthereumNetwork.coverage]: undefined,
    [eEthereumNetwork.buidlerevm]: undefined,
    [eEthereumNetwork.coverage]: undefined,
    [eEthereumNetwork.hardhat]: undefined,
    [eEthereumNetwork.kovan]: undefined,
    [eEthereumNetwork.ropsten]: undefined,
    [eEthereumNetwork.main]: undefined,
    [eEthereumNetwork.goerli]: undefined,
    [eEthereumNetwork.tenderly]: undefined,
  },
  PoolAdminIndex: 0,
  EmergencyAdmin: {
    [eEthereumNetwork.hardhat]: undefined,
    [eEthereumNetwork.coverage]: undefined,
    [eEthereumNetwork.buidlerevm]: undefined,
    [eEthereumNetwork.kovan]: undefined,
    [eEthereumNetwork.ropsten]: undefined,
    [eEthereumNetwork.main]: undefined,
    [eEthereumNetwork.goerli]: undefined,
    [eEthereumNetwork.tenderly]: undefined,
  },
  VMEXTreasury: {
    [eEthereumNetwork.hardhat]: "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49",
    [eEthereumNetwork.coverage]: undefined,
    [eEthereumNetwork.buidlerevm]: undefined,
    [eEthereumNetwork.kovan]: undefined,
    [eEthereumNetwork.ropsten]: undefined,
    [eEthereumNetwork.main]: "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49",
    [eEthereumNetwork.goerli]: "0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49",
    [eEthereumNetwork.tenderly]: undefined,
  },
  EmergencyAdminIndex: 1,
  ProviderRegistry: {
    [eEthereumNetwork.kovan]: '', //'0x1E40B561EC587036f9789aF83236f057D1ed2A90',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '', //0x52D306e36E3B6B02c153d0266ff0f85d18BCD413
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.goerli]: '',
    [eEthereumNetwork.tenderly]: '', //0x52D306e36E3B6B02c153d0266ff0f85d18BCD413
  },
  ProviderRegistryOwner: {
    [eEthereumNetwork.kovan]: '', // 0x85e4A467343c0dc4aDAB74Af84448D9c45D8ae6F
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '', // 0xB9062896ec3A615a4e4444DF183F0531a77218AE
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.goerli]: '',
    [eEthereumNetwork.tenderly]: '', // 0xB9062896ec3A615a4e4444DF183F0531a77218AE
  },
  LendingPoolCollateralManager: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',//'0x9269b6453d0d75370c4c85e5a42977a53efdb72a',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '',//'0xbd4765210d4167CE2A5b87280D9E8Ee316D5EC7C',
    [eEthereumNetwork.goerli]: '',
    [eEthereumNetwork.tenderly]: '',//'0xbd4765210d4167CE2A5b87280D9E8Ee316D5EC7C',
  },
  LendingPoolConfigurator: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '',
    [eEthereumNetwork.goerli]: '',
    [eEthereumNetwork.tenderly]: '',
  },
  LendingPool: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '',
    [eEthereumNetwork.goerli]: '',
    [eEthereumNetwork.tenderly]: '',
  },
  WethGateway: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '',
    [eEthereumNetwork.goerli]: '',
    [eEthereumNetwork.tenderly]: '',
  },
  TokenDistributor: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.kovan]: '0x971efe90088f21dc6a36f610ffed77fc19710708',
    [eEthereumNetwork.ropsten]: '0xeba2ea67942b8250d870b12750b594696d02fc9c',
    [eEthereumNetwork.main]: '0xe3d9988f676457123c5fd01297605efdd0cba1ae',
    [eEthereumNetwork.goerli]: '',
    [eEthereumNetwork.tenderly]: '0xe3d9988f676457123c5fd01297605efdd0cba1ae',
  },
  FallbackOracle: {
    [eEthereumNetwork.coverage]: '',
    [eEthereumNetwork.hardhat]: '',
    [eEthereumNetwork.buidlerevm]: '',
    [eEthereumNetwork.kovan]: '0x50913E8E1c650E790F8a1E741FF9B1B1bB251dfe',
    [eEthereumNetwork.ropsten]: '0xAD1a978cdbb8175b2eaeC47B01404f8AEC5f4F0d',
    [eEthereumNetwork.main]: ZERO_ADDRESS,
    [eEthereumNetwork.goerli]: ZERO_ADDRESS,
    [eEthereumNetwork.tenderly]: ZERO_ADDRESS,
  },
  UniswapV3OracleAddresses: {
    [eEthereumNetwork.coverage]: {},
    [eEthereumNetwork.hardhat]: {},
    [eEthereumNetwork.buidlerevm]: {},
    [eEthereumNetwork.kovan]: {},
    [eEthereumNetwork.ropsten]: {},
    [eEthereumNetwork.goerli]: {},
    [eEthereumNetwork.main]: {
      AAVE: '0x5aB53EE1d50eeF2C1DD3d5402789cd27bB52c1bB',
      BAT: '0xAE614a7a56cB79c04Df2aeBA6f5dAB80A39CA78E',
      BUSD: '0x4Ff7E1E713E30b0D1Fb9CD00477cEF399ff9D493',
      DAI: '0x60594a405d53811d3BC4766596EFD80fd545A270',
      ENJ: '0xe16Be1798F860bC1EB0FEb64cD67Ca00AE9b6E58',
      KNC: '0x76838fD2f22Bdc1D3e96069971E65653173eDB2a',
      LINK: '0xa6Cc3C2531FdaA6Ae1A3CA84c2855806728693e8',
      MANA: '0x8661aE7918C0115Af9e3691662f605e9c550dDc9',
      MKR: '0xe8c6c9227491C0a8156A0106A0204d881BB7E531',
      REN: '0x2dD56b633FAa1A5B46107d248714C9cCB6e20920',
      SNX: '0xEDe8dd046586d22625Ae7fF2708F879eF7bdb8CF',
      SUSD: ZERO_ADDRESS,
      TUSD: '0x714b8443D0ADA18eCE1fcE5702567e313bfa8f29',
      UNI: '0x1d42064Fc4Beb5F8aAF85F4617AE8b3b5B8Bd801',
      USDC: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
      USDT: '0x11b815efB8f581194ae79006d24E0d814B7697F6',
      WBTC: '0x4585FE77225b41b697C938B018E2Ac67Ac5a20c0',
      WETH: ZERO_ADDRESS,
      YFI: '0x04916039B1f59D9745Bf6E0a21f191D1e0A84287',
      ZRX: '0x14424eEeCbfF345B38187d0B8b749E56FAA68539',
      Tricrypto2: ZERO_ADDRESS,
      ThreePool: ZERO_ADDRESS,
      StethEth: ZERO_ADDRESS,
      Steth: ZERO_ADDRESS,
      FraxUSDC: ZERO_ADDRESS,
      Frax3Crv: ZERO_ADDRESS,
      FRAX: ZERO_ADDRESS,
      BAL: '0xDC2c21F1B54dDaF39e944689a8f90cb844135cc9',
      CRV: '0x4c83A7f819A5c37D64B4c5A2f8238Ea082fA1f4e',
      CVX: '0x2E4784446A0a06dF3D1A040b03e1680Ee266c35a',
      BADGER: '0x74092c7c0024feeb3839bED5ab6189eeD86ae856',
      LDO: '0xf4aD61dB72f114Be877E87d62DC5e7bd52DF4d9B',
      ALCX: '0xb80946cd2B4b68beDd769A21CA2F096EAD6E0EE8',
      Oneinch: ZERO_ADDRESS,
      yvTricrypto2: ZERO_ADDRESS,
      yvThreePool: ZERO_ADDRESS,
      yvStethEth: ZERO_ADDRESS,
      yvFraxUSDC: ZERO_ADDRESS,
      yvFrax3Crv: ZERO_ADDRESS,
    },
    [eEthereumNetwork.tenderly]: {
      AAVE: '0x5aB53EE1d50eeF2C1DD3d5402789cd27bB52c1bB',
      BAT: '0xAE614a7a56cB79c04Df2aeBA6f5dAB80A39CA78E',
      BUSD: '0x4Ff7E1E713E30b0D1Fb9CD00477cEF399ff9D493',
      DAI: '0x60594a405d53811d3BC4766596EFD80fd545A270',
      ENJ: '0xe16Be1798F860bC1EB0FEb64cD67Ca00AE9b6E58',
      KNC: '0x76838fD2f22Bdc1D3e96069971E65653173eDB2a',
      LINK: '0xa6Cc3C2531FdaA6Ae1A3CA84c2855806728693e8',
      MANA: '0x8661aE7918C0115Af9e3691662f605e9c550dDc9',
      MKR: '0xe8c6c9227491C0a8156A0106A0204d881BB7E531',
      REN: '0x2dD56b633FAa1A5B46107d248714C9cCB6e20920',
      SNX: '0xEDe8dd046586d22625Ae7fF2708F879eF7bdb8CF',
      SUSD: ZERO_ADDRESS,
      TUSD: '0x714b8443D0ADA18eCE1fcE5702567e313bfa8f29',
      UNI: '0x1d42064Fc4Beb5F8aAF85F4617AE8b3b5B8Bd801',
      USDC: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
      USDT: '0x11b815efB8f581194ae79006d24E0d814B7697F6',
      WBTC: '0x4585FE77225b41b697C938B018E2Ac67Ac5a20c0',
      WETH: ZERO_ADDRESS,
      YFI: '0x04916039B1f59D9745Bf6E0a21f191D1e0A84287',
      ZRX: '0x14424eEeCbfF345B38187d0B8b749E56FAA68539',
      Tricrypto2: ZERO_ADDRESS,
      ThreePool: ZERO_ADDRESS,
      StethEth: ZERO_ADDRESS,
      Steth: ZERO_ADDRESS,
      FraxUSDC: ZERO_ADDRESS,
      Frax3Crv: ZERO_ADDRESS,
      FRAX: ZERO_ADDRESS,
      BAL: '0xDC2c21F1B54dDaF39e944689a8f90cb844135cc9',
      CRV: '0x4c83A7f819A5c37D64B4c5A2f8238Ea082fA1f4e',
      CVX: '0x2E4784446A0a06dF3D1A040b03e1680Ee266c35a',
      BADGER: '0x74092c7c0024feeb3839bED5ab6189eeD86ae856',
      LDO: '0xf4aD61dB72f114Be877E87d62DC5e7bd52DF4d9B',
      ALCX: '0xb80946cd2B4b68beDd769A21CA2F096EAD6E0EE8',
      Oneinch: ZERO_ADDRESS,
      yvTricrypto2: ZERO_ADDRESS,
      yvThreePool: ZERO_ADDRESS,
      yvStethEth: ZERO_ADDRESS,
      yvFraxUSDC: ZERO_ADDRESS,
      yvFrax3Crv: ZERO_ADDRESS,
    },
  },
  UniswapV3OracleTargets: {
    [eEthereumNetwork.coverage]: {},
    [eEthereumNetwork.hardhat]: {},
    [eEthereumNetwork.buidlerevm]: {},
    [eEthereumNetwork.kovan]: {},
    [eEthereumNetwork.ropsten]: {},
    [eEthereumNetwork.goerli]: {},
    [eEthereumNetwork.main]: {
      AAVE: '0',
      BAT: '0',
      BUSD: '0',
      DAI: '0',
      ENJ: '1',
      KNC: '1',
      LINK: '0',
      MANA: '0',
      MKR: '0',
      REN: '0',
      SNX: '0',
      SUSD: '0',
      TUSD: '0',
      UNI: '0',
      USDC: '0',
      USDT: '1',
      WBTC: '0',
      WETH: '1',
      YFI: '0',
      ZRX: '1',
      Tricrypto2: '0',
      ThreePool: '0',
      StethEth: '0',
      Steth: '0',
      FraxUSDC: '0',
      Frax3Crv: '0',
      FRAX: '0',
      BAL: '0',
      CRV: '1',
      CVX: '0',
      BADGER: '0',
      LDO: '0',
      ALCX: '1',
      Oneinch: '0',
      yvTricrypto2: '0',
      yvThreePool: '0',
      yvStethEth: '0',
      yvFraxUSDC: '0',
      yvFrax3Crv: '0',
    },
    [eEthereumNetwork.tenderly]: {
      AAVE: '0',
      BAT: '0',
      BUSD: '0',
      DAI: '0',
      ENJ: '1',
      KNC: '1',
      LINK: '0',
      MANA: '0',
      MKR: '0',
      REN: '0',
      SNX: '0',
      SUSD: '0',
      TUSD: '0',
      UNI: '0',
      USDC: '0',
      USDT: '1',
      WBTC: '0',
      WETH: '1',
      YFI: '0',
      ZRX: '1',
      Tricrypto2: '0',
      ThreePool: '0',
      StethEth: '0',
      Steth: '0',
      FraxUSDC: '0',
      Frax3Crv: '0',
      FRAX: '0',
      BAL: '0',
      CRV: '1',
      CVX: '0',
      BADGER: '0',
      LDO: '0',
      ALCX: '1',
      Oneinch: '0',
      yvTricrypto2: '0',
      yvThreePool: '0',
      yvStethEth: '0',
      yvFraxUSDC: '0',
      yvFrax3Crv: '0',
    },
  },
  CurveMetadata: {
    [eEthereumNetwork.coverage]: {},
    [eEthereumNetwork.hardhat]: {},
    [eEthereumNetwork.buidlerevm]: {},
    [eEthereumNetwork.kovan]: {},
    [eEthereumNetwork.ropsten]: {},
    [eEthereumNetwork.goerli]: {},
    [eEthereumNetwork.main]: {
      Tricrypto2: {
        _reentrancyType: 1,
        _poolSize: '3',
        _curvePool: '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46'
      },
      ThreePool: {
        _reentrancyType: 0,
        _poolSize: '3',
        _curvePool: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7'
      },
      StethEth: {
        _reentrancyType: 4,
        _poolSize: '2',
        _curvePool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022'
      },
      FraxUSDC: {
        _reentrancyType: 0,
        _poolSize: '2',
        _curvePool: '0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2'
      },
      Frax3Crv: {
        _reentrancyType: 0,
        _poolSize: '2',
        _curvePool: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B'
      },
    },
    [eEthereumNetwork.tenderly]: {
    },
  },
  ChainlinkAggregator: {
    [eEthereumNetwork.coverage]: {},
    [eEthereumNetwork.hardhat]: {},
    [eEthereumNetwork.buidlerevm]: {},
    [eEthereumNetwork.kovan]: {},
    [eEthereumNetwork.ropsten]: {},
    [eEthereumNetwork.goerli]: {},
    [eEthereumNetwork.main]: {
      AAVE:{
        feed: '0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012',
        heartbeat: 864000000
      },
      BAT:{
        feed: '0x0d16d4528239e9ee52fa531af613AcdB23D88c94',
        heartbeat: 864000000
      },
      BUSD:{
        feed: '0x614715d2Af89E6EC99A233818275142cE88d1Cfd',
        heartbeat: 864000000
      },
      DAI:{
        feed: '0x773616E4d11A78F511299002da57A0a94577F1f4',
        heartbeat: 864000000
      },
      ENJ:{
        feed: '0x24D9aB51950F3d62E9144fdC2f3135DAA6Ce8D1B',
        heartbeat: 864000000
      },
      KNC:{
        feed: '0x656c0544eF4C98A6a98491833A89204Abb045d6b',
        heartbeat: 864000000
      },
      LINK:{
        feed: '0xDC530D9457755926550b59e8ECcdaE7624181557',
        heartbeat: 864000000
      },
      MANA:{
        feed: '0x82A44D92D6c329826dc557c5E1Be6ebeC5D5FeB9',
        heartbeat: 864000000
      },
      MKR:{
        feed: '0x24551a8Fb2A7211A25a17B1481f043A8a8adC7f2',
        heartbeat: 864000000
      },
      REN:{
        feed: '0x3147D7203354Dc06D9fd350c7a2437bcA92387a4',
        heartbeat: 864000000
      },
      SNX:{
        feed: '0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c',
        heartbeat: 864000000
      },
      SUSD:{
        feed: '0x8e0b7e6062272B5eF4524250bFFF8e5Bd3497757',
        heartbeat: 864000000
      },
      TUSD:{
        feed: '0x3886BA987236181D98F2401c507Fb8BeA7871dF2',
        heartbeat: 864000000
      },
      UNI:{
        feed: '0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e',
        heartbeat: 864000000
      },
      USDC:{
        feed: '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4',
        heartbeat: 864000000
      },
      USDT:{
        feed: '0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46',
        heartbeat: 864000000
      },
      WBTC:{
        feed: '0xdeb288f737066589598e9214e782fa5a8ed689e8',
        heartbeat: 864000000
      },
      YFI:{
        feed: '0x7c5d4F8345e66f68099581Db340cd65B078C41f4',
        heartbeat: 864000000
      },
      ZRX:{
        feed: '0x2Da4983a622a8498bb1a21FaE9D8F6C664939962',
        heartbeat: 864000000
      },
      Steth:{
        feed: '0x86392dC19c0b719886221c78AB11eb8Cf5c52812',
        heartbeat: 864000000
      },
      FRAX:{
        feed: '0x14d04fff8d21bd62987a5ce9ce543d2f1edf5d3e',
        heartbeat: 864000000
      },
      BAL:{
        feed: '0xc1438aa3823a6ba0c159cfa8d98df5a994ba120b',
        heartbeat: 864000000
      },
      CRV:{
        feed: '0x8a12be339b0cd1829b91adc01977caa5e9ac121e',
        heartbeat: 864000000
      },
      CVX:{
        feed: '0xC9CbF687f43176B302F03f5e58470b77D07c61c6',
        heartbeat: 864000000
      },
      BADGER:{
        feed: '0x58921ac140522867bf50b9e009599da0ca4a2379',
        heartbeat: 864000000
      },
      LDO:{
        feed: '0x4e844125952d32acdf339be976c98e22f6f318db',
        heartbeat: 864000000
      },
      ALCX:{
        feed: '0x194a9aaf2e0b67c35915cd01101585a33fe25caa',
        heartbeat: 864000000
      },
      Oneinch:{
        feed: '0x72afaecf99c9d9c8215ff44c77b94b99c28741e8',
        heartbeat: 864000000
      },
    },
    [eEthereumNetwork.tenderly]: {},
  },
  ReserveAssets: {
    [eEthereumNetwork.coverage]: {},
    [eEthereumNetwork.hardhat]: {},
    [eEthereumNetwork.buidlerevm]: {},
    [eEthereumNetwork.main]: {},
    [eEthereumNetwork.kovan]: {},
    [eEthereumNetwork.ropsten]: {},
    [eEthereumNetwork.goerli]: {},
    [eEthereumNetwork.tenderly]: {},
  },
  ReservesConfig: {},
  ATokenDomainSeparator: {
    [eEthereumNetwork.coverage]:
      '0x95b73a72c6ecf4ccbbba5178800023260bad8e75cdccdb8e4827a2977a37c820',
    [eEthereumNetwork.hardhat]:
      '0xbae024d959c6a022dc5ed37294cd39c141034b2ae5f02a955cce75c930a81bf5',
    [eEthereumNetwork.buidlerevm]:
      '0xbae024d959c6a022dc5ed37294cd39c141034b2ae5f02a955cce75c930a81bf5',
    [eEthereumNetwork.kovan]: '',
    [eEthereumNetwork.ropsten]: '',
    [eEthereumNetwork.main]: '',
    [eEthereumNetwork.goerli]: '',
    [eEthereumNetwork.tenderly]: '',
  },
  WETH: {
    [eEthereumNetwork.coverage]: '', // deployed in local evm
    [eEthereumNetwork.hardhat]: '', // deployed in local evm
    [eEthereumNetwork.buidlerevm]: '', // deployed in local evm
    [eEthereumNetwork.kovan]: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    [eEthereumNetwork.ropsten]: '0xc778417e063141139fce010982780140aa0cd5ab',
    [eEthereumNetwork.main]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    [eEthereumNetwork.goerli]: '',
    [eEthereumNetwork.tenderly]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  WrappedNativeToken: {
    [eEthereumNetwork.coverage]: '', // deployed in local evm
    [eEthereumNetwork.hardhat]: '', // deployed in local evm
    [eEthereumNetwork.buidlerevm]: '', // deployed in local evm
    [eEthereumNetwork.kovan]: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    [eEthereumNetwork.ropsten]: '0xc778417e063141139fce010982780140aa0cd5ab',
    [eEthereumNetwork.main]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    [eEthereumNetwork.goerli]: '',
    [eEthereumNetwork.tenderly]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  ReserveFactorTreasuryAddress: {//TODO: change this to our addresses
    [eEthereumNetwork.coverage]: '0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49',
    [eEthereumNetwork.hardhat]: '0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49',
    [eEthereumNetwork.buidlerevm]: '0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49',
    [eEthereumNetwork.kovan]: '0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49',
    [eEthereumNetwork.ropsten]: '0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49',
    [eEthereumNetwork.main]: '0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49',
    [eEthereumNetwork.goerli]: '',
    [eEthereumNetwork.tenderly]: '0xF2539a767D6a618A86E0E45D6d7DB3dE6282dE49',
  },
  IncentivesController: {
    [eEthereumNetwork.coverage]: ZERO_ADDRESS,
    [eEthereumNetwork.hardhat]: ZERO_ADDRESS,
    [eEthereumNetwork.buidlerevm]: ZERO_ADDRESS,
    [eEthereumNetwork.kovan]: ZERO_ADDRESS,
    [eEthereumNetwork.ropsten]: ZERO_ADDRESS,
    [eEthereumNetwork.main]: ZERO_ADDRESS,
    [eEthereumNetwork.goerli]: ZERO_ADDRESS,
    [eEthereumNetwork.tenderly]: ZERO_ADDRESS,
  },
  SequencerUptimeFeed: {
    [eEthereumNetwork.coverage]: ZERO_ADDRESS,
    [eEthereumNetwork.hardhat]: ZERO_ADDRESS,
    [eEthereumNetwork.buidlerevm]: ZERO_ADDRESS,
    [eEthereumNetwork.kovan]: ZERO_ADDRESS,
    [eEthereumNetwork.ropsten]: ZERO_ADDRESS,
    [eEthereumNetwork.main]: ZERO_ADDRESS,
    [eEthereumNetwork.goerli]: ZERO_ADDRESS,
    [eEthereumNetwork.tenderly]: ZERO_ADDRESS,
  },
  BeethovenMetadata: {
    [eEthereumNetwork.coverage]: {},
    [eEthereumNetwork.buidlerevm]: {},
    [eEthereumNetwork.coverage]: {},
    [eEthereumNetwork.hardhat]: {},
    [eEthereumNetwork.kovan]: {},
    [eEthereumNetwork.ropsten]: {},
    [eEthereumNetwork.main]: {},
    [eEthereumNetwork.goerli]: {},
    [eEthereumNetwork.tenderly]: {},
  },
  RETHOracle: {
    [eEthereumNetwork.coverage]: ZERO_ADDRESS,
    [eEthereumNetwork.hardhat]: ZERO_ADDRESS,
    [eEthereumNetwork.buidlerevm]: ZERO_ADDRESS,
    [eEthereumNetwork.kovan]: ZERO_ADDRESS,
    [eEthereumNetwork.ropsten]: ZERO_ADDRESS,
    [eEthereumNetwork.main]: ZERO_ADDRESS,
    [eEthereumNetwork.goerli]: ZERO_ADDRESS,
    [eEthereumNetwork.tenderly]: ZERO_ADDRESS,
  },
};
