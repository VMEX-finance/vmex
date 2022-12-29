import AaveConfig from "../../markets/aave";
import { ICommonConfiguration, eNetwork, SymbolMap, eEthereumNetwork } from "../../helpers/types";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";

import { formatEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';
import { ConfigNames, loadPoolConfig } from '../../helpers/configuration';

task('get-uniswap-data', 'Gets uniswap data')
  .setAction(async ({ verify, pool }, DRE) => {

    const axios = require('axios');
    console.log('prior dre');
    await DRE.run('set-DRE');
    
    const network = <eNetwork>DRE.network.name;
    const myURL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

    const query = `
{
  pools(
    where: {token0_: {symbol: "BUSD"}, token1_: {symbol: "WETH"}}
    orderBy: volumeUSD
    orderDirection: desc
  ) {
    token0Price
    token0 {
      symbol
    }
    token1 {
      symbol
    }
    feeTier
    totalValueLockedUSD
    volumeUSD
    id
  }
}
`

      axios.post(myURL, {query: query})
      .then((result)=> {
          console.log("HERE")
          console.log(result.data.data)
          // console.log(result.data.data.pools[0].feeTier)
      })

    const {
        ProtocolGlobalParams: { UsdAddress },
        ReserveAssets,
        FallbackOracle,
        ChainlinkAggregator,
      } = AaveConfig as ICommonConfiguration;
    const reserveAssets = await getParamPerNetwork(ReserveAssets, eEthereumNetwork.main);

Object.entries(reserveAssets).map(
  ([tokenSymbol, tokenAddress]) => {
    
      const query = `
{
  pools(
    where: {token0_: {symbol: "${tokenSymbol}"}, token1_: {symbol: "WETH"}}
    orderBy: volumeUSD
    orderDirection: desc
  ) {
    token0Price
    token0 {
      symbol
    }
    token1 {
      symbol
    }
    feeTier
    totalValueLockedUSD
    volumeUSD
    id
  }
}
`

      axios.post(myURL, {query: query})
      .then((result)=> {
          console.log(result.data.data)
          // console.log(result.data.data.pools[0].feeTier)
      })
      .catch(error=>console.log(error))

      const token2Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
      const factoryAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
      const factoryAbi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":true,"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"FeeAmountEnabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":false,"internalType":"int24","name":"tickSpacing","type":"int24"},{"indexed":false,"internalType":"address","name":"pool","type":"address"}],"name":"PoolCreated","type":"event"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"}],"name":"createPool","outputs":[{"internalType":"address","name":"pool","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"enableFeeAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"","type":"uint24"}],"name":"feeAmountTickSpacing","outputs":[{"internalType":"int24","name":"","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint24","name":"","type":"uint24"}],"name":"getPool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"parameters","outputs":[{"internalType":"address","name":"factory","type":"address"},{"internalType":"address","name":"token0","type":"address"},{"internalType":"address","name":"token1","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickSpacing","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"setOwner","outputs":[],"stateMutability":"nonpayable","type":"function"}];  // Use raw ABI listed on goerli etherscan. Dont import ABI from the Uniswap SDK npm package, because mainnet & testnet ABI's are likely different
      const providerUrl = 'https://eth-goerli.g.alchemy.com/v2/KfL7cddimeJa7pdiPbc2-kzo5RobzZZ3';  // Replace with your api key
      const poolBips = 3000;  // 0.3%. This is measured in hundredths of a bip
  }
)
  });






