// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;
import { QueryUserHelpers } from "../libs/QueryUserHelpers.sol";
import { LendingPoolConfigurator } from "../../protocol/lendingpool/LendingPoolConfigurator.sol";
import { ILendingPoolAddressesProvider } from "../../interfaces/ILendingPoolAddressesProvider.sol";

//import "hardhat/console.sol";

contract GetUserSummaryData {

	constructor(
        address providerAddr,
        address user)
    {
        QueryUserHelpers.UserSummaryData memory userSummaryData;
        uint64 totalTranches = LendingPoolConfigurator(
            ILendingPoolAddressesProvider(providerAddr).getLendingPoolConfigurator()
        ).totalTranches();

        for (uint64 i = 0; i < totalTranches; ++i) {
            QueryUserHelpers.UserTrancheData memory userTrancheData =
                QueryUserHelpers.getUserTrancheData(user, i, providerAddr);
            userSummaryData.totalCollateralETH += userTrancheData.totalCollateralETH;
            userSummaryData.totalDebtETH += userTrancheData.totalDebtETH;
            userSummaryData.availableBorrowsETH += userTrancheData.availableBorrowsETH;
            userSummaryData.suppliedAssetData = QueryUserHelpers.concatenateArrays(
                userSummaryData.suppliedAssetData, userTrancheData.suppliedAssetData);
            userSummaryData.borrowedAssetData = QueryUserHelpers.concatenateArrays(
                userSummaryData.borrowedAssetData, userTrancheData.borrowedAssetData);
        }
	    bytes memory returnData = abi.encode(userSummaryData);
		assembly {
			return(add(0x20, returnData), mload(returnData))
		}
	}
	function getType() public view returns(QueryUserHelpers.UserSummaryData memory){}
}
