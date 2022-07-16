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
     * @param trancheId 0-255 id of tranche, decided by governance
     * @param _riskLevel 1, 2, or 3 for low, medium, and high risk? @Steven verify this
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

    //what is the point of this function? To assign specific collateral to specific tranches?
    //I fixed the compile errors and now it seems redundant. ex: We created trancheId with risk level 2 for medium risk assets. We want to associate LP token address with that tranche
    //(the reserve for the LP token must already be initialized, and must be the same riskLevel (2) that we defined the tranche to have).
    //This will set the reserve for the LP token as the same riskLevel it is already at. Redundant function.
    function associateAssetToTranche(address asset, uint8 trancheId)
        public
        onlyGovernance
    {
        // 0 means uninitialized, reserved for default tranches
        assert(tranches[trancheId].riskLevel != 0);

        DataTypes.ReserveData storage reserve =
            _reserves[asset][tranches[trancheId].riskLevel]; //@Steven verify

        reserve.tranche = tranches[trancheId].riskLevel;
    }
}
