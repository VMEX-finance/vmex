import { AaveProtocolDataProvider } from "../misc/AaveProtocolDataProvider.sol";
import { LendingPoolConfigurator } from "../protocol/lendingpool/LendingPoolConfigurator.sol";
import { ILendingPool } from "../interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "../interfaces/ILendingPoolAddressesProvider.sol";
import { IERC20 } from "../dependencies/openzeppelin/contracts/IERC20.sol";
import { IAToken } from "../interfaces/IAToken.sol";

import "hardhat/console.sol";

contract GetUserSummaryData {

    struct SuppliedAssetData {
        address asset;
        uint64 tranche;
        uint256 amount;
        bool isCollateral;
    }

    struct BorrowedAssetData {
        address asset;
        uint64 tranche;
        uint256 amount;
        uint256 apy;
    }

    struct UserSummaryData {
        uint256 totalCollateralETH;
        uint256 totalDebtETH;
        uint256 availableBorrowsETH;
        uint256 currentLiquidationThreshold;
        uint256 ltv;
        uint256 healthFactor;
        SuppliedAssetData[] suppliedAssetData;
        BorrowedAssetData[] borrowedAssetData;
    }

    ILendingPool private lendingPool;
    AaveProtocolDataProvider private dataProvider;
    LendingPoolConfigurator private configurator;

	constructor(
        address providerAddr,
        address dataProviderAddr,
        address user,
        bool useAllTranches,
        uint64 tranche)
    {
        UserSummaryData memory userData;
        dataProvider = AaveProtocolDataProvider(dataProviderAddr);
	    lendingPool = ILendingPool(ILendingPoolAddressesProvider(providerAddr).getLendingPool());
	    configurator = LendingPoolConfigurator(ILendingPoolAddressesProvider(providerAddr).getLendingPoolConfigurator());
        uint64 totalTranches = LendingPoolConfigurator(configurator).totalTranches();

        if (useAllTranches) {
            for (uint64 i = 0; i < totalTranches; i++) {
                UserSummaryData memory tempUserData = getUserSummaryDataForTranche(user, tranche);
                userData.totalCollateralETH += tempUserData.totalCollateralETH;
                userData.totalDebtETH += tempUserData.totalDebtETH;
                userData.availableBorrowsETH += tempUserData.availableBorrowsETH;
                // currentLiquidationThreshold, ltv, healthFactor metrics don't make sense
                // for aggregating data across all tranches
                userData.suppliedAssetData = concatenateArrays(userData.suppliedAssetData, tempUserData.suppliedAssetData);
                userData.borrowedAssetData = concatenateArrays(userData.borrowedAssetData, tempUserData.borrowedAssetData);
            }
        } else {
            // use specific tranche
            userData = getUserSummaryDataForTranche(user, tranche);
        }

	    bytes memory returnData = abi.encode(userData);
		assembly {
			return(add(0x20, returnData), mload(returnData))
		}
	}
	function getType() public view returns(UserSummaryData memory){}

    function getUserSummaryDataForTranche(
        address user,
        uint64 tranche)
    private view returns (UserSummaryData memory userData)
    {
        (userData.totalCollateralETH,
            userData.totalDebtETH,
            userData.availableBorrowsETH,
            userData.currentLiquidationThreshold,
            userData.ltv,
            userData.healthFactor) = lendingPool.getUserAccountData(user, tranche, false);

        (userData.suppliedAssetData,
            userData.borrowedAssetData) = getSuppliedAssetData(user, tranche);
    }

    function getSuppliedAssetData(
        address user,
        uint64 tranche)
    private view returns (SuppliedAssetData[] memory s, BorrowedAssetData[] memory b)
    {
        address[] memory allAssets = lendingPool.getReservesList(tranche);
        s = new SuppliedAssetData[](allAssets.length);
        b = new BorrowedAssetData[](allAssets.length);
        uint256 s_idx = 0;
        uint256 b_idx = 0;

        for (uint8 i = 0; i < allAssets.length; i++) {
            (uint256 currentATokenBalance,
                ,
                uint256 currentVariableDebt,
                ,
                ,
                ,
                ,
                ,
                bool usageAsCollateralEnabled) = dataProvider.getUserReserveData(allAssets[i], tranche, user);

            if (currentATokenBalance > 0) {
                // asset is being supplied
                s[s_idx++] = SuppliedAssetData ({
                    asset: allAssets[i],
                    tranche: tranche,
                    amount: currentATokenBalance,
                    isCollateral: usageAsCollateralEnabled
                });
                s_idx++;
            }

            if (currentVariableDebt > 0) {
                b[b_idx++] = BorrowedAssetData ({
                    asset: allAssets[i],
                    tranche: tranche,
                    amount: currentATokenBalance,
                    apy: 0
                });
            }
        }
    }

    function concatenateArrays(
        SuppliedAssetData[] memory arr1,
        SuppliedAssetData[] memory arr2)
    private pure returns(SuppliedAssetData[] memory)
    {
        SuppliedAssetData[] memory returnArr =
            new SuppliedAssetData[](arr1.length + arr2.length);

        uint i = 0;
        for (; i < arr1.length; i++) {
            returnArr[i] = arr1[i];
        }

        uint j=0;
        while (j < arr2.length) {
            returnArr[i++] = arr2[j++];
        }

        return returnArr;
    }
    function concatenateArrays(
        BorrowedAssetData[] memory arr1,
        BorrowedAssetData[] memory arr2)
    private pure returns(BorrowedAssetData[] memory)
    {
        BorrowedAssetData[] memory returnArr =
            new BorrowedAssetData[](arr1.length + arr2.length);

        uint i = 0;
        for (; i < arr1.length; i++) {
            returnArr[i] = arr1[i];
        }

        uint j=0;
        while (j < arr2.length) {
            returnArr[i++] = arr2[j++];
        }

        return returnArr;
    }

}
