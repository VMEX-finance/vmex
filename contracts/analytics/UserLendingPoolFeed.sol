// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {ILendingPool} from "../interfaces/ILendingPool.sol";
import {Constants} from "./libraries/Constants.sol";

contract UserLendingPoolFeed {
    /**
        @dev Returns user account data for a lending pool accross all tranches
        @param user The address of the user
    **/
    constructor(address user, address pool) {
        uint256[6][] memory tranches = new uint256[6][](3);
        for (uint8 i = 0; i < 3; i++) {
            (
                uint256 totalCollateralETH,
                uint256 totalDebtETH,
                uint256 availableBorrowsETH,
                uint256 currentLiquidationThreshold,
                uint256 ltv,
                uint256 healthFactor
            ) = ILendingPool(pool).getUserAccountData(user, i);
            tranches[i] = [
                totalCollateralETH,
                totalDebtETH,
                availableBorrowsETH,
                currentLiquidationThreshold,
                ltv,
                healthFactor
            ];
        }
        bytes memory returnData = abi.encode(tranches);
        assembly {
            return(add(0x20, returnData), mload(returnData))
        }
    }
}
