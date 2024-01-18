// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.19;
import {IPriceOracleGetter} from "./IPriceOracleGetter.sol";
import {IChainlinkPriceFeed} from "./IChainlinkPriceFeed.sol";

interface IVMEXOracle is IPriceOracleGetter {
    struct ChainlinkData {
        IChainlinkPriceFeed feed;
        uint64 heartbeat;
    }

	function setBaseCurrency(
        address baseCurrency,
        uint256 baseCurrencyDecimals,
        uint256 baseCurrencyUnit,
        string calldata baseCurrencyString
    ) external;

	function setAssetSources(
        address[] calldata assets,
        ChainlinkData[] calldata sources
    ) external;

	function setFallbackOracle(address fallbackOracle) external;

	function setWETH(
        address weth
    ) external;

	function setRETHOracle(
        address _rETHOracle
    ) external;

	function setSequencerUptimeFeed(uint256 chainId, address sequencerUptimeFeed) external;
}