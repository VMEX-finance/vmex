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
import {IPriceOracle} from "../../interfaces/IPriceOracle.sol";

library AnalyticsUtilities {
    function getTokenReserveData(
        ILendingPoolAddressesProvider provider,
        uint8 tranche
    ) internal view returns (TokenData[22] memory) {
        address[22] memory tokens = Constants.token();
        string[22] memory names = Constants.tokenNames();
        ILendingPool lendingPool = ILendingPool(provider.getLendingPool());
        TokenData[22] memory returnData;
        for (uint8 i = 0; i < tokens.length; i++) {
            TokenData memory data = TokenData(
                names[i],
                lendingPool.getReserveData(tokens[i], tranche),
                lendingPool.getAssetData(tokens[i])
            );

            returnData[i] = data;
        }

        return returnData;
    }

    function getTokenOraclePrice(address oracle)
        public
        view
        returns (uint256[22] memory)
    {
        address[22] memory tokens = Constants.token();
        uint256[22] memory returnData;
        for (uint8 i; i < tokens.length; i++) {
            returnData[i] = IPriceOracle(oracle).getAssetPrice(tokens[i]);
        }

        return returnData;
    }

    function balanceOf(address user, address token)
        public
        view
        returns (uint256)
    {
        return IERC20Detailed(token).balanceOf(user);
    }

    function getUserWalletBalances(address user)
        internal
        view
        returns (uint256[22] memory)
    {
        address[22] memory reserves = Constants.token();
        uint256[22] memory balances;
        for (uint256 j = 0; j < reserves.length; j++) {
            balances[j] = balanceOf(user, reserves[j]);
        }

        return balances;
    }

    function getBatchNormalizedIncomeDebt(uint8 tranche, address provider)
        internal
        view
        returns (uint256[22] memory, uint256[22] memory)
    {
        address[22] memory reserves = Constants.token();
        uint256[22] memory income;
        uint256[22] memory debt;
        ILendingPool pool = ILendingPool(
            ILendingPoolAddressesProvider(provider).getLendingPool()
        );

        for (uint8 i = 0; i < reserves.length; i++) {
            income[i] = pool.getReserveNormalizedIncome(reserves[i], tranche);
            debt[i] = pool.getReserveNormalizedVariableDebt(
                reserves[i],
                tranche
            );
        }

        return (income, debt);
    }
}
