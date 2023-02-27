// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import {UserLiquidationLogic} from "../analytics-utilities/user/UserLiquidationLogic.sol"; 
//actual aave implementations
import {IFlashLoanSimpleReceiver} from "@aave/core-v3/contracts/flashloan/interfaces/IFlashLoanSimpleReceiver.sol"; 
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol"; 
//vmex lending pool
import {ILendingPool} from "../interfaces/ILendingPool.sol"; 
import {ILendingPoolAddressesProvider} from "../interfaces/ILendingPoolAddressesProvider.sol";
import {IERC20} from "../dependencies/openzeppelin/contracts/IERC20.sol"; 
import {IPool} from '@aave/core-v3/contracts/interfaces/IPool.sol';

library FlashLoanLiquidation  { 
	IPoolAddressesProvider internal constant aaveAddressesProvider = 
		IPoolAddressesProvider(0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e); 

	//checkUpkeep --> performUpkeep --> flashloanCall --> executeOperation 
	function _executeOperation(
		// ILendingPool lendingPool, //this would just be address(this)
		IPool POOL,
    	address asset,
    	uint256 amount,
    	uint256 premium,
    	address initiator,
    	bytes calldata params
	) internal returns (bool){
	
	
	//TODO check if borrowed asset is what we need, do swaps as necessary

	FlashLoanData memory decodedParams = abi.decode(params, (FlashLoanData)); 

	//vmex liquidation			
	ILendingPool(address(this)).liquidationCall(
		decodedParams.collateralAsset,
		decodedParams.debtAsset,
		decodedParams.trancheId,
		decodedParams.user,
		decodedParams.debtAmount,
		false //no vToken
	); 

	uint amountOwing = amount + premium; 
    IERC20(asset).approve(address(POOL), amountOwing);


	return true; 
  }

	struct FlashLoanData {
		address collateralAsset;  
		address debtAsset;
		uint64 trancheId; 
		address user;
		uint256 debtAmount; 		
	}
	
	//
	function flashLoanCall(
		IPool POOL,
		address collateralAsset, 
		address debtAsset,
		uint64 trancheId, 
		address user, 
		uint256 amountDebt
	) internal {

		bytes memory params = abi.encode(FlashLoanData({
			collateralAsset: collateralAsset,
			debtAsset: debtAsset,
			trancheId: trancheId,
			user: user,
			debtAmount: amountDebt})
		); 

		POOL.flashLoanSimple(
			address(this), //receiver. In delegateCall setting (inlcuding libraries), this would be the lendingpool.
			debtAsset, //we pay down debt so we need the flashloan in the debt asset? 
			amountDebt, 
			params, 
			0 //referral code
		); 
  }


	function _liquidate() internal {
		//unused for now but can move liquidation logic here if needed
	}
		
}
