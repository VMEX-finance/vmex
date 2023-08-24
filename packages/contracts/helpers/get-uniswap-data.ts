import {
  oneRay,
  ZERO_ADDRESS,
  MOCK_CHAINLINK_AGGREGATORS_PRICES,
  oneEther,
} from './constants';
import { UniswapData } from './types';
// declare var require: any

// const reserveAssets = new Map<string, string>([
//   ['AAVE', '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'],
//   ['BAT', '0x0d8775f648430679a709e98d2b0cb6250d2887ef'],
//   ['BUSD', '0x4Fabb145d64652a948d72533023f6E7A623C7C53'],
//   ['DAI', '0x6B175474E89094C44Da98b954EedeAC495271d0F'],
//   ['ENJ', '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c'],
//   ['KNC', '0xdd974D5C2e2928deA5F71b9825b8b646686BD200'],
//   ['LINK', '0x514910771AF9Ca656af840dff83E8264EcF986CA'],
//   ['MANA', '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942'],
//   ['MKR', '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2'],
//   ['REN', '0x408e41876cCCDC0F92210600ef50372656052a38'],
//   ['SNX', '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F'],
//   ['sUSD', '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51'],
//   ['TUSD', '0x0000000000085d4780B73119b644AE5ecd22b376'],
//   ['UNI', '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'],
//   ['USDC', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
//   ['USDT', '0xdAC17F958D2ee523a2206206994597C13D831ec7'],
//   ['WBTC', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
//   ['WETH', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
//   ['YFI', '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'],
//   ['ZRX', '0xE41d2489571d322189246DaFA5ebDe1F4699F498'],
//   ['stETH', '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'],
//   ['FRAX', '0x853d955aCEf822Db058eb8505911ED77F175b99e'],
//   ['BAL', '0xba100000625a3754423978a60c9317c58a424e3D'],
//   ['CRV', '0xD533a949740bb3306d119CC777fa900bA034cd52'],
//   ['CVX', '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B'],
//   ['BADGER', '0x3472A5A71965499acd81997a54BBA8D852C6E53d'],
//   ['LDO', '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'],
//   ['ALCX', '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF'],
//   ['1INCH', '0x111111111117dC0aa78b770fA6A738034120C302'],
// ]);

// reserveAssets.forEach(
//   (tokenAddress, tokenSymbol) => getUniswapAddress(tokenAddress, tokenSymbol)
// )

export const getUniswapAddress = async (tokenAddress, tokenSymbol): Promise<UniswapData> => {
  const axios = require('axios');
  const ethers = require('ethers');
  const myURL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
  const factoryAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
  const factoryAbi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":true,"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"FeeAmountEnabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":false,"internalType":"int24","name":"tickSpacing","type":"int24"},{"indexed":false,"internalType":"address","name":"pool","type":"address"}],"name":"PoolCreated","type":"event"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"}],"name":"createPool","outputs":[{"internalType":"address","name":"pool","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"enableFeeAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"","type":"uint24"}],"name":"feeAmountTickSpacing","outputs":[{"internalType":"int24","name":"","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint24","name":"","type":"uint24"}],"name":"getPool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"parameters","outputs":[{"internalType":"address","name":"factory","type":"address"},{"internalType":"address","name":"token0","type":"address"},{"internalType":"address","name":"token1","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickSpacing","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"setOwner","outputs":[],"stateMutability":"nonpayable","type":"function"}];  // Use raw ABI listed on goerli etherscan. Dont import ABI from the Uniswap SDK npm package, because mainnet & testnet ABI's are likely different
  const providerUrl = 'https://eth-mainnet.alchemyapi.io/v2/KfL7cddimeJa7pdiPbc2-kzo5RobzZZ3';  // Replace with your api key
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);

  const factoryContract = new ethers.Contract(factoryAddress, factoryAbi, provider);
  const query = `
{
pools(
where: {token0_: {symbol: "${tokenSymbol}"}, token1_: {symbol: "WETH"}}
orderBy: volumeUSD
orderDirection: desc
first: 1
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
  const query2 = `
{
pools(
where: {token0_: {symbol: "WETH"}, token1_: {symbol: "${tokenSymbol}"}}
orderBy: volumeUSD
orderDirection: desc
first: 1
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
  
      let poolAddress = ZERO_ADDRESS;
      let tokenToPrice = "0";
  try {

  
  const result = await axios.post(myURL, {query: query});
 
      let dat;
      //console.log(result.data.data)
      if(result.data.data === undefined){
        dat = [];
      } else {
        dat = result.data.data.pools;
      }
        
      
      
        // console.log("Asset not supported: ",tokenSymbol)
    const result2 = await axios.post(myURL, {query: query2});
            //console.log(result.data.data)
            let dat2;
            if(result2.data.data === undefined)
              dat2 = []
            else
              dat2 = result2.data.data.pools;
            let poolBips, token1Address, token2Address, dataToPrint;
            if(dat.length >0 && dat2.length>0){
              
              if(dat[0].volumeUSD > dat2[0].volumeUSD){
                token1Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
                token2Address = tokenAddress;
                poolBips = dat[0].feeTier; 
                dataToPrint = dat
                tokenToPrice = "0";
              } else{
                token2Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
                token1Address = tokenAddress;
                poolBips = dat2[0].feeTier; 
                dataToPrint = dat2
                tokenToPrice = "1";

              }
              
            } else if (dat.length>0) {
              token1Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
                token2Address = tokenAddress;
                poolBips = dat[0].feeTier; 
                dataToPrint = dat
                tokenToPrice = "0";
            } else if (dat2.length>0) {
              token2Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
                token1Address = tokenAddress;
                poolBips = dat2[0].feeTier; 
                dataToPrint = dat2
                tokenToPrice = "1";
            }
            else{
              console.log("Asset not supported: ",tokenSymbol)
              return {
                poolAddress: poolAddress, 
                tokenToPrice: tokenToPrice
              };
            }
            // (async () => {
              poolAddress = (await factoryContract.functions.getPool(token1Address, token2Address, poolBips))[0];
            //   console.log(tokenSymbol)
            //   console.log(dataToPrint)
            //   console.log("poolAddress: ",poolAddress);
            // // })();
            //   console.log("----------------------")
            return {
              poolAddress: poolAddress, 
              tokenToPrice: tokenToPrice
            };
    }
    catch (err) {
      console.error(err)
    }
    return {
      poolAddress: poolAddress, 
      tokenToPrice: tokenToPrice
    };
}

