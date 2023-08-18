import { BigNumber } from 'ethers';
import { DistributionManager } from '../../../../types/DistributionManager';
import { IncentivesController } from '../../../../types/IncentivesController';

export type UserStakeInput = {
  underlyingAsset: string;
  stakedByUser: string;
  totalStaked: string;
};

export type UserPositionUpdate = UserStakeInput & {
  user: string;
};
export async function getUserIndex(
  distributionManager: DistributionManager | IncentivesController,
  user: string,
  asset: string,
  reward: string
): Promise<BigNumber> {
  return await distributionManager.getUserRewardIndex(user, asset, reward);
}
