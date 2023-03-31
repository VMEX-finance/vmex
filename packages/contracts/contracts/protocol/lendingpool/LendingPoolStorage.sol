// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

import {UserConfiguration} from "../libraries/configuration/UserConfiguration.sol";
import {ReserveConfiguration} from "../libraries/configuration/ReserveConfiguration.sol";
import {ReserveLogic} from "../libraries/logic/ReserveLogic.sol";
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {DataTypes} from "../libraries/types/DataTypes.sol";
import {IAssetMappings} from "../../interfaces/IAssetMappings.sol";

contract LendingPoolStorage {
    using ReserveLogic for DataTypes.ReserveData;
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
    using UserConfiguration for DataTypes.UserConfigurationMap;

    ILendingPoolAddressesProvider internal _addressesProvider;
    IAssetMappings internal _assetMappings;

    // asset address to trancheId number to reserve data
    mapping(address => mapping(uint64 => DataTypes.ReserveData))
        internal _reserves;
    
    mapping(address => mapping(uint64 => DataTypes.UserData))
        internal _usersConfig; //user address to trancheId to user configuration
    mapping(address => mapping(uint64=>bool)) whitelist; //user address to tranche to boolean on whether user is whitelisted
    mapping(address => mapping(uint64=>bool)) blacklist;

    // mapping(address => DataTypes.ReserveAssetType) internal assetDatas;

    // the list of the available reserves, structured as a mapping for gas savings reasons
    mapping(uint64 => mapping(uint256 => address)) internal _reservesList; //trancheId id -> array of available reserves
    mapping(uint64 => uint256) internal _reservesCount; //trancheId id -> number of reserves per that trancheId
    mapping(uint64 => bool) internal _paused; //trancheId -> paused
    mapping(uint64 => bool) public isUsingWhitelist;

    bool internal _everythingPaused; //true if all tranches in the lendingpool is paused

    uint256 constant public _maxNumberOfReserves = 126; //NOTE: changed from 128 to 126 since two bits at the end are used for whitelist and blacklist.

}
