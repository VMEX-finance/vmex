pragma solidity >=0.8.0;


interface ICurveAddressProvider {
	function get_registry() external returns (address); 
	
	function get_address(uint256 _id) external returns (address); 
}
