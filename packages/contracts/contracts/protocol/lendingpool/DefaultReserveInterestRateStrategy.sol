// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {SafeMath} from "../../dependencies/openzeppelin/contracts/SafeMath.sol";
import {IReserveInterestRateStrategy} from "../../interfaces/IReserveInterestRateStrategy.sol";
import {IIncentivesController} from "../../interfaces/IIncentivesController.sol";
import {WadRayMath} from "../libraries/math/WadRayMath.sol";
import {PercentageMath} from "../libraries/math/PercentageMath.sol";
import {IAToken} from "../../interfaces/IAToken.sol";
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {IERC20} from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import {DataTypes} from "../libraries/types/DataTypes.sol";


/**
 * @title DefaultReserveInterestRateStrategy contract
 * @notice Implements the calculation of the interest rates depending on the reserve state
 * @dev The model of interest rate is based on 2 slopes, one before the `OPTIMAL_UTILIZATION_RATE`
 * point of utilization and another from that one to 100%
 * - An instance of this same contract, can't be used across different Aave markets, due to the caching
 *   of the LendingPoolAddressesProvider
 * @author Aave and VMEX
 **/
contract DefaultReserveInterestRateStrategy is IReserveInterestRateStrategy {
    using WadRayMath for uint256;
    using SafeMath for uint256;
    using PercentageMath for uint256;

    /**
     * @dev this constant represents the utilization rate at which the pool aims to obtain most competitive borrow rates.
     * Expressed in ray
     **/
    uint256 public immutable OPTIMAL_UTILIZATION_RATE;

    /**
     * @dev This constant represents the excess utilization rate above the optimal. It's always equal to
     * 1-optimal utilization rate. Added as a constant here for gas optimizations.
     * Expressed in ray
     **/

    uint256 public immutable EXCESS_UTILIZATION_RATE;

    ILendingPoolAddressesProvider public immutable addressesProvider;

    // Base variable borrow rate when Utilization rate = 0. Expressed in ray
    uint256 internal immutable _baseVariableBorrowRate;

    // Slope of the variable interest curve when utilization rate > 0 and <= OPTIMAL_UTILIZATION_RATE. Expressed in ray
    uint256 internal immutable _variableRateSlope1;

    // Slope of the variable interest curve when utilization rate > OPTIMAL_UTILIZATION_RATE. Expressed in ray
    uint256 internal immutable _variableRateSlope2;

    constructor(
        ILendingPoolAddressesProvider provider,
        uint256 optimalUtilizationRate,
        uint256 __baseVariableBorrowRate,
        uint256 __variableRateSlope1,
        uint256 __variableRateSlope2
    ) {
        OPTIMAL_UTILIZATION_RATE = optimalUtilizationRate;
        EXCESS_UTILIZATION_RATE = WadRayMath.ray().sub(optimalUtilizationRate);
        addressesProvider = provider;
        _baseVariableBorrowRate = __baseVariableBorrowRate;
        _variableRateSlope1 = __variableRateSlope1;
        _variableRateSlope2 = __variableRateSlope2;
    }

    function variableRateSlope1() external view returns (uint256) {
        return _variableRateSlope1;
    }

    function variableRateSlope2() external view returns (uint256) {
        return _variableRateSlope2;
    }

    function baseVariableBorrowRate() external view override returns (uint256) {
        return _baseVariableBorrowRate;
    }

    function getMaxVariableBorrowRate()
        external
        view
        override
        returns (uint256)
    {
        return
            _baseVariableBorrowRate.add(_variableRateSlope1).add(
                _variableRateSlope2
            );
    }

    /**
     * @dev Calculates the interest rates depending on the reserve's state and configurations
     * @param calvars: reserves The address of the reserve  * liquidityAdded The liquidity added during the operation. liquidityTaken The liquidity taken during the operation reserveFactor The reserve portion of the interest that goes to the treasury of the market
     * @return The liquidity rate and the variable borrow rate
     **/
    function calculateInterestRates(
        DataTypes.calculateInterestRatesVars memory calvars
    )
        external
        view
        override
        returns (
            uint256,
            uint256
        )
    {
        // this value is zero when strategy withdraws from atoken
        uint256 availableLiquidity = IERC20(calvars.reserve).balanceOf(
            calvars.aToken
        );
        availableLiquidity = availableLiquidity.add(IAToken(calvars.aToken).getStakedAmount());

        availableLiquidity = availableLiquidity
            .add(calvars.liquidityAdded)
            .sub(calvars.liquidityTaken);

        CalcInterestRatesLocalVars memory vars;
        vars.totalDebt = calvars.totalVariableDebt;
        vars.currentVariableBorrowRate = 0;
        vars.currentLiquidityRate = 0;
        vars.utilizationRate = vars.totalDebt == 0
            ? 0
            : vars.totalDebt.rayDiv(availableLiquidity.add(vars.totalDebt));


        if (vars.utilizationRate > OPTIMAL_UTILIZATION_RATE) {
            uint256 excessUtilizationRateRatio = vars
                .utilizationRate
                .sub(OPTIMAL_UTILIZATION_RATE)
                .rayDiv(EXCESS_UTILIZATION_RATE);

            vars.currentVariableBorrowRate = _baseVariableBorrowRate
                .add(_variableRateSlope1)
                .add(_variableRateSlope2.rayMul(excessUtilizationRateRatio));
        } else {
            vars.currentVariableBorrowRate = _baseVariableBorrowRate.add(
                vars.utilizationRate.rayMul(_variableRateSlope1).rayDiv(
                    OPTIMAL_UTILIZATION_RATE
                )
            );
        }

        vars.currentLiquidityRate = vars.currentVariableBorrowRate
            .rayMul(vars.utilizationRate) // % return per asset borrowed * amount borrowed = total expected return in pool
            .percentMul(PercentageMath.PERCENTAGE_FACTOR.sub(calvars.reserveFactor)) //this is percentage of pool being borrowed.
                .percentMul(
                    PercentageMath.PERCENTAGE_FACTOR.sub(
                        calvars.globalVMEXReserveFactor
                    ) //global VMEX treasury interest rate
                );

        //borrow interest rate * (1-reserve factor) *(1- global VMEX reserve factor) = deposit interest rate
        //this means borrow interest rate *(1- global VMEX reserve factor) * reserve factor is the interest rate of the pool admin treasury
        //borrow interest rate *(1- reserve factor) * global VMEX reserve factor is the interest rate of the VMEX treasury
        //if this last part wasn't here, once everyone repays and all deposits are withdrawn, there should be zero left in pool. Now, reserveFactor*borrow interest rate*liquidity is left in pool

        return (
            vars.currentLiquidityRate,
            vars.currentVariableBorrowRate
        );
    }

    struct CalcInterestRatesLocalVars {
        uint256 totalDebt;
        uint256 currentVariableBorrowRate;
        uint256 currentLiquidityRate;
        uint256 utilizationRate;
    }
}
