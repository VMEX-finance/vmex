import { BigNumber, BigNumberish, ethers } from "ethers";

export const nativeAmountToUSD = (
  amount: BigNumberish,
  priceDecimals: number,
  assetDecimals: number,
  assetUSDPrice: BigNumberish
): number => {
  return parseFloat(
    Number(
      ethers.utils.formatUnits(
        BigNumber.from(amount).mul(assetUSDPrice),
        assetDecimals + priceDecimals
      )
    ).toFixed(2)
  );
};
