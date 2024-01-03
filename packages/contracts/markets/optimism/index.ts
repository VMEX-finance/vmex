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
  strategyRETH,
  strategyBeefywstETHCRVToken,
  strategyVelorETH,
  strategyBeethovenwstETHETH,
  strategyStableYearn,
  strategyLUSD,
  strategyYearnWETHToken,
  strategy3Curve,
  strategysUSD3Curve,
  strategywstETHCRV,
  strategyVelowstETHWETH,
  strategyVeloUSDCsUSD,
  strategyVeloETHUSDC,
  strategyVeloOPETH,
  strategyVeloOPUSDC,
  strategyVeloDAIUSDC,
  strategyVeloUSDTUSDC,
  strategyVeloLUSDWETH,
  strategyVeloLUSDUSDC,
  strategyBeethovenrETHETH,
  strategyVeloUSDCOP,
  strategyVeloWETHOP,
  strategyVelowstETHOP,
  strategyyvVeloUSDCOP,
  strategyyvVeloUSDCsUSD,
  strategyyvVeloWETHOP,
  strategyyvVeloWETHUSDC,
  strategyyvVelowstETHOP,
  strategyyvVelowstETHWETH
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
    sUSD: strategySUSD,
    USDC: strategyUSDC,
    USDT: strategyUSDT,
    WBTC: strategyWBTC,
    WETH: strategyWETH,
    wstETH: strategywstETH,
    FRAX: strategyFRAX,
    OP: strategyOP,
    rETH: strategyRETH,
    "3CRV": strategy3Curve,
    "sUSD3CRV-f": strategysUSD3Curve,
    wstETHCRV: strategywstETHCRV,
    // mooCurveFsUSD: strategyBeefyToken,
    mooCurveWSTETH: strategyBeefywstETHCRVToken,
    velo_rETHWETH: strategyVelorETH,
    "vAMMV2-wstETH/WETH": strategyVelowstETHWETH,
    // moo_velo_wstETHWETH: strategyBeefyToken,
    "sAMMV2-USDC/sUSD": strategyVeloUSDCsUSD,
    // moo_velo_USDCsUSD: strategyBeefyToken,
    "vAMMV2-WETH/USDC": strategyVeloETHUSDC,
    // moo_velo_ETHUSDC: strategyBeefyToken,
    velo_OPETH: strategyVeloOPETH,
    // moo_velo_OPETH: strategyBeefyToken,
    // velo_ETHSNX: strategyVeloToken,
    // moo_velo_ETHSNX: strategyBeefyToken,
    velo_OPUSDC: strategyVeloOPUSDC,
    // moo_velo_OPUSDC: strategyBeefyToken,
    "sAMMV2-USDC/DAI": strategyVeloDAIUSDC,
    // moo_velo_DAIUSDC: strategyBeefyToken,
    // velo_FRAXUSDC: strategyVeloStableToken,
    // moo_velo_FRAXUSDC: strategyBeefyToken,
    velo_USDTUSDC: strategyVeloUSDTUSDC,
    // moo_velo_USDTUSDC: strategyBeefyToken,
    // beethoven_USDCDAI: strategyBeethovenToken,
    "BPT-WSTETH-WETH": strategyBeethovenwstETHETH,
    // beethoven_WETHOPUSDC: strategyBeethovenToken,
    "BPT-rETH-ETH": strategyBeethovenrETHETH,
    yvUSDC: strategyStableYearn,
    yvUSDT: strategyStableYearn,
    yvDAI: strategyStableYearn,
    yvWETH: strategyYearnWETHToken,
    LUSD: strategyLUSD,
    "vAMMV2-WETH/LUSD": strategyVeloLUSDWETH,
    "sAMMV2-USDC/LUSD": strategyVeloLUSDUSDC,
    "vAMMV2-wstETH/OP": strategyVelowstETHOP,
    "vAMMV2-WETH/OP": strategyVeloWETHOP,
    "vAMMV2-USDC/OP": strategyVeloUSDCOP,
    "yv-sAMMV2-USDC/sUSD": strategyyvVeloUSDCsUSD,
    "yv-vAMMV2-WETH/USDC": strategyyvVeloWETHUSDC,
    "yv-vAMMV2-wstETH/WETH": strategyyvVelowstETHWETH,
    "yv-vAMMV2-wstETH/OP": strategyyvVelowstETHOP,
    "yv-vAMMV2-WETH/OP": strategyyvVeloWETHOP,
    "yv-vAMMV2-USDC/OP": strategyyvVeloUSDCOP,
  },
  ReserveAssets: {
    [eOptimismNetwork.optimism]: {
      DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      // SNX: '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4',
      sUSD: '0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9',
      USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      WBTC: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
      WETH: '0x4200000000000000000000000000000000000006',
      wstETH: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
      FRAX: '0x2E3D870790dC77A83DD1d18184Acc7439A53f475',
      OP: '0x4200000000000000000000000000000000000042',
      rETH: '0x9Bcef72be871e61ED4fBbc7630889beE758eb81D',
      LUSD: '0xc40F949F8a4e094D1b49a23ea9241D289B7b2819',

      "3CRV": '0x1337BedC9D22ecbe766dF105c9623922A27963EC',
      "sUSD3CRV-f": '0x061b87122Ed14b9526A813209C8a59a633257bAb',
      wstETHCRV: '0xEfDE221f306152971D8e9f181bFe998447975810',

      // mooCurveFsUSD: '0x107Dbf9c9C0EF2Df114159e5C7DC2baf7C444cFF',
      mooCurveWSTETH: '0x0892a178c363b4739e5Ac89E9155B9c30214C0c0',
      
      // velo_rETHWETH: "0x7e0F65FAB1524dA9E2E5711D160541cf1199912E",
      "vAMMV2-wstETH/WETH": '0x6dA98Bde0068d10DDD11b468b197eA97D96F96Bc',
      // moo_velo_wstETHWETH: '0xcAdC68d5834898D54929E694eD19e833e0117694',
      "sAMMV2-USDC/sUSD": '0x6d5BA400640226e24b50214d2bBb3D4Db8e6e15a',
      // moo_velo_USDCsUSD: '0x2232455bf4622002c1416153EE59fd32B239863B',
      "vAMMV2-WETH/USDC": '0x0493Bf8b6DBB159Ce2Db2E0E8403E753Abd1235b',
      // moo_velo_ETHUSDC: '0xB708038C1b4cF9f91CcB918DAD1B9fD757ADa5C1',
      // velo_OPETH: '0xd25711EdfBf747efCE181442Cc1D8F5F8fc8a0D3',
      // moo_velo_OPETH: '0xC9737c178d327b410068a1d0ae2D30ef8e428754',
      // velo_ETHSNX: '0x1Bf31A0932A0035c532A7b1DCB94ffe0b35aed14', //new: currently has very little tvl in v2
      // moo_velo_ETHSNX: '0x40324434a0b53dd1ED167Ba30dcB6B4bd7a9536d',
      // velo_OPUSDC: '0x0df083de449F75691fc5A36477a6f3284C269108',
      // moo_velo_OPUSDC: '0x613f54c8836FD2C09B910869AC9d4de5e49Db1d8',
      "sAMMV2-USDC/DAI": '0x19715771E30c93915A5bbDa134d782b81A820076',
      // moo_velo_DAIUSDC: '0x43F6De3D9fB0D5EED93d7E7E14A8A526B98f8A58',
      // velo_FRAXUSDC: '0x8542DD4744edEa38b8a9306268b08F4D26d38581',
      // moo_velo_FRAXUSDC: '0x587c3e2e17c59b09B120fc2D27E0eAd6edD2C71D',
      // velo_USDTUSDC: '0x2B47C794c3789f499D8A54Ec12f949EeCCE8bA16',
      // moo_velo_USDTUSDC: '0x0495a700407975b2641Fa61Aef5Ccd0106F525Cc',
      // beethoven_USDCDAI: '0x43da214fab3315aA6c02e0B8f2BfB7Ef2E3C60A5',
      "vAMMV2-WETH/LUSD": '0x6387765fFA609aB9A1dA1B16C455548Bfed7CbEA',
      "sAMMV2-USDC/LUSD": "0xf04458f7B21265b80FC340dE7Ee598e24485c5bB",

      "BPT-WSTETH-WETH": '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2',
      // beethoven_WETHOPUSDC: '0x39965c9dAb5448482Cf7e002F583c812Ceb53046',
      "BPT-rETH-ETH": '0x4Fd63966879300caFafBB35D157dC5229278Ed23',
      
      yvUSDC: '0xaD17A225074191d5c8a37B50FdA1AE278a2EE6A2',
      yvUSDT: '0xFaee21D0f0Af88EE72BB6d68E54a90E6EC2616de',
      yvDAI: '0x65343F414FFD6c97b0f6add33d16F6845Ac22BAc',
      yvWETH: '0x5B977577Eb8a480f63e11FC615D6753adB8652Ae',
      
      "vAMMV2-wstETH/OP": '0x7178F61694ba9109205B8d6F686282307625e62D',
      "vAMMV2-WETH/OP": '0xd25711EdfBf747efCE181442Cc1D8F5F8fc8a0D3',
      "vAMMV2-USDC/OP": '0x0df083de449F75691fc5A36477a6f3284C269108',

      "yv-sAMMV2-USDC/sUSD": '0x1B1d2EfB6045851F8ccdE24369003e0fF157980b',
      "yv-vAMMV2-WETH/USDC": '0xF89FdBBCE1A707061e9d59B8E4387f89798B4d10',
      "yv-vAMMV2-wstETH/WETH": '0x6Ec9d003f0e5184Ee54c1d899B414322a0f0Dc07',
      "yv-vAMMV2-wstETH/OP": '0x830cB4AabF786b9349d9701dD8ee073215d95174',
      "yv-vAMMV2-WETH/OP": '0xDdDCAeE873f2D9Df0E18a80709ef2B396d4a6EA5',
      "yv-vAMMV2-USDC/OP": '0x3AD9566b15AACDd26d8a220cA8635F925EA7a3f6',
    },
  },
};

export default OptimismConfig;
