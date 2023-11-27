import { BigNumber, BigNumberish } from "ethers";

export interface SetAddress {
  addr: string;
  newValue: string | boolean;
}

export interface SuppliedAssetData {
  asset: string;
  tranche: BigNumber;
  amount: BigNumber;
  amountNative: BigNumber;
  isCollateral: boolean;
  apy: BigNumber;
  // supplyCap: BigNumber;
}

export interface BorrowedAssetData {
  asset: string;
  tranche: BigNumber;
  amount: BigNumber;
  amountNative: BigNumber;
  apy: BigNumber;
}

export type AvailableBorrowData = {
  asset: string;
  amountUSD: BigNumber;
  amountNative: BigNumber;
};
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
  currentLiquidationThreshold: BigNumber;
  ltv: BigNumber;
  healthFactor: BigNumber;
  avgBorrowFactor: BigNumber;
  suppliedAssetData: SuppliedAssetData[];
  borrowedAssetData: BorrowedAssetData[];
  assetBorrowingPower: AvailableBorrowData[];
}

export interface UserWalletData {
  asset: string;
  amount: BigNumber;
  amountNative: BigNumber;
  currentPrice: BigNumber;
}

export interface ReserveData {
  configuration: BigNumber;
  liquidityIndex: BigNumber;
  variableBorrowIndex: BigNumber;
  currentLiquidityRate: BigNumber;
  currentVariableBorrowRate: BigNumber;
  lastUpdateTimestamp: BigNumber;
  aTokenAddress: string;
  variableDebtTokenAddress: string;
  id: number;

  interestRateStrategyAddress: string;
  baseLTV: BigNumber;
  liquidationThreshold: BigNumber;
  liquidationBonus: BigNumber;
  borrowFactor: BigNumber;
}

export interface ReserveSummary {
  reserveData: ReserveData;
  tranche: BigNumber;
  asset: string;
  name: string;
  inVerifiedTranche: boolean;
  decimals: number;

  canBeCollateral: boolean;
  canBeBorrowed: boolean;
  supplyCap: BigNumber;
  borrowCap: BigNumber;
  adminFee: BigNumber;
  platformFee: BigNumber;

  totalSupplied: BigNumber;
  totalBorrowed: BigNumber;
  totalReserves: BigNumber;
  utilization: BigNumber;

  stakingContract: string;
  totalStaked: BigNumber;
  pendingRewards: BigNumber;

  oracle: string;
  currentPriceETH: BigNumber;
}

/**
 * Tranche view tab: statistics surrouding the graph inset
 *
 * Provides data about a tranche, summary across all assets in the tranche
 */
export interface TrancheData {
  id: BigNumber;
  name: string;
  assets: string[];
  tvl: BigNumber;
  totalSupplied: BigNumber;
  totalBorrowed: BigNumber;
  availableLiquidity: BigNumber;
  upgradeable: boolean;
  utilization: BigNumber;
  admin: string;
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
  numLenders: number; // TODO
  numBorrowers: number; // TODO
  numTranches: number;
  numMarkets: number;
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

export interface PriceData {
  oracle: string;
  priceETH: BigNumber;
  priceUSD: BigNumber;
}

export interface RewardConfig {
  emissionPerSecond: BigNumber;
  endTimestamp: BigNumber;
  incentivizedAsset: string;
  reward: string;
}

export interface UserRewards {
  rewardTokens: string[];
  rewardAmounts: BigNumber[];
}

export interface ConfigureCollateralParams {
  baseLTV: BigNumberish;
  liquidationThreshold: BigNumberish;
  liquidationBonus: BigNumberish;
  borrowFactor: BigNumberish;
}
export interface ConfigureCollateralParamsInput {
  underlyingAsset: string;
  collateralParams: ConfigureCollateralParams;
}
