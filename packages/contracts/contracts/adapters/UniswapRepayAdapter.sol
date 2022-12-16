// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {BaseUniswapAdapter} from "./BaseUniswapAdapter.sol";
import {ILendingPoolAddressesProvider} from "../interfaces/ILendingPoolAddressesProvider.sol";
import {IUniswapV2Router02} from "../interfaces/IUniswapV2Router02.sol";
import {IERC20} from "../dependencies/openzeppelin/contracts/IERC20.sol";
import {DataTypes} from "../protocol/libraries/types/DataTypes.sol";
import {SafeMath} from "../dependencies/openzeppelin/contracts/SafeMath.sol";

/**
 * @title UniswapRepayAdapter
 * @notice Uniswap V2 Adapter to perform a repay of a debt with collateral.
 * @author Aave
 **/
contract UniswapRepayAdapter is BaseUniswapAdapter {
    using SafeMath for uint256;

    struct RepayParams {
        DataTypes.TrancheAddress collateralAsset;
        uint256 collateralAmount;
        uint256 rateMode;
        PermitSignature permitSignature;
        bool useEthPath;
    }

    constructor(
        ILendingPoolAddressesProvider addressesProvider,
        IUniswapV2Router02 uniswapRouter,
        address wethAddress
    ) BaseUniswapAdapter(addressesProvider, uniswapRouter, wethAddress) {}

    /**
     * @dev Uses the received funds from the flash loan to repay a debt on the protocol on behalf of the user. Then pulls
     * the collateral from the user and swaps it to the debt asset to repay the flash loan.
     * The user should give this contract allowance to pull the ATokens in order to withdraw the underlying asset, swap it
     * and repay the flash loan.
     * Supports only one asset on the flash loan.
     * @param assets Address of debt asset
     * @param amounts Amount of the debt to be repaid
     * @param premiums Fee of the flash loan
     * @param initiator Address of the user
     * @param params Additional variadic field to include extra params. Expected parameters:
     *   address collateralAsset Address of the reserve to be swapped
     *   uint256 collateralAmount Amount of reserve to be swapped
     *   uint256 permitAmount Amount for the permit signature
     *   uint256 deadline Deadline for the permit signature
     *   uint8 v V param for the permit signature
     *   bytes32 r R param for the permit signature
     *   bytes32 s S param for the permit signature
     */
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(
            msg.sender == address(LENDING_POOL),
            "CALLER_MUST_BE_LENDING_POOL"
        );

        RepayParams memory decodedParams = _decodeParams(params);

        //check logic
        _swapAndRepay(
            decodedParams.collateralAsset,
            assets[0],
            amounts[0],
            decodedParams.collateralAmount,
            initiator,
            premiums[0],
            decodedParams.permitSignature,
            decodedParams.useEthPath
        );

        return true;
    }

    /**
   * @dev Swaps the user collateral for the debt asset and then repay the debt on the protocol on behalf of the user
   * without using flash loans. This method can be used when the temporary transfer of the collateral asset to this
   * contract does not affect the user position.
   * The user should give this contract allowance to pull the ATokens in order to withdraw the underlying asset
   * @param collateralAsset Address of asset to be swapped
   * @param debtAsset Address of debt asset
   * @param collateralAmount Amount of the collateral to be swapped
   * @param debtRepayAmount Amount of the debt to be repaid
   * @param permitSignature struct containing the permit signature
   * @param useEthPath 'true' to use path that swaps to Weth, 'false' to directly swap from collateral to debt asset
   */
    function swapAndRepay(
        DataTypes.TrancheAddress calldata collateralAsset,
        DataTypes.TrancheAddress calldata debtAsset,
        uint256 collateralAmount,
        uint256 debtRepayAmount,
        PermitSignature calldata permitSignature,
        bool useEthPath
    ) external {
        DataTypes.ReserveData memory collateralReserveData = _getReserveData(
            collateralAsset.asset,
            collateralAsset.trancheId
        );
        DataTypes.ReserveData memory debtReserveData = _getReserveData(
            debtAsset.asset,
            collateralAsset.trancheId
        );

        address debtToken = debtReserveData.variableDebtTokenAddress;

        uint256 currentDebt = IERC20(debtToken).balanceOf(msg.sender);
        uint256 amountToRepay = debtRepayAmount <= currentDebt
            ? debtRepayAmount
            : currentDebt;

        if (collateralAsset.asset != debtAsset.asset) {
            uint256 maxCollateralToSwap = collateralAmount;
            if (amountToRepay < debtRepayAmount) {
                maxCollateralToSwap = maxCollateralToSwap
                    .mul(amountToRepay)
                    .div(debtRepayAmount);
            }

            // Get exact collateral needed for the swap to avoid leftovers
            uint256[] memory amounts = _getAmountsIn(
                collateralAsset.asset,
                debtAsset.asset,
                amountToRepay,
                useEthPath
            );
            require(amounts[0] <= maxCollateralToSwap, "slippage too high");

            // Pull aTokens from user
            _pullAToken(
                collateralAsset.asset,
                collateralAsset.trancheId,
                collateralReserveData.aTokenAddress,
                msg.sender,
                amounts[0],
                permitSignature
            );

            // Swap collateral for debt asset
            _swapTokensForExactTokens(
                collateralAsset.asset,
                debtAsset.asset,
                amounts[0],
                amountToRepay,
                useEthPath
            );
        } else {
            // Pull aTokens from user
            _pullAToken(
                collateralAsset.asset,
                collateralAsset.trancheId,
                collateralReserveData.aTokenAddress,
                msg.sender,
                amountToRepay,
                permitSignature
            );
        }

        // Repay debt. Approves 0 first to comply with tokens that implement the anti frontrunning approval fix
        IERC20(debtAsset.asset).approve(address(LENDING_POOL), 0);
        IERC20(debtAsset.asset).approve(address(LENDING_POOL), amountToRepay);
        LENDING_POOL.repay(
            debtAsset.asset,
            debtAsset.trancheId,
            amountToRepay,
            msg.sender
        );
    }

    /**
     * @dev Perform the repay of the debt, pulls the initiator collateral and swaps to repay the flash loan
     *
     * @param collateralAsset Address of token to be swapped
     * @param debtAsset Address of debt token to be received from the swap
     * @param amount Amount of the debt to be repaid
     * @param collateralAmount Amount of the reserve to be swapped
     * @param initiator Address of the user
     * @param premium Fee of the flash loan
     * @param permitSignature struct containing the permit signature
     * @param useEthPath 'true' to use path that swaps to Weth, 'false' to directly swap from collateral to debt asset
     */
    function _swapAndRepay(
        DataTypes.TrancheAddress memory collateralAsset,
        address debtAsset,
        uint256 amount,
        uint256 collateralAmount,
        address initiator,
        uint256 premium,
        PermitSignature memory permitSignature,
        bool useEthPath
    ) internal {
        DataTypes.ReserveData memory collateralReserveData = _getReserveData(
            collateralAsset.asset,
            collateralAsset.trancheId
        );

        // Repay debt. Approves for 0 first to comply with tokens that implement the anti frontrunning approval fix.
        IERC20(debtAsset).approve(address(LENDING_POOL), 0);
        IERC20(debtAsset).approve(address(LENDING_POOL), amount);
        uint256 repaidAmount = IERC20(debtAsset).balanceOf(address(this));
        LENDING_POOL.repay(
            debtAsset,
            collateralAsset.trancheId, //debt and collateral trancheId are the same
            amount,
            initiator
        );
        repaidAmount = repaidAmount.sub(
            IERC20(debtAsset).balanceOf(address(this))
        );

        if (collateralAsset.asset != debtAsset) {
            uint256 maxCollateralToSwap = collateralAmount;
            if (repaidAmount < amount) {
                maxCollateralToSwap = maxCollateralToSwap.mul(repaidAmount).div(
                        amount
                    );
            }

            uint256 neededForFlashLoanDebt = repaidAmount.add(premium);
            uint256[] memory amounts = _getAmountsIn(
                collateralAsset.asset,
                debtAsset,
                neededForFlashLoanDebt,
                useEthPath
            );
            require(amounts[0] <= maxCollateralToSwap, "slippage too high");

            // Pull aTokens from user
            _pullAToken(
                collateralAsset.asset,
                collateralAsset.trancheId,
                collateralReserveData.aTokenAddress,
                initiator,
                amounts[0],
                permitSignature
            );

            // Swap collateral asset to the debt asset
            _swapTokensForExactTokens(
                collateralAsset.asset,
                debtAsset,
                amounts[0],
                neededForFlashLoanDebt,
                useEthPath
            );
        } else {
            // Pull aTokens from user
            _pullAToken(
                collateralAsset.asset,
                collateralAsset.trancheId,
                collateralReserveData.aTokenAddress,
                initiator,
                repaidAmount.add(premium),
                permitSignature
            );
        }

        // Repay flashloan. Approves for 0 first to comply with tokens that implement the anti frontrunning approval fix.
        IERC20(debtAsset).approve(address(LENDING_POOL), 0);
        IERC20(debtAsset).approve(address(LENDING_POOL), amount.add(premium));
    }

    /**
     * @dev Decodes debt information encoded in the flash loan params
     * @param params Additional variadic field to include extra params. Expected parameters:
     *   address collateralAsset Address of the reserve to be swapped
     *   uint256 collateralAmount Amount of reserve to be swapped
     *   uint256 rateMode Rate modes of the debt to be repaid
     *   uint256 permitAmount Amount for the permit signature
     *   uint256 deadline Deadline for the permit signature
     *   uint8 v V param for the permit signature
     *   bytes32 r R param for the permit signature
     *   bytes32 s S param for the permit signature
     *   bool useEthPath use WETH path route
     * @return RepayParams struct containing decoded params
     */
    function _decodeParams(bytes memory params)
        internal
        pure
        returns (RepayParams memory)
    {
        (
            address collateralAsset,
            uint64 collateralTranche,
            uint256 collateralAmount,
            uint256 rateMode,           // TODO: Figure out where this is called and remove this param
            uint256 permitAmount,
            uint256 deadline,
            uint8 v,
            bytes32 r,
            bytes32 s,
            bool useEthPath
        ) = abi.decode(
                params,
                (
                    address,
                    uint64,
                    uint256,
                    uint256,
                    uint256,
                    uint256,
                    uint8,
                    bytes32,
                    bytes32,
                    bool
                )
            );
        return
            RepayParams(
                DataTypes.TrancheAddress(collateralTranche, collateralAsset),
                collateralAmount,
                rateMode,
                PermitSignature(permitAmount, deadline, v, r, s),
                useEthPath
            );
    }
}
