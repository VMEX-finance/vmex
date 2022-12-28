// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;


interface IAaveOracle {

	/// @notice Gets an asset price by address
    /// @param asset The asset address
    function getAssetPrice(address asset) external view returns (uint256); 

    /// @notice Gets a list of prices from a list of assets addresses
    /// @param assets The list of assets addresses
    function getAssetsPrices(address[] calldata assets) external view returns (uint256[] memory);
	
}
