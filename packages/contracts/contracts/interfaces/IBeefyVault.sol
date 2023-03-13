pragma solidity >=0.8.0; 


interface IBeefyVault {

	function balance() external view returns (uint256); 
	function getPricePerFullShare() external view returns(uint256); 
	
	function deposit(uint256 amount) external; 

}
