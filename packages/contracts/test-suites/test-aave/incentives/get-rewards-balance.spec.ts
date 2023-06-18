const { expect } = require('chai');

import { makeSuite } from '../helpers/make-suite';
import { getRewards } from './data-helpers/base-math';
import { getUserIndex } from './data-helpers/asset-user-data';
import { getRewardAssetsData } from './data-helpers/asset-data';
import { advanceBlock, timeLatest, waitForTx, increaseTime } from '../../../helpers/misc-utils';
import { getNormalizedDistribution } from './data-helpers/ray-math';
import { getBlockTimestamp } from '../../../helpers/contracts-helpers';
import hre from 'hardhat';

type ScenarioAction = {
  caseName: string;
  emissionPerSecond: string;
};

const getRewardsBalanceScenarios: ScenarioAction[] = [
  {
    caseName: 'Accrued rewards are 0',
    emissionPerSecond: '0',
  },
  {
    caseName: 'Accrued rewards are not 0',
    emissionPerSecond: '2432424',
  }
];

makeSuite('IncentivesController getRewardsBalance tests', (testEnv) => {
  for (const { caseName, emissionPerSecond } of getRewardsBalanceScenarios) {
    it(caseName, async () => {
      await increaseTime(100);

      const { incentivesController, users, incentivizedTokens, rewardTokens } = testEnv;

      const { timestamp } = await hre.ethers.provider.getBlock('latest');

      const distributionEndTimestamp = timestamp + 2000 * 60 * 60;
      const userAddress = users[1].address;
      const stakedByUser = 22 * caseName.length;
      const totalStaked = 33 * caseName.length;
      const incentivizedAsset = incentivizedTokens[0];
      const rewardAsset = rewardTokens[0];

      // update emissionPerSecond in advance to not affect user calculations
      await advanceBlock((await timeLatest()).plus(100).toNumber());
      if (emissionPerSecond) {
        incentivizedAsset.setUserBalanceAndSupply('0', totalStaked);
        await incentivesController.configureRewards([
          {
            emissionPerSecond: emissionPerSecond,
            endTimestamp: distributionEndTimestamp,
            incentivizedAsset: incentivizedAsset.address,
            reward: rewardAsset.address,
          },
        ]);
      }
      await incentivizedAsset.handleActionOnAic(userAddress, totalStaked, 0, stakedByUser, 0);
      await advanceBlock((await timeLatest()).plus(100).toNumber());

      const lastTxReceipt = await waitForTx(
        await incentivizedAsset.setUserBalanceAndSupply(stakedByUser, totalStaked)
      );
      const lastTxTimestamp = await getBlockTimestamp(lastTxReceipt.blockNumber);

      const unclaimedRewardsBefore = await incentivesController.getAccruedRewards(
        userAddress,
        rewardAsset.address
      );

      const unclaimedRewards = (
        await incentivesController.getPendingRewards([incentivizedAsset.address], userAddress)
      )[1][0];

      const userIndex = await getUserIndex(
        incentivesController,
        userAddress,
        incentivizedAsset.address,
        rewardAsset.address
      );
      const assetData = (
        await getRewardAssetsData(incentivesController, [incentivizedAsset.address], [rewardAsset.address])
      )[0];

      await incentivizedAsset.cleanUserState();

      const expectedAssetIndex = getNormalizedDistribution(
        totalStaked,
        assetData.index,
        assetData.emissionPerSecond,
        assetData.lastUpdateTimestamp,
        lastTxTimestamp,
        distributionEndTimestamp
      );
      const expectedAccruedRewards = getRewards(
        stakedByUser,
        expectedAssetIndex,
        userIndex
      ).toString();

      expect(unclaimedRewards.toString()).to.be.equal(
        unclaimedRewardsBefore.add(expectedAccruedRewards).toString()
      );
    });
  }
});
