// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {SafeMath} from "../../../dependencies/openzeppelin/contracts/SafeMath.sol";
import {IERC20} from "../../../dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeERC20} from "../../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {IAToken} from "../../../interfaces/IAToken.sol";
import {IStableDebtToken} from "../../../interfaces/IStableDebtToken.sol";
import {IVariableDebtToken} from "../../../interfaces/IVariableDebtToken.sol";
import {IReserveInterestRateStrategy} from "../../../interfaces/IReserveInterestRateStrategy.sol";
import {ReserveConfiguration} from "../configuration/ReserveConfiguration.sol";
import {MathUtils} from "../math/MathUtils.sol";
import {WadRayMath} from "../math/WadRayMath.sol";
import {PercentageMath} from "../math/PercentageMath.sol";
import {Errors} from "../helpers/Errors.sol";
import {DataTypes} from "../types/DataTypes.sol";

import {IBaseStrategy} from "../../../interfaces/IBaseStrategy.sol";
// import "hardhat/console.sol";
/**
 * @title ReserveLogic library
 * @author Aave
 * @notice Implements the logic to update the reserves state
 */
library ReserveLogic {
    using SafeMath for uint256;
    using WadRayMath for uint256;
    using PercentageMath for uint256;
    using SafeERC20 for IERC20;

    /**
     * @dev Emitted when the state of a reserve is updated
     * @param reserve The address of the underlying asset of the reserve
     * @param trancheId The trancheId of the reserve
     * @param liquidityRate The new liquidity rate
     * @param variableBorrowRate The new variable borrow rate
     * @param liquidityIndex The new liquidity index
     * @param variableBorrowIndex The new variable borrow index
     **/
    event ReserveDataUpdated(
        address indexed reserve,
        uint64 indexed trancheId,
        uint256 liquidityRate,
        uint256 variableBorrowRate,
        uint256 liquidityIndex,
        uint256 variableBorrowIndex
    );

    using ReserveLogic for DataTypes.ReserveData;
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;

    /**
     * @dev Returns the ongoing normalized income for the reserve
     * A value of 1e27 means there is no income. As time passes, the income is accrued
     * A value of 2*1e27 means for each unit of asset one unit of income has been accrued
     * @param reserve The reserve object
     * @return the normalized income. expressed in ray
     **/
    function getNormalizedIncome(DataTypes.ReserveData storage reserve)
        internal
        view
        returns (uint256)
    {
        uint40 timestamp = reserve.lastUpdateTimestamp;
        // console.log("getNormalizedIncome liquidity index: ", reserve.liquidityIndex);

        //solium-disable-next-line
        if (timestamp == uint40(block.timestamp) || IAToken(reserve.aTokenAddress).getStrategy() != address(0)) { //if it has a strategy, it just the liquidityIndex
            //if the index was updated in the same block, no need to perform any calculation
            // console.log("Just returning liquidity index: ");
            return reserve.liquidityIndex;
        }
        // console.log("current timestamp: ", block.timestamp);
        // console.log("last update timestamp: ", timestamp);
        // console.log("reserve.currentLiquidityRate: ", reserve.currentLiquidityRate);

        uint256 cumulated = MathUtils
            .calculateLinearInterest(reserve.currentLiquidityRate, timestamp)
            .rayMul(reserve.liquidityIndex);

        return cumulated;
    }

    /**
     * @dev Returns the ongoing normalized variable debt for the reserve
     * A value of 1e27 means there is no debt. As time passes, the income is accrued
     * A value of 2*1e27 means that for each unit of debt, one unit worth of interest has been accumulated
     * @param reserve The reserve object
     * @return The normalized variable debt. expressed in ray
     **/
    function getNormalizedDebt(DataTypes.ReserveData storage reserve)
        internal
        view
        returns (uint256)
    {
        uint40 timestamp = reserve.lastUpdateTimestamp;

        //solium-disable-next-line
        if (timestamp == uint40(block.timestamp)) {
            //if the index was updated in the same block, no need to perform any calculation
            return reserve.variableBorrowIndex;
        }

        uint256 cumulated = MathUtils
            .calculateCompoundedInterest(
                reserve.currentVariableBorrowRate,
                timestamp
            )
            .rayMul(reserve.variableBorrowIndex);

        return cumulated;
    }

    /**
     * @dev Updates the liquidity cumulative index and the variable borrow index.
     * @param reserve the reserve object
     **/
    function updateState(DataTypes.ReserveData storage reserve, uint256 VMEXReserveFactor) internal {
        address strategist = IAToken(reserve.aTokenAddress).getStrategy();
        if (strategist==address(0)) { //no strategist, so keep original method of calculating
            uint256 scaledVariableDebt = IVariableDebtToken(
                reserve.variableDebtTokenAddress
            ).scaledTotalSupply();
            uint256 previousVariableBorrowIndex = reserve.variableBorrowIndex;
            uint256 previousLiquidityIndex = reserve.liquidityIndex;
            uint40 lastUpdatedTimestamp = reserve.lastUpdateTimestamp;

            (uint256 newLiquidityIndex, uint256 newVariableBorrowIndex) = _updateIndexes(
                reserve,
                scaledVariableDebt, //for curve, this will always be zero, but the currentLiquidityRate gets updated with the tends. Don't need to pass in strategist address since currentLiquidityRate gets updated elsewhere
                previousLiquidityIndex,
                previousVariableBorrowIndex,
                lastUpdatedTimestamp
            );
            //no strategist, so keep original method of minting to treasury. For strategies, minting to treasury will be handled during tend()
            _mintToTreasury(
                reserve,
                scaledVariableDebt,
                previousVariableBorrowIndex,
                newLiquidityIndex,
                newVariableBorrowIndex,
                lastUpdatedTimestamp,
                VMEXReserveFactor
            );
        }
        // }
        // else{
        //     //assumptions
        //     //no borrowing in this reserve => Stable and variable rate always 0 so don't need to update
        //     //only need to update liquidity index for user to get interest
        //     uint256 globalVMEXReserveFactor = reserve
        //         .configuration
        //         .getVMEXReserveFactor();

        //     reserve.liquidityIndex = BaseStrategy(strategist).calculateAverageRate().percentMul(
        //         PercentageMath.PERCENTAGE_FACTOR.sub(globalVMEXReserveFactor)
        //     );

        //     // minting to treasury will be handled during tend()

        //     // IAToken(reserve.aTokenAddress).mintToVMEXTreasury(
        //     //     vars.amountToMintVMEX,
        //     //     newLiquidityIndex
        //     // );

        // }
    }

    /**
     * @dev Accumulates a predefined amount of asset to the reserve as a fixed, instantaneous income. Used for example to accumulate
     * the flashloan fee to the reserve, and spread it between all the depositors
     * @param reserve The reserve object
     * @param totalLiquidity The total liquidity available in the reserve
     * @param amount The amount to accomulate
     **/
    function cumulateToLiquidityIndex(
        DataTypes.ReserveData storage reserve,
        uint256 totalLiquidity,
        uint256 amount
    ) internal {
        uint256 amountToLiquidityRatio = amount.wadToRay().rayDiv(
            totalLiquidity.wadToRay()
        );

        uint256 result = amountToLiquidityRatio.add(WadRayMath.ray());

        result = result.rayMul(reserve.liquidityIndex);
        require(
            result <= type(uint128).max,
            Errors.RL_LIQUIDITY_INDEX_OVERFLOW
        );

        reserve.liquidityIndex = uint128(result);
    }

    /**
     * @dev Initializes a reserve
     * @param reserve The reserve object
     * @param aTokenAddress The address of the overlying atoken contract
     **/
    function init(
        DataTypes.ReserveData storage reserve,
        address aTokenAddress,
        address variableDebtTokenAddress,
        address interestRateStrategyAddress,
        uint64 trancheId
    ) external {
        require(
            reserve.aTokenAddress == address(0),
            Errors.RL_RESERVE_ALREADY_INITIALIZED
        );
        {
            reserve.liquidityIndex = uint128(WadRayMath.ray());
            reserve.variableBorrowIndex = uint128(WadRayMath.ray());
            reserve.aTokenAddress = aTokenAddress;
            reserve.variableDebtTokenAddress = variableDebtTokenAddress;
        }
        {
            reserve.interestRateStrategyAddress = interestRateStrategyAddress;
            //TODO: users choose from governance approved set of strategies
            reserve.trancheId = trancheId;
        }
    }

    struct UpdateInterestRatesLocalVars {
        uint256 availableLiquidity;
        uint256 newLiquidityRate;
        uint256 newVariableRate;
        uint256 totalVariableDebt;
    }

    /**
     * @dev Updates the reserve current variable borrow rate and the current liquidity rate
     * @param reserve The address of the reserve to be updated
     * @param liquidityAdded The amount of liquidity added to the protocol (deposit or repay) in the previous action
     * @param liquidityTaken The amount of liquidity taken from the protocol (redeem or borrow)
     **/
    function updateInterestRates(
        DataTypes.ReserveData storage reserve,
        address reserveAddress,
        address aTokenAddress,
        uint256 liquidityAdded,
        uint256 liquidityTaken,
        uint256 VMEXReserveFactor
    ) internal {
        if (IAToken(reserve.aTokenAddress).getStrategy() == address(0)) {
            UpdateInterestRatesLocalVars memory vars;

            //calculates the total variable debt locally using the scaled total supply instead
            //of totalSupply(), as it's noticeably cheaper. Also, the index has been
            //updated by the previous updateState() call
            vars.totalVariableDebt = IVariableDebtToken(
                reserve.variableDebtTokenAddress
            ).scaledTotalSupply().rayMul(reserve.variableBorrowIndex);

            DataTypes.calculateInterestRatesVars memory calvars =
                DataTypes.calculateInterestRatesVars(
                        reserveAddress,
                        aTokenAddress,
                        liquidityAdded,
                        liquidityTaken,
                        vars.totalVariableDebt,
                        reserve.configuration.getReserveFactor(),
                        VMEXReserveFactor
                    );
            (
                vars.newLiquidityRate,
                vars.newVariableRate
            ) = IReserveInterestRateStrategy(
                reserve.interestRateStrategyAddress
            ).calculateInterestRates(calvars);

            require(
                vars.newLiquidityRate <= type(uint128).max,
                Errors.RL_LIQUIDITY_RATE_OVERFLOW
            );
            require(
                vars.newVariableRate <= type(uint128).max,
                Errors.RL_VARIABLE_BORROW_RATE_OVERFLOW
            );

            reserve.currentLiquidityRate = uint128(vars.newLiquidityRate);
            reserve.currentVariableBorrowRate = uint128(vars.newVariableRate);

            emit ReserveDataUpdated(
                reserveAddress,
                reserve.trancheId,
                vars.newLiquidityRate,
                vars.newVariableRate,
                reserve.liquidityIndex,
                reserve.variableBorrowIndex
            );
        }
    }


    struct MintToTreasuryLocalVars {
        uint256 currentVariableDebt;
        uint256 previousVariableDebt;
        uint256 totalDebtAccrued;
        uint256 amountToMint;
        uint256 amountToMintVMEX;
        uint256 reserveFactor;
        uint256 globalVMEXReserveFactor;
    }

    /**
     * @dev Mints part of the repaid interest to the reserve treasury as a function of the reserveFactor for the
     * specific asset.
     * @param reserve The reserve reserve to be updated
     * @param scaledVariableDebt The current scaled total variable debt
     * @param previousVariableBorrowIndex The variable borrow index before the last accumulation of the interest
     * @param newLiquidityIndex The new liquidity index
     * @param newVariableBorrowIndex The variable borrow index after the last accumulation of the interest
     **/
    function _mintToTreasury(
        DataTypes.ReserveData storage reserve,
        uint256 scaledVariableDebt,
        uint256 previousVariableBorrowIndex,
        uint256 newLiquidityIndex,
        uint256 newVariableBorrowIndex,
        uint40 timestamp,
        uint256 VMEXReserveFactor
    ) internal {
        MintToTreasuryLocalVars memory vars;
        {
            vars.reserveFactor = reserve.configuration.getReserveFactor();
            vars.globalVMEXReserveFactor = VMEXReserveFactor;
        }

        if (vars.reserveFactor == 0 && vars.globalVMEXReserveFactor == 0) {
            return;
        }

        //calculate the last principal variable debt
        vars.previousVariableDebt = scaledVariableDebt.rayMul(
            previousVariableBorrowIndex
        );

        //calculate the new total supply after accumulation of the index
        vars.currentVariableDebt = scaledVariableDebt.rayMul(
            newVariableBorrowIndex
        );

        //debt accrued is the sum of the current debt minus the sum of the debt at the last update
        //note that repay did not have to occur for this to be higher.
        vars.totalDebtAccrued = vars
            .currentVariableDebt
            .sub(vars.previousVariableDebt);

        vars.amountToMint = vars
            .totalDebtAccrued
            // .percentMul(
            //     PercentageMath.PERCENTAGE_FACTOR.sub(vars.globalVMEXReserveFactor)
            // ) //for global VMEX reserve
            .percentMul(vars.reserveFactor); //permissionless pool owners will always get their reserveFactor * debt

        if (vars.amountToMint != 0) {
            IAToken(reserve.aTokenAddress).mintToTreasury(
                vars.amountToMint,
                newLiquidityIndex
            );
        }

        vars.amountToMintVMEX = vars
            .totalDebtAccrued
            .percentMul(
                PercentageMath.PERCENTAGE_FACTOR.sub(vars.reserveFactor)
            )
            .percentMul(
                vars.globalVMEXReserveFactor //for global VMEX reserve
            ); //we will get (1-reserveFactor) * vmexReserveFacotr * debt
        //P = total earned
        //x = reserveFactor
        //y = VMEX reserve factor
        //user gets P*(1-x)*(1-y)
        //pool owner gets P*x
        //VMEX gets P*(1-x)*y
        //total distribution: P * (1-x-y+xy + x + y-xy) = P

        if (vars.amountToMintVMEX != 0) {
            IAToken(reserve.aTokenAddress).mintToVMEXTreasury(
                vars.amountToMintVMEX,
                newLiquidityIndex
            );
        }
    }

    /**
     * @dev Updates the reserve indexes and the timestamp of the update
     * @param reserve The reserve reserve to be updated
     * @param scaledVariableDebt The scaled variable debt
     * @param liquidityIndex The last stored liquidity index
     * @param variableBorrowIndex The last stored variable borrow index
     **/
    function _updateIndexes(
        DataTypes.ReserveData storage reserve,
        uint256 scaledVariableDebt,
        uint256 liquidityIndex,
        uint256 variableBorrowIndex,
        uint40 timestamp
    ) internal returns (uint256, uint256) {
        uint256 currentLiquidityRate = reserve.currentLiquidityRate;

        uint256 newLiquidityIndex = liquidityIndex;
        uint256 newVariableBorrowIndex = variableBorrowIndex;

        //only cumulating if there is any income being produced
        if (currentLiquidityRate > 0) {
            //consider strategies cumulatedLiquidityInterest can be calculated via ppfs approach
            uint256 cumulatedLiquidityInterest = MathUtils
                .calculateLinearInterest(currentLiquidityRate, timestamp); //if currentLiquidityRate is 1% APR, and the time difference between current block and last update was half a year then this function will return 0.5% + 100%
            newLiquidityIndex = cumulatedLiquidityInterest.rayMul(
                liquidityIndex
            ); //now this will calculate the true interest earned on the previous balance (liquidityIndex), 1.005 * liquidityIndex = new liquidityIndex. liquidityIndex will always increase regardless of borrows and withdraws
            //note if x is original liquidity index, and you deposit 100, your scaled aToken balance is 100/x. Then, you wait a year at 1 % interest rate, so this newLiquidityIndex will be 1.01 * x, so your balance is 100/x * x *1.01 = 101 as expected
            require(
                newLiquidityIndex <= type(uint128).max,
                Errors.RL_LIQUIDITY_INDEX_OVERFLOW
            );

            reserve.liquidityIndex = uint128(newLiquidityIndex);

            //check that there is actual variable debt before accumulating
            if (scaledVariableDebt != 0) {
                uint256 cumulatedVariableBorrowInterest = MathUtils
                    .calculateCompoundedInterest(
                        reserve.currentVariableBorrowRate,
                        timestamp
                    );
                newVariableBorrowIndex = cumulatedVariableBorrowInterest.rayMul(
                        variableBorrowIndex
                    );
                require(
                    newVariableBorrowIndex <= type(uint128).max,
                    Errors.RL_VARIABLE_BORROW_INDEX_OVERFLOW
                );
                reserve.variableBorrowIndex = uint128(newVariableBorrowIndex);
            }
        }

        //solium-disable-next-line
        reserve.lastUpdateTimestamp = uint40(block.timestamp);
        return (newLiquidityIndex, newVariableBorrowIndex);
    }
}
