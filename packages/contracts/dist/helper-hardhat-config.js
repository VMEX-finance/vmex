"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLOCK_TO_FORK = exports.NETWORKS_DEFAULT_GAS = exports.NETWORKS_RPC_URL = exports.buildForkConfig = void 0;
const types_1 = require("./helpers/types");
require('dotenv').config();
const INFURA_KEY = process.env.INFURA_KEY || '';
const ALCHEMY_KEY = process.env.ALCHEMY_KEY || '';
const TENDERLY_FORK_ID = process.env.TENDERLY_FORK_ID || '';
const FORK = process.env.FORK || '';
const FORK_BLOCK_NUMBER = process.env.FORK_BLOCK_NUMBER
    ? parseInt(process.env.FORK_BLOCK_NUMBER)
    : 0;
const GWEI = 1000 * 1000 * 1000;
const buildForkConfig = () => {
    let forkMode;
    console.log("$$$$$$$$$$$$ process.env.FORK ", process.env.FORK);
    console.log("$$$$$$$$$$$$ FORK ", FORK);
    if (FORK) {
        forkMode = {
            url: exports.NETWORKS_RPC_URL[FORK],
        };
        if (FORK_BLOCK_NUMBER || exports.BLOCK_TO_FORK[FORK]) {
            forkMode.blockNumber = FORK_BLOCK_NUMBER || exports.BLOCK_TO_FORK[FORK];
        }
    }
    // console.log("$$$$$$$$$$$$ ",forkMode.url);
    return forkMode;
};
exports.buildForkConfig = buildForkConfig;
exports.NETWORKS_RPC_URL = {
    [types_1.eEthereumNetwork.kovan]: ALCHEMY_KEY
        ? `https://eth-kovan.alchemyapi.io/v2/${ALCHEMY_KEY}`
        : `https://kovan.infura.io/v3/${INFURA_KEY}`,
    [types_1.eEthereumNetwork.ropsten]: ALCHEMY_KEY
        ? `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_KEY}`
        : `https://ropsten.infura.io/v3/${INFURA_KEY}`,
    [types_1.eEthereumNetwork.main]: ALCHEMY_KEY
        ? `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`
        : `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    [types_1.eEthereumNetwork.coverage]: 'http://localhost:8555',
    [types_1.eEthereumNetwork.hardhat]: 'http://localhost:8545',
    [types_1.eEthereumNetwork.buidlerevm]: 'http://localhost:8545',
    [types_1.eEthereumNetwork.tenderly]: `https://rpc.tenderly.co/fork/`,
    [types_1.ePolygonNetwork.mumbai]: 'https://rpc-mumbai.maticvigil.com',
    [types_1.ePolygonNetwork.matic]: 
    // 'https://rpc-mainnet.maticvigil.com/v1/e616b9ddc7598ffae92629f8145614d55094c722',
    'https://polygon-mainnet.g.alchemy.com/v2/6NUmfWDZw6lC3RPAphj0p_2vm7ElOn2U',
    // [ePolygonNetwork.matic]: 'https://rpc-mainnet.matic.network',
    [types_1.eXDaiNetwork.xdai]: 'https://rpc.xdaichain.com/',
    [types_1.eAvalancheNetwork.avalanche]: 'https://api.avax.network/ext/bc/C/rpc',
    [types_1.eAvalancheNetwork.fuji]: 'https://api.avax-test.network/ext/bc/C/rpc',
};
exports.NETWORKS_DEFAULT_GAS = {
    [types_1.eEthereumNetwork.kovan]: 3 * GWEI,
    [types_1.eEthereumNetwork.ropsten]: 65 * GWEI,
    [types_1.eEthereumNetwork.main]: 8000000000,
    [types_1.eEthereumNetwork.coverage]: 65 * GWEI,
    [types_1.eEthereumNetwork.hardhat]: 65 * GWEI,
    [types_1.eEthereumNetwork.buidlerevm]: 65 * GWEI,
    [types_1.eEthereumNetwork.tenderly]: 1 * GWEI,
    [types_1.ePolygonNetwork.mumbai]: 35 * GWEI,
    [types_1.ePolygonNetwork.matic]: 35 * GWEI,
    [types_1.eXDaiNetwork.xdai]: 1 * GWEI,
    [types_1.eAvalancheNetwork.avalanche]: 225 * GWEI,
    [types_1.eAvalancheNetwork.fuji]: 85 * GWEI,
};
exports.BLOCK_TO_FORK = {
    [types_1.eEthereumNetwork.main]: 15373013,
    [types_1.eEthereumNetwork.kovan]: undefined,
    [types_1.eEthereumNetwork.ropsten]: undefined,
    [types_1.eEthereumNetwork.coverage]: undefined,
    [types_1.eEthereumNetwork.hardhat]: undefined,
    [types_1.eEthereumNetwork.buidlerevm]: undefined,
    [types_1.eEthereumNetwork.tenderly]: undefined,
    [types_1.ePolygonNetwork.mumbai]: undefined,
    [types_1.ePolygonNetwork.matic]: undefined,
    [types_1.eXDaiNetwork.xdai]: undefined,
    [types_1.eAvalancheNetwork.avalanche]: undefined,
    [types_1.eAvalancheNetwork.fuji]: undefined,
};
//# sourceMappingURL=helper-hardhat-config.js.map