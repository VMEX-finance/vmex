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

    // asset address to tranche number to reserve data
    mapping(address => mapping(uint8 => DataTypes.ReserveData))
        internal _reserves;
    mapping(address => DataTypes.UserConfigurationMap) internal _usersConfig;

    //combine these together into struct
    // {
    //     //asset address to risk level of that asset when it is used as collateral
    // mapping(address => uint8) internal collateralRisk;
    //     //asset address to boolean value representing if that address is lendable, or if it should just be a collateral vault
    //     mapping(address => bool) internal isLendable;

    //     mapping(address => bool) internal isAllowedCollateralInHigherTranches;

    //
    // }

    mapping(address => DataTypes.AssetData) internal assetDatas;

    // the list of the available reserves, structured as a mapping for gas savings reasons
    mapping(uint256 => address) internal _reservesList;
    uint256 internal _reservesCount;

    bool internal _paused;

    uint256 internal _maxStableRateBorrowSizePercent;

    uint256 internal _flashLoanPremiumTotal;

    uint256 internal _maxNumberOfReserves;

    mapping(uint256 => DataTypes.TrancheMultiplier) internal trancheMultipliers;

    //mapping between address of underlying token the strategy snapshot is -> user address and their snapshot for SCVX (accurredEarnings is for amount in cvxCRV vcTokens)
    mapping(address => mapping(address => DataTypes.Snapshot)) snapshots;

    //[underlying token strategy that current snapshot is monitoring rewards for][reward token address]
    mapping(address => mapping(address => uint256)) Scurrent;
}
