// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {ILendingPool} from "./ILendingPool.sol";
import {IAaveIncentivesController} from "./IAaveIncentivesController.sol";
import {ILendingPoolAddressesProvider} from "./ILendingPoolAddressesProvider.sol";

/**
 * @title IInitializableDebtToken
 * @notice Interface for the initialize function common between debt tokens
 * @author Aave
 **/
interface IInitializableDebtToken {
    /**
     * @dev Emitted when a debt token is initialized
     * @param underlyingAsset The address of the underlying asset
     * @param trancheId The tranche of the underlying asset
     * @param pool The address of the associated lending pool
     * @param incentivesController The address of the incentives controller for this aToken
     * @param debtTokenDecimals the decimals of the debt token
     * @param debtTokenName the name of the debt token
     * @param debtTokenSymbol the symbol of the debt token
     **/
    event Initialized(
        address indexed underlyingAsset,
        uint64 indexed trancheId,
        address indexed pool,
        address incentivesController,
        uint8 debtTokenDecimals,
        string debtTokenName,
        string debtTokenSymbol
    );

    /**
     * @dev Initializes the debt token.
     * @param pool The address of the lending pool where this aToken will be used
     * @param underlyingAsset The address of the underlying asset of this aToken (E.g. WETH for aWETH)
     * @param debtTokenDecimals The decimals of the debtToken, same as the underlying asset's
     * @param debtTokenName The name of the token
     * @param debtTokenSymbol The symbol of the token
     */
    function initialize(
        ILendingPool pool,
        address underlyingAsset,
        uint64 trancheId,
        ILendingPoolAddressesProvider addressesProvider,
        uint8 debtTokenDecimals,
        string memory debtTokenName,
        string memory debtTokenSymbol
    ) external;
}
