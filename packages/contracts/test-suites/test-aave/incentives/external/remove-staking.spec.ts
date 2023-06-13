import { fail } from 'assert';
const { expect } = require('chai');
import { makeSuite, TestEnv } from '../../helpers/make-suite';
import { increaseTime, waitForTx } from '../../../../helpers/misc-utils';
import { CompareRules, eventChecker } from '../helpers/comparator-engine';
import hre from 'hardhat';
import { BigNumber, BigNumberish } from 'ethers';

makeSuite('ExternalRewardDistributor remove staking', (testEnv) => {
    it('Single depositor, harvests and claims requested amount, then staked contract is removed', async () => {
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

			await expect(incentivesController.addStakingReward(incentivizedTokens[0].address, stakingContracts[0].address, rewardTokens[1].address)).to.be.revertedWith("Cannot reinitialize reward thats been set")
		});
})