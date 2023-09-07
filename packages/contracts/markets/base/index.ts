import { addListener } from 'process';
import { oneRay, ZERO_ADDRESS } from '../../helpers/constants';
import { IBaseL2Configuration, IOptimismConfiguration, eBaseNetwork, eEthereumNetwork, eOptimismNetwork } from '../../helpers/types';

import { CommonsConfig } from './commons';
import {
  strategyCbETH,
  strategyUSDbC,
  strategyWETH,
  strategyVeloWETHUSDbC,
  strategyVeloCbETHWETH
} from './reservesConfigs';

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const BaseConfig: IBaseL2Configuration = {
  ...CommonsConfig,
  MarketId: 'VMEX genesis market Base',
  ProviderId: 8453,

  ReservesConfig: {
    USDbC: strategyUSDbC,
    WETH: strategyWETH,
    cbETH: strategyCbETH,
    "vAMM-WETH/USDbC": strategyVeloWETHUSDbC,
    "vAMM-cbETH/WETH": strategyVeloCbETHWETH,
  },
  ReserveAssets: {
    [eBaseNetwork.base]: {
      USDbC: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
      WETH: "0x4200000000000000000000000000000000000006",
      cbETH: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
      "vAMM-WETH/USDbC": "0xB4885Bc63399BF5518b994c1d0C153334Ee579D0",
      "vAMM-cbETH/WETH": "0x44Ecc644449fC3a9858d2007CaA8CFAa4C561f91",
    },
  },
};

export default BaseConfig;
