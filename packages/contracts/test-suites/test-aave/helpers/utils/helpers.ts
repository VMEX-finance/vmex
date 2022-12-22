import { LendingPool } from "../../../../types/LendingPool";
import { ReserveData, UserReserveData } from "./interfaces";
import {
  getLendingRateOracle,
  getIErc20Detailed,
  getMintableERC20,
  getAToken,
  getStableDebtToken,
  getVariableDebtToken,
} from "../../../../helpers/contracts-getters";
import { tEthereumAddress } from "../../../../helpers/types";
import BigNumber from "bignumber.js";
import { getDb, DRE } from "../../../../helpers/misc-utils";
import { AaveProtocolDataProvider } from "../../../../types/AaveProtocolDataProvider";

export const getReserveData = async (
  helper: AaveProtocolDataProvider,
  reserve: tEthereumAddress,
  tranche: string
): Promise<ReserveData> => {
  const [reserveData, tokenAddresses, rateOracle, token] = await Promise.all([
    helper.getReserveData(reserve, tranche),
    helper.getReserveTokensAddresses(reserve, tranche),
    getLendingRateOracle(),
    getIErc20Detailed(reserve),
  ]);

  const stableDebtToken = await getStableDebtToken(
    tokenAddresses.stableDebtTokenAddress
  );
  const variableDebtToken = await getVariableDebtToken(
    tokenAddresses.variableDebtTokenAddress
  );

  const { 0: principalStableDebt } = await stableDebtToken.getSupplyData();
  const totalStableDebtLastUpdated =
    await stableDebtToken.getTotalSupplyLastUpdated();

  const scaledVariableDebt = await variableDebtToken.scaledTotalSupply();

  const rate = (await rateOracle.getMarketBorrowRate(reserve)).toString();
  const symbol = await token.symbol();
  const decimals = new BigNumber(await token.decimals());

  const totalLiquidity = new BigNumber(
    reserveData.availableLiquidity.toString()
  )
    .plus(reserveData.totalStableDebt.toString())
    .plus(reserveData.totalVariableDebt.toString());

  const utilizationRate = new BigNumber(
    totalLiquidity.eq(0)
      ? 0
      : new BigNumber(reserveData.totalStableDebt.toString())
          .plus(reserveData.totalVariableDebt.toString())
          .rayDiv(totalLiquidity)
  );

  return {
    totalLiquidity,
    utilizationRate,
    availableLiquidity: new BigNumber(
      reserveData.availableLiquidity.toString()
    ),
    totalStableDebt: new BigNumber(reserveData.totalStableDebt.toString()),
    totalVariableDebt: new BigNumber(reserveData.totalVariableDebt.toString()),
    liquidityRate: new BigNumber(reserveData.liquidityRate.toString()),
    variableBorrowRate: new BigNumber(
      reserveData.variableBorrowRate.toString()
    ),
    stableBorrowRate: new BigNumber(reserveData.stableBorrowRate.toString()),
    averageStableBorrowRate: new BigNumber(
      reserveData.averageStableBorrowRate.toString()
    ),
    liquidityIndex: new BigNumber(reserveData.liquidityIndex.toString()),
    variableBorrowIndex: new BigNumber(
      reserveData.variableBorrowIndex.toString()
    ),
    lastUpdateTimestamp: new BigNumber(reserveData.lastUpdateTimestamp),
    totalStableDebtLastUpdated: new BigNumber(totalStableDebtLastUpdated),
    principalStableDebt: new BigNumber(principalStableDebt.toString()),
    scaledVariableDebt: new BigNumber(scaledVariableDebt.toString()),
    address: reserve,
    aTokenAddress: tokenAddresses.aTokenAddress,
    symbol,
    decimals,
    marketStableRate: new BigNumber(rate),
  };
};

export const getUserData = async (
  pool: LendingPool,
  helper: AaveProtocolDataProvider,
  reserve: string,
  tranche: string,
  user: tEthereumAddress,
  sender?: tEthereumAddress
): Promise<UserReserveData> => {
  const [userData, scaledATokenBalance] = await Promise.all([
    helper.getUserReserveData(reserve, tranche, user),
    getATokenUserData(reserve, tranche, user, helper),
  ]);

  const token = await getMintableERC20(reserve);
  const walletBalance = new BigNumber(
    (await token.balanceOf(sender || user)).toString()
  );
  const usrActData = await pool.getUserAccountData(user, tranche, false); //twap doesn't matter in these tests since prices don't change

  return {
    scaledATokenBalance: new BigNumber(scaledATokenBalance),
    currentATokenBalance: new BigNumber(
      userData.currentATokenBalance.toString()
    ),
    currentStableDebt: new BigNumber(userData.currentStableDebt.toString()),
    currentVariableDebt: new BigNumber(userData.currentVariableDebt.toString()),
    principalStableDebt: new BigNumber(userData.principalStableDebt.toString()),
    scaledVariableDebt: new BigNumber(userData.scaledVariableDebt.toString()),
    stableBorrowRate: new BigNumber(userData.stableBorrowRate.toString()),
    liquidityRate: new BigNumber(userData.liquidityRate.toString()),
    usageAsCollateralEnabled: userData.usageAsCollateralEnabled,
    stableRateLastUpdated: new BigNumber(
      userData.stableRateLastUpdated.toString()
    ),
    walletBalance,
    healthFactor: new BigNumber(usrActData.healthFactor.toString())
  };
};

export const getReserveAddressFromSymbol = async (symbol: string) => {
  //console.log("DB: ",await getDb().get(`${symbol}.${DRE.network.name}`).value())
  const token = await getMintableERC20(
    (
      await getDb().get(`${symbol}.${DRE.network.name}`).value()
    ).address
  );

  if (!token) {
    throw `Could not find instance for contract ${symbol}`;
  }
  return token.address;
};

const getATokenUserData = async (
  reserve: string,
  tranche: string,
  user: string,
  helpersContract: AaveProtocolDataProvider
) => {
  const aTokenAddress: string = (
    await helpersContract.getReserveTokensAddresses(reserve, tranche)
  ).aTokenAddress;

  const aToken = await getAToken(aTokenAddress);

  const scaledBalance = await aToken.scaledBalanceOf(user);
  return scaledBalance.toString();
};
