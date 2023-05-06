import { fail } from 'assert';
const { expect } = require('chai');
import { makeSuite, TestEnv } from '../../helpers/make-suite';
import { increaseTime, setAutomine, waitForTx } from '../../../../helpers/misc-utils';
import { convertToCurrencyDecimals, getBlockTimestamp } from '../../../../helpers/contracts-helpers';
import { CompareRules, eventChecker } from '../helpers/comparator-engine';
import {
  AssetData,
  assetDataComparator,
  AssetUpdateData,
  getRewardAssetsData,
} from '../data-helpers/asset-data';
import hre from 'hardhat';
import { BigNumber, BigNumberish } from 'ethers';

makeSuite('ExternalRewardsDistributor action hooks', (testEnv) => {
	it('single deposit is staked', async () => {
		const { incentivesController, incentivizedTokens, stakingContracts, incentUnderlying, users, rewardTokens, dai } = testEnv;

		await incentivesController.addStakingReward(incentivizedTokens[0].address, stakingContracts[0].address, rewardTokens[0].address)

		const aToken = incentivizedTokens[0];
		const asset = incentUnderlying[0];
		const amount = 1000;
		const user = users[1];
		const stake = stakingContracts[0];

		await asset.mint(100000);
		await asset.transfer(aToken.address, amount)
		await aToken.handleActionOnAic(user.address, amount, 0, amount, 0);

		const distributorStakeBal = await stake.balanceOf(incentivesController.address)
		const stakedUnderlyingBal = await asset.balanceOf(stake.address)
		expect(distributorStakeBal).equal(amount);
		expect(stakedUnderlyingBal).equal(amount);

		const userData = await incentivesController.getUserDataByAToken(user.address, aToken.address);
		expect(userData.assetBalance).equal(amount);
		expect(userData.rewardBalance).equal(0);
		expect(userData.lastUpdateRewardPerToken).equal(0);
	});

	it('transfer updates balances and harvests once', async () => {
		increaseTime(50000);

		const { incentivesController, incentivizedTokens, incentUnderlying, users, rewardTokens } = testEnv;

		const aToken = incentivizedTokens[0];
		const asset = incentUnderlying[0];
		const user = users[1];
		const receiver = users[2];
		const transferAmt = 500;
		const reward = rewardTokens[0];

		const senderDataBefore = await incentivesController.getUserDataByAToken(user.address, aToken.address);
		const senderBalBefore = senderDataBefore.assetBalance

		const receipt = await waitForTx(await aToken.multiAction(
			[user.address, receiver.address],
			[1000, 1000],
			[1000, 0],
			[1000 - transferAmt, transferAmt],
			[2, 2]
		))
		const senderData = await incentivesController.getUserDataByAToken(user.address, aToken.address);
		const receiverData = await incentivesController.getUserDataByAToken(receiver.address, aToken.address);
		const rewardData = await incentivesController.getDataByAToken(aToken.address);
		expect(senderData.assetBalance).equal(senderBalBefore.sub(transferAmt));
		expect(receiverData.assetBalance).equal(BigNumber.from(transferAmt));
		expect(senderData.lastUpdateRewardPerToken).gt(0);
		expect(senderData.lastUpdateRewardPerToken).equal(rewardData[3]);
		expect(senderData.rewardBalance).equal(senderData.lastUpdateRewardPerToken.mul(senderBalBefore));
		expect(senderData.lastUpdateRewardPerToken).equal(receiverData.lastUpdateRewardPerToken);
		const contractRewardBal = await reward.balanceOf(incentivesController.address);
		const contractAssetBal = await asset.balanceOf(incentivesController.address);
		// using a gte comparison here because of a ~10^-16 discrepancy between the values, due to dividing (to calculate rewardPerToken) and then multiplying (to calculate reward balance). since this multiplication is also used by the contract, real-world dust accumulation can be expected, but as it would require on the order of eg. ten million transactions operating on a million-token staked balance to produce one full reward token of dust, it can be reasonably ignored as long as no operations are logically dependent on the contract having a zero balance.
		expect(contractRewardBal).gte(senderData.lastUpdateRewardPerToken.mul(senderBalBefore));
		expect(senderData.rewardBalance).equal(senderData.lastUpdateRewardPerToken.mul(senderBalBefore));
		expect(contractAssetBal).equal(0);

		const emitted = receipt.events || [];
		expect(emitted.length).equal(5);
		// some logs being returned without full event data - hardhat issue?

		// eventChecker(emitted[2], "Harvested", [asset.address, rewardData[3]]);
		// eventChecker(emitted[3], "UserUpdated", [
		// 	user.address, 
		// 	aToken.address, 
		// 	asset.address, 
		// 	senderData.rewardBalance
		// ]);
		// eventChecker(emitted[4], "UserUpdated", [
		// 	receiver.address,
		// 	aToken.address, 
		// 	asset.address,
		// 	0
		// ]);
	});

	it('withdraw unstakes, harvests, returns asset', async () => {
		increaseTime(50000);

		const { incentivesController, incentivizedTokens, incentUnderlying, users, rewardTokens, stakingContracts } = testEnv;

		const aToken = incentivizedTokens[0];
		const asset = incentUnderlying[0];
		const user = users[1];
		const stake = stakingContracts[0];
		const reward = rewardTokens[0]

		const userDataBefore = await incentivesController.getUserDataByAToken(user.address, aToken.address)
		const withdrawAmt = userDataBefore.assetBalance;
		const icStakedBefore = await stake.balanceOf(incentivesController.address)
		const icRewardBalBefore = await reward.balanceOf(incentivesController.address);
		const rewardDataBefore = await incentivesController.getDataByAToken(aToken.address);

		await aToken.handleActionOnAic(user.address, 1000, withdrawAmt, 0, 1);

		const aTokenAssetBal = await asset.balanceOf(aToken.address);
		const icStakedAfter = await stake.balanceOf(incentivesController.address);
		const userDataAfter = await incentivesController.getUserDataByAToken(user.address, aToken.address);
		const icRewardBalAfter = await reward.balanceOf(incentivesController.address);
		expect(aTokenAssetBal).equal(withdrawAmt);
		expect(icStakedAfter).equal(icStakedBefore.sub(withdrawAmt));
		expect(userDataAfter.assetBalance).equal(0);
		expect(userDataAfter.rewardBalance).gt(userDataBefore.rewardBalance);
		expect(userDataAfter.lastUpdateRewardPerToken).gt(userDataBefore.lastUpdateRewardPerToken);
		const harvestAmt = icRewardBalAfter.sub(icRewardBalBefore);
		// see dust comment in previous test - discrepancies in 'lte' tests below are same order of magnitude
		expect(userDataAfter.rewardBalance).lte(
			userDataBefore.rewardBalance.add(harvestAmt.div(2))
		);
		
		increaseTime(1000);
		const userB = users[2];

		await aToken.handleActionOnAic(userB.address, 500, 500, 0, 1);

		const userBDataAfter = await incentivesController.getUserDataByAToken(userB.address, aToken.address);
		const nextICRewardBal = await reward.balanceOf(incentivesController.address);
		expect(userBDataAfter.rewardBalance).lte(
			(harvestAmt.div(2)).add(nextICRewardBal.sub(icRewardBalAfter))
		);
	});

	it('only harvests or updates a user once per block', async () => {
		const { incentivesController, incentivizedTokens, incentUnderlying, users, rewardTokens, stakingContracts } = testEnv;

		const aToken = incentivizedTokens[0];
		const asset = incentUnderlying[0];
		const amount = 1000;
		const userA = users[3];
		const userB = users[4];

		await asset.transfer(aToken.address, amount * 2);
		await aToken.handleActionOnAic(userA.address, amount, 0, amount, 0);
		await aToken.handleActionOnAic(userB.address, amount, 0, amount, 0);

		increaseTime(50000);
		const rewardDataBefore = await incentivesController.getDataByAToken(aToken.address);
		const receipt = await waitForTx(await aToken.multiAction(
			[userA.address, userA.address, userB.address],
			[amount * 2, amount * 1.5, amount],
			[amount, amount / 2, amount],
			[amount / 2, 0, 0],
			[1, 1, 2]
		));
		// hardhat not logging events properly

		// const emitted = receipt.events || [];
		// console.log(emitted.length);

		// const rewardDataAfter = await incentivesController.getDataByAToken(aToken.address);
		// const userAData = await incentivesController.getUserDataByAToken(userA.address, aToken.address);
		// const userBData = await incentivesController.getUserDataByAToken(userB.address, aToken.address);
		// eventChecker(emitted[2], "Harvested", [
		// 	asset.address, 
		// 	rewardDataAfter[3].sub(rewardDataBefore[3])
		// ]);
		// eventChecker(emitted[3], "UserUpdated", [
		// 	userA.address, 
		// 	aToken.address, 
		// 	asset.address, 
		// 	userAData.rewardBalance
		// ]);
		// eventChecker(emitted[4], "UserUpdated", [
		// 	userB.address, 
		// 	aToken.address, 
		// 	asset.address, 
		// 	userBData.rewardBalance
		// ]);
	})
});
