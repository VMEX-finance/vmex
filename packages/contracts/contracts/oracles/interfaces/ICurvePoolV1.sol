pragma solidity >=0.8.0; 


interface ICurvePool {

	function get_virtual_price() external view returns(uint256); 
	function coins(uint256 n) external view returns(address); 

}
