pragma solidity >=0.8.0; 


interface IBeefyVault {

	function balance() external view returns (uint256); 
	function getPricePerFullShare() external view returns(uint256); 
	function totalSupply() external view returns (uint256); 
	function strategy() external view returns (address); 
	function withdraw(uint256 amount) external; 

	function balanceOf(address token) external view returns (uint256); 
	
	function deposit(uint256 amount) external; 
}

interface IFeeConfig {
    struct FeeCategory {
        uint256 total;
        uint256 beefy;
        uint256 call;
        uint256 strategist;
        string label;
        bool active;
    }
    struct AllFees {
        FeeCategory performance;
        uint256 deposit;
        uint256 withdraw;
    }
    function getFees(address strategy) external view returns (FeeCategory memory);
    function stratFeeId(address strategy) external view returns (uint256);
    function setStratFeeId(uint256 feeId) external;
}

interface IBeefyStrategy {
	function getAllFees() external view returns (IFeeConfig.AllFees memory); 

}

