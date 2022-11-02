import { BigNumber, ethers, utils } from "ethers";

export const calculateUserStake = (
    userReserveDataSignerBefore: BigNumber,
    totalATokens: BigNumber,
  ) => {
    return userReserveDataSignerBefore
    .mul(ethers.utils.parseEther("1"))
    .div(totalATokens) //18 decimals
  }
    

export const calculateExpectedInterest = (
    strategyBoostedBalance: BigNumber,
    strategyStartBoostedBalance: BigNumber,
    reserveFactor: BigNumber, //% with two decimals, like 1000 for 10%
    userStake: BigNumber //%stake of profit, with 18 decimals
  ) => {
    var userAmt = BigNumber.from("10000").sub(reserveFactor);
    var interestRaw = strategyBoostedBalance.sub(strategyStartBoostedBalance)
    var usrInterest = interestRaw.mul(userAmt).div(10000)
    return usrInterest.mul(userStake).div(ethers.utils.parseEther("1"))
  }

  export const calculateAdminInterest = (
    strategyBoostedBalance: BigNumber,
    strategyStartBoostedBalance: BigNumber,
    reserveFactor: BigNumber, //% with two decimals, like 1000 for 10%
  ) => {
    var interestRaw = strategyBoostedBalance.sub(strategyStartBoostedBalance)
    return interestRaw.mul(reserveFactor).div(10000)
  }