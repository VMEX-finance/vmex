// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

struct UserBalances {
    int256[20] ethBalances;
    int256[20] usdBalances;
    uint256[20] userBalance;
    string[20] tokenNames;
}

struct UserAccountData {
    uint256 totalCollateralETH;
    uint256 totalDebtETH;
    uint256 availableBorrowsETH;
    uint256 currentLiquidationThreshold;
    uint256 ltv;
    uint256 healthFactor;
}

struct TokenReserveData {
    uint128 liquidityIndex;
    uint128 variableBorrowIndex;
    uint128 currentLiquidityRate;
    uint128 currentVariableBorrowRate;
    uint128 currentStableBorrowRate;
    uint40 lastUpdateTimestamp;
    address aTokenAddress;
    address stableDebtTokenAddress;
    address variableDebtTokenAddress;
    address interestRateStrategyAddress;
    uint8 id;
    uint8 tranche;
}

struct ApiDataType {
    UserBalances userBalances;
    UserAccountData[3] userTrancheData;
    address[] reserveList;
    // TokenReserveData[20] tokenReserveData;
}
