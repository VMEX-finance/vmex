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
    mapping(address => mapping(uint64 => DataTypes.ReserveData))
        internal _reserves;
    mapping(address => mapping(uint64 => DataTypes.UserConfigurationMap))
        internal _usersConfig; //user address to trancheId to user configuration

    // mapping(address => DataTypes.ReserveAssetType) internal assetDatas;

    // the list of the available reserves, structured as a mapping for gas savings reasons
    mapping(uint64 => mapping(uint256 => address)) internal _reservesList; //trancheId id -> array of available reserves
    mapping(uint64 => uint256) internal _reservesCount; //trancheId id -> number of reserves per that trancheId

    mapping(uint64 => bool) internal _paused; //trancheId -> paused

    uint256 internal _maxStableRateBorrowSizePercent;

    uint256 internal _flashLoanPremiumTotal;

    uint256 internal _maxNumberOfReserves;

    mapping(address => bool) isWhitelistedDepositBorrow;

    mapping(address => mapping(uint64 => uint256)) lastUserBorrow;
    mapping(address => mapping(uint64 => uint256)) lastUserDeposit; //user address to tranche to block number

    bool isUsingWhitelist;
    mapping(uint64 => mapping(address=>bool)) whitelist;
    mapping(uint64 => mapping(address=>bool)) blacklist;
}
