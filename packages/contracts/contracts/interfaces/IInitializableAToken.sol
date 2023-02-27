// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

import {ILendingPool} from "./ILendingPool.sol";
import {IAaveIncentivesController} from "./IAaveIncentivesController.sol";

/**
 * @title IInitializableAToken
 * @notice Interface for the initialize function on AToken
 * @author Aave
 **/
interface IInitializableAToken {
    /**
     * @dev Emitted when an aToken is initialized
     * @param underlyingAsset The address of the underlying asset
     * @param trancheId The tranche of the underlying asset
     * @param pool The address of the associated lending pool
     * @param aTokenDecimals the decimals of the underlying
     * @param aTokenName the name of the aToken
     * @param aTokenSymbol the symbol of the aToken
     **/
    event Initialized(
        address indexed underlyingAsset,
        uint64 indexed trancheId,
        address indexed pool,
        uint8 aTokenDecimals,
        string aTokenName,
        string aTokenSymbol
    );

    struct InitializeTreasuryVars {
        address lendingPoolConfigurator;
        address addressesProvider;
        address underlyingAsset;
        uint64 trancheId;
    }

    /**
     * @dev Initializes the aToken
     * @param pool The address of the lending pool where this aToken will be used
     * @param vars Stores treasury vars to fix stack too deep
     */
    function initialize(
        ILendingPool pool,
        InitializeTreasuryVars memory vars
    ) external;
}
