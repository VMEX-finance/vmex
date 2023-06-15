import { fail } from 'assert';
const { expect } = require('chai');
import { makeSuite, TestEnv } from '../../helpers/make-suite';
import { increaseTime, waitForTx } from '../../../../helpers/misc-utils';
import { CompareRules, eventChecker } from '../helpers/comparator-engine';
import hre from 'hardhat';
import { BigNumber, BigNumberish } from 'ethers';

makeSuite('ExternalRewardDistributor remove staking', (testEnv) => {
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
	
    it('Single depositor, then staked contract is removed, harvests and claims requested amount still allowed', async () => {
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

			await waitForTx(
				await incentivesController.removeStakingReward(asset.address)
			);
			const receipt = await waitForTx(
				await incentivesController.connect(user.signer).claimStakingReward(asset.address, rewardAmt.div(2))
			);

			const userData = await incentivesController.getUserDataByAToken(user.address, aToken.address);
			const userRewardBal = await reward.balanceOf(user.address)
			expect(userRewardBal).equal(rewardAmt.div(2));
			// see note in handle-action.spec.ts regarding dust amounts
			expect(userData.rewardBalance).gte(rewardAmt.div(2));
			expect(userData.stakedBalance).equal(0);
			
			const emitted = receipt.events || [];

			eventChecker(emitted[emitted.length - 1], "StakingRewardClaimed", [
				user.address,
				asset.address,
				reward.address,
				rewardAmt.div(2)
			]);

			await waitForTx(
				await incentivesController.connect(user.signer).claimStakingReward(asset.address, rewardAmt.div(2))
			);
    });

		it('Adds another staking reward token, revert expected', async () => {
			const { incentivesController, incentivizedTokens, stakingContracts, incentUnderlying, users, rewardTokens } = testEnv;

			const asset = incentUnderlying[0]			
			const aToken = incentivizedTokens[0]
			const user = users[0]
			const reward = rewardTokens[0]

			await expect(incentivesController.addStakingReward(incentivizedTokens[0].address, stakingContracts[1].address, rewardTokens[0].address))
				.to.be.revertedWith('Cannot reinitialize an underlying that has been set before')
			
				//however users can still claim their rewards from the previous staking contract 
			const userData = await incentivesController.getUserDataByAToken(user.address, aToken.address);
			console.log("User still has ",userData.rewardBalance);
			const rewardAmt = userData.rewardBalance;
			expect(rewardAmt).gt(0);
			const userRewardBalBefore = await reward.balanceOf(user.address)
			await waitForTx(
				await incentivesController.connect(user.signer).claimStakingReward(asset.address, rewardAmt.div(2))
			);
			const userRewardBal = await reward.balanceOf(user.address)
			expect(userRewardBal.sub(userRewardBalBefore)).gte(rewardAmt.div(2));
		});

		// @dev: These tests are written under the assumption that staking contract can change after calling removeStakingReward, but that assumption is incorrect

		// it('Adds another staking reward token with the same reward token, which is allowed, but just cant handleAction. Can still claim staking rewards', async () => {
		// 	const { incentivesController, incentivizedTokens, stakingContracts, incentUnderlying, users, rewardTokens } = testEnv;

		// 	await incentivesController.addStakingReward(incentivizedTokens[0].address, stakingContracts[1].address, rewardTokens[0].address)

		// 	//note that this new staking contract expects a different underlying than the incentivizedTokens[0], so it can't harvest

		// 	const asset = incentUnderlying[1]			
		// 	const aToken = incentivizedTokens[0]
		// 	const user = users[0]
		// 	const reward = rewardTokens[0]

		// 	const aData = await incentivesController.getDataByAToken(aToken.address);

		// 	console.log("Data: ",aData);

		// 	await asset.mint(100000);
		// 	await asset.transfer(aToken.address, 3000);
		// 	//at this juncture aToken still holds some of the other
		// 	await expect(aToken.handleActionOnAic(user.address, 3000, 0, 3000, 0)).to.be.revertedWith("SafeERC20: low-level call failed")

		// 	//however users can still claim their rewards from the previous staking contract 
		// 	const userData = await incentivesController.getUserDataByAToken(user.address, aToken.address);
		// 	console.log("User still has ",userData.rewardBalance);
		// 	const rewardAmt = userData.rewardBalance;
		// 	expect(rewardAmt).gt(0);
		// 	const userRewardBalBefore = await reward.balanceOf(user.address)
		// 	await waitForTx(
		// 		await incentivesController.connect(user.signer).claimStakingReward(incentUnderlying[0].address, rewardAmt.div(2))
		// 	);
		// 	const userRewardBal = await reward.balanceOf(user.address)
		// 	expect(userRewardBal.sub(userRewardBalBefore)).gte(rewardAmt.div(2));
		// });

		// it('Changes staking contract. Can still claim staking rewards', async () => {
		// 	const { incentivesController, incentivizedTokens, stakingContracts, incentUnderlying, users, rewardTokens } = testEnv;

		// 	await incentivesController.addStakingReward(incentivizedTokens[0].address, stakingContracts[0].address, rewardTokens[0].address)

		// 	const aToken = incentivizedTokens[0]
		// 	const asset = incentUnderlying[0]
		// 	const staking = stakingContracts[0]
		// 	const reward = rewardTokens[0]
		// 	const user = users[0]

		// 	await asset.mint(100000);
		// 	await asset.transfer(aToken.address, 1000);
		// 	await aToken.handleActionOnAic(user.address, 2000, 1000, 2000, 0);
		// 	const rewardAmtBefore = await staking.earned(incentivesController.address);
		// 	console.log("reward amount before: ", rewardAmtBefore)

		// 	increaseTime(50000);
		// 	const rewardAmt = await staking.earned(incentivesController.address);
		// 	console.log("rewardAmt: ", rewardAmt );
		// 	let userData = await incentivesController.getUserDataByAToken(user.address, aToken.address);
		// 	console.log("user data: ", userData);
		// 	const receipt = await waitForTx(
		// 		await incentivesController.connect(user.signer).claimStakingReward(asset.address, rewardAmt.div(2))
		// 	);

		// 	userData = await incentivesController.getUserDataByAToken(user.address, aToken.address);
		// 	const userRewardBal = await reward.balanceOf(user.address)
		// 	expect(userRewardBal).equal(rewardAmt.div(2));
		// 	// see note in handle-action.spec.ts regarding dust amounts
		// 	expect(userData.rewardBalance).gte(rewardAmt.div(2));
		// 	expect(userData.stakedBalance).equal(1000);
			
		// 	const emitted = receipt.events || [];

		// 	eventChecker(emitted[emitted.length - 1], "StakingRewardClaimed", [
		// 		user.address,
		// 		asset.address,
		// 		reward.address,
		// 		rewardAmt.div(2)
		// 	]);
		// });
})