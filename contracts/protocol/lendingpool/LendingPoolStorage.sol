// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {UserConfiguration} from "../libraries/configuration/UserConfiguration.sol";
import {ReserveConfiguration} from "../libraries/configuration/ReserveConfiguration.sol";
import {ReserveLogic} from "../libraries/logic/ReserveLogic.sol";
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {DataTypes} from "../libraries/types/DataTypes.sol";

contract LendingPoolStorage {
    using ReserveLogic for DataTypes.ReserveData;
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
    using UserConfiguration for DataTypes.UserConfigurationMap;

    ILendingPoolAddressesProvider internal _addressesProvider;

    // asset address to trancheId number to reserve data
    mapping(address => mapping(uint8 => DataTypes.ReserveData))
        internal _reserves;
    mapping(address => DataTypes.UserConfigurationMap) internal _usersConfig;

    mapping(address => DataTypes.AssetData) internal assetDatas;

    // the list of the available reserves, structured as a mapping for gas savings reasons
    //TODO: change this to be a different list per trancheId
    mapping(uint8 => mapping(uint256 => address)) internal _reservesList; //trancheId id -> array of available reserves
    mapping(uint8 => uint256) internal _reservesCount; //trancheId id -> number of reserves per that trancheId

    bool internal _paused;

    uint256 internal _maxStableRateBorrowSizePercent;

    uint256 internal _flashLoanPremiumTotal;

    uint256 internal _maxNumberOfReserves;

    mapping(uint256 => DataTypes.TrancheMultiplier) internal trancheMultipliers;
}
