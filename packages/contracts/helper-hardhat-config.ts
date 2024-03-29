// @ts-ignore
import { HardhatNetworkForkingUserConfig, HardhatUserConfig } from 'hardhat/types';
import {
  eArbitrumNetwork,
  eAvalancheNetwork,
  eBaseNetwork,
  eEthereumNetwork,
  eOptimismNetwork,
  ePolygonNetwork,
  eXDaiNetwork,
  iParamsPerNetwork,
} from './helpers/types';

require('dotenv').config();

const INFURA_KEY = process.env.INFURA_KEY || '';
const ALCHEMY_KEY = process.env.ALCHEMY_KEY || '';
const SEPOLIA_ALCHEMY_KEY = process.env.SEPOLIA_ALCHEMY_KEY || '';
const OP_ALCHEMY_KEY = process.env.OP_ALCHEMY_KEY || '';
const BASE_ALCHEMY_KEY = process.env.BASE_ALCHEMY_KEY || '';
const ARBITRUM_ALCHEMY_KEY = process.env.ARBITRUM_ALCHEMY_KEY || '';
const TENDERLY_FORK_ID = process.env.TENDERLY_FORK_ID || '';
const FORK = process.env.FORK || '';
const FORK_BLOCK_NUMBER = process.env.FORK_BLOCK_NUMBER
  ? parseInt(process.env.FORK_BLOCK_NUMBER)
  : 0;

const GWEI = 1000 * 1000 * 1000;

export const buildForkConfig = (): HardhatNetworkForkingUserConfig | undefined => {
  let forkMode;
  if (FORK) {
    forkMode = {
      url: NETWORKS_RPC_URL[FORK],
    };
    if (FORK_BLOCK_NUMBER || BLOCK_TO_FORK[FORK]) {
      forkMode.blockNumber = FORK_BLOCK_NUMBER || BLOCK_TO_FORK[FORK];
    }
  }
  return forkMode;
};

export const NETWORKS_RPC_URL: iParamsPerNetwork<string> = {
  [eEthereumNetwork.goerli]: ALCHEMY_KEY
    ? `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_KEY}`
    : `https://goerli.infura.io/v3/${INFURA_KEY}`,
  [eEthereumNetwork.sepolia]: SEPOLIA_ALCHEMY_KEY
    ? `https://eth-sepolia.g.alchemy.com/v2/${SEPOLIA_ALCHEMY_KEY}`
    : `https://sepolia.infura.io/v3/${INFURA_KEY}`,
  [eEthereumNetwork.kovan]: ALCHEMY_KEY
    ? `https://eth-kovan.alchemyapi.io/v2/${ALCHEMY_KEY}`
    : `https://kovan.infura.io/v3/${INFURA_KEY}`,
  [eEthereumNetwork.ropsten]: ALCHEMY_KEY
    ? `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_KEY}`
    : `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  [eEthereumNetwork.main]: ALCHEMY_KEY
    ? `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`
    : `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  [eEthereumNetwork.coverage]: 'http://localhost:8555',
  [eEthereumNetwork.hardhat]: 'http://localhost:8545',
  [eEthereumNetwork.buidlerevm]: 'http://localhost:8545',
  [eEthereumNetwork.tenderly]: `https://rpc.tenderly.co/fork/${TENDERLY_FORK_ID}`,
  [ePolygonNetwork.mumbai]: 'https://rpc-mumbai.maticvigil.com',
  [ePolygonNetwork.matic]:
    // 'https://rpc-mainnet.maticvigil.com/v1/e616b9ddc7598ffae92629f8145614d55094c722',
    'https://polygon-mainnet.g.alchemy.com/v2/6NUmfWDZw6lC3RPAphj0p_2vm7ElOn2U',
  // [ePolygonNetwork.matic]: 'https://rpc-mainnet.matic.network',
  [eXDaiNetwork.xdai]: 'https://rpc.xdaichain.com/',
  [eAvalancheNetwork.avalanche]: 'https://api.avax.network/ext/bc/C/rpc',
  [eAvalancheNetwork.fuji]: 'https://api.avax-test.network/ext/bc/C/rpc',
  [eOptimismNetwork.optimism]:
    //`https://mainnet.optimism.io`,
    `https://opt-mainnet.g.alchemy.com/v2/${OP_ALCHEMY_KEY}`,
  [eBaseNetwork.base]:
    //`https://mainnet.optimism.io`,
    `https://base-mainnet.g.alchemy.com/v2/${BASE_ALCHEMY_KEY}`,
  [eArbitrumNetwork.arbitrum]:
    `https://arb-mainnet.g.alchemy.com/v2/${ARBITRUM_ALCHEMY_KEY}`,
};

export const NETWORKS_DEFAULT_GAS: iParamsPerNetwork<number | string> = {
  [eEthereumNetwork.kovan]: 3 * GWEI,
  [eEthereumNetwork.goerli]: 3 * GWEI,
  [eEthereumNetwork.sepolia]: 3 * GWEI,
  [eEthereumNetwork.ropsten]: 65 * GWEI,
  [eEthereumNetwork.main]: 8000000000,
  [eEthereumNetwork.coverage]: 65 * GWEI,
  [eEthereumNetwork.hardhat]: 65 * GWEI,
  [eEthereumNetwork.buidlerevm]: 65 * GWEI,
  [eEthereumNetwork.tenderly]: 1 * GWEI,
  [ePolygonNetwork.mumbai]: 35 * GWEI,
  [ePolygonNetwork.matic]: 35 * GWEI,
  [eXDaiNetwork.xdai]: 1 * GWEI,
  [eAvalancheNetwork.avalanche]: 225 * GWEI,
  [eAvalancheNetwork.fuji]: 85 * GWEI,
  [eOptimismNetwork.optimism]: "auto",
  [eBaseNetwork.base]: "auto",
};

export const BLOCK_TO_FORK: iParamsPerNetwork<number | undefined> = {
  [eEthereumNetwork.main]: 16408037,//16173821 works for steth eth //15373013
  [eEthereumNetwork.kovan]: undefined,
  [eEthereumNetwork.ropsten]: undefined,
  [eEthereumNetwork.coverage]: undefined,
  [eEthereumNetwork.hardhat]: undefined,
  [eEthereumNetwork.buidlerevm]: undefined,
  [eEthereumNetwork.tenderly]: undefined,
  [ePolygonNetwork.mumbai]: undefined,
  [ePolygonNetwork.matic]: undefined,
  [eXDaiNetwork.xdai]: undefined,
  [eAvalancheNetwork.avalanche]: undefined,
  [eAvalancheNetwork.fuji]: undefined,
  [eOptimismNetwork.optimism]: 106761131,
  [eBaseNetwork.base]: 6877400,
  [eArbitrumNetwork.arbitrum]: 136565633,
};
