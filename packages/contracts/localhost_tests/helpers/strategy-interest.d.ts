import { BigNumber } from "ethers";
export declare const calculateUserStake: (userReserveDataSignerBefore: BigNumber, totalATokens: BigNumber) => BigNumber;
export declare const calculateExpectedInterest: (strategyBoostedBalance: BigNumber, strategyStartBoostedBalance: BigNumber, reserveFactor: BigNumber, userStake: BigNumber) => BigNumber;
export declare const calculateAdminInterest: (strategyBoostedBalance: BigNumber, strategyStartBoostedBalance: BigNumber, reserveFactor: BigNumber) => BigNumber;
