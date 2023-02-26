import { LendingPool } from "../../../../types/LendingPool";
import { ReserveData, UserReserveData } from "./interfaces";
import {
  getIErc20Detailed,
  getMintableERC20,
  getAToken,
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
  const [reserveData, configData, tokenAddresses, token] = await Promise.all([
    helper.getReserveData(reserve, tranche),
    helper.getReserveConfigurationData(reserve, tranche),
    helper.getReserveTokensAddresses(reserve, tranche),
    getIErc20Detailed(reserve),
  ]);

  const variableDebtToken = await getVariableDebtToken(
    tokenAddresses.variableDebtTokenAddress
  );

  const scaledVariableDebt = await variableDebtToken.scaledTotalSupply();

  const symbol = await token.symbol();
  const decimals = new BigNumber(await token.decimals());

  const totalLiquidity = new BigNumber(
    reserveData.availableLiquidity.toString()
  )
    .plus(reserveData.totalVariableDebt.toString());

  const utilizationRate = new BigNumber(
    totalLiquidity.eq(0)
      ? 0
      : new BigNumber(reserveData.totalVariableDebt.toString())
          .rayDiv(totalLiquidity)
  );

  return {
    totalLiquidity,
    utilizationRate,
    availableLiquidity: new BigNumber(
      reserveData.availableLiquidity.toString()
    ),
    totalVariableDebt: new BigNumber(reserveData.totalVariableDebt.toString()),
    liquidityRate: new BigNumber(reserveData.liquidityRate.toString()),
    variableBorrowRate: new BigNumber(
      reserveData.variableBorrowRate.toString()
    ),
    liquidityIndex: new BigNumber(reserveData.liquidityIndex.toString()),
    variableBorrowIndex: new BigNumber(
      reserveData.variableBorrowIndex.toString()
    ),
    lastUpdateTimestamp: new BigNumber(reserveData.lastUpdateTimestamp),
    scaledVariableDebt: new BigNumber(scaledVariableDebt.toString()),
    address: reserve,
    aTokenAddress: tokenAddresses.aTokenAddress,
    symbol,
    decimals,
    reserveFactor: new BigNumber(configData.reserveFactor.toString()),
    VMEXReserveFactor: new BigNumber(configData.VMEXReserveFactor.toString()),
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
  const usrActData = await pool.getUserAccountData(user, tranche); //twap doesn't matter in these tests since prices don't change

  return {
    scaledATokenBalance: new BigNumber(scaledATokenBalance),
    currentATokenBalance: new BigNumber(
      userData.currentATokenBalance.toString()
    ),
    currentVariableDebt: new BigNumber(userData.currentVariableDebt.toString()),
    scaledVariableDebt: new BigNumber(userData.scaledVariableDebt.toString()),
    liquidityRate: new BigNumber(userData.liquidityRate.toString()),
    usageAsCollateralEnabled: userData.usageAsCollateralEnabled,
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
