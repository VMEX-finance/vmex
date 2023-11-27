// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;
import { DataTypes } from "../../protocol/libraries/types/DataTypes.sol";
import { ReserveConfiguration } from "../../protocol/libraries/configuration/ReserveConfiguration.sol";
import { WadRayMath } from "../../protocol/libraries/math/WadRayMath.sol";
import { ILendingPool } from "../../interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "../../interfaces/ILendingPoolAddressesProvider.sol";
import { AssetMappings } from "../../protocol/lendingpool/AssetMappings.sol";
import { IERC20 } from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import { IERC20Detailed } from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import { IAToken } from "../../interfaces/IAToken.sol";
import { IIncentivesController } from "../../interfaces/IIncentivesController.sol";
import { PricingHelpers } from "./PricingHelpers.sol";
import { Address } from "../../dependencies/openzeppelin/contracts/Address.sol";

library QueryReserveHelpers {
    using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
    using WadRayMath for uint256;

    struct ReserveSummary {
        // identity
        DataTypes.ReserveData reserveData;
        uint64 tranche;
        address asset;
        string name;
        bool inVerifiedTranche;
        uint8 decimals;

        // read more complex values
        bool canBeCollateral;
        bool canBeBorrowed;
        uint256 supplyCap;
        uint256 borrowCap;
        uint256 adminFee;
        uint256 platformFee;

        // analysis
        uint256 totalSupplied;  // same number of decimals as underlying token
        uint256 totalBorrowed;  // same number of decimals as underlying token
        uint256 totalReserves;  // the atoken's balance of the underlying, same number of decimals as underlying token
        uint256 utilization;

        // external rewards
        address stakingContract;
        uint256 totalStaked;    // the amount underlying staked by incentives controller (including rewards), same number of decimals as underlying token
        uint256 pendingRewards; // pending rewards of incentives controller, same number of decimals as underlying token

        // oracle
        address oracle;
        uint256 currentPriceETH; // current price of the underlying in eth (18 decimals)
    }

    function getReserveData(
        address asset,
        uint64 tranche,
        address providerAddr
    )
        internal
        returns (ReserveSummary memory reserveSummary)
    {
        ILendingPool lendingPool = ILendingPool(
            ILendingPoolAddressesProvider(providerAddr).getLendingPool()
        );
        IIncentivesController incentivesController = IIncentivesController(
            ILendingPoolAddressesProvider(providerAddr).getIncentivesController()
        );

        AssetMappings a = AssetMappings(ILendingPoolAddressesProvider(providerAddr).getAssetMappings());

        DataTypes.ReserveData memory reserve = lendingPool.getReserveData(asset, tranche);
        reserveSummary.reserveData = reserve;
        reserveSummary.tranche = tranche;
        reserveSummary.asset = asset;
        reserveSummary.name = IERC20Detailed(asset).name();
        reserveSummary.inVerifiedTranche = lendingPool.getTrancheParams(tranche).verified;
        reserveSummary.decimals = IERC20(asset).decimals();

        reserveSummary.canBeCollateral = reserve.configuration.getCollateralEnabled(asset, a);
        reserveSummary.canBeBorrowed = reserve.configuration.getBorrowingEnabled(asset, a);
        reserveSummary.oracle = ILendingPoolAddressesProvider(providerAddr).getPriceOracle();
        reserveSummary.supplyCap = a.getSupplyCap(reserveSummary.asset);
        reserveSummary.borrowCap = a.getBorrowCap(reserveSummary.asset);
        reserveSummary.adminFee = reserve.configuration.getReserveFactor();
        reserveSummary.platformFee = a.getVMEXReserveFactor(asset);

        reserveSummary.totalSupplied = IAToken(reserve.aTokenAddress).totalSupply();
        reserveSummary.totalBorrowed = IAToken(reserve.variableDebtTokenAddress).totalSupply();
        reserveSummary.totalReserves = IERC20(asset).balanceOf(reserve.aTokenAddress);
        reserveSummary.utilization = reserveSummary.totalBorrowed == 0
            ? 0
            : reserveSummary.totalBorrowed.rayDiv(reserveSummary.totalReserves + reserveSummary.totalBorrowed);

        reserveSummary.stakingContract = incentivesController.getStakingContract(reserve.aTokenAddress);
        if (Address.isContract(reserveSummary.stakingContract)) {
            reserveSummary.totalStaked = tryGetTotalStaked(reserveSummary.stakingContract, address(incentivesController));
            // reserveSummary.pendingRewards = incentivesController.getPendingRewards(); // TODO
        }

        reserveSummary.currentPriceETH = PricingHelpers.tryGetAssetPrice(reserveSummary.oracle, reserveSummary.asset);
    }

    function tryGetTotalStaked(
        address stakingContract,
        address incentivesController
    ) internal view returns (uint256) {
        try IERC20(stakingContract).balanceOf(incentivesController) returns(uint256 amount) {
            return amount;
        } catch {
            return 1;
        }
    }
}