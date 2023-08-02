// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0; 

import "../../dependencies/balancer/BNum.sol"; //already audited import 
import "../../interfaces/IBalancer.sol"; //imports IVault as well
import "../../interfaces/IRateProvider.sol"; 
import "../../interfaces/IPriceOracle.sol";
import {IERC20} from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import "./libs/vMath.sol";
import "../../dependencies/balancer/VaultReentrancyLib.sol";

//This contract orignally comes from alpha homora v2 -- audited by peckshield and quantstamp
//has been modified to suit VMEX's structure, updated to solc 0.8
//has also been updated to balancer v2 pools and structure
//mathematical formula remains the same
library BalancerOracle {

	uint256 internal constant uint211 = (2**211) - 1; 
	
	//weighted == 0
	//metastable/composable == 1 
	//metastable == pools of the same wrapped assets (eth/weth, eth/rweth, etc) (any amount supported)
	//composable == stablecoin pools (any amount supported)
	/// @param bal_pool the underlying balancer pool
	/// @param prices the underlying prices, must be scaled to 1e18
	/// @param type_of_pool the type of pool to calculate the price of
		//weighted == 0
		//metastable/composable == 1 
		//metastable == pools of the same wrapped assets (eth/weth, eth/rweth, etc) (any amount supported)
		//composable == stablecoin pools (any amount supported)
	/// @param legacy. If the pool supports pre-minted BPT or not. If not, legacy should be = true. 

	/// @dev we are only allowing stable balancer pools for now, until a good formula for 
	function get_lp_price(
		address vmexOracle,
		address bal_pool, 
		uint8 type_of_pool,
		bool legacy //if stable, ignore
	) internal returns (uint256 price) {

		//check for reentrancy on bal and beets
		IVault vault = IBalancer(bal_pool).getVault(); 
		VaultReentrancyLib.ensureNotInVaultContext(vault); 

		if (type_of_pool == 1) { //stable
			price = calc_stable_lp_price(
				vmexOracle,
				bal_pool,
				legacy
			); 
		} else {
			revert("Balancer pool not supported");  
		}


		return price; 
			
	}
	
	// https://github.com/Midas-Protocol/contracts/blob/352be0e9ba2795e14d05a5fa4661cb2569655141/contracts/oracles/default/BalancerLpStablePoolPriceOracle.sol
	function calc_stable_lp_price(
		address vmexOracle,
		address bal_pool, 
		bool legacy
	) internal returns (uint256) {	
		IBalancer pool = IBalancer(bal_pool);

        // get the underlying assets
        IVault vault = IBalancer(bal_pool).getVault();
        bytes32 poolId = IBalancer(bal_pool).getPoolId();


        (
            IERC20[] memory tokens,
            ,
        ) = vault.getPoolTokens(poolId);
		
		uint256 bptIndex;
		// if(legacy) {
		// 	bptIndex = type(uint256).max;
		// } else {
		// 	bptIndex = pool.getBptIndex();
		// }
		try pool.getBptIndex() returns (uint ind) {
			bptIndex = ind;
		} catch {
			bptIndex = type(uint256).max;
		}

		uint256 minPrice = type(uint256).max;

		address[] memory rateProviders;
		if(legacy) {
			rateProviders = pool.getRateProviders();
		} 

		for (uint256 i = 0; i < tokens.length; i++) {
			if (i == bptIndex) {
				continue;
			}
			// Get the price of each of the base tokens in ETH
			// This also includes the price of the nested LP tokens, if they are e.g. LinearPools
			// The only requirement is that the nested LP tokens have a price oracle registered
			// See BalancerLpLinearPoolPriceOracle.sol for an example, as well as the relevant tests
			uint256 price = IPriceOracle(vmexOracle).getAssetPrice(address(tokens[i]));
			uint256 depositTokenPrice;
			if(legacy) {
				if(rateProviders[i] == address(0)){
					depositTokenPrice = 1e18;
				} else {
					depositTokenPrice = IRateProvider(rateProviders[i]).getRate();
				}
			} else {
				depositTokenPrice = pool.getTokenRate(address(tokens[i]));
			}
			uint256 finalPrice = (price * 1e18) / depositTokenPrice; //rate always yas 18 decimals, so this preserves original decimals of price
			if (finalPrice < minPrice) {
				minPrice = finalPrice;
			}
		}
		// Multiply the value of each of the base tokens' share in ETH by the rate of the pool
		// pool.getRate() is the rate of the pool, scaled by 1e18
		return (minPrice * pool.getRate()) / 1e18;
	}
	
}
