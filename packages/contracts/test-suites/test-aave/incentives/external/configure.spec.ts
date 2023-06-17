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
      incentivesController.connect(users[2].signer).beginStakingReward(
        incentivizedTokens[0].address, 
          stakingContracts[0].address
    )).to.be.revertedWith('Only manager');

    

    await expect(
        incentivesController.connect(users[2].signer).batchBeginStakingRewards(
          incentivizedTokens.slice(0, 2).map(t => t.address),
            stakingContracts.slice(0, 2).map(t => t.address)
      )).to.be.revertedWith('Only manager');
  });

  it('Configure single asset reward', async () => {
    const { incentivesController, rewardTokens, incentUnderlying, stakingContracts, dai, usdc, incentivizedTokens } = testEnv;
    
    await incentivizedTokens[0].setTranche(0);

    let assetData = await incentivesController.getStakingContract(incentivizedTokens[0].address);
    expect(assetData).equal(ZERO_ADDRESS)

    await incentivesController.beginStakingReward(
      incentivizedTokens[0].address, 
      stakingContracts[0].address
    );

    assetData = await incentivesController.getStakingContract(incentivizedTokens[0].address);
    expect(assetData).equal(stakingContracts[0].address)
  })

  it('Configure batch assets, fail on inconsistent parameter lengths', async () => {
    const { incentivesController, rewardTokens, incentUnderlying, stakingContracts, usdc, busd, aave, incentivizedTokens } = testEnv;
    await incentivizedTokens[1].setTranche(0); //technically they are already 0?
    await expect(
        incentivesController.batchBeginStakingRewards(
          incentivizedTokens.slice(0, 1).map(t => t.address),
            stakingContracts.slice(0, 2).map(t => t.address)
      )).to.be.revertedWith('Malformed input');
    const receipt = await waitForTx(
        await incentivesController.batchBeginStakingRewards(
          incentivizedTokens.slice(1, 3).map(t => t.address),
            stakingContracts.slice(1, 3).map(t => t.address)
    ));

    const assetBData = await incentivesController.getStakingContract(incentivizedTokens[1].address)
    const assetCData = await incentivesController.getStakingContract(incentivizedTokens[2].address)

    expect(assetBData).equal(stakingContracts[1].address)
    expect(assetCData).equal(stakingContracts[2].address)

    const emitted = receipt.events || [];

    expect(emitted.length).equal(4)

    eventChecker(emitted[1], 'RewardConfigured', [
      incentivizedTokens[1].address,
        stakingContracts[1].address,
        0
    ]);

    eventChecker(emitted[3], 'RewardConfigured', [
      incentivizedTokens[2].address,
        stakingContracts[2].address,
        0
    ]);
  });  

  it('Configure asset reward with multiple staking contracts and with liquidity', async () => {
    const { incentivesController, rewardTokens, incentUnderlying, stakingContracts, dai, users, incentivizedTokens } = testEnv;
    

    await expect(incentivesController.beginStakingReward(
      incentivizedTokens[0].address, 
      stakingContracts[5].address
    )).to.be.revertedWith("Cannot add staking reward for a token that already has staking");

    await expect(incentivesController.beginStakingReward(
      incentivizedTokens[0].address, 
      stakingContracts[0].address
    )).to.be.revertedWith("Cannot add staking reward for a token that already has staking");


    // add some liquidity to the aToken via a deposit. 
    console.log(" users 0 and 1 both deposit 1000 of the asset (usdc) to aToken (incentivizedTokens[0])");
    const aToken = incentivizedTokens[0]
    const asset = incentUnderlying[0]
    const staking = stakingContracts[0]
    const reward = rewardTokens[0]
    const user = users[0]

    console.log(" users 0 deposit 1000 of the asset (usdc) to aToken (incentivizedTokens[0])");
    await asset.mint(100000);
    await asset.transfer(aToken.address, 1000);
    await aToken.setUserBalanceAndSupply(1000, 1000);
    await aToken.handleActionOnAic(user.address, 1000, 0, 1000, 0);


    console.log(" users 1 deposit 1000 of the asset (usdc) to aToken (incentivizedTokens[0])");
    await asset.connect(users[1].signer).mint(100000);
    await asset.connect(users[1].signer).transfer(aToken.address, 1000);
    await aToken.connect(users[1].signer).setUserBalanceAndSupply(1000, 2000);
    await aToken.connect(users[1].signer).handleActionOnAic(users[1].address, 2000, 0, 1000, 0);

    let assetData = await incentivesController.getStakingContract(incentivizedTokens[0].address);
    expect(assetData).equal(stakingContracts[0].address)

    console.log("remove the current staking reward and change it to reward 5")
    await incentivesController.removeStakingReward(
      incentivizedTokens[0].address
    );

    await incentivesController.beginStakingReward(
      incentivizedTokens[0].address, 
      stakingContracts[5].address
    );

    assetData = await incentivesController.getStakingContract(incentivizedTokens[0].address);
    expect(assetData).equal(stakingContracts[5].address)
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
    await aToken2.setTranche(1);

    const asset = incentUnderlying[0]
    const staking = stakingContracts[5]
    const reward = rewardTokens[0]

    const user = users[6]
    
    await asset.connect(user.signer).mint(10000)
    await asset.connect(user.signer).transfer(aToken1.address, 2000)
    await aToken1.setUserBalanceAndSupply(2000, 4000);
    await aToken1.handleActionOnAic(user.address, 4000, 0, 2000, 0);
    let assetData = await incentivesController.getStakingContract(aToken1.address);
    expect(assetData).equal(stakingContracts[5].address)

    await asset.connect(user.signer).transfer(aToken2.address, 2000)
    await aToken2.connect(user.signer).setUserBalanceAndSupply(2000,2000);

    await incentivesController.beginStakingReward(
      aToken2.address,
      stakingContracts[5].address
    )
    assetData = await incentivesController.getStakingContract(aToken2.address);
    expect(assetData).equal(stakingContracts[5].address)

    // mimicking user 6 withdrawing 1000
    await aToken2.connect(user.signer).setUserBalanceAndSupply(1000,2000);
    await aToken2.handleActionOnAic(user.address, 2000, 2000, 1000, 1);
    assetData = await incentivesController.getStakingContract(aToken1.address);
    expect(assetData).equal(stakingContracts[5].address)

    //removes staking reward for aToken1
    await incentivesController.removeStakingReward(
      aToken1.address
    );
    assetData = await incentivesController.getStakingContract(aToken1.address);
    const amtAToken = await asset.balanceOf(aToken1.address)
    expect(assetData).equal(ZERO_ADDRESS)

    assetData = await incentivesController.getStakingContract(aToken2.address);
    expect(assetData).equal(stakingContracts[5].address)
  })
});
