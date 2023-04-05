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
      wstETH: '0x4B3488123649E8A671097071A02DA8537fE09A16',
      FRAX: '0x2E3D870790dC77A83DD1d18184Acc7439A53f475',
      OP: '0x4200000000000000000000000000000000000042',
      ThreeCRV: '0x1337BedC9D22ecbe766dF105c9623922A27963EC',
      sUSD3CRV: '0x061b87122Ed14b9526A813209C8a59a633257bAb',
      wstETHCRV: '0xEfDE221f306152971D8e9f181bFe998447975810',
      mooCurveFsUSD: '0x107Dbf9c9C0EF2Df114159e5C7DC2baf7C444cFF',
      mooCurveWSTETH: '0x0892a178c363b4739e5Ac89E9155B9c30214C0c0',
    },
  },
};

export default OptimismConfig;
