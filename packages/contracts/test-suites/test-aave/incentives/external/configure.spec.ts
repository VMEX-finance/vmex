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
  it('Reject reward config not from manager', async () => {
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

  it('Configure single asset reward', async () => {
    const { incentivesController, users, rewardTokens, incentivizedTokens, stakingContracts } = testEnv;
    const receipt = await waitForTx(
        await incentivesController.addStakingReward(
            incentivizedTokens[0].address, 
            stakingContracts[0].address, 
            rewardTokens[0].address
    ));
    const assetConfig = await incentivesController.getDataByAToken(rewardTokens[0].address);
    expect(assetConfig[0]).to.equal()
  })

});
