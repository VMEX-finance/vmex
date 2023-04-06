import { addListener } from 'process';
import { oneRay, ZERO_ADDRESS } from '../../helpers/constants';
import { IOptimismConfiguration, eEthereumNetwork, eOptimismNetwork } from '../../helpers/types';

import { CommonsConfig } from './commons';
import {
  strategyDAI,
  strategySUSD,
  strategyUSDC,
  strategyUSDT,
  strategywstETH,
  strategyFRAX,
  strategyOP,
  strategySNX,
  strategyWBTC,
  strategyWETH,
  strategyCurveV1LPToken,
  strategyBeefyToken,
  strategyVeloToken,
} from './reservesConfigs';

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const OptimismConfig: IOptimismConfiguration = {
  ...CommonsConfig,
  MarketId: 'VMEX genesis market OP',
  ProviderId: 10,

  ReservesConfig: {
    DAI: strategyDAI,
    SNX: strategySNX,
    SUSD: strategySUSD,
    USDC: strategyUSDC,
    USDT: strategyUSDT,
    WBTC: strategyWBTC,
    WETH: strategyWETH,
    wstETH: strategywstETH,
    FRAX: strategyFRAX,
    OP: strategyOP,
    ThreeCRV: strategyCurveV1LPToken,
    sUSD3CRV: strategyCurveV1LPToken,
    wstETHCRV: strategyCurveV1LPToken,
    mooCurveFsUSD: strategyBeefyToken,
    mooCurveWSTETH: strategyBeefyToken,
    velo_wstETHWETH: strategyVeloToken,
    moo_velo_wstETHWETH: strategyBeefyToken,
    velo_USDCsUSD: strategyVeloToken,
    moo_velo_USDCsUSD: strategyBeefyToken,
    velo_ETHUSDC: strategyVeloToken,
    moo_velo_ETHUSDC: strategyBeefyToken,
    velo_OPETH: strategyVeloToken,
    moo_velo_OPETH: strategyBeefyToken,
    velo_ETHSNX: strategyVeloToken,
    moo_velo_ETHSNX: strategyBeefyToken,
    velo_OPUSDC: strategyVeloToken,
    moo_velo_OPUSDC: strategyBeefyToken,
    velo_DAIUSDC: strategyVeloToken,
    moo_velo_DAIUSDC: strategyBeefyToken,
    velo_FRAXUSDC: strategyVeloToken,
    moo_velo_FRAXUSDC: strategyBeefyToken,
    velo_USDTUSDC: strategyVeloToken,
    moo_velo_USDTUSDC: strategyBeefyToken,
  },
  ReserveAssets: {
    [eOptimismNetwork.optimism]: {
      DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      SNX: '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4',
      SUSD: '0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9',
      USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      WBTC: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
      WETH: '0x4200000000000000000000000000000000000006',
      wstETH: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
      FRAX: '0x2E3D870790dC77A83DD1d18184Acc7439A53f475',
      OP: '0x4200000000000000000000000000000000000042',
      ThreeCRV: '0x1337BedC9D22ecbe766dF105c9623922A27963EC',
      sUSD3CRV: '0x061b87122Ed14b9526A813209C8a59a633257bAb',
      wstETHCRV: '0xEfDE221f306152971D8e9f181bFe998447975810',
      mooCurveFsUSD: '0x107Dbf9c9C0EF2Df114159e5C7DC2baf7C444cFF',
      mooCurveWSTETH: '0x0892a178c363b4739e5Ac89E9155B9c30214C0c0',

      velo_wstETHWETH: '0xBf205335De602ac38244F112d712ab04CB59A498',
      moo_velo_wstETHWETH: '0xcAdC68d5834898D54929E694eD19e833e0117694',
      velo_USDCsUSD: '0xd16232ad60188B68076a235c65d692090caba155',
      moo_velo_USDCsUSD: '0x2232455bf4622002c1416153EE59fd32B239863B',
      velo_ETHUSDC: '0x79c912FEF520be002c2B6e57EC4324e260f38E50',
      moo_velo_ETHUSDC: '0xB708038C1b4cF9f91CcB918DAD1B9fD757ADa5C1',
      velo_OPETH: '0xcdd41009E74bD1AE4F7B2EeCF892e4bC718b9302',
      moo_velo_OPETH: '0xC9737c178d327b410068a1d0ae2D30ef8e428754',
      velo_ETHSNX: '0xffb6c35960b23989037c8c391facebc8a17de970',
      moo_velo_ETHSNX: '0x40324434a0b53dd1ED167Ba30dcB6B4bd7a9536d',
      velo_OPUSDC: '0x47029bc8f5CBe3b464004E87eF9c9419a48018cd',
      moo_velo_OPUSDC: '0x613f54c8836FD2C09B910869AC9d4de5e49Db1d8',
      velo_DAIUSDC: '0x4F7ebc19844259386DBdDB7b2eB759eeFc6F8353',
      moo_velo_DAIUSDC: '0x43F6De3D9fB0D5EED93d7E7E14A8A526B98f8A58',
      velo_FRAXUSDC: '0xAdF902b11e4ad36B227B84d856B229258b0b0465',
      moo_velo_FRAXUSDC: '0x587c3e2e17c59b09B120fc2D27E0eAd6edD2C71D',
      velo_USDTUSDC: '0xe08d427724d8a2673FE0bE3A81b7db17BE835B36',
      moo_velo_USDTUSDC: '0x0495a700407975b2641Fa61Aef5Ccd0106F525Cc',
    },
  },
};

export default OptimismConfig;
