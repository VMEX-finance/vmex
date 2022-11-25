import {BigNumber} from "ethers";

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

/**
 * Overview tab, after user connects wallet
 *
 * Provides data about a user either inside a specific
 * tranche or a summary across all tranches (depending on sdk call)
 */
export interface UserSummaryData {
  totalCollateralETH: BigNumber;
  totalDebtETH: BigNumber;
  availableBorrowsETH: BigNumber;
  suppliedAssetData: SuppliedAssetData[];
  borrowedAssetData: BorrowedAssetData[];
}
export interface UserTrancheData {
  totalCollateralETH: BigNumber;
  totalDebtETH: BigNumber;
  availableBorrowsETH: BigNumber;
  currentLiquidityThreshold: BigNumber;
  ltv: BigNumber;
  healthFactor: BigNumber;
  suppliedAssetData: SuppliedAssetData[];
  borrowedAssetData: BorrowedAssetData[];
}

/**
 * Tranche view tab: Viewing a specific asset inside the graph inset
 *
 * Provides data about a specific asset in a specific tranche.
 */
export interface AssetData {
  trancheId: BigNumber;
  asset: BigNumber;
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

/**
 * Tranche view tab: statistics surrouding the graph inset
 *
 * Provides data about a tranche, summary across all assets in the tranche
 */
export interface TrancheData {
  id: BigNumber;
  name: string;
  assets: BigNumber[];
  tvl: BigNumber;
  totalSupplied: BigNumber;
  totalBorrowed: BigNumber;
  availableLiquidity: BigNumber;
  upgradeable: boolean;
  utilization: BigNumber;
  admin: BigNumber;
  whitelist: boolean;
  grade: string;
}

/**
 * Overview tab
 *
 * Provides information about the entire VMEX protocol, a summary
 * of the data across all tranches in the protocol.
 */
export interface ProtocolData {
  tvl: BigNumber;
  totalReserves: BigNumber;
  totalSupplied: BigNumber;
  totalBorrowed: BigNumber;
  topSuppliedAssets: AssetBalance[];
  topBorrowedAssets: AssetBalance[];
  numLenders: BigNumber;                      // TODO
  numBorrowers: BigNumber;                    // TODO
  numTranches: number;
  topTranches: TrancheData[];
}

export interface AssetBalance {
  asset: string;
  amount: BigNumber;
}
export interface TopAssetsData {
  topSuppliedAssets: AssetBalance[];
  topBorrowedAssets: AssetBalance[];
}

export enum RateMode {
  None = "0",
  Stable = "1",
  Variable = "2",
}
