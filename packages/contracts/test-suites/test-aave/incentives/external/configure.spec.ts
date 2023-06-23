const { expect } = require('chai');

import { makeSuite, TestEnv } from '../../helpers/make-suite';
import { increaseTime, waitForTx } from '../../../../helpers/misc-utils';
import { getBlockTimestamp } from '../../../../helpers/contracts-helpers';
import { CompareRules, eventChecker } from '.././helpers/comparator-engine';
import { BigNumber, ethers } from 'ethers';
import { MAX_UINT_AMOUNT, ZERO_ADDRESS } from '../../../../helpers/constants';
import {harvestAndUpdate} from './helpers';
import { getAToken } from '../../../../helpers/contracts-getters';
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');


makeSuite('ExternalRewardsDistributor configure rewards', (testEnv: TestEnv) => {
  before('Before', async () => {
    const { dai, assetMappings, busd, usdt, weth, addressesProvider, incentivesController } = testEnv; 
    await addressesProvider.setIncentivesController(incentivesController.address);
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
    const { incentivesController, rewardTokens, stakingContracts, dai, usdc, ayvTricrypto2 } = testEnv;

    let assetData = await incentivesController.getStakingContract(ayvTricrypto2.address);
    expect(assetData).equal(ZERO_ADDRESS)

    await incentivesController.beginStakingReward(
      ayvTricrypto2.address, 
      stakingContracts[6].address
    );

    assetData = await incentivesController.getStakingContract(ayvTricrypto2.address);
    expect(assetData).equal(stakingContracts[6].address)
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
    const { incentivesController, rewardTokens, incentUnderlying, stakingContracts, dai, users, ayvTricrypto2, yvTricrypto2, pool } = testEnv;
    

    await expect(incentivesController.beginStakingReward(
      ayvTricrypto2.address, 
      stakingContracts[5].address
    )).to.be.revertedWith("Cannot add staking reward for a token that already has staking");

    await expect(incentivesController.beginStakingReward(
      ayvTricrypto2.address, 
      stakingContracts[0].address
    )).to.be.revertedWith("Cannot add staking reward for a token that already has staking");


    // add some liquidity to the aToken via a deposit. 
    const aToken = ayvTricrypto2
    const asset = yvTricrypto2
    const staking = stakingContracts[6]
    const reward = rewardTokens[0]
    const user = users[0]

    console.log(" users 0 deposit 1000 of the asset (usdc) to aToken (incentivizedTokens[0])");
    await asset.connect(user.signer).mint(100000);
    await asset.connect(user.signer).approve(pool.address, 100000);
    await pool.connect(user.signer).deposit(asset.address, 1, 1000, user.address, 0);

    increaseTime(50000)
    await harvestAndUpdate(testEnv);
    console.log("leaf nodes after user 0 deposits: ",testEnv.leafNodes)

    console.log(" users 1 deposit 1000 of the asset (usdc) to aToken (incentivizedTokens[0])");
    await asset.connect(users[1].signer).mint(100000);
    await asset.connect(users[1].signer).approve(pool.address, 100000);
    await pool.connect(users[1].signer).deposit(asset.address, 1, 1000, users[1].address, 0);


    increaseTime(50000)
    await harvestAndUpdate(testEnv);
    console.log("leaf nodes after user 1 deposits: ",testEnv.leafNodes)

    let assetData = await incentivesController.getStakingContract(aToken.address);
    expect(assetData).equal(stakingContracts[6].address)

    console.log("remove the current staking reward ")
    console.log("aToken).totalSupply()", await aToken.totalSupply())
    console.log("staking.balanceOf(aToken.address)", await staking.balanceOf(incentivesController.address))
    await incentivesController.removeStakingReward(
      aToken.address
    );

    assetData = await incentivesController.getStakingContract(aToken.address);
    expect(assetData).equal(ZERO_ADDRESS)

    console.log("change it to reward 6")
    await incentivesController.beginStakingReward(
      aToken.address, 
      stakingContracts[6].address
    );

    assetData = await incentivesController.getStakingContract(aToken.address);
    expect(assetData).equal(stakingContracts[6].address)
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
    await expect(incentivesController.claim(users[0].address, usdc.address, 0, proof)).to.be.revertedWith("ProofInvalidOrExpired");

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
    const { incentivesController, incentivizedTokens, stakingContracts, incentUnderlying, users, rewardTokens, pool, dai } = testEnv;
    
    const aToken1 = (await pool.getReserveData(dai.address, 0)).aTokenAddress
    const aToken2 = (await pool.getReserveData(dai.address, 1)).aTokenAddress

    const asset = incentUnderlying[0]

    const user = users[6]
    
    console.log("User 6 deposits 2000 in aToken 0")
    await asset.connect(user.signer).mint(10000)
    await asset.connect(user.signer).approve(pool.address, 4000)
    await pool.connect(user.signer).deposit(dai.address, 0, 2000, user.address, 0);
    let assetData = await incentivesController.getStakingContract(aToken1);
    expect(assetData).equal(ZERO_ADDRESS)


    console.log("User 6 deposits 2000 in aToken 1")
    await pool.connect(user.signer).deposit(dai.address, 1, 2000, user.address, 0);


    console.log("aToken 2 begins staking reward with staking contract")
    await incentivesController.beginStakingReward(
      aToken2,
      stakingContracts[0].address
    )

    console.log("aToken 1 begins staking reward with staking contract")
    await incentivesController.beginStakingReward(
      aToken1,
      stakingContracts[0].address
    )
    assetData = await incentivesController.getStakingContract(aToken2);
    expect(assetData).equal(stakingContracts[0].address)

    assetData = await incentivesController.getStakingContract(aToken1);
    expect(assetData).equal(stakingContracts[0].address)

    increaseTime(50000)
    await harvestAndUpdate(testEnv);
  })
  it('Calculate Merkle and claim rewards again', async () => {
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
    await expect(incentivesController.claim(users[0].address, usdc.address, 0, proof)).to.be.revertedWith("ProofInvalidOrExpired");

    console.log("User 0 now claims the correct amount")
    const packedGood = ethers.utils.solidityPack(
      ["address", "address", "uint256"],
      [users[0].address, usdc.address, BigNumber.from(leafNodes[0].amountOwed.toString())]
    );


    const proofGood = merkleTree.getHexProof(keccak256(packedGood));

    await expect(incentivesController.claim(users[0].address, usdc.address, MAX_UINT_AMOUNT, proofGood)).to.be.revertedWith("ProofInvalidOrExpired");
    await incentivesController.claim(users[0].address, usdc.address, BigNumber.from(leafNodes[0].amountOwed.toString()), proofGood)
    console.log("user 0 usdc amount: ", await usdc.balanceOf(users[0].address));

    console.log("User 6 now claims the correct amount")
    const packedGood6 = ethers.utils.solidityPack(
      ["address", "address", "uint256"],
      [users[6].address, usdc.address, BigNumber.from(leafNodes[6].amountOwed.toString())]
    );


    const proofGood6 = merkleTree.getHexProof(keccak256(packedGood6));

    await expect(incentivesController.claim(users[6].address, usdc.address, MAX_UINT_AMOUNT, proofGood6)).to.be.revertedWith("ProofInvalidOrExpired");
    await incentivesController.claim(users[6].address, usdc.address, BigNumber.from(leafNodes[6].amountOwed.toString()), proofGood6)
    console.log("user 6 usdc amount: ", await usdc.balanceOf(users[6].address));
  })
  // it('Try to attack by using external aToken contract', async () => {
  //   const { incentivesController, rewardTokens, incentUnderlying, stakingContracts, dai, usdc, incentivizedTokens } = testEnv;
    
  //   await incentivizedTokens[0].setTranche(0); //try to mimic dai in tranche 0

  //   await incentivesController.handleAction()
  // })
});
