import {reserveAssets} from "./constants";
declare var require: any
const axios = require('axios');
const ethers = require('ethers');
const myURL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
const factoryAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const factoryAbi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":true,"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"FeeAmountEnabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":false,"internalType":"int24","name":"tickSpacing","type":"int24"},{"indexed":false,"internalType":"address","name":"pool","type":"address"}],"name":"PoolCreated","type":"event"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"}],"name":"createPool","outputs":[{"internalType":"address","name":"pool","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"enableFeeAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"","type":"uint24"}],"name":"feeAmountTickSpacing","outputs":[{"internalType":"int24","name":"","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint24","name":"","type":"uint24"}],"name":"getPool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"parameters","outputs":[{"internalType":"address","name":"factory","type":"address"},{"internalType":"address","name":"token0","type":"address"},{"internalType":"address","name":"token1","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickSpacing","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"setOwner","outputs":[],"stateMutability":"nonpayable","type":"function"}];  // Use raw ABI listed on goerli etherscan. Dont import ABI from the Uniswap SDK npm package, because mainnet & testnet ABI's are likely different
const providerUrl = 'https://eth-mainnet.alchemyapi.io/v2/KfL7cddimeJa7pdiPbc2-kzo5RobzZZ3';  // Replace with your api key
const provider = new ethers.providers.JsonRpcProvider(providerUrl);

const factoryContract = new ethers.Contract(factoryAddress, factoryAbi, provider);


reserveAssets.forEach(
    (tokenAddress, tokenSymbol) => {
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
        
        axios.post(myURL, {query: query})
        .then(async (result)=> {
            //console.log(result.data.data)
            const dat = result.data.data.pools;
            
              // console.log("Asset not supported: ",tokenSymbol)
              axios.post(myURL, {query: query2})
              .then(async (result2)=> {
                  //console.log(result.data.data)
                  
                  const dat2 = result2.data.data.pools;
                  let poolBips, token1Address, token2Address, dataToPrint;
                  if(dat.length >0 && dat2.length>0){
                    
                    if(dat[0].volumeUSD > dat2[0].volumeUSD){
                      token1Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
                      token2Address = tokenAddress;
                      poolBips = dat[0].feeTier; 
                      dataToPrint = dat
                    } else{
                      token2Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
                      token1Address = tokenAddress;
                      poolBips = dat2[0].feeTier; 
                      dataToPrint = dat2

                    }
                    
                  } else if (dat.length>0) {
                    token1Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
                      token2Address = tokenAddress;
                      poolBips = dat[0].feeTier; 
                      dataToPrint = dat
                  } else if (dat2.length>0) {
                    token2Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
                      token1Address = tokenAddress;
                      poolBips = dat2[0].feeTier; 
                      dataToPrint = dat2
                  }
                  else{
                    console.log("Asset not supported: ",tokenSymbol)
                    return
                  }
                  // (async () => {
                    const poolAddress = await factoryContract.functions.getPool(token1Address, token2Address, poolBips);
                    console.log(tokenSymbol)
                    console.log(dataToPrint)
                    console.log("poolAddress: ",poolAddress);
                  // })();
                    console.log("----------------------")
                  //console.log(result.data.data.pools[0].feeTier)
              })
            // }
            //console.log(result.data.data.pools[0].feeTier)
        })


        
    }
)

