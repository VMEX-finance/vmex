// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {IPriceOracleGetter} from "../../interfaces/IPriceOracleGetter.sol";

contract BaseUniswapOracle is IPriceOracleGetter {
	//returns the latest price in a WAD fixed number
	function getAssetPrice(address asset) public pure override returns(uint256) {
        revert("fallback oracle not implemented, if Chainlink fails, then this reverts");
	}
}
