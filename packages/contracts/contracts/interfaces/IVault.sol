// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0; 

import {IERC20} from "../dependencies/openzeppelin/contracts/IERC20.sol"; 

interface IAsset {
 //only needed for sol to not complain
}

interface IVault {

    /**
     * @dev Data for `manageUserBalance` operations, which include the possibility for ETH to be sent and received
     without manual WETH wrapping or unwrapping.
     */
    struct UserBalanceOp {
        UserBalanceOpKind kind;
        IAsset asset;
        uint256 amount;
        address sender;
        address payable recipient;
    }

	 enum UserBalanceOpKind { DEPOSIT_INTERNAL, WITHDRAW_INTERNAL, TRANSFER_INTERNAL, TRANSFER_EXTERNAL }

	function getPoolTokens(bytes32 poolId) external returns (IERC20[] memory tokens, uint256[] memory balances, uint256 lastChangeBlock); 
    function manageUserBalance(UserBalanceOp[] memory ops) external payable;

}
