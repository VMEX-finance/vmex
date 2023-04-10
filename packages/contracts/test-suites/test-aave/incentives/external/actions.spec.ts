import { fail } from 'assert';
const { expect } = require('chai');

import { increaseTime, waitForTx } from '../../../../helpers/misc-utils';
import { makeSuite } from '../../helpers/make-suite';
import { getBlockTimestamp } from '../../../../helpers/contracts-helpers';

import { getUserIndex } from '.././data-helpers/asset-user-data';
import {
  assetDataComparator,
  getRewardAssetsData,
} from '.././data-helpers/asset-data';
import { getRewards } from '.././data-helpers/base-math';
import hre from 'hardhat';

type ScenarioAction = {
  caseName: string;
  emissionPerSecond?: string;
  userBalance: string;
  totalSupply: string;
  customTimeMovement?: number;
};

const handleActionScenarios: ScenarioAction[] = [
  {
    caseName: 'First deposit',
    emissionPerSecond: '0',
    userBalance: '0',
    totalSupply: '0',
  },
  {
    caseName: 'Accrued rewards are 0, 0 emission',
    emissionPerSecond: '0',
    userBalance: '22',
    totalSupply: '22',
  },
  {
    caseName: 'Accrued rewards are 0, 0 user balance',
    emissionPerSecond: '100',
    userBalance: '0',
    totalSupply: '22',
  },
  {
    caseName: '1. Accrued rewards are not 0',
    userBalance: '22',
    totalSupply: '22',
  },
  {
    caseName: '2. Accrued rewards are not 0',
    emissionPerSecond: '1000',
    userBalance: '2332',
    totalSupply: '3232',
  },
];

makeSuite('AaveIncentivesController handleAction tests', (testEnv) => {
  for (const {
    caseName,
    totalSupply,
    userBalance,
    customTimeMovement,
    emissionPerSecond,
  } of handleActionScenarios) {
    it(caseName, async () => {
      await increaseTime(100);

      const { incentivesController, users, incentivizedTokens, rewardTokens } = testEnv;

      const { timestamp } = await hre.ethers.provider.getBlock('latest');
      const distributionEndTimestamp = timestamp + 2000 * 60 * 60;
      const userAddress = users[1].address;
      const incentivizedAsset = incentivizedTokens[0].address;
      const rewardAsset = rewardTokens[0].address;

      // update emissionPerSecond in advance to not affect user calculations
      if (emissionPerSecond) {
        incentivizedTokens[0].setUserBalanceAndSupply('0', totalSupply);
        await incentivesController.configureRewards([
          {
            emissionPerSecond: emissionPerSecond,
            endTimestamp: distributionEndTimestamp,
            incentivizedAsset: incentivizedAsset,
            reward: rewardAsset,
          },
        ]);
      }
      const rewardsBalanceBefore = await incentivesController.getAccruedRewards(
        userAddress,
        rewardAsset
      );

      const userIndexBefore = await getUserIndex(
        incentivesController,
        userAddress,
        incentivizedAsset,
        rewardAsset
      );
      const assetDataBefore = (
        await getRewardAssetsData(incentivesController, [incentivizedAsset], [rewardAsset])
      )[0];

      if (customTimeMovement) {
        await increaseTime(customTimeMovement);
      }

      const handleActionReceipt = await waitForTx(
        await incentivizedTokens[0].handleActionOnAic(userAddress, userBalance, totalSupply)
      );
      const eventsEmitted = handleActionReceipt.events || [];
      const actionBlockTimestamp = await getBlockTimestamp(handleActionReceipt.blockNumber);

      const userIndexAfter = await getUserIndex(
        incentivesController,
        userAddress,
        incentivizedAsset,
        rewardAsset
      );

      const assetDataAfter = (
        await getRewardAssetsData(incentivesController, [incentivizedAsset], [rewardAsset])
      )[0];

      const expectedAccruedRewards = getRewards(
        userBalance,
        userIndexAfter,
        userIndexBefore
      ).toString();

      const rewardsBalanceAfter = await incentivesController.getAccruedRewards(
        userAddress,
        rewardAsset
      );

      // ------- Distribution Manager tests START -----
      await assetDataComparator(
        { underlyingAsset: incentivizedAsset, totalStaked: totalSupply },
        assetDataBefore,
        assetDataAfter,
        actionBlockTimestamp,
        distributionEndTimestamp,
        {}
      );
      expect(userIndexAfter.toString()).to.be.equal(
        assetDataAfter.index.toString(),
        'user index are not correctly updated'
      );

      // TODO: investigate why events are not emitting
      //   if (!assetDataAfter.index.eq(assetDataBefore.index)) {
      //     const eventAssetUpdated = eventsEmitted.find(({ event }) => event === 'RewardAccrued');

      //     if (!eventAssetUpdated) {
      //       fail('missing RewardAccrued event');
      //     }
      //     eventChecker(eventsEmitted[0], 'RewardAccrued', [
      //       assetDataAfter.incentivizedAsset,
      //       rewardAsset,
      //       userAddress,
      //       assetDataAfter.index,
      //       expectedAccruedRewards
      //     ]);
      //   }
      // ------- Distribution Manager tests END -----

      // ------- PEI tests START -----
      expect(rewardsBalanceAfter.toString()).to.be.equal(
        rewardsBalanceBefore.add(expectedAccruedRewards).toString(),
        'rewards balance are incorrect'
      );
      // ------- PEI tests END -----
    });
  }
});
