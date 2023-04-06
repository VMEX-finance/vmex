import { BigNumber, BigNumberish } from 'ethers';
import { comparatorEngine, CompareRules } from '../helpers/comparator-engine';
import { getNormalizedDistribution } from './ray-math';
import { DistributionManager } from '../../../../types/DistributionManager';
import { IncentivesController } from '../../../../types/IncentivesController';

export type AssetUpdateData = {
  emissionPerSecond: BigNumberish;
  totalStaked: BigNumberish;
  underlyingAsset: string;
};
export type AssetData = {
  emissionPerSecond: BigNumber;
  index: BigNumber;
  lastUpdateTimestamp: BigNumber;
};

export async function getRewardAssetsData(
  peiContract: DistributionManager | IncentivesController,
  assets: BigNumberish[],
  rewards: BigNumberish[]
) {
  return await Promise.all(
    assets.map(async (incentivizedAsset, i) => {
      const response = await peiContract.getRewardsData(
        incentivizedAsset.toString(),
        rewards[i].toString()
      );
      return {
        index: response[0],
        emissionPerSecond: response[1],
        lastUpdateTimestamp: response[2],
        distributionEnd: response[3],
        incentivizedAsset,
      };
    })
  );
}

export function assetDataComparator<
  Input extends { underlyingAsset: string; totalStaked: BigNumberish },
  State extends AssetData
>(
  assetConfigUpdateInput: Input,
  assetConfigBefore: State,
  assetConfigAfter: State,
  actionBlockTimestamp: number,
  emissionEndTimestamp: number,
  compareRules: CompareRules<Input, State>
) {
  return comparatorEngine(
    ['emissionPerSecond', 'index', 'lastUpdateTimestamp'],
    assetConfigUpdateInput,
    assetConfigBefore,
    assetConfigAfter,
    actionBlockTimestamp,
    {
      ...compareRules,
      fieldsWithCustomLogic: [
        // should happen on any update
        {
          fieldName: 'lastUpdateTimestamp',
          logic: (stateUpdate, stateBefore, stateAfter, txTimestamp) => txTimestamp.toString(),
        },
        {
          fieldName: 'index',
          logic: async (stateUpdate, stateBefore, stateAfter, txTimestamp) => {
            return getNormalizedDistribution(
              stateUpdate.totalStaked.toString(),
              stateBefore.index,
              stateBefore.emissionPerSecond,
              stateBefore.lastUpdateTimestamp,
              txTimestamp,
              emissionEndTimestamp
            ).toString(10);
          },
        },
        ...(compareRules.fieldsWithCustomLogic || []),
      ],
    }
  );
}
