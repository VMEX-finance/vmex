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
  assets: Omit<AssetUpdateData, 'underlyingAsset'>[];
  compareRules?: CompareRules<AssetUpdateData, AssetData>;
};

const configureAssetScenarios: ScenarioAction[] = [
  {
    caseName: 'Submit initial config for the assets',
    assets: [
      {
        emissionPerSecond: '11',
        totalStaked: '0',
      },
    ],
    compareRules: {
      fieldsEqualToInput: ['emissionPerSecond'],
    },
  },
  {
    caseName: 'Submit updated config for the assets',
    assets: [
      {
        emissionPerSecond: '33',
        totalStaked: '0',
      },
      {
        emissionPerSecond: '22',
        totalStaked: '0',
      },
    ],
    compareRules: {
      fieldsEqualToInput: ['emissionPerSecond'],
    },
  },
  {
    caseName:
      'Indexes should change if emission are set not to 0, and pool has deposited and borrowed funds',
    assets: [
      {
        emissionPerSecond: '33',
        totalStaked: '100000',
      },
      {
        emissionPerSecond: '22',
        totalStaked: '123123123',
      },
    ],
    compareRules: {
      fieldsEqualToInput: ['emissionPerSecond'],
    },
  },
  {
    caseName: 'Indexes should cumulate rewards if next emission is 0',
    assets: [
      {
        emissionPerSecond: '0',
        totalStaked: '100000',
      },
    ],
    compareRules: {
      fieldsEqualToInput: ['emissionPerSecond'],
    },
  },
  {
    caseName: 'Indexes should not change if no emission',
    assets: [
      {
        emissionPerSecond: '222',
        totalStaked: '213213213213',
      },
    ],
    compareRules: {
      fieldsEqualToInput: ['emissionPerSecond'],
    },
  },
  {
    caseName: 'Should go to the limit if distribution ended',
    // customTimeMovement: 4000 * 60 * 100,
    assets: [
      {
        emissionPerSecond: '222',
        totalStaked: '213213213213',
      },
    ],
    compareRules: {
      fieldsEqualToInput: ['emissionPerSecond'],
    },
  },
  {
    caseName: 'Should not accrue any rewards after end or distribution',
    // customTimeMovement: 1000,
    assets: [
      {
        emissionPerSecond: '222',
        totalStaked: '213213213213',
      },
    ],
    compareRules: {
      fieldsEqualToInput: ['emissionPerSecond'],
    },
  },
];

makeSuite('IncentivesController configureAssets', (testEnv: TestEnv) => {
  // custom checks
  it('Tries to submit config updates not from emission manager', async () => {
    const { incentivesController, users } = testEnv;
    await expect(
      incentivesController.connect(users[2].signer).configureRewards([])
    ).to.be.revertedWith('ONLY_EMISSION_MANAGER');
  });

  // mutate compatible scenarios
  // TODO: add events emission
  for (const { assets, caseName, compareRules, customTimeMovement } of configureAssetScenarios) {
    it(caseName, async () => {
      const { incentivesController, rewardTokens, incentivizedTokens } = testEnv;
      const { timestamp } = await hre.ethers.provider.getBlock('latest');

      const distributionEndTimestamp = timestamp + 2000 * 60 * 60;
      const assetConfigsUpdate: AssetUpdateData[] = [];
      const rewardToken = rewardTokens[0];

      const configureRewardsInput: {
        emissionPerSecond: BigNumberish;
        endTimestamp: BigNumberish;
        incentivizedAsset: string;
        reward: string;
      }[] = [];

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
