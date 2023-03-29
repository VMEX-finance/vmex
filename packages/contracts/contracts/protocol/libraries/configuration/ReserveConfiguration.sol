// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

import {Errors} from "../helpers/Errors.sol";
import {DataTypes} from "../types/DataTypes.sol";
import {IAssetMappings} from "../../../interfaces/IAssetMappings.sol";

/**
 * @title ReserveConfiguration library
 * @author Aave
 * @notice Implements the bitmap logic to handle the reserve configuration
 */
library ReserveConfiguration {
    uint256 constant ACTIVE_MASK =                0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE; // prettier-ignore
    uint256 constant FROZEN_MASK =                0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD; // prettier-ignore
    uint256 constant BORROWING_MASK =             0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFB; // prettier-ignore
    uint256 constant COLLATERAL_ENABLED_MASK =    0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7; // prettier-ignore
    uint256 constant RESERVE_FACTOR_MASK =        0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000000000000F; // prettier-ignore

    /// @dev For the ACTIVE_MASK, the start bit is 0, hence no bitshifting is needed
    uint256 constant IS_FROZEN_START_BIT_POSITION = 1;
    uint256 constant BORROWING_ENABLED_START_BIT_POSITION = 2;
    uint256 constant COLLATERAL_ENABLED_START_BIT_POSITION = 3;
    uint256 constant RESERVE_FACTOR_START_BIT_POSITION = 4;

    uint256 constant MAX_VALID_RESERVE_FACTOR = 2**64-1; //64 bits

    /**
     * @dev Sets the active state of the reserve
     * @param self The reserve configuration
     * @param active The active state
     **/
    function setActive(
        DataTypes.ReserveConfigurationMap memory self,
        bool active
    ) internal pure {
        self.data =
            (self.data & ACTIVE_MASK) |
            (uint256(active ? 1 : 0));
    }

    /**
     * @dev Gets the active state of the reserve
     * @param self The reserve configuration
     * @return The active state
     **/
    function getActive(DataTypes.ReserveConfigurationMap memory self, address asset, IAssetMappings a)
        internal
        view
        returns (bool)
    {
        return a.getAssetActive(asset) && (self.data & ~ACTIVE_MASK) != 0;
    }

    /**
     * @dev Sets the frozen state of the reserve
     * @param self The reserve configuration
     * @param frozen The frozen state
     **/
    function setFrozen(
        DataTypes.ReserveConfigurationMap memory self,
        bool frozen
    ) internal pure {
        self.data =
            (self.data & FROZEN_MASK) |
            (uint256(frozen ? 1 : 0) << IS_FROZEN_START_BIT_POSITION);
    }

    /**
     * @dev Gets the frozen state of the reserve
     * @param self The reserve configuration
     * @return The frozen state
     **/
    function getFrozen(DataTypes.ReserveConfigurationMap memory self)
        internal
        pure
        returns (bool)
    {
        return (self.data & ~FROZEN_MASK) != 0;
    }

    /**
     * @dev Enables or disables borrowing on the reserve
     * @param self The reserve configuration
     * @param enabled True if the borrowing needs to be enabled, false otherwise
     **/
    function setBorrowingEnabled(
        DataTypes.ReserveConfigurationMap memory self,
        bool enabled
    ) internal pure {
        self.data =
            (self.data & BORROWING_MASK) |
            (uint256(enabled ? 1 : 0) << BORROWING_ENABLED_START_BIT_POSITION);
    }

    /**
     * @dev Gets the borrowing state of the reserve
     * @param self The reserve configuration
     * @return The borrowing state
     **/
    function getBorrowingEnabled(DataTypes.ReserveConfigurationMap memory self, address asset, IAssetMappings a)
        internal
        view
        returns (bool)
    {
        return a.getAssetBorrowable(asset) && (self.data & ~BORROWING_MASK) != 0;
    }

    /**
     * @dev Sets the reserve factor of the reserve
     * @param self The reserve configuration
     * @param reserveFactor The reserve factor
     * @param asset The asset address
     * @param a asset mappings
     **/
    function setReserveFactor(
        DataTypes.ReserveConfigurationMap memory self,
        uint256 reserveFactor, 
        address asset, 
        IAssetMappings a
    ) internal view {
        //make sure user reserve factor does not exceed our reserve factor to prevent tranche admins rugging users
        //also make sure it doesn't exceed the max number of bits allocated
        require(
            reserveFactor <= MAX_VALID_RESERVE_FACTOR &&
            reserveFactor <= a.getVMEXReserveFactor(asset),
            Errors.RC_INVALID_RESERVE_FACTOR
        );

        self.data =
            (self.data & RESERVE_FACTOR_MASK) |
            (reserveFactor << RESERVE_FACTOR_START_BIT_POSITION);
    }

    /**
     * @dev Gets the reserve factor of the reserve
     * @param self The reserve configuration
     * @return The reserve factor
     **/
    function getReserveFactor(DataTypes.ReserveConfigurationMap memory self)
        internal
        pure
        returns (uint256)
    {
        return
            (self.data & ~RESERVE_FACTOR_MASK) >>
            RESERVE_FACTOR_START_BIT_POSITION;
    }
    /**
     * @dev Sets the active state of the reserve
     * @param self The reserve configuration
     * @param active The active state
     **/
    function setCollateralEnabled(
        DataTypes.ReserveConfigurationMap memory self,
        bool active
    ) internal pure {
        self.data =
            (self.data & COLLATERAL_ENABLED_MASK) |
            (uint256(active ? 1 : 0) << COLLATERAL_ENABLED_START_BIT_POSITION);
    }

    /**
     * @dev Gets the active state of the reserve
     * @param self The reserve configuration
     * @return The active state
     **/
    function getCollateralEnabled(DataTypes.ReserveConfigurationMap memory self, address asset, IAssetMappings a)
        internal
        view
        returns (bool)
    {
        //note: only if we allow an asset as collateral, do we give tranche admins to choose to set asset as collateral
        return a.getAssetCollateralizable(asset) && (self.data & ~COLLATERAL_ENABLED_MASK) != 0;

    }

    /**
     * @dev Gets the configuration flags of the reserve
     * @param self The reserve configuration
     * @return The state flags representing active, frozen, borrowing enabled
     **/
    function getFlags(DataTypes.ReserveConfigurationMap memory self, address asset, IAssetMappings a)
        internal
        view
        returns (
            bool,
            bool,
            bool
        )
    {
        uint256 dataLocal = self.data;

        return (
            getActive(self, asset, a),
            (dataLocal & ~FROZEN_MASK) != 0,
            getBorrowingEnabled(self, asset, a)
        );
    }

    /**
     * @dev Gets the configuration flags of the reserve from a memory object
     * @param self The reserve configuration
     * @return The state flags representing active, frozen, borrowing enabled
     **/
    function getFlagsMemory(DataTypes.ReserveConfigurationMap memory self, address asset, IAssetMappings a)
        internal
        view
        returns (
            bool,
            bool,
            bool
        )
    {
        return (
            getActive(self, asset, a),
            (self.data & ~FROZEN_MASK) != 0,
            getBorrowingEnabled(self, asset, a)
        );
    }
}
