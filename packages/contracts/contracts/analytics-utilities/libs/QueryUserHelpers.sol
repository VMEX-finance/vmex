import { AaveProtocolDataProvider } from "../../misc/AaveProtocolDataProvider.sol";
import { ILendingPool } from "../../interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "../../interfaces/ILendingPoolAddressesProvider.sol";
import { IERC20 } from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import { IAToken } from "../../interfaces/IAToken.sol";
import { DataTypes } from "../../protocol/libraries/types/DataTypes.sol";
import { UserConfiguration } from "../../protocol/libraries/configuration/UserConfiguration.sol";

library QueryUserHelpers {

    using UserConfiguration for DataTypes.UserConfigurationMap;

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
        SuppliedAssetData[] suppliedAssetData;
        BorrowedAssetData[] borrowedAssetData;
        // currentLiquidationThreshold, ltv, healthFactor metrics don't make sense
        // for aggregating data across all tranches
    }

    struct UserTrancheData {
        uint256 totalCollateralETH;
        uint256 totalDebtETH;
        uint256 availableBorrowsETH;
        uint256 currentLiquidationThreshold;
        uint256 ltv;
        uint256 healthFactor;
        SuppliedAssetData[] suppliedAssetData;
        BorrowedAssetData[] borrowedAssetData;
    }

    function getUserTrancheData(
        address user,
        uint64 tranche,
        address addressesProvider)
    internal view returns (UserTrancheData memory userData)
    {
        ILendingPool lendingPool = ILendingPool(
            ILendingPoolAddressesProvider(addressesProvider).getLendingPool());

        (userData.totalCollateralETH,
            userData.totalDebtETH,
            userData.availableBorrowsETH,
            userData.currentLiquidationThreshold,
            userData.ltv,
            userData.healthFactor) = lendingPool.getUserAccountData(user, tranche, false);

        (userData.suppliedAssetData,
            userData.borrowedAssetData) = getUserAssetData(user, tranche, lendingPool);
    }

    struct getUserAssetDataVars {
        uint256 s_idx;
        uint256 b_idx;
        DataTypes.ReserveData reserve;
        uint256 currentATokenBalance;
        uint256 currentVariableDebt;
        DataTypes.UserConfigurationMap userConfig;
        SuppliedAssetData[] tempSuppliedAssetData;
        BorrowedAssetData[] tempBorrowedAssetData;
        address[] allAssets;
    }

    function getUserAssetData(
        address user,
        uint64 tranche,
        ILendingPool lendingPool)
    internal view returns (SuppliedAssetData[] memory s, BorrowedAssetData[] memory b)
    {
        getUserAssetDataVars memory vars;
        vars.allAssets = lendingPool.getReservesList(tranche);
        vars.tempSuppliedAssetData = new SuppliedAssetData[](vars.allAssets.length);
        vars.tempBorrowedAssetData = new BorrowedAssetData[](vars.allAssets.length);
        vars.s_idx = 0;
        vars.b_idx = 0;

        vars.userConfig = lendingPool.getUserConfiguration(user, tranche);

        for (uint8 i = 0; i < vars.allAssets.length; i++) {
            vars.reserve = lendingPool.getReserveData(vars.allAssets[i], tranche);

            vars.currentATokenBalance = IERC20(vars.reserve.aTokenAddress).balanceOf(user);
            vars.currentVariableDebt = IERC20(vars.reserve.variableDebtTokenAddress).balanceOf(user);

            if (vars.currentATokenBalance > 0) {
                // asset is being supplied
                vars.tempSuppliedAssetData[vars.s_idx++] = SuppliedAssetData ({
                    asset: vars.allAssets[i],
                    tranche: tranche,
                    amount: vars.currentATokenBalance,
                    isCollateral: vars.userConfig.isUsingAsCollateral(vars.reserve.id)
                });
            }

            if (vars.currentVariableDebt > 0) {
                vars.tempBorrowedAssetData[vars.b_idx++] = BorrowedAssetData ({
                    asset: vars.allAssets[i],
                    tranche: tranche,
                    amount: vars.currentATokenBalance,
                    apy: vars.reserve.currentVariableBorrowRate
                });
            }
        }

        // return correctly sized arrays
        s = new SuppliedAssetData[](vars.s_idx);
        b = new BorrowedAssetData[](vars.b_idx);
        for (uint8 i = 0; i < vars.s_idx; i++) {
            s[i] = vars.tempSuppliedAssetData[i];
        }
        for (uint8 i = 0; i < vars.b_idx; i++) {
            b[i] = vars.tempBorrowedAssetData[i];
        }
    }

    function concatenateArrays(
        SuppliedAssetData[] memory arr1,
        SuppliedAssetData[] memory arr2)
    internal pure returns(SuppliedAssetData[] memory)
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
    internal pure returns(BorrowedAssetData[] memory)
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