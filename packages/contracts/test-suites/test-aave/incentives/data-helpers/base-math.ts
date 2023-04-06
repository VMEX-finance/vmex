import { BigNumber } from 'ethers';

import { BigNumberValue, valueToZDBigNumber } from './ray-math/bignumber';

export function getRewards(
  balance: BigNumberValue,
  assetIndex: BigNumberValue,
  userIndex: BigNumberValue,
  precision: number = 18
): BigNumber {
  return BigNumber.from(
    valueToZDBigNumber(balance)
      .multipliedBy(valueToZDBigNumber(assetIndex).minus(userIndex.toString()))
      .dividedBy(valueToZDBigNumber(10).exponentiatedBy(precision))
      .toString()
  );
}
