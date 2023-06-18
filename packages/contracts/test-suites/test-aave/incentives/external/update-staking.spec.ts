// import { fail } from 'assert';
// const { expect } = require('chai');
// import { makeSuite, TestEnv } from '../../helpers/make-suite';
// import { increaseTime, waitForTx } from '../../../../helpers/misc-utils';
// import { CompareRules, eventChecker } from '../helpers/comparator-engine';
// import hre from 'hardhat';
// import { BigNumber, BigNumberish } from 'ethers';

// makeSuite('ExternalRewardDistributor update staking', (testEnv) => {
// 	before('Before', async () => {
// 		const { dai, assetMappings, busd, usdt, weth } = testEnv; 
// 		await assetMappings.setBorrowingEnabled(dai.address, false);
// 		await assetMappings.setBorrowingEnabled(busd.address, false);
// 		await assetMappings.setBorrowingEnabled(usdt.address, false);
// 		await assetMappings.setBorrowingEnabled(weth.address, false);
// 	  });
	
// 	  after('After', async () => {
// 		const { dai, assetMappings, busd, usdt, weth } = testEnv; 
// 		await assetMappings.setBorrowingEnabled(dai.address, true);
// 		await assetMappings.setBorrowingEnabled(busd.address, true);
// 		await assetMappings.setBorrowingEnabled(usdt.address, true);
// 		await assetMappings.setBorrowingEnabled(weth.address, true);
// 	  });
	
//     it('Single depositor, then staked contract is updated, harvests and claims requested amount still allowed', async () => {
//       const { incentivesController, incentivizedTokens, stakingContracts, incentUnderlying, users, rewardTokens } = testEnv;

// 			await incentivesController.addStakingReward(incentivizedTokens[0].address, stakingContracts[0].address, rewardTokens[0].address)

// 			const aToken = incentivizedTokens[0]
// 			const asset = incentUnderlying[0]
// 			const staking = stakingContracts[0]
// 			const reward = rewardTokens[0]
// 			const user = users[0]

// 			await asset.mint(100000);
// 			await asset.transfer(aToken.address, 1000);
// 			await aToken.handleActionOnAic(user.address, 1000, 0, 1000, 0);

// 			increaseTime(50000);
// 			const rewardAmt = await staking.earned(incentivesController.address);

// 			await expect(incentivesController.updateStakingContract(asset.address, stakingContracts[1].address)
// 			).to.be.revertedWith('Bad staking contract');
			
//     });

// 		it('Changes staking contract. Can still claim staking rewards', async () => {
// 			const { incentivesController, incentivizedTokens, stakingContracts, incentUnderlying, users, rewardTokens } = testEnv;

// 			const aToken = incentivizedTokens[0]
// 			const asset = incentUnderlying[0]
// 			const staking = stakingContracts[5]
// 			const reward = rewardTokens[0]
// 			const user = users[0]


// 			const rewardAmtBeforeUpdate = await stakingContracts[0].earned(incentivesController.address);
// 			const amtStaked = await stakingContracts[0].balanceOf(incentivesController.address);
// 			const userDataBeforeUpdate = await incentivesController.getUserDataByAToken(user.address, aToken.address);
// 			const accountingBeforeUpdate = await incentivesController.getDataByAToken(aToken.address);

// 			expect(userDataBeforeUpdate.rewardBalance).equal(0);

// 			await waitForTx(
// 				await incentivesController.updateStakingContract(asset.address, staking.address)
// 			);

// 			let userDataAfterUpdate = await incentivesController.getUserDataByAToken(user.address, aToken.address);
// 			const accountingAfterUpdate = await incentivesController.getDataByAToken(aToken.address);

// 			const expectedCumReward = Number(accountingBeforeUpdate.cumulativeRewardPerToken) + Number(rewardAmtBeforeUpdate) * 1e16 / Number(amtStaked)
// 			console.log("expected cum reward: ", expectedCumReward)
// 			console.log("cum reward: ", accountingAfterUpdate.cumulativeRewardPerToken)
// 			const diff = Math.abs(Number(accountingAfterUpdate.cumulativeRewardPerToken) - expectedCumReward) / Number(accountingAfterUpdate.cumulativeRewardPerToken)

// 			expect(userDataBeforeUpdate.lastUpdateRewardPerToken).equal(userDataAfterUpdate.lastUpdateRewardPerToken);
// 			expect(userDataBeforeUpdate.rewardBalance).equal(userDataAfterUpdate.rewardBalance);
// 			expect(userDataBeforeUpdate.stakedBalance).equal(userDataAfterUpdate.stakedBalance);


// 			expect(accountingAfterUpdate.underlyingContract).equal(asset.address)
// 			expect(accountingAfterUpdate.stakingContract).equal(staking.address)
// 			expect(accountingAfterUpdate.rewardContract).equal(reward.address)
// 			expect(diff).lte(0.001) // 0.1% error tolerance
// 			expect(accountingAfterUpdate.lastUpdateTimestamp).gt(accountingBeforeUpdate.lastUpdateTimestamp)


// 			//user can still claim their unclaimed balance from the previous staking contract
// 			let receipt = await waitForTx(
// 				await incentivesController.connect(user.signer).claimStakingReward(asset.address, rewardAmtBeforeUpdate.div(2))
// 			);

// 			let userData = await incentivesController.getUserDataByAToken(user.address, aToken.address);
// 			const userRewardBalBefore = await reward.balanceOf(user.address)
// 			expect(userRewardBalBefore).equal(rewardAmtBeforeUpdate.div(2));
// 			// see note in handle-action.spec.ts regarding dust amounts
// 			expect(userData.rewardBalance).gte(rewardAmtBeforeUpdate.div(2));
// 			expect(userData.stakedBalance).equal(1000);
			
// 			let emitted = receipt.events || [];

// 			eventChecker(emitted[emitted.length - 1], "StakingRewardClaimed", [
// 				user.address,
// 				asset.address,
// 				reward.address,
// 				rewardAmtBeforeUpdate.div(2)
// 			]);


// 			// deposit again
// 			await asset.mint(100000);
// 			await asset.transfer(aToken.address, 1000);
// 			await aToken.handleActionOnAic(user.address, 2000, 1000, 2000, 0);
// 			const rewardAmtBefore = await staking.earned(incentivesController.address);
// 			console.log("reward amount before: ", rewardAmtBefore)

// 			increaseTime(50000);
// 			const rewardAmt = await staking.earned(incentivesController.address);
// 			console.log("rewardAmt: ", rewardAmt );
// 			userData = await incentivesController.getUserDataByAToken(user.address, aToken.address);
// 			console.log("user data: ", userData);
// 			receipt = await waitForTx(
// 				await incentivesController.connect(user.signer).claimStakingReward(asset.address, rewardAmt.div(2))
// 			);

// 			userData = await incentivesController.getUserDataByAToken(user.address, aToken.address);
// 			const userRewardBal = await reward.balanceOf(user.address)
// 			expect(userRewardBal.sub(userRewardBalBefore)).equal(rewardAmt.div(2));
// 			// see note in handle-action.spec.ts regarding dust amounts
// 			expect(userData.rewardBalance).gte(rewardAmt.div(2));
// 			expect(userData.stakedBalance).equal(2000);
			
// 			emitted = receipt.events || [];

// 			eventChecker(emitted[emitted.length - 1], "StakingRewardClaimed", [
// 				user.address,
// 				asset.address,
// 				reward.address,
// 				rewardAmt.div(2)
// 			]);
// 		});
// })