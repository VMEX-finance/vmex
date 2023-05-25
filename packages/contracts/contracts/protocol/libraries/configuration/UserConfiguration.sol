// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {Errors} from "../helpers/Errors.sol";
import {DataTypes} from "../types/DataTypes.sol";

/**
 * @title UserConfiguration library
 * @author Aave and VMEX
 * @notice Implements the bitmap logic to handle the user configuration
 */
library UserConfiguration {
    uint256 internal constant BORROWING_MASK =      0x5555555555555555555555555555555555555555555555555555555555555555; // prettier-ignore
    uint256 constant WHITELISTED_MASK =             0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF; // prettier-ignore
    uint256 constant BLACKLISTED_MASK =             0xBFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF; // prettier-ignore

    //NOTE: changed from 128 to 126 since two bits at the end are used for whitelist and blacklist.
    uint256 internal constant MAX_RESERVES = 126;

    uint256 constant WHITELISTED_START_BIT_POSITION = 255;
    uint256 constant BLACKLISTED_START_BIT_POSITION = 254;

    /**
     * @dev Sets if the user is borrowing the reserve identified by reserveIndex
     * @param self The configuration object
     * @param reserveIndex The index of the reserve in the bitmap
     * @param borrowing True if the user is borrowing the reserve, false otherwise
     **/
    function setBorrowing(
        DataTypes.UserConfigurationMap storage self,
        uint256 reserveIndex,
        bool borrowing
    ) internal {
        require(reserveIndex < MAX_RESERVES, Errors.UL_INVALID_INDEX);
        self.data =
            (self.data & ~(1 << (reserveIndex * 2))) |
            (uint256(borrowing ? 1 : 0) << (reserveIndex * 2));
    }

    /**
     * @dev Sets if the user is using as collateral the reserve identified by reserveIndex
     * @param self The configuration object
     * @param reserveIndex The index of the reserve in the bitmap
     * @param usingAsCollateral True if the user is usin the reserve as collateral, false otherwise
     **/
    function setUsingAsCollateral(
        DataTypes.UserConfigurationMap storage self,
        uint256 reserveIndex,
        bool usingAsCollateral
    ) internal {
        require(reserveIndex < MAX_RESERVES, Errors.UL_INVALID_INDEX);
        self.data =
            (self.data & ~(1 << (reserveIndex * 2 + 1))) |
            (uint256(usingAsCollateral ? 1 : 0) << (reserveIndex * 2 + 1));
    }

    /**
     * @dev Used to validate if a user has been using the reserve for borrowing or as collateral
     * @param self The configuration object
     * @param reserveIndex The index of the reserve in the bitmap
     * @return True if the user has been using a reserve for borrowing or as collateral, false otherwise
     **/
    function isUsingAsCollateralOrBorrowing(
        DataTypes.UserConfigurationMap memory self,
        uint256 reserveIndex
    ) internal pure returns (bool) {
        require(reserveIndex < MAX_RESERVES, Errors.UL_INVALID_INDEX);
        return (self.data >> (reserveIndex * 2)) & 3 != 0;
    }

    /**
     * @dev Used to validate if a user has been using the reserve for borrowing
     * @param self The configuration object
     * @param reserveIndex The index of the reserve in the bitmap
     * @return True if the user has been using a reserve for borrowing, false otherwise
     **/
    function isBorrowing(
        DataTypes.UserConfigurationMap memory self,
        uint256 reserveIndex
    ) internal pure returns (bool) {
        require(reserveIndex < MAX_RESERVES, Errors.UL_INVALID_INDEX);
        return (self.data >> (reserveIndex * 2)) & 1 != 0;
    }

    /**
     * @dev Used to validate if a user has been using the reserve as collateral
     * @param self The configuration object
     * @param reserveIndex The index of the reserve in the bitmap
     * @return True if the user has been using a reserve as collateral, false otherwise
     **/
    function isUsingAsCollateral(
        DataTypes.UserConfigurationMap memory self,
        uint256 reserveIndex
    ) internal pure returns (bool) {
        require(reserveIndex < MAX_RESERVES, Errors.UL_INVALID_INDEX);
        return (self.data >> (reserveIndex * 2 + 1)) & 1 != 0;
    }

    /**
     * @dev Used to validate if a user has been borrowing from any reserve
     * @param self The configuration object
     * @return True if the user has been borrowing any reserve, false otherwise
     **/
    function isBorrowingAny(DataTypes.UserConfigurationMap memory self)
        internal
        pure
        returns (bool)
    {
        return self.data & BORROWING_MASK != 0;
    }

    /**
     * @dev Used to validate if a user has not been using any reserve
     * @param self The configuration object
     * @return True if the user has been borrowing any reserve, false otherwise
     **/
    function isEmpty(DataTypes.UserConfigurationMap memory self)
        internal
        pure
        returns (bool)
    {
        return self.data == 0;
    }

    /**
     * @dev Sets if user is whitelisted
     * @param self The user configuration
     * @param whitelisted The whitelisted state
     **/
    function setWhitelist(
        DataTypes.UserConfigurationMap storage self,
        bool whitelisted
    ) internal {
        self.data =
            (self.data & WHITELISTED_MASK) |
            (uint256(whitelisted ? 1 : 0) << WHITELISTED_START_BIT_POSITION);
    }

    /**
     * @dev Gets the active state of the reserve
     * @param self The user configuration
     * @return The active state
     **/
    function getWhitelist(DataTypes.UserConfigurationMap memory self)
        internal
        pure
        returns (bool)
    {
        return (self.data & ~WHITELISTED_MASK) != 0;
    }

    /**
     * @dev Sets the blacklisted state of the user
     * @param self The user configuration
     * @param blacklisted The blacklisted state
     **/
    function setBlacklist(
        DataTypes.UserConfigurationMap storage self,
        bool blacklisted
    ) internal {
        self.data =
            (self.data & BLACKLISTED_MASK) |
            (uint256(blacklisted ? 1 : 0) << BLACKLISTED_START_BIT_POSITION);
    }

    /**
     * @dev Gets the blacklisted state of the reserve
     * @param self The user configuration
     * @return The blacklisted state
     **/
    function getBlacklist(DataTypes.UserConfigurationMap memory self)
        internal
        pure
        returns (bool)
    {
        return (self.data & ~BLACKLISTED_MASK) != 0;
    }
}
