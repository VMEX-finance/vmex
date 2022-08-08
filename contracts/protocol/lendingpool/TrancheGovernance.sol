// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {DataTypes} from "../libraries/types/DataTypes.sol";
import {LendingPoolStorage} from "./LendingPoolStorage.sol";

contract TrancheGovernance is LendingPoolStorage {
    modifier onlyGovernance() {
        //
        _;
    }

    /**
     * @dev Creates or edits a tranche
     * @param trancheId 0-255 id of tranche, decided by governance. If every asset in a tranche is multplied by the same multiplier, then this should just be the same as _riskLevel
     * @param _riskLevel 0, 1, or 2 for low, medium, and high risk? @Steven verify this
     * @param _variableBorrowRateMultiplier tranche specific variable rate multiplier
     * @param _stableBorrowRateMultiplier tranche specific variable rate multiplier
     **/
    function editTranche(
        uint8 trancheId,
        uint8 _riskLevel,
        uint256 _variableBorrowRateMultiplier,
        uint256 _stableBorrowRateMultiplier
    ) public onlyGovernance {
        tranches[trancheId] = DataTypes.Tranche({
            riskLevel: _riskLevel,
            variableBorrowRateMultiplier: _variableBorrowRateMultiplier,
            stableBorrowRateMultiplier: _stableBorrowRateMultiplier
        });
    }
}
