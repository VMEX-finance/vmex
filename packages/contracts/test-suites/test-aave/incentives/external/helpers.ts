import { BigNumber, ethers } from 'ethers';
import { ZERO_ADDRESS } from '../../../../helpers/constants';
import { tEthereumAddress } from '../../../../helpers/types';
import { TestEnv } from '../../helpers/make-suite';

const stakingAbi = require("../../../../artifacts/contracts/mocks/StakingRewardsMock.sol/StakingRewardsMock.json")

export async function harvestAndUpdate(testEnv: TestEnv) {
	const { incentivesController, incentivizedTokens, stakingContracts, incentUnderlying, users, rewardTokens, usdc, leafNodes } = testEnv;
    const stakingContractsSet = new Set<string>();
	for(let i =0; i<incentivizedTokens.length; i++) {
		const aToken = incentivizedTokens[i];
		const stakingAddress = await incentivesController.getStakingContract(aToken.address);
        
		if(stakingAddress == ZERO_ADDRESS || stakingContractsSet.has(stakingAddress)) continue;
        console.log("not skipping index ",i)
        stakingContractsSet.add(stakingAddress);

        const stakingContract = new ethers.Contract(stakingAddress, stakingAbi.abi);
        const amtBefore = await usdc.balanceOf(incentivesController.address);
		await incentivesController.harvestReward(stakingAddress);
        const amtAfter = await usdc.balanceOf(incentivesController.address);
        const earned = Number(amtAfter) - Number(amtBefore);
        console.log("Amount earned: ", earned);
        if(earned==0) continue
        const totalStaked = await stakingContract.connect(users[0].signer).balanceOf(incentivesController.address);
        console.log("totalStaked: ", totalStaked)
        for(let j = 0;j<users.length;j++) {
            const user = users[j];
            const userAmt = await aToken.balanceOf(user.address);
            console.log("user ",j," owns ",userAmt);
            const userOwed = Number(userAmt)* earned / Number(totalStaked)
            console.log("user ",j," is owed ",userOwed);
            leafNodes[j].amountOwed = Number(leafNodes[j].amountOwed) + Number(userOwed)
        }
	}

}