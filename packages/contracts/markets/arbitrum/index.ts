import { addListener } from 'process';
import { oneRay, ZERO_ADDRESS } from '../../helpers/constants';
import { IArbitrumConfiguration, eArbitrumNetwork } from '../../helpers/types';

import { CommonsConfig } from './commons';
import {
  strategywstETH,
  strategyUSDCe,
  strategyWETH,
  strategyChronosWETHUSDC,
  strategyChronosWETHUSDT,
  strategyWBTC,
  strategyARB,
  strategyDAI,
  strategyFRAX,
  strategyLUSD,
  strategyUSDC,
  strategyUSDT,
  strategyrETH,
  strategy2CRV,
  strategyFRAXCRV,
  strategyWstETHBPT,
  strategyrETHBPT,
  strategywstETHCRV,
  strategyCMLTARB,
  strategyCMLTETHUSDC,
  strategyCMLTLUSD,
  strategyCMLTUSDTUSDC,
  strategyCMLTwstETH
} from './reservesConfigs';

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const ArbitrumConfig: IArbitrumConfiguration = {
  ...CommonsConfig,
  MarketId: 'VMEX genesis market Arbitrum',
  ProviderId: 42161,

  ReservesConfig: {
    "USDC.e": strategyUSDCe,
    WETH: strategyWETH,
    wstETH: strategywstETH,
    WBTC: strategyWBTC,
    USDT: strategyUSDT,
    USDC: strategyUSDC,
    DAI: strategyDAI,
    ARB: strategyARB,
    rETH: strategyrETH,
    LUSD: strategyLUSD,
    FRAX: strategyFRAX,
    "vAMM-WETH/USDC": strategyChronosWETHUSDC,
    "vAMM-WETH/USDT": strategyChronosWETHUSDT,
    "wstETH-WETH-BPT": strategyWstETHBPT,
    "rETH-WETH-BPT": strategyrETHBPT,
    "2CRV": strategy2CRV,
    "wstETHCRV": strategywstETHCRV,
    "FRAXBPCRV-f": strategyFRAXCRV,
    "CMLT-ARB-ETH": strategyCMLTARB,
    "CMLT-ETH-USDC.e": strategyCMLTETHUSDC,
    "CMLT-USDT-USDC.e": strategyCMLTUSDTUSDC,
    "CMLT-wstETH-ETH": strategyCMLTwstETH,
    "CMLT-LUSD-USDC.e": strategyCMLTLUSD,
  },
  ReserveAssets: {
    [eArbitrumNetwork.arbitrum]: {
      "USDC.e": "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", 
      WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      wstETH: "0x5979D7b546E38E414F7E9822514be443A4800529",
      WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548",
      rETH: "0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8",
      LUSD: "0x93b346b6BC2548dA6A1E7d98E9a421B42541425b",
      FRAX: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
      // "vAMM-WETH/USDC": "0xA2F1C1B52E1b7223825552343297Dc68a29ABecC",
      // "vAMM-WETH/USDT": "0x8a263Cc1DfDCe6c64e2A1cf6133c22eED5D4E29d",
      "wstETH-WETH-BPT": "0x9791d590788598535278552EEcD4b211bFc790CB",
      "rETH-WETH-BPT": "0xadE4A71BB62bEc25154CFc7e6ff49A513B491E81",
      "2CRV": "0x7f90122BF0700F9E7e1F688fe926940E8839F353",
      "wstETHCRV": "0xDbcD16e622c95AcB2650b38eC799f76BFC557a0b",
      "FRAXBPCRV-f": "0xc9b8a3fdecb9d5b218d02555a8baf332e5b740d5",
      "CMLT-ARB-ETH": "0xa6c5C7D189fA4eB5Af8ba34E63dCDD3a635D433f",
      "CMLT-ETH-USDC.e": "0x84652bb2539513BAf36e225c930Fdd8eaa63CE27",
      "CMLT-USDT-USDC.e": "0x1C31fB3359357f6436565cCb3E982Bc6Bf4189ae",
      "CMLT-wstETH-ETH": "0x5201f6482EEA49c90FE609eD9d8F69328bAc8ddA",
      "CMLT-LUSD-USDC.e": "0x1e5b183b589A1d30aE5F6fDB8436F945989828Ca",
    },
  },
};

export default ArbitrumConfig;
