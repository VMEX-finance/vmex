import { fail } from 'assert';
const { expect } = require('chai');
import { makeSuite, TestEnv } from '../../helpers/make-suite';
import { increaseTime, waitForTx } from '../../../../helpers/misc-utils';
import { CompareRules, eventChecker } from '../helpers/comparator-engine';
import hre from 'hardhat';
import { BigNumber, BigNumberish } from 'ethers';

makeSuite('ExternalRewardDistributor reward claiming', (testEnv) => {
    it('Single depositor, harvests and claims requested amount', async () => {
      const { incentivesController, incentivizedTokens, stakingContracts, incentUnderlying, users, rewardTokens } = testEnv;

			await incentivesController.addStakingReward(incentivizedTokens[0].address, stakingContracts[0].address, rewardTokens[0].address)

			const aToken = incentivizedTokens[0]
			const asset = incentUnderlying[0]
			const staking = stakingContracts[0]
			const reward = rewardTokens[0]
			const user = users[0]

			await asset.mint(100000);
			await asset.transfer(aToken.address, 1000);
			await aToken.handleActionOnAic(user.address, 1000, 0, 1000, 0);

			increaseTime(50000);
			const rewardAmt = await staking.earned(incentivesController.address);
			const receipt = await waitForTx(
				await incentivesController.connect(user.signer).claimStakingReward(asset.address, rewardAmt.div(2))
			);

			const userData = await incentivesController.getUserDataByAToken(user.address, aToken.address);
			const userRewardBal = await reward.balanceOf(user.address)
			expect(userRewardBal).equal(rewardAmt.div(2));
			// see note in handle-action.spec.ts regarding dust amounts
			expect(userData.rewardBalance).gte(rewardAmt.div(2));
			expect(userData.stakedBalance).equal(1000);
			
			const emitted = receipt.events || [];

			eventChecker(emitted[emitted.length - 1], "StakingRewardClaimed", [
				user.address,
				asset.address,
				reward.address,
				rewardAmt.div(2)
			]);
    });

		it('Reverts on excess claim', async () => {
			const { incentivesController, incentivizedTokens, stakingContracts, incentUnderlying, users, rewardTokens } = testEnv;

			const aToken = incentivizedTokens[0]
			const asset = incentUnderlying[0]
			const newUser = users[1]
			const staking = stakingContracts[0]

			await asset.transfer(aToken.address, 1000);
			await aToken.handleActionOnAic(newUser.address, 1000, 0, 1000, 0);

			increaseTime(20000)
			
			const userData = await incentivesController.getUserDataByAToken(newUser.address, aToken.address)
			const earned = await staking.earned(incentivesController.address)
			await expect(
				incentivesController.connect(newUser.signer).claimStakingReward(asset.address, userData.rewardBalance.add(earned).add(10000))
			).to.be.revertedWith("Insufficient balance");
		});

		it('Two depositors of different assets with same reward token', async () => {
			const { incentivesController, incentivizedTokens, stakingContracts, incentUnderlying, users, rewardTokens } = testEnv;

			await incentivesController.addStakingReward(incentivizedTokens[1].address, stakingContracts[1].address, rewardTokens[0].address)

			const aToken1 = incentivizedTokens[0]
			const aToken2 = incentivizedTokens[1]
			const user1 = users[4]
			const user2 = users[5]
			const asset1 = incentUnderlying[0]
			const asset2 = incentUnderlying[1]
			const reward = rewardTokens[0]

			await asset1.transfer(aToken1.address, 1000)
			await asset2.mint(10000);
			await asset2.transfer(aToken2.address, 1000)

			await aToken1.handleActionOnAic(user1.address, 2000, 0, 1000, 0)
			await aToken2.handleActionOnAic(user2.address, 0, 0, 1000, 0)

			increaseTime(50000)
			const contractRewardBalBefore = await reward.balanceOf(incentivesController.address)
			await aToken2.handleActionOnAic(user2.address, 1000, 1000, 0, 1)
			const contractRewardBalAfter1 = await reward.balanceOf(incentivesController.address)
			await aToken1.handleActionOnAic(user1.address, 3000, 1000, 0, 1)
			const contractRewardBalAfter2 = await reward.balanceOf(incentivesController.address)
			const user2Data = await incentivesController.getUserDataByAToken(user2.address, aToken2.address)
			const user1Data = await incentivesController.getUserDataByAToken(user1.address, aToken1.address)
			expect(user2Data.rewardBalance).lte(contractRewardBalAfter1.sub(contractRewardBalBefore))
			expect(user1Data.rewardBalance).lte(contractRewardBalAfter2.sub(contractRewardBalBefore))

			await incentivesController.connect(user1.signer).claimStakingReward(asset1.address, user1Data.rewardBalance)
			await incentivesController.connect(user2.signer).claimStakingReward(asset2.address, user2Data.rewardBalance)

			expect(await reward.balanceOf(user1.address)).equal(user1Data.rewardBalance)
			expect(await reward.balanceOf(user2.address)).equal(user2Data.rewardBalance)
		});

		it('Single user batchClaim for multiple assets', async () => {
			const { incentivesController, incentivizedTokens, stakingContracts, incentUnderlying, users, rewardTokens } = testEnv;

			const aToken1 = incentivizedTokens[0]
			const aToken2 = incentivizedTokens[1]
			const user = users[0]
			const asset1 = incentUnderlying[0]
			const asset2 = incentUnderlying[1]
			const reward = rewardTokens[0]

			await asset2.transfer(aToken2.address, 1000)
			const userToken1DataBefore = await incentivesController.getUserDataByAToken(user.address, aToken1.address)

			await aToken2.handleActionOnAic(user.address, 0, 0, 1000, 0)
			increaseTime(50000)
			const rewardBalBefore = await reward.balanceOf(incentivesController.address)
			await aToken2.handleActionOnAic(user.address, 1000, 1000, 0, 1)
			const rewardBalNext = await reward.balanceOf(incentivesController.address)
			await aToken1.handleActionOnAic(user.address, 2000, 1000, 0, 1)
			const rewardBalAfter = await reward.balanceOf(incentivesController.address)
			const userToken1DataAfter = await incentivesController.getUserDataByAToken(user.address, aToken1.address)
			const userToken2Data = await incentivesController.getUserDataByAToken(user.address, aToken2.address)

			expect(userToken1DataAfter.rewardBalance.sub(userToken1DataBefore.rewardBalance))
				.gte(rewardBalAfter.sub(rewardBalNext))
			expect(userToken2Data.rewardBalance).lte(rewardBalNext.sub(rewardBalBefore))

			const userRewardBalBefore = await reward.balanceOf(user.address)

			await incentivesController.connect(user.signer).batchClaimStakingRewards(
				[asset1.address, asset2.address], 
				[userToken1DataAfter.rewardBalance, userToken2Data.rewardBalance]
			)

			const userRewardBalAfter = await reward.balanceOf(user.address)
			expect(userRewardBalAfter.sub(userRewardBalBefore)).equal(userToken1DataAfter.rewardBalance.add(userToken2Data.rewardBalance))
		})

		it('Full lifecycle for two aTokens with same underlying', async () => {
			const { incentivesController, incentivizedTokens, stakingContracts, incentUnderlying, users, rewardTokens } = testEnv;

			const aToken1 = incentivizedTokens[2]
			const aToken2 = incentivizedTokens[3]

			await aToken2.setUnderlying(await aToken1.UNDERLYING_ASSET_ADDRESS())

			const asset = incentUnderlying[2]
			const staking = stakingContracts[2]
			const reward = rewardTokens[0]
			
			await asset.mint(10000)
			await asset.transfer(aToken1.address, 2000)
			await asset.transfer(aToken2.address, 2000)

			await incentivesController.batchAddStakingRewards(
				[aToken1.address, aToken2.address],
				[staking.address, staking.address],
				[reward.address, reward.address]
			)

			const user = users[6]

			await aToken1.handleActionOnAic(user.address, 0, 0, 1000, 0)
			await aToken2.handleActionOnAic(user.address, 0, 0, 1000, 0)

			const userData = await incentivesController.getUserDataByAToken(user.address, aToken1.address)
			expect(userData.stakedBalance).equal(2000)
			
			increaseTime(50000)

			const rewardBalBefore = await reward.balanceOf(incentivesController.address)
			await aToken1.handleActionOnAic(user.address, 1000, 1000, 500, 1)
			const userDataNext = await incentivesController.getUserDataByAToken(user.address, aToken1.address)
			const rewardBalNext = await reward.balanceOf(incentivesController.address)
			await aToken2.handleActionOnAic(user.address, 1000, 1000, 0, 1)
			const rewardBalAfter = await reward.balanceOf(incentivesController.address)
			const userDataAfter = await incentivesController.getUserDataByAToken(user.address, aToken1.address)

			expect(userDataNext.rewardBalance).gte(rewardBalNext.sub(rewardBalBefore))
			expect(userDataAfter.rewardBalance).gte(rewardBalAfter.sub(rewardBalBefore))
			expect(userDataNext.stakedBalance).equal(1500)
			expect(userDataAfter.stakedBalance).equal(500)

			const user2 = users[5]
			await asset.transfer(aToken1.address, 1000)
			await aToken1.handleActionOnAic(user2.address, 500, 0, 1000, 0)
			increaseTime(50000)
			const earned = await staking.earned(incentivesController.address)
			await incentivesController.connect(user.signer).claimStakingReward(
				asset.address, 
				userDataAfter.rewardBalance.add(earned.div(3))
			)
			expect(await reward.balanceOf(user.address)).equal(userDataAfter.rewardBalance.add(earned.div(3)))
		})
})