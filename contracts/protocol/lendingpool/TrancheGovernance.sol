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
//      * @dev Creates or edits a trancheId
//      * @param trancheId 0, 1, or 2 for low, medium, and high risk? @Steven verify this
//      * @param _variableBorrowRateMultiplier trancheId specific variable rate multiplier
//      * @param _stableBorrowRateMultiplier trancheId specific variable rate multiplier
//      **/
//     function editTranche(
//         uint8 trancheId,
//         uint256 _liquidityRateMultiplier,
//         uint256 _variableBorrowRateMultiplier,
//         uint256 _stableBorrowRateMultiplier
//     ) public onlyGovernance {
//         tranches[trancheId] = DataTypes.trancheId({
//             liquidityRateMultiplier: _liquidityRateMultiplier,
//             variableBorrowRateMultiplier: _variableBorrowRateMultiplier,
//             stableBorrowRateMultiplier: _stableBorrowRateMultiplier
//         });
//     }
// }
