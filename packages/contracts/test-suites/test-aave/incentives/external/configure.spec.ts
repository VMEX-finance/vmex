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
import { ZERO_ADDRESS } from '../../../../helpers/constants';

makeSuite('ExternalRewardsDistributor configure rewards', (testEnv: TestEnv) => {
  before('Before', async () => {
    const { dai, assetMappings, busd, usdt, weth } = testEnv; 
    await assetMappings.setBorrowingEnabled(dai.address, false);
    await assetMappings.setBorrowingEnabled(busd.address, false);
    await assetMappings.setBorrowingEnabled(usdt.address, false);
    await assetMappings.setBorrowingEnabled(weth.address, false);
  });

  after('After', async () => {
    const { dai, assetMappings, busd, usdt, weth } = testEnv; 
    await assetMappings.setBorrowingEnabled(dai.address, true);
    await assetMappings.setBorrowingEnabled(busd.address, true);
    await assetMappings.setBorrowingEnabled(usdt.address, true);
    await assetMappings.setBorrowingEnabled(weth.address, true);
  });

  it('Reject reward config not from manager', async () => {
    const { incentivesController, users, rewardTokens, incentivizedTokens, stakingContracts, incentUnderlying } = testEnv;
    await expect(
      incentivesController.connect(users[2].signer).addStakingReward(
        incentUnderlying[0].address, 
          stakingContracts[0].address
    )).to.be.revertedWith('Only manager');

    

    await expect(
        incentivesController.connect(users[2].signer).batchAddStakingRewards(
          incentUnderlying.slice(0, 2).map(t => t.address),
            stakingContracts.slice(0, 2).map(t => t.address)
      )).to.be.revertedWith('Only manager');
  });

  it('Configure single asset reward', async () => {
    const { incentivesController, rewardTokens, incentUnderlying, stakingContracts, dai, usdc, incentivizedTokens } = testEnv;
    await incentivesController.addStakingReward(
      incentUnderlying[0].address, 
        stakingContracts[0].address
    );
    let assetData = await incentivesController.getDataByAToken(incentivizedTokens[0].address);
    expect(assetData[0]).equal(dai.address)
    expect(assetData[1]).equal(stakingContracts[0].address)
    expect(assetData[2]).equal(0)
    expect(assetData[3]).equal(0)
    expect(assetData[4]).equal(false)

    await expect(incentivesController.beginStakingReward(
      incentivizedTokens[0].address, 
      1
    )).to.be.revertedWith("invalid index of staking contract");

    await incentivesController.beginStakingReward(
      incentivizedTokens[0].address, 
      0
    );

    assetData = await incentivesController.getDataByAToken(incentivizedTokens[0].address);
    expect(assetData[0]).equal(dai.address)
    expect(assetData[1]).equal(stakingContracts[0].address)
    expect(assetData[2]).equal(0)
    expect(assetData[3]).equal(0)
    expect(assetData[4]).equal(true)
  })

  it('Configure batch assets, fail on inconsistent parameter lengths', async () => {
    const { incentivesController, rewardTokens, incentUnderlying, stakingContracts, usdc, busd, aave, incentivizedTokens } = testEnv;
    await expect(
        incentivesController.batchAddStakingRewards(
          incentUnderlying.slice(0, 1).map(t => t.address),
            stakingContracts.slice(0, 2).map(t => t.address)
      )).to.be.revertedWith('Malformed input');
    const receipt = await waitForTx(
        await incentivesController.batchAddStakingRewards(
          incentUnderlying.slice(1, 3).map(t => t.address),
            stakingContracts.slice(1, 3).map(t => t.address)
    ));

    await incentivesController.beginStakingReward(
      incentivizedTokens[1].address, 
      0
    );

    await incentivesController.beginStakingReward(
      incentivizedTokens[2].address, 
      0
    );

    const assetBData = await incentivesController.getDataByAToken(incentivizedTokens[1].address)
    const assetCData = await incentivesController.getDataByAToken(incentivizedTokens[2].address)

    expect(assetBData[0]).equal(busd.address)
    expect(assetBData[1]).equal(stakingContracts[1].address)
    expect(assetBData[2]).equal(0)
    expect(assetBData[3]).equal(0)
    expect(assetBData[4]).equal(true)

    expect(assetCData[0]).equal(aave.address)
    expect(assetCData[1]).equal(stakingContracts[2].address)
    expect(assetCData[2]).equal(0)
    expect(assetCData[3]).equal(0)
    expect(assetCData[4]).equal(true)

    const emitted = receipt.events || [];

    expect(emitted.length).equal(4)

    eventChecker(emitted[1], 'RewardConfigured', [
        busd.address,
        stakingContracts[1].address,
        1
    ]);

    eventChecker(emitted[3], 'RewardConfigured', [
        aave.address,
        stakingContracts[2].address,
        1
    ]);
  });  

  it('Configure asset reward with multiple staking contracts and with liquidity', async () => {
    const { incentivesController, rewardTokens, incentUnderlying, stakingContracts, dai, users, incentivizedTokens } = testEnv;
    await incentivesController.addStakingReward(
      incentUnderlying[0].address, 
        stakingContracts[5].address
    );
    let assetData = await incentivesController.getDataByAToken(incentivizedTokens[0].address);
    expect(assetData[0]).equal(dai.address)
    expect(assetData[1]).equal(stakingContracts[0].address)
    expect(assetData[2]).equal(0)
    expect(assetData[3]).equal(0)
    expect(assetData[4]).equal(true)

    await expect(incentivesController.beginStakingReward(
      incentivizedTokens[0].address, 
      1
    )).to.be.revertedWith("Cannot add staking reward for a token that already has staking");

    await expect(incentivesController.beginStakingReward(
      incentivizedTokens[0].address, 
      0
    )).to.be.revertedWith("Cannot add staking reward for a token that already has staking");


    // add some liquidity to the aToken via a deposit
    const aToken = incentivizedTokens[0]
    const asset = incentUnderlying[0]
    const staking = stakingContracts[0]
    const reward = rewardTokens[0]
    const user = users[0]

    await asset.mint(100000);
    await asset.transfer(aToken.address, 1000);
    await aToken.handleActionOnAic(user.address, 1000, 0, 1000, 0);


    await asset.connect(users[1].signer).mint(100000);
    await asset.connect(users[1].signer).transfer(aToken.address, 1000);
    await aToken.connect(users[1].signer).handleActionOnAic(users[1].address, 2000, 0, 1000, 0);

    assetData = await incentivesController.getDataByAToken(incentivizedTokens[0].address);
    expect(assetData[0]).equal(dai.address)
    expect(assetData[1]).equal(stakingContracts[0].address)
    expect(assetData[2]).equal(0)
    expect(assetData[3]).equal(2000)
    expect(assetData[4]).equal(true)

    await incentivesController.removeStakingReward(
      incentivizedTokens[0].address
    );

    console.log("allowance of atoken: ", await asset.allowance(incentivesController.address, stakingContracts[5].address))

    await expect(incentivesController.beginStakingReward(
      incentivizedTokens[0].address, 
      2
    )).to.be.revertedWith("invalid index of staking contract");

    assetData = await incentivesController.getDataByAToken(incentivizedTokens[0].address);

    expect(assetData[0]).equal(dai.address)
    expect(assetData[1]).equal(stakingContracts[0].address)
    expect(assetData[2]).equal(0)
    expect(assetData[3]).equal(0)
    expect(assetData[4]).equal(false)

    await incentivesController.beginStakingReward(
      incentivizedTokens[0].address, 
      1
    );

    assetData = await incentivesController.getDataByAToken(incentivizedTokens[0].address);
    expect(assetData[0]).equal(dai.address)
    expect(assetData[1]).equal(stakingContracts[5].address)
    expect(assetData[2]).equal(1)
    expect(assetData[3]).equal(2000)
    expect(assetData[4]).equal(true)
  })

  it('Full lifecycle for two aTokens with same underlying', async () => {
    const { incentivesController, incentivizedTokens, stakingContracts, incentUnderlying, users, rewardTokens, dai } = testEnv;

    const aToken1 = incentivizedTokens[0]
    const aToken2 = incentivizedTokens[1]

    //removes staking reward for aToken2
    await incentivesController.removeStakingReward(
      aToken2.address
    );

    await aToken2.setUnderlying(await aToken1.UNDERLYING_ASSET_ADDRESS())

    const asset = incentUnderlying[0]
    const staking = stakingContracts[5]
    const reward = rewardTokens[0]

    const user = users[6]
    
    await asset.connect(user.signer).mint(10000)
    await asset.connect(user.signer).transfer(aToken1.address, 2000)
    await aToken1.handleActionOnAic(user.address, 4000, 0, 2000, 0);
    let assetData = await incentivesController.getDataByAToken(aToken1.address);
    expect(assetData[0]).equal(dai.address)
    expect(assetData[1]).equal(stakingContracts[5].address)
    expect(assetData[2]).equal(1)
    expect(assetData[3]).equal(4000)
    expect(assetData[4]).equal(true)


    await asset.connect(user.signer).transfer(aToken2.address, 2000)

    await incentivesController.beginStakingReward(
      aToken2.address,
      1
    )
    assetData = await incentivesController.getDataByAToken(aToken2.address);
    expect(assetData[0]).equal(dai.address)
    expect(assetData[1]).equal(stakingContracts[5].address)
    expect(assetData[2]).equal(1)
    expect(assetData[3]).equal(2000)
    expect(assetData[4]).equal(true)

    // mimicking user 6 withdrawing 1000
    await aToken2.handleActionOnAic(user.address, 2000, 2000, 1000, 1);
    assetData = await incentivesController.getDataByAToken(aToken1.address);
    expect(assetData[0]).equal(dai.address)
    expect(assetData[1]).equal(stakingContracts[5].address)
    expect(assetData[2]).equal(1)
    expect(assetData[3]).equal(4000)
    expect(assetData[4]).equal(true)

    assetData = await incentivesController.getDataByAToken(aToken2.address);
    expect(assetData[0]).equal(dai.address)
    expect(assetData[1]).equal(stakingContracts[5].address)
    expect(assetData[2]).equal(1)
    expect(assetData[3]).equal(1000)
    expect(assetData[4]).equal(true)

    //removes staking reward for aToken1
    await incentivesController.removeStakingReward(
      aToken1.address
    );
    assetData = await incentivesController.getDataByAToken(aToken1.address);
    const amtAToken = await asset.balanceOf(aToken1.address)
    expect(assetData[0]).equal(dai.address)
    expect(assetData[1]).equal(stakingContracts[5].address)
    expect(assetData[2]).equal(1)
    expect(assetData[3]).equal(0)
    expect(assetData[4]).equal(false)
    expect(amtAToken).equal(4000)

    assetData = await incentivesController.getDataByAToken(aToken2.address);
    expect(assetData[0]).equal(dai.address)
    expect(assetData[1]).equal(stakingContracts[5].address)
    expect(assetData[2]).equal(1)
    expect(assetData[3]).equal(1000)
    expect(assetData[4]).equal(true)
  })
});
