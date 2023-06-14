import { fail } from 'assert';
const { expect } = require('chai');
import { makeSuite, TestEnv } from '../../helpers/make-suite';
import { increaseTime, waitForTx } from '../../../../helpers/misc-utils';
import { CompareRules, eventChecker } from '../helpers/comparator-engine';
import hre from 'hardhat';
import { BigNumber, BigNumberish } from 'ethers';

makeSuite('ExternalRewardDistributor update staking', (testEnv) => {
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
	
    it('Single depositor, then staked contract is updated, harvests and claims requested amount still allowed', async () => {
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

			await expect(incentivesController.updateStakingContract(asset.address, stakingContracts[1].address)
			).to.be.revertedWith('Bad staking contract');
			// const receipt = await waitForTx(
			// 	await incentivesController.connect(user.signer).claimStakingReward(asset.address, rewardAmt.div(2))
			// );

			// const userData = await incentivesController.getUserDataByAToken(user.address, aToken.address);
			// const userRewardBal = await reward.balanceOf(user.address)
			// expect(userRewardBal).equal(rewardAmt.div(2));
			// // see note in handle-action.spec.ts regarding dust amounts
			// expect(userData.rewardBalance).gte(rewardAmt.div(2));
			// expect(userData.stakedBalance).equal(0);
			
			// const emitted = receipt.events || [];

			// eventChecker(emitted[emitted.length - 1], "StakingRewardClaimed", [
			// 	user.address,
			// 	asset.address,
			// 	reward.address,
			// 	rewardAmt.div(2)
			// ]);
    });

		it('Changes staking contract. Can still claim staking rewards', async () => {
			const { incentivesController, incentivizedTokens, stakingContracts, incentUnderlying, users, rewardTokens } = testEnv;

			const aToken = incentivizedTokens[0]
			const asset = incentUnderlying[0]
			const staking = stakingContracts[5]
			const reward = rewardTokens[0]
			const user = users[0]

			await waitForTx(
				await incentivesController.updateStakingContract(asset.address, staking.address)
			);

			await asset.mint(100000);
			await asset.transfer(aToken.address, 1000);
			await aToken.handleActionOnAic(user.address, 2000, 1000, 2000, 0);
			const rewardAmtBefore = await staking.earned(incentivesController.address);
			console.log("reward amount before: ", rewardAmtBefore)

			increaseTime(50000);
			const rewardAmt = await staking.earned(incentivesController.address);
			console.log("rewardAmt: ", rewardAmt );
			let userData = await incentivesController.getUserDataByAToken(user.address, aToken.address);
			console.log("user data: ", userData);
			const receipt = await waitForTx(
				await incentivesController.connect(user.signer).claimStakingReward(asset.address, rewardAmt.div(2))
			);

			userData = await incentivesController.getUserDataByAToken(user.address, aToken.address);
			const userRewardBal = await reward.balanceOf(user.address)
			expect(userRewardBal).equal(rewardAmt.div(2));
			// see note in handle-action.spec.ts regarding dust amounts
			expect(userData.rewardBalance).gte(rewardAmt.div(2));
			expect(userData.stakedBalance).equal(2000);
			
			const emitted = receipt.events || [];

			eventChecker(emitted[emitted.length - 1], "StakingRewardClaimed", [
				user.address,
				asset.address,
				reward.address,
				rewardAmt.div(2)
			]);
		});
})