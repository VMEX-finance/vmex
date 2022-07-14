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
     * @param trancheKey 0-255 id of tranche, decided by governance
     * @param _riskLevel
     * @param _variableBorrowRateMultiplier
     * @param _stableBorrowRateMultiplier
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

    function associateAssetToTranche(address asset, uint8 trancheId)
        public
        onlyGovernance
    {
        // 0 means uninitialized, reserved for default tranches
        assert(tranches[trancheId].riskLevel != 0);

        DataTypes.ReserveData storage reserve = _reserves[asset];

        reserve.tranche = tranches[trancheId];
    }
}
