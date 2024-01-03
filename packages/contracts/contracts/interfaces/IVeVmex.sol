// SPDX-License-Identifier: agpl-3.0
import { IERC20 } from "../dependencies/openzeppelin/contracts/IERC20.sol";

interface IVeVmex is IERC20 {
    struct LockedBalance {
        int128 amount;
        uint256 end;
    }

	struct Withdrawn {
		uint256 amount;
		uint256 pentalty; 
	}

    function totalSupply() external view returns (uint256);

    function locked(address _user) external view returns (LockedBalance memory);
	function supply() external view returns (uint256); 
	function token() external view returns (address);

    function modify_lock(
        uint256 _amount,
        uint256 _unlock_time,
        address _user
    ) external;

	function withdraw() external returns (Withdrawn memory); 

	function checkpoint() external;

	function owner() external returns (address); 

	function set_migration_period(bool active) external;  

	function migrate() external; 

	function set_ccs_contract(address newAddress) external;  

	function accept_migration(uint256 amount, uint256 end) external; 

	function setOwner(address addr) external; 
}