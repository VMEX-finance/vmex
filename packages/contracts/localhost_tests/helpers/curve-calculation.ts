import { BigNumber, utils } from "ethers";

export const getCurvePrice = (
    vPrice: BigNumber,
    prices: BigNumber[]
  ) => {
    var N = prices.length
    console.log(prices)
    var prod = 1;
    for(var i =0;i<N;i++){
        prod = parseFloat(utils.formatEther(prices[i]))*(prod)
    }
    return prod**(1/N);
  }
    