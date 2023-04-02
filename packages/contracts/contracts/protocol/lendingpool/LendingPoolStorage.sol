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
    
    mapping(address => mapping(uint64 => DataTypes.UserData))
        internal _usersConfig; //user address to trancheId to user configuration
    
    // asset address to trancheId number to reserve data
    mapping(address => mapping(uint64 => DataTypes.ReserveData))
        internal _reserves;

    // the list of the available reserves, structured as a mapping for gas savings reasons
    mapping(uint64 => mapping(uint256 => address)) internal _reservesList; //trancheId id -> array of available reserves
    mapping(uint64 => DataTypes.TrancheParams) public trancheParams;

    bool internal _everythingPaused; //true if all tranches in the lendingpool is paused
}
