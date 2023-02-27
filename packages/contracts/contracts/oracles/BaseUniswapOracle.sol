// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {IUniswapV3Pool} from "./uniswapv08/v3-core/interfaces/IUniswapV3Pool.sol";
import {OracleLibrary} from "./uniswapv08/v3-periphery/OracleLibrary.sol";
import {IPriceOracleGetter} from "../interfaces/IPriceOracleGetter.sol";
import {Ownable} from "../dependencies/openzeppelin/contracts/Ownable.sol";
import {IERC20Detailed} from "../dependencies/openzeppelin/contracts/IERC20Detailed.sol";

// import "hardhat/console.sol";
contract BaseUniswapOracle is IPriceOracleGetter, Ownable {
	//returns the latest price in a WAD fixed number
	function getAssetPrice(address asset) public pure override returns(uint256) {
        revert("fallback oracle not implemented, if Chainlink fails, then this reverts");
	}
}
