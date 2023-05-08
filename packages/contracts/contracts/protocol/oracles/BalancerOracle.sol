// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import '../../dependencies/balancer/BNum.sol'; //already audited
import "../../interfaces/IBalancer.sol"; //imports IVault as well
import "./libs/vMath.sol";
import "../../dependencies/balancer/VaultReentrancyLib.sol";

//This contract orignally comes from alpha homora v2 -- audited by peckshield and quantstamp
//has been modified to suit VMEX's structure, updated to solc 0.8
//has also been updated to balancer v2 pools and structure
//mathematical formula remains the same
library BalancerOracle {

	uint256 internal constant uint211 = (2**211) - 1;

	//@param bal_pool the underlying balancer pool
	//@param prices the underlying prices, must be scaled to 1e18
	//@param type_of_pool the type of pool to calculate the price of
		//weighted == 0 (pairs only supported -- any two tokens that are not the same)
		//metastable/composable == 1
		//metastable == pools of the same wrapped assets (eth/weth, eth/rweth, etc) (any amount supported)
		//composable == stablecoin pools (any amount supported)
	//@param legacy for weighted pools ONLY. If the pool supports pre-minted BPT or not. If not, legacy should be = true.
	function get_lp_price(
		address bal_pool,
		uint256[] memory prices,
		uint8 type_of_pool,
		bool legacy //if stable, ignore
	) internal returns (uint256 price) {
		//check for reentrancy on bal and beets
		IVault vault = IBalancer(bal_pool).getVault();
		VaultReentrancyLib.ensureNotInVaultContext(vault);


		if (type_of_pool == 0) {
			price = calc_balancer_lp_price(
				bal_pool,
				prices[0],
				prices[1],
				legacy
			);
		} else if (type_of_pool == 1) {
			price = calc_stable_lp_price(
				bal_pool,
				prices
			);
		} else {
			revert("Balancer pool not supported");
		}

		return price;
	}
		//calc metastable using getRate(); 	//calc composable stable using getRate();


	/// @dev Return fair reserve amounts given spot reserves, weights, and fair prices.
  	/// @param resA Reserve of the first asset
  	/// @param resB Reserve of the second asset
  	/// @param wA Weight of the first asset
  	/// @param wB Weight of the second asset
  	/// @param pxA Fair price of the first asset
  	/// @param pxB Fair price of the second asset
  	function computeFairReserves(
  	  uint resA,
  	  uint resB,
  	  uint wA,
  	  uint wB,
  	  uint pxA,
  	  uint pxB
  	) internal pure returns (uint fairResA, uint fairResB) {
  	  // NOTE: wA + wB = 1 (normalize weights)
  	  // constant product = resA^wA * resB^wB
  	  // constraints:
  	  // - fairResA^wA * fairResB^wB = constant product
  	  // - fairResA * pxA / wA = fairResB * pxB / wB
  	  // Solving equations:
  	  // --> fairResA^wA * (fairResA * (pxA * wB) / (wA * pxB))^wB = constant product
  	  // --> fairResA / r1^wB = constant product
  	  // --> fairResA = resA^wA * resB^wB * r1^wB
  	  // --> fairResA = resA * (resB/resA)^wB * r1^wB = resA * (r1/r0)^wB
  	  uint r0 = BNum.bdiv(resA, resB);
  	  uint r1 = BNum.bdiv(BNum.bmul(wA, pxB), BNum.bmul(wB, pxA));
  	  // fairResA = resA * (r1 / r0) ^ wB
  	  // fairResB = resB * (r0 / r1) ^ wA
  	  if (r0 > r1) {
  	    uint ratio = BNum.bdiv(r1, r0);
  	    fairResA = BNum.bmul(resA, BNum.bpow(ratio, wB));
  	    fairResB = BNum.bdiv(resB, BNum.bpow(ratio, wA));
  	  } else {
  	    uint ratio = BNum.bdiv(r0, r1);
  	    fairResA = BNum.bdiv(resA, BNum.bpow(ratio, wB));
  	    fairResB = BNum.bmul(resB, BNum.bpow(ratio, wA));
  	  }
  	}

	/// @dev Return the value of the given input as ETH per unit, multiplied by 2**112.
	/// @param bal_pool The address of the balancer pool
	/// @param legacy -- is the pool a legacy weighted pool or the new version
	function calc_balancer_lp_price(
		address bal_pool,
		uint256 pxA,
		uint256 pxB,
		bool legacy
		) internal returns (uint) {
			IBalancer pool = IBalancer(bal_pool);
			bytes32 pool_id = pool.getPoolId();
			IVault balancer_vault = pool.getVault();
			(, uint256[] memory balances, ) =
				balancer_vault.getPoolTokens(pool_id);
			uint256[] memory weights = pool.getNormalizedWeights();
    		require(balances.length == 2, 'num tokens must be 2');
    		(uint fairResA, uint fairResB) =
    		  computeFairReserves(
				balances[0], //bal
				balances[1], //weth
				weights[0], //bal
				weights[1], //weth
    		    pxA,
    		    pxB
    		  );
			uint256 supply;

			if (legacy == true) {
				supply = pool.totalSupply();
			} else {
				supply = pool.getActualSupply();
			}

			//balancer pools with pre-minted BPT will always return type(uint211).max if totalSupply is used
			//this is not, however, the case with old weighted and stable pools
			require(supply != uint211, "incorrect pool type");
    		// use fairReserveA and fairReserveB to compute LP token price
    		// LP price = (fairResA * pxA + fairResB * pxB) / totalLPSupply
    		return ((fairResA * pxA) + (fairResB * pxB)) / supply;
	}

	//assumes that prices are scaled properly, esp for stable assets prior to being passed in here
	function calc_stable_lp_price(
		address bal_pool, 
		uint256[] memory prices
	) internal view returns (uint256) {
		uint256 rate = IBalancer(bal_pool).getRate();

		uint256 min = vMath.min(prices);

		return rate * min / 10**IBalancer(bal_pool).decimals();
	}
}
