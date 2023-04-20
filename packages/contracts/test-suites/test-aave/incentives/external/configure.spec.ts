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
    const { incentivesController, rewardTokens, incentivizedTokens, stakingContracts, dai, usdc } = testEnv;
    await incentivesController.addStakingReward(
        incentivizedTokens[0].address, 
        stakingContracts[0].address, 
        rewardTokens[0].address
    );
    const assetData = await incentivesController.getDataByAToken(rewardTokens[0].address);
    expect(assetData[0]).equal(dai.address)
    expect(assetData[1]).equal(stakingContracts[0].address)
    expect(assetData[2]).equal(usdc.address)
    expect(assetData[3]).equal(0)
    expect(assetData[4]).equal(0)
  })

  it('Configure batch assets, fail on inconsistent parameter lengths', async () => {
    const { incentivesController, rewardTokens, incentivizedTokens, stakingContracts, weth, usdc, busd } = testEnv;
    await expect(
        incentivesController.batchAddStakingRewards(
            incentivizedTokens.slice(0, 1).map(t => t.address),
            stakingContracts.slice(0, 2).map(t => t.address), 
            [rewardTokens[0].address, rewardTokens[0].address]
      )).to.be.revertedWith('Malformed input');
    
    const receipt = await waitForTx(
        await incentivesController.batchAddStakingRewards(
            incentivizedTokens.slice(1, 2).map(t => t.address),
            stakingContracts.slice(1, 2).map(t => t.address), 
            [rewardTokens[0].address, rewardTokens[0].address]
    ));

    const assetBData = await incentivesController.getDataByAToken(incentivizedTokens[1].address)
    const assetCData = await incentivesController.getDataByAToken(incentivizedTokens[2].address)

    expect(assetBData[0]).equal(weth.address)
    expect(assetBData[1]).equal(stakingContracts[1].address)
    expect(assetBData[2]).equal(usdc.address)
    expect(assetBData[3]).equal(0)
    expect(assetBData[4]).equal(0)

    expect(assetCData[0]).equal(busd.address)
    expect(assetCData[1]).equal(stakingContracts[2].address)
    expect(assetCData[2]).equal(usdc.address)
    expect(assetCData[3]).equal(0)
    expect(assetCData[4]).equal(0)

    const emitted = receipt.events || [];

    expect(emitted.length).equal(2)

    eventChecker(emitted[0], 'RewardConfigured', [
        incentivizedTokens[1].address,
        weth.address,
        usdc.address,
        stakingContracts[1].address
    ]);

    eventChecker(emitted[1], 'RewardConfigured', [
        incentivizedTokens[2].address,
        busd.address,
        usdc.address,
        stakingContracts[2].address
    ]);
  });  
});
