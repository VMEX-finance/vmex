import path from 'path';
import fs from 'fs';
import { HardhatUserConfig } from 'hardhat/types';
// @ts-ignore
import { accounts } from './test-wallets.js';
import {
  eArbitrumNetwork,
  eAvalancheNetwork,
  eBaseNetwork,
  eEthereumNetwork,
  eNetwork,
  eOptimismNetwork,
  ePolygonNetwork,
  eXDaiNetwork,
} from './helpers/types';
import { BUIDLEREVM_CHAINID, COVERAGE_CHAINID } from './helpers/buidler-constants';
import {
  NETWORKS_RPC_URL,
  NETWORKS_DEFAULT_GAS,
  BLOCK_TO_FORK,
  buildForkConfig,
} from './helper-hardhat-config';
// import "hardhat-contract-sizer";
import 'hardhat-test-utils';

require('dotenv').config();
require("@eth-optimism/plugins/hardhat");

import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import 'hardhat-gas-reporter';
import 'hardhat-typechain';
import '@tenderly/hardhat-tenderly';
import "hardhat-deploy";
import 'solidity-coverage';

const SKIP_LOAD = process.env.SKIP_LOAD === 'true';
const DEFAULT_BLOCK_GAS_LIMIT = 30_000_000;
const DEFAULT_GAS_MUL = 2;
const HARDFORK = 'shanghai';
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY || '';
const OP_ETHERSCAN_KEY = process.env.OP_ETHERSCAN_KEY || '';
const BASE_ETHERSCAN_KEY = process.env.BASE_ETHERSCAN_KEY || '';
const ARBITRUM_ETHERSCAN_KEY = process.env.ARBITRUM_ETHERSCAN_KEY || '';
const MNEMONIC_PATH = "m/44'/60'/0'/0";
const MNEMONIC = process.env.MNEMONIC || '';
const UNLIMITED_BYTECODE_SIZE = process.env.UNLIMITED_BYTECODE_SIZE === 'true';

// Prevent to load scripts before compilation and typechain
if (!SKIP_LOAD) {
  ['misc', 'migrations', 'dev', 'full', 'verifications', 'deployments', 'helpers', 'add_new_assets'].forEach(
    (folder) => {
      const tasksPath = path.join(__dirname, 'tasks', folder);
      fs.readdirSync(tasksPath)
        .filter((pth) => pth.includes('.ts'))
        .forEach((task) => {
          require(`${tasksPath}/${task}`);
        });
    }
  );
}

require(`${path.join(__dirname, 'tasks/misc')}/set-bre.ts`);

const getCommonNetworkConfig = (networkName: eNetwork, networkId: number) => ({
  url: NETWORKS_RPC_URL[networkName],
  hardfork: HARDFORK,
  blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
  gasMultiplier: DEFAULT_GAS_MUL,
  gasPrice: NETWORKS_DEFAULT_GAS[networkName],
  chainId: networkId,
  accounts: {
    mnemonic: MNEMONIC,
    path: MNEMONIC_PATH,
    initialIndex: 0,
    count: 20,
  },
});

let forkMode;


const buidlerConfig: HardhatUserConfig = {
  solidity: {
    version: '0.8.19', //As of Apr 9, 2023, 0.8.19 is the latest, and 0.8.18 has limited support for console logs and other stack traces.
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  typechain: {
    outDir: 'types',
    target: 'ethers-v5',
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_KEY,
      optimisticEthereum: OP_ETHERSCAN_KEY,
      base: BASE_ETHERSCAN_KEY,
      sepolia: ETHERSCAN_KEY,
      arbitrumOne: ARBITRUM_ETHERSCAN_KEY,
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      }
    ]
  },
  mocha: {
    timeout: 0,
  },
  networks: {
    arbitrum: getCommonNetworkConfig(eArbitrumNetwork.arbitrum, 42161),
    arbitrum_localhost: {
      url: "http://0.0.0.0:8545",
      forking: buildForkConfig(),
      chainId: 31337,
    },
    base: getCommonNetworkConfig(eBaseNetwork.base, 8453),
    base_localhost: {
      url: "http://0.0.0.0:8545",
      forking: buildForkConfig(),
      chainId: 31337,
    },
    optimism: getCommonNetworkConfig(eOptimismNetwork.optimism, 10),
    optimism_localhost: {
      url: "http://0.0.0.0:8545",
      forking: buildForkConfig(),
      chainId: 31337,
    },
    coverage: {
      url: 'http://localhost:8555',
      chainId: COVERAGE_CHAINID,
    },
    kovan: getCommonNetworkConfig(eEthereumNetwork.kovan, 42),
    ropsten: getCommonNetworkConfig(eEthereumNetwork.ropsten, 3),
    goerli: getCommonNetworkConfig(eEthereumNetwork.goerli, 5),
    sepolia: getCommonNetworkConfig(eEthereumNetwork.sepolia, 11155111),
    main: getCommonNetworkConfig(eEthereumNetwork.main, 1),
    tenderly: getCommonNetworkConfig(eEthereumNetwork.tenderly, 1),
    matic: getCommonNetworkConfig(ePolygonNetwork.matic, 137),
    mumbai: getCommonNetworkConfig(ePolygonNetwork.mumbai, 80001),
    xdai: getCommonNetworkConfig(eXDaiNetwork.xdai, 100),
    avalanche: getCommonNetworkConfig(eAvalancheNetwork.avalanche, 43114),
    fuji: getCommonNetworkConfig(eAvalancheNetwork.fuji, 43113),
    hardhat: {
      hardfork: 'merge',
      blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
      gas: DEFAULT_BLOCK_GAS_LIMIT,
      gasPrice: 80000000000,
      allowUnlimitedContractSize: UNLIMITED_BYTECODE_SIZE,
      saveDeployments: true,
      chainId: BUIDLEREVM_CHAINID,
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      accounts: accounts.map(({ secretKey, balance }: { secretKey: string; balance: string }) => ({
        privateKey: secretKey,
        balance,
      })),
      forking: buildForkConfig(),
    },
    localhost: {
      hardfork: 'merge',
      blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
      gas: DEFAULT_BLOCK_GAS_LIMIT,
      url: "http://0.0.0.0:8545",
      chainId: 31337,
      saveDeployments: true,
      gasPrice: 80000000000,
      forking: buildForkConfig(),
      timeout: 150000,
    },
    buidlerevm_docker: {
      hardfork: 'berlin',
      blockGasLimit: 9500000,
      gas: 9500000,
      gasPrice: 8000000000,
      chainId: BUIDLEREVM_CHAINID,
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      url: 'http://localhost:8545',
    },
    ganache: {
      url: 'http://ganache:8545',
      accounts: {
        mnemonic: 'fox sight canyon orphan hotel grow hedgehog build bless august weather swarm',
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },
    },
  },
};

export default buidlerConfig;
