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
		uint256 vmexDecimals,
		uint8 type_of_pool,
		bool legacy //if stable, ignore
	) internal returns (uint256 price) {

		//check for reentrancy on bal and beets
		IVault vault = IBalancer(bal_pool).getVault(); 
		VaultReentrancyLib.ensureNotInVaultContext(vault); 

		// if (type_of_pool == 0) { //weighted
		// 	price = calc_weighted_balancer_lp_price(
		// 		vmexOracle,
		// 		bal_pool,
		// 		vmexDecimals,
		// 		legacy
		// 	); 
		// } else 
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
	/*
	/// @dev Return fair reserve amounts given spot reserves, weights, and fair prices.
	/// @param reserves Reserves of the assets
	/// @param weights Weights of the assets
	/// @param prices Fair prices of the assets
	function computeFairReserves(
		uint256[] memory reserves,
		uint256[] memory weights,
		uint256[] memory prices
	) internal pure returns (uint256[] memory fairReserves) {
		// NOTE: wA + ... + wN = 1 (normalize weights)
		// K = resA^wA * resB^wB
		// constraints:
		// - fairResA^wA * .. * fairResN^wN = K
		// - fairResA * pxA / wA = ... =  fairResN * pxN / wN
		// define:
		// - r0_AB = resA / resB ... r0_AN = resA / resN
		// - r1_AB = (Wa / Pa) * (Pb / Wb) ... r1_AN = (Wa / Pa) * (Pn / Wn)

		// Solving equations:
		// --> fairResA^wA * (fairResA * (pxA * wB) / (wA * pxB))^wB * ... * (fairResA * (pxA * wN) / (wA * pxN))^wN = K
		// --> fairResA^(wA + ... + wN) * (r1_AB)^-wB * ... * (r1_AN)^-wN = K
		// --> fairResA = resA^wA * ... * resN^wN * (r1_AB)^wB * ... * (r1_AN)^wN
		// --> fairResA = resA * ((resB * r1_AB ) / resA)^wB * ... * ((resN * r1_AN ) / resA)^wN
		// --> fairResA = resA * (r1_AB / r0_AB)^wB * ... * (r1_AN / r1_AN)^wN

		// Generalising:
		// --> fairResB = (r1_BA / r0_BA)^wA * resB * ... * (r1_BN / r1_BN)^wN
		// ...
		// --> fairResN = (r1_NA / r0_NA)^wA * ... * (r1_N(N-1) / r1_N(N-1))^w(N-1) * resN

		uint256[] memory fairReservesArray = new uint256[](reserves.length);

		for (uint256 i = 0; i < reserves.length; i++) {
			uint256[] memory r0array = new uint256[](reserves.length);
			uint256[] memory r1array = new uint256[](reserves.length);
			for (uint256 j = 0; j < reserves.length; j++) {
				if (i == j) {
					r0array[j] = 1;
					r1array[j] = 1;
				} else {
					r0array[j] = BNum.bdiv(reserves[i], reserves[j]);
					r1array[j] = BNum.bdiv(BNum.bmul(weights[i], prices[j]), BNum.bmul(weights[j], prices[i]));
				}
			}
			uint256 init = reserves[i];
			for (uint256 k = 0; k < r0array.length; k++) {
				uint256 r0 = r0array[k];
				uint256 r1 = r1array[k];

				if (r0 > r1) {
					uint256 ratio = BNum.bdiv(r1, r0);
					init = BNum.bmul(init, BNum.bpow(ratio, weights[k]));
				} else {
					uint256 ratio = BNum.bdiv(r0, r1);
					init = BNum.bmul(init, BNum.bpow(ratio, weights[k]));
				}
			}
			fairReservesArray[i] = init;
		}
		return fairReservesArray;
	}

	/// inspired by https://github.com/Midas-Protocol/contracts/blob/352be0e9ba2795e14d05a5fa4661cb2569655141/contracts/oracles/default/BalancerLpTokenPriceOracleNTokens.sol
	/// @param underlying The address of the balancer pool
	/// @param legacy -- is the pool a legacy weighted pool or the new version
	function calc_weighted_balancer_lp_price(
		address vmexOracle,
		address underlying, 
		uint256 vmexDecimals,
		bool legacy
	) internal returns (uint) {
		IBalancer pool = IBalancer(underlying);
		bytes32 poolId = pool.getPoolId();
		IVault vault = IVault(address(pool.getVault()));
		(IERC20[] memory tokens, uint256[] memory reserves, ) = vault.getPoolTokens(poolId);

		uint256 nTokens = tokens.length;
		uint256[] memory weights = pool.getNormalizedWeights();

		require(nTokens == weights.length, "nTokens != nWeights");

		uint256[] memory prices = new uint256[](nTokens);

		for (uint256 i = 0; i < nTokens; i++) {
			uint256 tokenPrice = IPriceOracle(vmexOracle).getAssetPrice(address(tokens[i]));
			uint256 decimals = IERC20Detailed(address(tokens[i])).decimals();
			if (decimals < 18) {
				reserves[i] = reserves[i] * (10**(18 - decimals));
			} else if (decimals > 18) {
				reserves[i] = reserves[i] / (10**(decimals - 18));
			} else {
				reserves[i] = reserves[i];
			} //scale reserves to 18 decimals
			prices[i] = tokenPrice * 1e18 / 10**vmexDecimals; //scale token price to 18 decimals
		}

		uint256[] memory fairRes = computeFairReserves(reserves, weights, prices);
		// use fairReserveA and fairReserveB to compute LP token price
		// LP price = (fairRes[i] * px[i] + ... +  fairRes[n] * px[n]) / totalLPSupply
		uint256 fairResSum = 0;
		for (uint256 i = 0; i < fairRes.length; i++) {
			 fairResSum = fairResSum + (fairRes[i] * prices[i]);
		}

		
		uint256 supply;  

		if (legacy == true) {
			supply = pool.totalSupply(); 
		} else {
			supply = pool.getActualSupply(); 
		}
		// fairResSum / supply yields 18 decimals, so convert back to decimals of vmex
		return fairResSum * 10**vmexDecimals / supply / 1e18; 
			
	}

	*/
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
