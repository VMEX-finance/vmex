// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {ILendingPool} from "../../interfaces/ILendingPool.sol";
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";

struct UserData {
    uint256 totalCollateralETH;
    uint256 totalDebtETH;
    uint256 availableBorrowsETH;
    uint256 currentLiquidationThreshold;
    uint256 ltv;
    uint256 healthFactor;
}

contract getUserTrancheData {
    constructor(address user, address poolProvider) {
        ILendingPoolAddressesProvider provider = ILendingPoolAddressesProvider(
            poolProvider
        );
        ILendingPool lendingPool = ILendingPool(provider.getLendingPool());
        UserData[3] memory returnData;
        for (uint8 i; i < 3; i++) {
            (
                uint256 totalCollateralETH,
                uint256 totalDebtETH,
                uint256 availableBorrowsETH,
                uint256 currentLiquidationThreshold,
                uint256 ltv,
                uint256 healthFactor
            ) = lendingPool.getUserAccountData(user, i);

            returnData[i] = UserData(
                totalCollateralETH,
                totalDebtETH,
                availableBorrowsETH,
                currentLiquidationThreshold,
                ltv,
                healthFactor
            );
        }

        bytes memory data = abi.encode(returnData);
        assembly {
            return(add(0x20, data), mload(data))
        }
    }

    function getType() public view returns (UserData[3] memory) {}
}
