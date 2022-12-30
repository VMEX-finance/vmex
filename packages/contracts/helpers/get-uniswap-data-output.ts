import {reserveAssets} from "./constants";
import {getUniswapAddress} from "./get-uniswap-data";

(async () => {
const testuniswapPools = await Promise.all(Object.entries(reserveAssets).map(([tokenSymbol, tokenAddress]) => getUniswapAddress(tokenAddress, tokenSymbol)))

        // console.log("uniswapAddresses: ",testuniswapPools.map((el) => el.poolAddress))
        // console.log("uniswapTokenToPrice: ",testuniswapPools.map((el) => el.tokenToPrice))
      })();