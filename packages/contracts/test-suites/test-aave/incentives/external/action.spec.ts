import { fail } from 'assert';
const { expect } = require('chai');
import { makeSuite, TestEnv } from '../../helpers/make-suite';
import { increaseTime, setAutomine, waitForTx } from '../../../../helpers/misc-utils';
import { convertToCurrencyDecimals, getBlockTimestamp } from '../../../../helpers/contracts-helpers';
import { CompareRules, eventChecker } from '.././helpers/comparator-engine';
import {
  AssetData,
  assetDataComparator,
  AssetUpdateData,
  getRewardAssetsData,
} from '.././data-helpers/asset-data';
import hre from 'hardhat';
import { BigNumber, BigNumberish } from 'ethers';
import { ATokenMock, IncentivesController, MintableERC20, StakingRewardsMock } from '../../../../types';
import { SignerWithAddress } from '../../helpers/make-suite'

makeSuite('ExternalRewardsDistributor action hooks', (testEnv) => {
	let ic: IncentivesController;
	let reward: MintableERC20;
	let aTokens: ATokenMock[];
	let staking: StakingRewardsMock[];
	let underlying: MintableERC20[];
	let signers: SignerWithAddress[];

	beforeAll(async () => {
		const { incentivesController, rewardTokens, incentivizedTokens, stakingContracts, incentUnderlying, users } = testEnv;

		ic = incentivesController;
		reward = rewardTokens[0];
		aTokens = incentivizedTokens;
		staking = stakingContracts;
		underlying = incentUnderlying;
		signers = users;

		await ic.batchAddStakingRewards(
			aTokens.map(t => t.address), 
			staking.map(t => t.address), 
			[reward.address, reward.address, reward.address, reward.address, reward.address]);

		for (let token of incentUnderlying) {
			await token.mint(await convertToCurrencyDecimals(token.address, "1000000000000000.0"));
		}
	})

	it('single deposit is staked', async () => {
		const aToken = aTokens[0];
		const asset = underlying[0];
		const amount = 1000;
		const user = signers[1];
		const stake = staking[0];

		await asset.transfer(aToken.address, amount)
		const actionReceipt = await waitForTx(await aToken.handleActionOnAic(user.address, amount, 0, amount, 0));

		const distributorStakeBal = await stake.balanceOf(ic.address)
		const stakedUnderlyingBal = await asset.balanceOf(stake.address)
		expect(distributorStakeBal).equal(amount);
		expect(stakedUnderlyingBal).equal(amount);

		const userData = await ic.getUserDataByAToken(aToken.address, user.address);
		expect(userData.assetBalance).equal(amount);
		expect(userData.rewardBalance).equal(0);
		expect(userData.lastUpdateRewardPerToken).equal(0);

		const emitted = actionReceipt.events || [];
		expect(emitted.length).equal(2);
		eventChecker(emitted[0], "Harvested", [asset.address, 0]);
		eventChecker(emitted[1], "UserUpdated", [
			user.address, 
			aToken.address, 
			asset.address, 
			0
		]);
	});

	it('transfer updates balances and harvests once', async () => {
		increaseTime(50000);

		const aToken = aTokens[0];
		const asset = underlying[0];
		const user = signers[1];
		const receiver = signers[2];
		const transferAmt = 500;

		const senderBalBefore = (await ic.getUserDataByAToken(aToken.address, user.address)).assetBalance;

		setAutomine(false);
		const sendReceipt = await waitForTx(await aToken.handleActionOnAic(user.address, 1000, 1000, 1000 - transferAmt, 2));
		const receiveReceipt = await waitForTx(await aToken.handleActionOnAic(receiver.address, 1000, 0, transferAmt, 2));
		increaseTime(10);
		setAutomine(true);

		const senderData = await ic.getUserDataByAToken(aToken.address, user.address);
		const receiverData = await ic.getUserDataByAToken(aToken.address, receiver.address);
		const rewardData = await ic.getDataByAToken(aToken.address);
		expect(senderData.assetBalance).equal(senderBalBefore.sub(transferAmt));
		expect(receiverData.assetBalance).equal(BigNumber.from(transferAmt));
		expect(senderData.lastUpdateRewardPerToken).gt(0);
		expect(senderData.lastUpdateRewardPerToken).equal(rewardData[3])
		expect(senderData.rewardBalance).equal(senderData.lastUpdateRewardPerToken.mul(senderBalBefore));
		expect(senderData.lastUpdateRewardPerToken).equal(receiverData.lastUpdateRewardPerToken);
		const contractRewardBal = await reward.balanceOf(ic.address);
		const contractAssetBal = await asset.balanceOf(ic.address);
		expect(contractRewardBal).equal(senderData.lastUpdateRewardPerToken.mul(senderBalBefore));
		expect(contractAssetBal).equal(0);

		const sendEmitted = sendReceipt.events || [];
		const receiveEmitted = receiveReceipt.events || [];
		expect(sendEmitted.length).equal(2);
		expect(receiveEmitted.length).equal(1);
		eventChecker(sendEmitted[0], "Harvested", [asset.address, rewardData[3]]);
		eventChecker(sendEmitted[1], "UserUpdated", [
			user.address, 
			aToken.address, 
			asset.address, 
			senderData.rewardBalance
		]);
		eventChecker(receiveEmitted[0], "UserUpdated", [
			receiver.address, 
			aToken.address, 
			asset.address,
			0
		]);
	});

	it('withdraw unstakes, harvests, returns asset', async () => {
		increaseTime(50000);

		const aToken = aTokens[0];
		const asset = underlying[0];
		const user = signers[1];
		const stake = staking[0];

		const userDataBefore = await ic.getUserDataByAToken(aToken.address, user.address)
		const withdrawAmt = userDataBefore.assetBalance;
		const icStakedBefore = await stake.balanceOf(ic.address)
		const icRewardBalBefore = await reward.balanceOf(ic.address);
		const rewardDataBefore = await ic.getDataByAToken(aToken.address);

		await aToken.handleActionOnAic(user.address, 1000, withdrawAmt, 0, 1);

		const aTokenAssetBal = await asset.balanceOf(aToken.address);
		const icStakedAfter = await stake.balanceOf(ic.address);
		const userDataAfter = await ic.getUserDataByAToken(aToken.address, user.address);
		const icRewardBalAfter = await reward.balanceOf(ic.address);
		expect(aTokenAssetBal).equal(withdrawAmt);
		expect(icStakedAfter).equal(icStakedBefore.sub(withdrawAmt));
		expect(userDataAfter.assetBalance).equal(0);
		expect(userDataAfter.rewardBalance).gt(userDataBefore.rewardBalance);
		expect(userDataAfter.lastUpdateRewardPerToken).gt(userDataBefore.lastUpdateRewardPerToken);
		const harvestAmt = icRewardBalAfter.sub(icRewardBalBefore);
		expect(userDataAfter.rewardBalance).equal(
			userDataBefore.rewardBalance.add(harvestAmt.div(2))
		);
		
		increaseTime(1000);
		const userB = signers[2];

		await aToken.handleActionOnAic(userB.address, 500, 500, 0, 1);

		const userBDataAfter = await ic.getUserDataByAToken(aToken.address, userB.address);
		const nextICRewardBal = await reward.balanceOf(ic.address);
		expect(userBDataAfter.rewardBalance).equal(
			(harvestAmt.div(2)).add(nextICRewardBal.sub(icRewardBalAfter))
		);
	});

	it('only harvests or updates a user once per block', async () => {
		const aToken = aTokens[0];
		const asset = underlying[0];
		const amount = 1000;
		const userA = signers[3];
		const userB = signers[4];

		await asset.transfer(aToken.address, amount * 2);
		await aToken.handleActionOnAic(userA.address, amount, 0, amount, 0);
		await aToken.handleActionOnAic(userB.address, amount, 0, amount, 0);

		increaseTime(50000);
		const rewardDataBefore = await ic.getDataByAToken(aToken.address);
		setAutomine(false);
		const userAWithdraw1 = await waitForTx(
			await aToken.handleActionOnAic(userA.address, amount * 2, amount, amount / 2, 1));
		const userAWithdraw2 = await waitForTx(
			await aToken.handleActionOnAic(userA.address, amount * 1.5, amount / 2, 0, 1));
		const userBWithdraw = await waitForTx(
			await aToken.handleActionOnAic(userB.address, amount, amount, 0, 1));
		increaseTime(10);
		setAutomine(true);

		const emitted1 = userAWithdraw1.events || [];
		const emitted2 = userAWithdraw2.events || [];
		const emitted3 = userBWithdraw.events || [];
		expect(emitted1.length).equal(2);
		expect(emitted2.length).equal(0);
		expect(emitted3.length).equal(1);

		const rewardDataAfter = await ic.getDataByAToken(aToken.address);
		const userAData = await ic.getUserDataByAToken(userA.address, aToken.address);
		const userBData = await ic.getUserDataByAToken(userB.address, aToken.address);
		eventChecker(emitted1[0], "Harvested", [
			asset.address, 
			rewardDataAfter[3].sub(rewardDataBefore[3])
		]);
		eventChecker(emitted1[1], "UserUpdated", [
			userA.address, 
			aToken.address, 
			asset.address, 
			userAData.rewardBalance
		]);
		eventChecker(emitted3[0], "UserUpdated", [
			userB.address, 
			aToken.address, 
			asset.address, 
			userBData.rewardBalance
		]);
	})
});
