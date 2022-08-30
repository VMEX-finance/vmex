//SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

struct UserDataModel {
    UserAsset[] ownedAssets;
}

struct UserAsset {
    string name;
    address mainnet;
    int256 balance;
    int256 to_usd;
}
/**
 * params returned from ILendingPool.getUserAccountData(address user, uint8 tranche)
 */
struct TracheSpecificUserData {
    uint256 totalCollateralETH;
    uint256 totalDebtETH;
    uint256 availableBorrowsETH;
    uint256 loanToValue;
    uint256 healthFactor;
}

struct AssetLendingPoolData {
    uint256 normIncome; // ILendingPool.getReserveNormalizedIncome(address asset, uint8 tranche)
    uint256 normDebt; // ILendingPool.getReserveNormalizedVariableDebt(address asset, uint8 tranche )
    bool isLendable;
    bool isCollateralInHigherTranches;
}

struct TrancheSpecificAssetData {
    uint8 index;
    uint128 depositAPR; //ReserveData.currentLiquidityRate
    uint128 currentBorrowRate; //ReserveData.currentVariableBorrowRate
    uint128 currentStableBorrowRate; //ReserveData.currentStableBorrowRate
    address stableDebtTokenAddress;
    address variableDebtTokenAddress;
    address interestRateStrategy;
    uint256 liquidityRateMultiplier;
    uint256 variableBorrowRateMultiplier;
    uint256 stableBorrowRateMultiplier;
}
