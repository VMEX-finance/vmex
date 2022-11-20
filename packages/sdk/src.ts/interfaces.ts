import BigNumber from "bignumber.js";

export interface SuppliedAssetData {
  asset: BigNumber;
  tranche: BigNumber;
  amount: BigNumber;
  isCollateral: boolean;
}

export interface BorrowedAssetData {
  asset: BigNumber;
  tranche: BigNumber;
  amount: BigNumber;
  apy: BigNumber;
}

export interface UserSummaryData {
  totalCollateralETH: BigNumber;
  totalDebtETH: BigNumber;
  availableBorrowsETH: BigNumber;
  currentLiquidityThreshold: BigNumber;
  ltv: BigNumber;
  healthFactor: BigNumber;
  suppliedAssetData: SuppliedAssetData[];
  borrowedAssetData: BorrowedAssetData[];
}
export interface UserReserveData {
  scaledATokenBalance: BigNumber;
  currentATokenBalance: BigNumber;
  currentStableDebt: BigNumber;
  currentVariableDebt: BigNumber;
  principalStableDebt: BigNumber;
  scaledVariableDebt: BigNumber;
  liquidityRate: BigNumber;
  stableBorrowRate: BigNumber;
  stableRateLastUpdated: BigNumber;
  usageAsCollateralEnabled: Boolean;
  walletBalance: BigNumber;
  [key: string]: BigNumber | string | Boolean;
}

export enum RateMode {
  None = "0",
  Stable = "1",
  Variable = "2",
}

export interface AssetData {
  trancheId: BigNumber;
  name: string;
  ltv: BigNumber;
  liquidationThreshold: BigNumber;
  liquidationPenalty: BigNumber;
  canBeCollateral: boolean;
  oracle: BigNumber;
  totalSupplied: BigNumber;
  utilization: BigNumber;
  totalBorrowed: BigNumber;   // aka totalVariableDebt
  strategyAddress: BigNumber;
  adminFee: BigNumber;
  platformFee: BigNumber;
  // liquidityIndex: BigNumber;
  // variableBorrowIndex: BigNumber;
  // currentLiquidityRate: BigNumber;
  // currentVariableBorrowRate: BigNumber;
  // currentStableBorrowRate: BigNumber;
  // lastUpdateTimestamp: BigNumber;
  // aTokenAddress: BigNumber;
  // variableDebtTokenAddress: BigNumber;
  // interestRateStrategyAddress: BigNumber;
  // availableLiquidity: BigNumber;
}
export interface ReserveData {
  availableLiquidity: BigNumber;
  totalSupplied: BigNumber;
  totalStableDebt: BigNumber;
  totalVariableDebt: BigNumber;
  liquidityRate: BigNumber;
  variableBorrowRate: BigNumber;
  stableBorrowRate: BigNumber;
  averageStableBorrowRate: BigNumber;
  liquidityIndex: BigNumber;
  variableBorrowIndex: BigNumber;
  lastUpdateTimestamp: BigNumber;
}

export interface ReserveDataBase {
  configuration: BigNumber;
  liquidityIndex: BigNumber;
  variableBorrowIndex: BigNumber;
  currentLiquidityRate: BigNumber;
  currentVariableBorrowRate: BigNumber;
  currentStableBorrowRate: BigNumber;
  lastUpdateTimestamp: BigNumber;
  aTokenAddress: BigNumber;
  stableDebtTokenAddress: BigNumber;
  variableDebtTokenAddress: BigNumber;
  interestRateStrategyAddress: BigNumber;
  id: BigNumber;
  trancheId: BigNumber;
}
