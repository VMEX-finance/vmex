// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {ILendingPoolAddressesProvider} from "./ILendingPoolAddressesProvider.sol";
import {DataTypes} from "../protocol/libraries/types/DataTypes.sol";

interface IAssetMappings {
    event AssetDataSet(
        address indexed asset,
        uint8 underlyingAssetDecimals,
        string underlyingAssetSymbol,
        uint256 supplyCap,
        uint256 borrowCap,
        uint256 baseLTV,
        uint256 liquidationThreshold,
        uint256 liquidationBonus,
        uint256 borrowFactor,
        bool borrowingEnabled,
        uint256 VMEXReserveFactor
    );

    event ConfiguredAssetMapping(
        address indexed asset,
        uint256 baseLTV,
        uint256 liquidationThreshold,
        uint256 liquidationBonus,
        uint256 supplyCap,
        uint256 borrowCap,
        uint256 borrowFactor
    );

    event AddedInterestRateStrategyAddress(
        address indexed asset,
        uint256 index,
        address strategyAddress
    );

    event VMEXReserveFactorChanged(address indexed asset, uint256 factor);

    event BorrowingEnabledChanged(address indexed asset, bool borrowingEnabled);

    struct AddAssetMappingInput {
        address asset;
        address defaultInterestRateStrategyAddress;
        uint128 supplyCap; //can get up to 10^38. Good enough.
        uint128 borrowCap; //can get up to 10^38. Good enough.
        uint64 baseLTV; // % of value of collateral that can be used to borrow. "Collateral factor." 64 bits
        uint64 liquidationThreshold; //if this is zero, then disabled as collateral. 64 bits
        uint64 liquidationBonus; // 64 bits
        uint64 borrowFactor; // borrowFactor * baseLTV * value = truly how much you can borrow of an asset. 64 bits

        bool borrowingEnabled;
        uint8 assetType; //to choose what oracle to use
        uint64 VMEXReserveFactor;
    }

    function getVMEXReserveFactor(
        address asset
    ) external view returns(uint256);

    function setVMEXReserveFactor(
        address asset,
        uint256 reserveFactor
    ) external;

    function setBorrowingEnabled(
        address asset,
        bool borrowingEnabled
    ) external;

    function addAssetMapping(
        AddAssetMappingInput[] memory input
    ) external;

    function configureAssetMapping(
        address asset,//20
        uint64 baseLTV, //28
        uint64 liquidationThreshold, //36 --> 1 word, 8 bytes
        uint64 liquidationBonus, //1 word, 16 bytes
        uint128 supplyCap, //1 word, 32 bytes -> 1 word
        uint128 borrowCap, //2 words, 16 bytes
        uint64 borrowFactor //2 words, 24 bytes --> 3 words total
    ) external;

    function setAssetAllowed(address asset, bool isAllowed) external;

    function isAssetInMappings(address asset) view external returns (bool);

    function getNumApprovedTokens() view external returns (uint256);

    function getAllApprovedTokens() view external returns (address[] memory tokens);

    function getAssetMapping(address asset) view external returns(DataTypes.AssetData memory);

    function getAssetBorrowable(address asset) view external returns (bool);

    function getAssetCollateralizable(address asset) view external returns (bool);

    function getInterestRateStrategyAddress(address asset, uint8 choice) view external returns(address);

    function getAssetType(address asset) view external returns(DataTypes.ReserveAssetType);

    function getSupplyCap(address asset) view external returns(uint256);

    function getBorrowCap(address asset) view external returns(uint256);

    function getBorrowFactor(address asset) view external returns(uint256);

    function getAssetAllowed(address asset) view external returns(bool);

    function addInterestRateStrategyAddress(address asset, address strategy) external;

    function setCurveMetadata(address[] calldata asset, DataTypes.CurveMetadata[] calldata vars) external;

    function getCurveMetadata(address asset) external view returns (DataTypes.CurveMetadata memory);

    function getBeethovenMetadata(address asset) external view returns (DataTypes.BeethovenMetadata memory);


    function getParams(address asset)
        external view
        returns (
            uint256 baseLTV,
            uint256 liquidationThreshold,
            uint256 liquidationBonus,
            uint256 underlyingAssetDecimals,
            uint256 borrowFactor
        );

    function getDecimals(address asset) external view
        returns (
            uint256
        );

    function setAssetType(address asset, DataTypes.ReserveAssetType assetType) external;
}