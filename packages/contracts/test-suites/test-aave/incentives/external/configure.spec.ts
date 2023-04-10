const { expect } = require('chai');

import { makeSuite, TestEnv } from '../../helpers/make-suite';
import { increaseTime, waitForTx } from '../../../../helpers/misc-utils';
import { getBlockTimestamp } from '../../../../helpers/contracts-helpers';
import { CompareRules, eventChecker } from '.././helpers/comparator-engine';
import {
  AssetData,
  assetDataComparator,
  AssetUpdateData,
  getRewardAssetsData,
} from '.././data-helpers/asset-data';
import hre from 'hardhat';
import { BigNumberish } from 'ethers';

type ScenarioAction = {
  caseName: string;
  customTimeMovement?: number;
//   assets: Omit<AssetUpdateData, 'underlyingAsset'>[];
//   compareRules?: CompareRules<AssetUpdateData, AssetData>;
};

const configureAssetScenarios: ScenarioAction[] = [
  {
    caseName: 'Configure single asset rewards',
    // compareRules: {
    //   fieldsEqualToInput: ['emissionPerSecond'],
    // },
  },
  {
    caseName: 'Batch configure asset rewards',
  },
  {
    caseName: 'Reject repeat configuration',
  },
  {
    caseName: 'Update asset staking contract only',
  },
];

makeSuite('IncentivesController configureAssets', (testEnv: TestEnv) => {
  it('Rejects reward config not from manager', async () => {
    const { incentivesController, users, rewardTokens, incentivizedTokens, stakingContracts } = testEnv;
    await expect(
      incentivesController.connect(users[2].signer).addStakingReward(
          incentivizedTokens[0].address, 
          stakingContracts[0].address, 
          rewardTokens[0].address
    )).to.be.revertedWith('Only manager');

    await expect(
        incentivesController.connect(users[2].signer).batchAddStakingRewards(
            incentivizedTokens.slice(0, 1).map(t => t.address),
            stakingContracts.slice(0, 1).map(t => t.address), 
            [rewardTokens[0].address, rewardTokens[0].address]
      )).to.be.revertedWith('Only manager');
  });

  // mutate compatible scenarios
  // TODO: add events emission
  for (const { caseName, customTimeMovement } of configureAssetScenarios) {
    it(caseName, async () => {
      const { incentivesController, rewardTokens, incentivizedTokens, stakingContracts } = testEnv;
      const { timestamp } = await hre.ethers.provider.getBlock('latest');

      const rewardToken = rewardTokens[0];

      assets.forEach((assetConfig, i) => {
        if (i > incentivizedTokens.length) {
          throw new Error('to many assets to test');
        }
        const underlyingAsset = incentivizedTokens[i];
        underlyingAsset.setUserBalanceAndSupply('0', assetConfig.totalStaked);

        configureRewardsInput.push({
          emissionPerSecond: assetConfig.emissionPerSecond,
          endTimestamp: distributionEndTimestamp,
          incentivizedAsset: underlyingAsset.address,
          reward: rewardToken.address,
        });
        assetConfigsUpdate.push({
          emissionPerSecond: assetConfig.emissionPerSecond,
          underlyingAsset: underlyingAsset.address,
          totalStaked: assetConfig.totalStaked,
        });
      });

      const assetsConfigBefore = await getRewardAssetsData(
        incentivesController,
        configureRewardsInput.map(({ incentivizedAsset }) => incentivizedAsset),
        configureRewardsInput.map(({ reward }) => reward)
      );

      if (customTimeMovement) {
        await increaseTime(customTimeMovement);
      }

      const txReceipt = await waitForTx(
        await incentivesController.configureRewards(configureRewardsInput)
      );
      const configsUpdateBlockTimestamp = await getBlockTimestamp(txReceipt.blockNumber);
      const assetsConfigAfter = await getRewardAssetsData(
        incentivesController,
        configureRewardsInput.map(({ incentivizedAsset }) => incentivizedAsset),
        configureRewardsInput.map(({ reward }) => reward)
      );

      const eventsEmitted = txReceipt.events || [];

      let eventArrayIndex = 0;
      for (let i = 0; i < assetsConfigBefore.length; i++) {
        const assetConfigBefore = assetsConfigBefore[i];
        const assetConfigUpdateInput = assetConfigsUpdate[i];
        const assetConfigAfter = assetsConfigAfter[i];

        eventChecker(eventsEmitted[eventArrayIndex], 'RewardConfigUpdated', [
          assetConfigAfter.incentivizedAsset,
          rewardToken.address,
          assetConfigAfter.emissionPerSecond,
          assetConfigAfter.distributionEnd,
          assetConfigAfter.index,
        ]);
        eventArrayIndex += 1;

        await assetDataComparator(
          assetConfigUpdateInput,
          assetConfigBefore,
          assetConfigAfter,
          configsUpdateBlockTimestamp,
          distributionEndTimestamp,
          compareRules || {}
        );
      }
      expect(eventsEmitted[eventArrayIndex]).to.be.equal(undefined, 'Too many events emitted');
    });
  }
});
