// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {ILendingPool} from "../../interfaces/ILendingPool.sol";
import {DataTypes} from "../../protocol/libraries/types/DataTypes.sol";
import {Constants} from "./Constants.sol";
import {UserBalances, UserAccountData, AggregatedData, TokenReserveData} from "../types/AnalyticsDataTypes.sol";
import {IChainlinkAggregator} from "../../interfaces/IChainlinkAggregator.sol";
import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {IAaveOracle} from "../../misc/interfaces/IAaveOracle.sol";
import {AggregateData, TokenData} from "../types/Tokens.sol";

library AnalyticsUtilities {
    function getSupportedAssetData(address pool)
        internal
        view
        returns (DataTypes.AssetData[] memory)
    {
        address[22] memory tokens = Constants.token();
        DataTypes.AssetData[] memory returnData = new DataTypes.AssetData[](20);
        for (uint8 i; i < tokens.length; i++) {
            DataTypes.AssetData memory data = ILendingPool(pool).getAssetData(
                tokens[i]
            );
            returnData[i] = data;
        }

        return returnData;
    }

    function getTokenReserveData(ILendingPool lendingPool, address token)
        internal
        view
        returns (DataTypes.ReserveData[3] memory)
    {
        DataTypes.ReserveData[3] memory data = [
            lendingPool.getReserveData(token, 0),
            lendingPool.getReserveData(token, 1),
            lendingPool.getReserveData(token, 2)
        ];
        return data;
    }

    function getAggregatedReserveData(ILendingPoolAddressesProvider provider)
        internal
        view
        returns (string[22] memory)
    {}

    function getReserveAssetAddresses(address pool)
        internal
        view
        returns (address[] memory)
    {
        return ILendingPool(pool).getReservesList();
    }

    function getUserTrancheData(address user, address pool)
        internal
        view
        returns (UserAccountData[3] memory)
    {
        UserAccountData[3] memory returnData;
        for (uint8 i = 0; i < 3; i++) {
            (
                uint256 totalCollateralETH,
                uint256 totalDebtETH,
                uint256 availableBorrowsETH,
                uint256 currentLiquidationThreshold,
                uint256 ltv,
                uint256 healthFactor
            ) = ILendingPool(pool).getUserAccountData(user, i);
            returnData[i] = UserAccountData(
                totalCollateralETH,
                totalDebtETH,
                availableBorrowsETH,
                currentLiquidationThreshold,
                ltv,
                healthFactor
            );
        }

        return returnData;
    }

    function getTokenPriceData(address user)
        internal
        view
        returns (UserBalances memory)
    {
        int256[20] memory ethBalance;
        int256[20] memory usdBalance;
        uint256[20] memory userBalance;
        string[20] memory names = Constants.tokenNames();
        address[20] memory tokenMainnet = Constants.token();
        address[20] memory ethPriceOracle = Constants.ETHPriceOracles();
        address[20] memory usdPriceOracle = Constants.USDPriceOracles();
        for (uint256 i = 0; i < ethPriceOracle.length; i++) {
            ethBalance[i] = IChainlinkAggregator(ethPriceOracle[i])
                .latestAnswer();
            usdBalance[i] = IChainlinkAggregator(usdPriceOracle[i])
                .latestAnswer();
            userBalance[i] = IERC20Detailed(tokenMainnet[i]).balanceOf(user);
        }

        return UserBalances(ethBalance, usdBalance, userBalance, names);
    }
}
