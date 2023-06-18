const { expect } = require('chai');

import { makeSuite, TestEnv } from '../../helpers/make-suite';
import { increaseTime, waitForTx } from '../../../../helpers/misc-utils';
import { getBlockTimestamp } from '../../../../helpers/contracts-helpers';
import { CompareRules, eventChecker } from '.././helpers/comparator-engine';
import { BigNumber, ethers } from 'ethers';
import { MAX_UINT_AMOUNT, ZERO_ADDRESS } from '../../../../helpers/constants';
import {harvestAndUpdate} from './helpers';
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');


makeSuite('ExternalRewardsDistributor configure rewards', (testEnv: TestEnv) => {
  before('Before', async () => {
    const { dai, assetMappings, busd, usdt, weth } = testEnv; 
    await assetMappings.setBorrowingEnabled(dai.address, false);
    await assetMappings.setBorrowingEnabled(busd.address, false);
    await assetMappings.setBorrowingEnabled(usdt.address, false);
    await assetMappings.setBorrowingEnabled(weth.address, false);
    testEnv.leafNodes = testEnv.users.map((user) => {
      return {
        userAddress: user.address,
        rewardToken: testEnv.usdc.address,
        amountOwed: Number(0)
      }
    })
  });

  after('After', async () => {
    const { dai, assetMappings, busd, usdt, weth } = testEnv; 
    await assetMappings.setBorrowingEnabled(dai.address, true);
    await assetMappings.setBorrowingEnabled(busd.address, true);
    await assetMappings.setBorrowingEnabled(usdt.address, true);
    await assetMappings.setBorrowingEnabled(weth.address, true);
    testEnv.leafNodes = testEnv.users.map((user) => {
      return {
        userAddress: user.address,
        rewardToken: testEnv.usdc.address,
        amountOwed: Number(0)
      }
    })
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
    const aToken = incentivizedTokens[0]
    const asset = incentUnderlying[0]
    const staking = stakingContracts[0]
    const reward = rewardTokens[0]
    const user = users[0]

    console.log(" users 0 deposit 1000 of the asset (usdc) to aToken (incentivizedTokens[0])");
    await asset.connect(user.signer).mint(100000);
    await asset.connect(user.signer).approve(aToken.address, 1000);
    await aToken.deposit(user.address, 1000);

    increaseTime(50000)
    await harvestAndUpdate(testEnv);
    console.log("leaf nodes after user 0 deposits: ",testEnv.leafNodes)

    console.log(" users 1 deposit 1000 of the asset (usdc) to aToken (incentivizedTokens[0])");
    await asset.connect(users[1].signer).mint(100000);
    await asset.connect(users[1].signer).approve(aToken.address, 1000);
    await aToken.connect(users[1].signer).deposit(users[1].address, 1000);


    increaseTime(50000)
    await harvestAndUpdate(testEnv);
    console.log("leaf nodes after user 1 deposits: ",testEnv.leafNodes)

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
  it('Calculate Merkle and claim rewards', async () => {
    const { incentivesController, incentivizedTokens, usdc, stakingContracts, incentUnderlying, users, rewardTokens, dai, leafNodes } = testEnv;
    const arr = leafNodes.map((i,ix) => {
      const packed = ethers.utils.solidityPack(["address", "address", "uint256"], [ i.userAddress, i.rewardToken, BigNumber.from(i.amountOwed.toString())])
      return keccak256(packed);
    });
    const merkleTree = new MerkleTree(arr, keccak256, { sortPairs: true });
    const rootHash = merkleTree.getRoot();
    await incentivesController.updateRoot(rootHash);
    console.log("updated root")

    console.log("User 0 tries to claim incorrect amount")

    const packed = ethers.utils.solidityPack(
      ["address", "address", "uint256"],
      [users[0].address, usdc.address, MAX_UINT_AMOUNT]
    );
    const proof = merkleTree.getHexProof(keccak256(packed));

    await expect(incentivesController.claim(users[0].address, usdc.address, MAX_UINT_AMOUNT, proof)).to.be.revertedWith("ProofInvalidOrExpired");

    console.log("User 0 now claims the correct amount")
    const packedGood = ethers.utils.solidityPack(
      ["address", "address", "uint256"],
      [users[0].address, usdc.address, BigNumber.from(leafNodes[0].amountOwed.toString())]
    );


    const proofGood = merkleTree.getHexProof(keccak256(packedGood));

    await expect(incentivesController.claim(users[0].address, usdc.address, MAX_UINT_AMOUNT, proofGood)).to.be.revertedWith("ProofInvalidOrExpired");
    await incentivesController.claim(users[0].address, usdc.address, BigNumber.from(leafNodes[0].amountOwed.toString()), proofGood)
    console.log("user 0 usdc amount: ", await usdc.balanceOf(users[0].address));
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
    
    console.log("User 6 deposits 2000 in aToken 0")
    await asset.connect(user.signer).mint(10000)
    await asset.connect(user.signer).approve(aToken1.address, 2000)
    await aToken1.deposit(user.address, 2000);
    let assetData = await incentivesController.getStakingContract(aToken1.address);
    expect(assetData).equal(stakingContracts[5].address)


    console.log("User 6 deposits 2000 in aToken 1")
    await asset.connect(user.signer).approve(aToken2.address, 2000)
    await aToken2.connect(user.signer).deposit(user.address,2000);


    console.log("aToken 1 begins staking reward")
    await incentivesController.beginStakingReward(
      aToken2.address,
      stakingContracts[5].address
    )
    assetData = await incentivesController.getStakingContract(aToken2.address);
    expect(assetData).equal(stakingContracts[5].address)

    // console.log("user 6 withdrawing 1000 from aToken 1");
    // console.log("Atoken 0 owns ",await asset.balanceOf(aToken1.address))
    // console.log("Atoken 1 owns ",await asset.balanceOf(aToken2.address))
    // await aToken2.connect(user.signer).withdraw(user.address, 1000);
    // assetData = await incentivesController.getStakingContract(aToken1.address);
    // expect(assetData).equal(stakingContracts[5].address)

    console.log("aToken 0 removes staking reward");
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
