import { BigNumber, ethers } from 'ethers';
import { ZERO_ADDRESS } from '../../../../helpers/constants';
import { tEthereumAddress } from '../../../../helpers/types';
import { TestEnv } from '../../helpers/make-suite';

const stakingAbi = require("../../../../artifacts/contracts/mocks/StakingRewardsMock.sol/StakingRewardsMock.json")
const aTokenAbi = require("../../../../artifacts/contracts/protocol/tokenization/AToken.sol/AToken.json")

export async function harvestAndUpdate(testEnv: TestEnv) {
	const { incentivesController, users, usdc, leafNodes, helpersContract, configurator} = testEnv;
    const stakingContractsSet = new Set<string>();
    const totalTranches = await configurator.totalTranches()

	for(let i =0; i<Number(totalTranches); i++) {
        const allTokens = await helpersContract.getAllATokens(i)
        for(let k = 0;k<allTokens.length;k++){
            const aToken = allTokens[k];
            const stakingAddress = await incentivesController.getStakingContract(aToken.tokenAddress);
            
            if(stakingAddress == ZERO_ADDRESS || stakingContractsSet.has(stakingAddress)) continue;
            // console.log("not skipping token ",aToken.symbol)
            stakingContractsSet.add(stakingAddress);

            const stakingContract = new ethers.Contract(stakingAddress, stakingAbi.abi);
            const amtBefore = await usdc.balanceOf(incentivesController.address);
            await incentivesController.harvestReward(stakingAddress, 3, [usdc.address]);
            const amtAfter = await usdc.balanceOf(incentivesController.address);
            const earned = Number(amtAfter) - Number(amtBefore);
            // console.log("Amount earned: ", earned);
            if(earned==0) continue
            const totalStaked = await stakingContract.connect(users[0].signer).balanceOf(incentivesController.address);
            // console.log("totalStaked: ", totalStaked)
            for(let j = 0;j<users.length;j++) {
                const user = users[j];
                const aTokenContract = new ethers.Contract(aToken.tokenAddress, aTokenAbi.abi);
                const userAmt = await aTokenContract.connect(user.signer).balanceOf(user.address);
                // console.log("user ",j," owns ",userAmt);
                const userOwed = Number(userAmt)* earned / Number(totalStaked)
                // console.log("user ",j," is owed ",userOwed);
                leafNodes[j].amountOwed = Number(leafNodes[j].amountOwed) + Number(userOwed)
            }
        }
		
	}

}