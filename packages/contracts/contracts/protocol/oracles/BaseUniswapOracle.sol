// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IPriceOracleGetter} from "../../interfaces/IPriceOracleGetter.sol";

contract BaseUniswapOracle is IPriceOracleGetter {
    uint256 public BASE_CURRENCY_DECIMALS;
	/**
     * @dev This is the default fallback oracle at launch (if chainlink fails, tx reverts)
     **/
	function getAssetPrice(address) external pure override returns(uint256) {
        revert("fallback oracle not implemented, if Chainlink fails, then this reverts");
	}
}
