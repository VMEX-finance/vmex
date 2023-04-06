import { MAX_UINT_AMOUNT, RANDOM_ADDRESSES } from '../../../helpers/constants';

const { expect } = require('chai');

import { makeSuite } from '../helpers/make-suite';
import { BigNumber } from 'ethers';
import { waitForTx, increaseTime } from '../../../helpers/misc-utils';
import { comparatorEngine, eventChecker } from './helpers/comparator-engine';
import { getUserIndex } from './data-helpers/asset-user-data';
import {
  assetDataComparator,
  getRewardAssetsData,
} from './data-helpers/asset-data';
import { getBlockTimestamp } from '../../../helpers/contracts-helpers';
import { getRewards } from './data-helpers/base-math';
import { fail } from 'assert';
import hre from 'hardhat';

type ScenarioAction = {
  caseName: string;
  emissionPerSecond?: string;
  amountToClaim: string;
  to?: string;
  toStake?: boolean;
};

const getRewardsBalanceScenarios: ScenarioAction[] = [
  {
    caseName: 'Accrued rewards are 0, claim 0',
    emissionPerSecond: '0',
    amountToClaim: '0',
  },
  {
    caseName: 'Accrued rewards are 0, claim not 0',
    emissionPerSecond: '0',
    amountToClaim: '100',
  },
  {
    caseName: 'Accrued rewards are not 0',
    emissionPerSecond: '2432424',
    amountToClaim: '10',
  },
  {
    caseName: 'Should allow -1',
    emissionPerSecond: '2432424',
    amountToClaim: MAX_UINT_AMOUNT,
    toStake: false,
  },
  {
    caseName: 'Should withdraw to another user',
    emissionPerSecond: '100',
    amountToClaim: '1034',
    to: RANDOM_ADDRESSES[5],
  },
];

makeSuite('IncentivesController claimRewards tests', (testEnv) => {
  for (const {
    caseName,
    amountToClaim: _amountToClaim,
    to,
    toStake,
    emissionPerSecond,
  } of getRewardsBalanceScenarios) {
    let amountToClaim = _amountToClaim;
    it(caseName, async () => {
      const { incentivesController, rewardTokens, incentivizedTokens } = testEnv;

      const { timestamp } = await hre.ethers.provider.getBlock('latest');
      const timePerTest = 1000;
      const distributionEndTimestamp = timestamp + timePerTest * getRewardsBalanceScenarios.length;
      await increaseTime(timePerTest);

      const userAddress = await incentivesController.signer.getAddress();

      const incentivizedAsset = incentivizedTokens[0];
      const rewardAsset = rewardTokens[0];
      const userATokenBalance = 22 * caseName.length;
      const totalAtokenSupply = 33 * caseName.length;

      await incentivizedAsset.setUserBalanceAndSupply(userATokenBalance, totalAtokenSupply);

      // update emissionPerSecond in advance to not affect user calculations
      if (emissionPerSecond) {
        await incentivesController.configureRewards([
          {
            emissionPerSecond: emissionPerSecond,
            endTimestamp: distributionEndTimestamp,
            incentivizedAsset: incentivizedAsset.address,
            reward: rewardAsset.address,
          },
        ]);
      }

      // await increaseTimeAndMine(100000000000);

      const destinationAddress = to || userAddress;

      const destinationAddressBalanceBefore = await rewardAsset.balanceOf(destinationAddress);

      let unclaimedRewardsBefore = BigNumber.from(0);

      if (emissionPerSecond) {
        unclaimedRewardsBefore = (
          await incentivesController.getPendingRewards([incentivizedAsset.address], userAddress)
        )[1][0];
      }

      const accruedRewardsBefore = await incentivesController.getAccruedRewards(
        userAddress,
        rewardAsset.address
      );

      const userIndexBefore = await getUserIndex(
        incentivesController,
        userAddress,
        incentivizedAsset.address,
        rewardAsset.address
      );
      const assetDataBefore = (
        await getRewardAssetsData(
          incentivesController,
          [incentivizedAsset.address],
          [rewardAsset.address]
        )
      )[0];

      const claimRewardsReceipt = await waitForTx(
        await incentivesController.claimReward(
          [incentivizedAsset.address],
          rewardAsset.address,
          amountToClaim,
          destinationAddress
        )
      );
      const eventsEmitted = claimRewardsReceipt.events || [];
      const actionBlockTimestamp = await getBlockTimestamp(claimRewardsReceipt.blockNumber);

      const userIndexAfter = await getUserIndex(
        incentivesController,
        userAddress,
        incentivizedAsset.address,
        rewardAsset.address
      );
      const assetDataAfter = (
        await getRewardAssetsData(
          incentivesController,
          [incentivizedAsset.address],
          [rewardAsset.address]
        )
      )[0];

      let unclaimedRewardsAfter = BigNumber.from(0);

      if (emissionPerSecond) {
        unclaimedRewardsAfter = (
          await incentivesController.getPendingRewards([incentivizedAsset.address], userAddress)
        )[1][0];
      }

      const destinationAddressBalanceAfter = await rewardAsset.balanceOf(destinationAddress);

      const claimedAmount = destinationAddressBalanceAfter.sub(destinationAddressBalanceBefore);

      const expectedAccruedRewards = getRewards(
        userATokenBalance,
        userIndexAfter,
        userIndexBefore
      ).toString();

      await incentivizedAsset.cleanUserState();

      if (amountToClaim === '0') {
        // state should not change
        expect(userIndexBefore.toString()).to.be.equal(
          userIndexAfter.toString(),
          'userIndexAfter should not change'
        );
        expect(unclaimedRewardsBefore.toString()).to.be.equal(
          unclaimedRewardsAfter.toString(),
          'unclaimedRewards should not change'
        );
        expect(destinationAddressBalanceBefore.toString()).to.be.equal(
          destinationAddressBalanceAfter.toString(),
          'destinationAddressBalance should not change'
        );
        await comparatorEngine(
          ['emissionPerSecond', 'index', 'lastUpdateTimestamp'],
          { incentivizedAsset, totalAtokenSupply },
          assetDataBefore,
          assetDataAfter,
          actionBlockTimestamp,
          {}
        );
        expect(eventsEmitted.length).to.be.equal(0, 'no events should be emitted');
        return;
      }

      // ------- Distribution Manager tests START -----
      await assetDataComparator(
        { underlyingAsset: incentivizedAsset.address, totalStaked: totalAtokenSupply },
        assetDataBefore,
        assetDataAfter,
        actionBlockTimestamp,
        distributionEndTimestamp,
        {}
      );
      expect(userIndexAfter.toString()).to.be.equal(
        assetDataAfter.index.toString(),
        'user index are not correctly updated'
      );
      if (!assetDataAfter.index.eq(assetDataBefore.index)) {
        eventChecker(eventsEmitted[0], 'RewardAccrued', [
          assetDataAfter.incentivizedAsset,
          rewardAsset.address,
          userAddress,
          assetDataAfter.index,
          expectedAccruedRewards,
        ]);
        // eventChecker(eventsEmitted[1], 'UserIndexUpdated', [
        //   userAddress,
        //   assetDataAfter.incentivizedAsset,
        //   assetDataAfter.index,
        // ]);
      }
      // ------- Distribution Manager tests END -----

      let unclaimedRewardsCalc = accruedRewardsBefore.add(expectedAccruedRewards);

      let expectedClaimedAmount: BigNumber;
      if (unclaimedRewardsCalc.lte(amountToClaim)) {
        expectedClaimedAmount = unclaimedRewardsCalc;
        expect(unclaimedRewardsAfter.toString()).to.be.equal(
          '0',
          'unclaimed amount after should go to 0'
        );
      } else {
        expectedClaimedAmount = BigNumber.from(amountToClaim);
        expect(unclaimedRewardsAfter.toString()).to.be.equal(
          unclaimedRewardsCalc.sub(amountToClaim).toString(),
          'unclaimed rewards after are wrong'
        );
      }

      expect(claimedAmount.toString()).to.be.equal(
        expectedClaimedAmount.toString(),
        'claimed amount are wrong'
      );

      if (expectedClaimedAmount.gt(0)) {
        const rewardsClaimedEvent = eventsEmitted.find(({ event }) => event === 'RewardClaimed');
        // Expect event to exist
        expect(rewardsClaimedEvent).to.be.ok;
        if (rewardsClaimedEvent) {
          eventChecker(rewardsClaimedEvent, 'RewardClaimed', [
            userAddress,
            rewardAsset.address,
            destinationAddress,
            expectedClaimedAmount,
          ]);
        } else {
          fail('missing reward event');
        }
      }
    });
  }
});
