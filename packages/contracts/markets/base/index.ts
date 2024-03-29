import { addListener } from 'process';
import { oneRay, ZERO_ADDRESS } from '../../helpers/constants';
import { IBaseL2Configuration, IOptimismConfiguration, eBaseNetwork, eEthereumNetwork, eOptimismNetwork } from '../../helpers/types';

import { CommonsConfig } from './commons';
import {
  strategyCbETH,
  strategyUSDbC,
  strategyWETH,
  strategyVeloWETHUSDbC,
  strategyVeloCbETHWETH,
  strategyBIB01,
  strategyBIBTA,
  strategyDAI,
  strategyUSDC,
  strategyVeloDAIUSDC,
  strategyVeloUSDCUSDbC,
  strategyCbETHBPT,
  strategyrETH,
  strategyrETHETHBPT,
  strategycbETHWETHCRV,
  strategyVeloWETHDAI,
  strategywstETH,
  strategyVelowstETHWETH,
  strategyyvVelocbETHWETH,
  strategyyvVeloWETHUSDbC,
  strategyyvVeloUSDCUSDbC,
  strategyyvVeloWETHDAI
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
    rETH: strategyrETH,
    DAI: strategyDAI,
    USDC: strategyUSDC,
    "vAMM-WETH/USDbC": strategyVeloWETHUSDbC,
    "vAMM-cbETH/WETH": strategyVeloCbETHWETH,
    "sAMM-DAI/USDbC": strategyVeloDAIUSDC,
    "sAMM-USDC/USDbC": strategyVeloUSDCUSDbC,
    "vAMM-WETH/DAI": strategyVeloWETHDAI,
    bIB01: strategyBIB01,
    bIBTA: strategyBIBTA,
    "cbETH-WETH-BPT": strategyCbETHBPT,
    "rETH-WETH-BPT": strategyrETHETHBPT,
    "cbETHWETHCRV": strategycbETHWETHCRV,

    wstETH: strategywstETH,
    "vAMM-wstETH/WETH": strategyVelowstETHWETH,
    
    "yv-vAMM-cbETH/WETH": strategyyvVelocbETHWETH,
    "yv-vAMM-WETH/USDbC": strategyyvVeloWETHUSDbC,
    // "yv-vAMM-wstETH/WETH": ""
    "yv-sAMM-USDC/USDbC": strategyyvVeloUSDCUSDbC,
    "yv-vAMM-WETH/DAI": strategyyvVeloWETHDAI
  },
  ReserveAssets: {
    [eBaseNetwork.base]: {
      USDbC: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
      WETH: "0x4200000000000000000000000000000000000006",
      cbETH: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
      rETH: "0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c",
      DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "vAMM-WETH/USDbC": "0xB4885Bc63399BF5518b994c1d0C153334Ee579D0",
      "vAMM-cbETH/WETH": "0x44Ecc644449fC3a9858d2007CaA8CFAa4C561f91",
      "sAMM-DAI/USDbC": "0x6EAB8c1B93f5799daDf2C687a30230a540DbD636",
      "sAMM-USDC/USDbC": "0x27a8Afa3Bd49406e48a074350fB7b2020c43B2bD",
      "vAMM-WETH/DAI": "0x9287C921f5d920cEeE0d07d7c58d476E46aCC640",
      bIB01: "0xCA30c93B02514f86d5C86a6e375E3A330B435Fb5",
      bIBTA: "0x52d134c6DB5889FaD3542A09eAf7Aa90C0fdf9E4",
      "cbETH-WETH-BPT": "0xFb4C2E6E6e27B5b4a07a36360C89EDE29bB3c9B6",
      "rETH-WETH-BPT": "0xC771c1a5905420DAEc317b154EB13e4198BA97D0",
      "cbETHWETHCRV": "0x98244d93d42b42ab3e3a4d12a5dc0b3e7f8f32f9",

      wstETH: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
      "vAMM-wstETH/WETH": '0xA6385c73961dd9C58db2EF0c4EB98cE4B60651e8',

      "yv-vAMM-cbETH/WETH": "0x8C589ADdBe1466a9B555EaA6cE8940Ac1680C5F4",
      "yv-vAMM-WETH/USDbC": "0x58dcE038423A1e43f3429cb62425a1364cc3bb4c",
      // "yv-vAMM-wstETH/WETH": ""
      "yv-sAMM-USDC/USDbC": "0x37fDacD764AA64F4e453842D8056853e5550c09b",
      "yv-vAMM-WETH/DAI": "0xEcFc1e5BDa4d4191c9Cab053ec704347Db87Be5d"
    },
  },
};

export default BaseConfig;
