// SPDX-License-Identifier: agpl-3.0

//IGNORE THIS FILE
// pragma solidity >=0.8.0;

// import {DataTypes} from "../libraries/types/DataTypes.sol";
// import {LendingPoolStorage} from "./LendingPoolStorage.sol";

// import {
//     ILendingPoolAddressesProvider
// } from "../../interfaces/ILendingPoolAddressesProvider.sol";
// import {
//     VersionedInitializable
// } from "../libraries/aave-upgradeability/VersionedInitializable.sol";
// import {Errors} from "../libraries/helpers/Errors.sol";


// contract TrancheGovernance is LendingPoolStorage {
//     ILendingPoolAddressesProvider internal addressesProvider;
//     modifier onlyGovernance() {
//         require(
//             addressesProvider.getEmergencyAdmin() == msg.sender,
//             Errors.LPC_CALLER_NOT_EMERGENCY_ADMIN
//         );
//         _;
//     }

//     function initialize(ILendingPoolAddressesProvider provider)
//         public
//     {
//         addressesProvider = provider;
//         // pool = ILendingPool(addressesProvider.getLendingPool());
//     }

//     /**
//      * @dev Creates or edits a tranche
//      * @param tranche 0, 1, or 2 for low, medium, and high risk? @Steven verify this
//      * @param _variableBorrowRateMultiplier tranche specific variable rate multiplier
//      * @param _stableBorrowRateMultiplier tranche specific variable rate multiplier
//      **/
//     function editTranche(
//         uint8 tranche,
//         uint256 _liquidityRateMultiplier,
//         uint256 _variableBorrowRateMultiplier,
//         uint256 _stableBorrowRateMultiplier
//     ) public onlyGovernance {
//         tranches[tranche] = DataTypes.Tranche({
//             liquidityRateMultiplier: _liquidityRateMultiplier,
//             variableBorrowRateMultiplier: _variableBorrowRateMultiplier,
//             stableBorrowRateMultiplier: _stableBorrowRateMultiplier
//         });
//     }
// }
