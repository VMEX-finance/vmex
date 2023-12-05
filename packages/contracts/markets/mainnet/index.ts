import { IMainnetConfiguration, eMainnetNetwork } from '../../helpers/types';

import { CommonsConfig } from './commons';
import {
  strategyWETH,
  strategystETH,
  strategystETHCRV,
  strategywstETH,
  strategyrETH,
  strategystETHv2CRV,
  strategyrETHCRV,
  strategywstETHBPT,
  strategyrETHBPT,
  LSDBaseConfig,
  LSDLPConfig
} from './reservesConfigs';

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const MainnetConfig: IMainnetConfiguration = {
  ...CommonsConfig,
  MarketId: 'VMEX genesis market',
  ProviderId: 1,
  LSDReservesConfig: {
    WETH: LSDBaseConfig,
    stETH: LSDBaseConfig,
    wstETH: LSDBaseConfig,
    rETH: LSDBaseConfig,
    "BPT-WSTETH-WETH": LSDLPConfig,
    "BPT-rETH-ETH": LSDLPConfig,
    stETHCRV: LSDLPConfig,
    stETHv2CRV: LSDLPConfig,
    rETHCRV: LSDLPConfig,
  },

  ReservesConfig: {
    WETH: strategyWETH,
    stETH: strategystETH,
    wstETH: strategywstETH,
    rETH: strategyrETH,
    "BPT-WSTETH-WETH": strategywstETHBPT,
    "BPT-rETH-ETH": strategyrETHBPT,
    stETHCRV: strategystETHCRV,
    stETHv2CRV: strategystETHv2CRV,
    rETHCRV: strategyrETHCRV,
  },
  ReserveAssets: {
    [eMainnetNetwork.mainnet]: {
      WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      stETH: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      wstETH: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
      rETH: '0xae78736Cd615f374D3085123A210448E74Fc6393',
      "BPT-WSTETH-WETH": '0x93d199263632a4EF4Bb438F1feB99e57b4b5f0BD',
      "BPT-rETH-ETH": '0x1E19CF2D73a72Ef1332C882F20534B6519Be0276',
      stETHCRV: '0x06325440d014e39736583c165c2963ba99faf14e',
      stETHv2CRV: '0x21e27a5e5513d6e65c4f830167390997aa84843a',
      rETHCRV: '0x6c38ce8984a890f5e46e6df6117c26b3f1ecfc9c',
    }
},
};

export default MainnetConfig;
