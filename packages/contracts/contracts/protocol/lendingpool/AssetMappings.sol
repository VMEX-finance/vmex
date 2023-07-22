// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {ILendingPool} from "../../interfaces/ILendingPool.sol";
import {ILendingPoolConfigurator} from "../../interfaces/ILendingPoolConfigurator.sol";
import {IAssetMappings} from "../../interfaces/IAssetMappings.sol";
import {DataTypes} from "../libraries/types/DataTypes.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {PercentageMath} from "../libraries/math/PercentageMath.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {Address} from "../../dependencies/openzeppelin/contracts/Address.sol";
import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import {Helpers} from "../libraries/helpers/Helpers.sol";
import {SafeCast} from "../../dependencies/openzeppelin/contracts/SafeCast.sol";
import {ValidationLogic} from "../libraries/logic/ValidationLogic.sol";
/**
 * @title AssetMappings contract
 * @notice Stores information on the assets used across all tranches in the VMEX protocol
 * @dev The global admin has control over the asset mappings and the risk parameters
 * - The global admin can:
 *   # Add asset mappings
 *   # Configure asset mappings
 *   # Set asset as allowed or disallowed in the protocol
 *   # Set VMEX reserve factor
 *   # Enable or disable assets for borrowing
 *   # Add interest rate strategies
 *   # Add curve metadata for pricing curve assets
 * @author VMEX
 **/
contract AssetMappings is IAssetMappings, Initializable{
    using PercentageMath for uint256;
    using Helpers for address;
    using SafeCast for uint256;

    ILendingPoolAddressesProvider internal addressesProvider;
    address public approvedAssetsHead;
    address public approvedAssetsTail;

    mapping(address => DataTypes.AssetData) internal assetMappings;
    mapping(address => DataTypes.CurveMetadata) internal curveMetadata;
    mapping(address => DataTypes.BeethovenMetadata) internal beethovenMetadata;

    modifier onlyGlobalAdmin() {
        Helpers.onlyGlobalAdmin(addressesProvider, msg.sender);
        _;
    }

    /**
     * @dev Validates if the global admin can set asset as not allowed.
     * We are being very conservative: there cannot be any outstanding borrows or deposits in the reserve, and it must be set off for borrowing and collateral
     * @param asset The address of the asset you want to disallow
     **/
    function validateAssetAllowed(address asset) internal view {
        require(!assetMappings[asset].borrowingEnabled, Errors.AM_UNABLE_TO_DISALLOW_ASSET);
        require(assetMappings[asset].baseLTV == 0, Errors.AM_UNABLE_TO_DISALLOW_ASSET);
        //check no borrows open
        uint64 totalTranches = ILendingPoolConfigurator(
            addressesProvider.getLendingPoolConfigurator()
        ).totalTranches();

        ILendingPool lendingPool = ILendingPool(addressesProvider.getLendingPool());
        for (uint64 tranche = 0; tranche < totalTranches; tranche++) {
            DataTypes.ReserveData memory reserve = lendingPool.getReserveData(asset, tranche);
            //no outstanding borrows allowed
            if (reserve.variableDebtTokenAddress != address(0)) {
                // if the reserve exists in the tranche
                require(
                    IERC20Detailed(reserve.variableDebtTokenAddress).totalSupply() == 0,
                    Errors.AM_UNABLE_TO_DISALLOW_ASSET
                );
            }
            //no outstanding deposits allowed, or else they are unable to withdraw
            if (reserve.aTokenAddress != address(0)) {
                // if the reserve exists in the tranche
                require(
                    IERC20Detailed(reserve.aTokenAddress).totalSupply() == 0,
                    Errors.AM_UNABLE_TO_DISALLOW_ASSET
                );
            }
        }

    }

    function initialize(ILendingPoolAddressesProvider provider)
        public
        initializer
    {
        addressesProvider = ILendingPoolAddressesProvider(provider);
        approvedAssetsHead = address(0);
        approvedAssetsTail = address(0);
    }

    /**
     * @dev Gets the vmex reserve factor of a reserve
     * @param asset The address of the reserve you want to get
     **/
    function getVMEXReserveFactor(
        address asset
    ) external view returns(uint256) {
        return assetMappings[asset].VMEXReserveFactor;
    }

    /**
     * @dev Updates the vmex reserve factor of a reserve
     * @param asset The address of the reserve you want to set
     * @param reserveFactor The new reserve factor of the reserve. Passed in with 18 decimals.
     **/
    function setVMEXReserveFactor(
        address asset,
        uint256 reserveFactor
    ) public onlyGlobalAdmin {
        require(isAssetInMappings(asset), Errors.AM_ASSET_DOESNT_EXIST);
        validateVMEXReserveFactor(reserveFactor);

        assetMappings[asset].VMEXReserveFactor = reserveFactor.toUint64();

        emit VMEXReserveFactorChanged(asset, reserveFactor);
    }

    /**
     * @dev Sets the borrowing enabled on an asset
     * @param asset The address of the reserve you want to set
     * @param borrowingEnabled True to enable borrowing, false to disable borrowing
     **/
    function setBorrowingEnabled(
        address asset,
        bool borrowingEnabled
    ) external onlyGlobalAdmin {
        require(isAssetInMappings(asset), Errors.AM_ASSET_DOESNT_EXIST);
        assetMappings[asset].borrowingEnabled = borrowingEnabled;

        emit BorrowingEnabledChanged(asset, borrowingEnabled);
    }

    /**
     * @dev validates if asset is able to be added to the asset mappings
     * @param inputAsset contains all input info for an asset
     **/
    function validateAddAssetMapping(AddAssetMappingInput memory inputAsset) internal view {
        address currentAssetAddress = inputAsset.asset;
        require(!isAssetInMappings(currentAssetAddress),Errors.AM_ASSET_ALREADY_IN_MAPPINGS);
        require(Address.isContract(currentAssetAddress),Errors.AM_ASSET_NOT_CONTRACT);
        require(Address.isContract(inputAsset.defaultInterestRateStrategyAddress), Errors.AM_INTEREST_STRATEGY_NOT_CONTRACT);
    }

    /**
     * @dev Adds a new asset mapping to the linked list, will revert if there are assets
     *      that were already added
     **/
    function addAssetMapping(
        AddAssetMappingInput[] calldata input
    ) external onlyGlobalAdmin {
        uint256 length = input.length;
        for(uint256 i; i<length;) {
            AddAssetMappingInput memory inputAsset = input[i];
            address currentAssetAddress = inputAsset.asset;
            validateAddAssetMapping(inputAsset);

            ValidationLogic.validateCollateralParams(inputAsset.baseLTV, inputAsset.liquidationThreshold, inputAsset.liquidationBonus, inputAsset.borrowFactor);
            validateVMEXReserveFactor(inputAsset.VMEXReserveFactor);

            DataTypes.AssetData storage currentAssetMapping = assetMappings[currentAssetAddress];

            currentAssetMapping.supplyCap = inputAsset.supplyCap;
            currentAssetMapping.borrowCap = inputAsset.borrowCap;
            currentAssetMapping.baseLTV = inputAsset.baseLTV;
            currentAssetMapping.liquidationThreshold = inputAsset.liquidationThreshold;
            currentAssetMapping.liquidationBonus = inputAsset.liquidationBonus;
            currentAssetMapping.borrowFactor = inputAsset.borrowFactor;
            currentAssetMapping.VMEXReserveFactor = inputAsset.VMEXReserveFactor;
            currentAssetMapping.borrowingEnabled = inputAsset.borrowingEnabled;
            currentAssetMapping.assetType = inputAsset.assetType;
            currentAssetMapping.defaultInterestRateStrategyAddress = inputAsset.defaultInterestRateStrategyAddress;
            currentAssetMapping.isAllowed = true;
            currentAssetMapping.exists = true;


            if (approvedAssetsHead==address(0)) {
                // head not set, add first asset to linked list
                approvedAssetsHead = currentAssetAddress;
                approvedAssetsTail = currentAssetAddress;
            }
            else {
                // add to end
                assetMappings[approvedAssetsTail].nextApprovedAsset = currentAssetAddress;
                approvedAssetsTail = currentAssetAddress;
            }

            emit AssetDataSet(
                currentAssetAddress,
                IERC20Detailed(currentAssetAddress).decimals(),
                currentAssetAddress.getSymbol(),
                inputAsset.supplyCap,
                inputAsset.borrowCap,
                inputAsset.baseLTV,
                inputAsset.liquidationThreshold,
                inputAsset.liquidationBonus,
                inputAsset.borrowFactor,
                inputAsset.defaultInterestRateStrategyAddress,
                inputAsset.borrowingEnabled,
                inputAsset.VMEXReserveFactor
            );

            unchecked { ++i; }
        }
    }

    /**
     * @dev Configures an existing asset mapping's risk parameters
     * @param asset Address of asset token you want to set. Note that the percentage values use 18 decimals
     **/
    function configureAssetMapping(
        address asset,//20
        uint64 baseLTV, //28
        uint64 liquidationThreshold, //36 --> 1 word, 8 bytes
        uint64 liquidationBonus, //1 word, 16 bytes
        uint128 supplyCap, //1 word, 32 bytes -> 1 word
        uint128 borrowCap, //2 words, 16 bytes
        uint64 borrowFactor //2 words, 24 bytes --> 3 words total
    ) external onlyGlobalAdmin {
        require(isAssetInMappings(asset), Errors.AM_ASSET_DOESNT_EXIST);
        ValidationLogic.validateCollateralParams(baseLTV, liquidationThreshold, liquidationBonus, borrowFactor);

        assetMappings[asset].baseLTV = baseLTV;
        assetMappings[asset].liquidationThreshold = (liquidationThreshold);
        assetMappings[asset].liquidationBonus = (liquidationBonus);
        assetMappings[asset].supplyCap = (supplyCap);
        assetMappings[asset].borrowCap = (borrowCap);
        assetMappings[asset].borrowFactor = (borrowFactor);
        assetMappings[asset].isAllowed = true;

        emit ConfiguredAssetMapping(asset, baseLTV, liquidationThreshold, liquidationBonus, supplyCap, borrowCap, borrowFactor);
    }

    /**
     * @dev Set a existing asset to be allowed
     * @param asset Address of the asset
     * @param isAllowed true if allowed, false otherwise
     **/
    function setAssetAllowed(address asset, bool isAllowed) external onlyGlobalAdmin{
        require(isAssetInMappings(asset), Errors.AM_ASSET_DOESNT_EXIST);
        if (!isAllowed) {
            validateAssetAllowed(asset);
        }
        assetMappings[asset].isAllowed = isAllowed;
    }

    /**
     * @dev Gets whether or not the asset is inside the mappings linked list, including disabled assets
     * @param asset Address of asset token you want to check
     **/
    function isAssetInMappings(address asset) view public returns (bool) {
        return assetMappings[asset].exists;
    }

    /**
     * @dev Gets the number of allowed assets in the linked list
     **/
    function getNumApprovedTokens() view public returns (uint256) {
        uint256 numTokens = 0;
        address tmp = approvedAssetsHead;

        while(tmp != address(0)) {
            if(assetMappings[tmp].isAllowed){
                // don't count disallowed tokens
                numTokens++;
            }

            tmp = assetMappings[tmp].nextApprovedAsset;
        }

        return numTokens;
    }

    /**
     * @dev Gets a list of the allowed assets in the linked list
     **/
    function getAllApprovedTokens() view external returns (address[] memory tokens) {
        if(approvedAssetsHead == address(0)){
            return new address[](0);
        }

        uint256 numTokens = getNumApprovedTokens();
        address tmp = approvedAssetsHead;
        tokens = new address[](numTokens);
        uint256 i;

        while(tmp != address(0)) {
            if(assetMappings[tmp].isAllowed) {
                tokens[i] = tmp;
                i++;
            }

            tmp = assetMappings[tmp].nextApprovedAsset;
        }
    }

    function getAssetMapping(address asset) view external returns(DataTypes.AssetData memory){
        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED);
        return assetMappings[asset];
    }

    function getAssetBorrowable(address asset) view external returns (bool){
        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED);
        return assetMappings[asset].borrowingEnabled;
    }

    function getAssetCollateralizable(address asset) view external returns (bool){
        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED);
        return assetMappings[asset].liquidationThreshold != 0;
    }

    function getInterestRateStrategyAddress(address asset, uint64 trancheId) view external override returns(address){
        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED);
        ILendingPool pool = ILendingPool(addressesProvider.getLendingPool());
        return pool.getTrancheParams(trancheId).verified ?
            pool.getReserveData(asset, trancheId).interestRateStrategyAddress :
            assetMappings[asset].defaultInterestRateStrategyAddress;
    }

    function getDefaultInterestRateStrategyAddress(address asset) view external override returns(address){
        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED);
        return assetMappings[asset].defaultInterestRateStrategyAddress;
    }

    function getAssetType(address asset) view external returns(DataTypes.ReserveAssetType){
        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED); //not existing
        return DataTypes.ReserveAssetType(assetMappings[asset].assetType);
    }

    function getSupplyCap(address asset) view external returns(uint256){
        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED); //not existing
        return assetMappings[asset].supplyCap;
    }

    function getBorrowCap(address asset) view external returns(uint256){
        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED); //not existing
        return assetMappings[asset].borrowCap;
    }

    function getBorrowFactor(address asset) view external returns(uint256){
        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED); //not existing
        return assetMappings[asset].borrowFactor;
    }

    function getAssetAllowed(address asset) view external returns(bool){
        return assetMappings[asset].isAllowed;
    }

    /**
     * @dev Adds an interest rate strategy to the end of the array.
     **/
    function setInterestRateStrategyAddress(address asset, address strategy) external onlyGlobalAdmin {
        require(Address.isContract(strategy), Errors.AM_INTEREST_STRATEGY_NOT_CONTRACT);
        assetMappings[asset].defaultInterestRateStrategyAddress = strategy;
        emit AddedInterestRateStrategyAddress(
            asset,
            strategy
        );
    }

    /**
     * @dev Sets asset type for an asset for oracle choice. May be used if a chainlink aggregator becomes available for a asset
     **/
    function setAssetType(address asset, DataTypes.ReserveAssetType assetType) external override onlyGlobalAdmin {
        assetMappings[asset].assetType = uint8(assetType);
    }

    /**
     * @dev Sets curve metadata for an array of assets.
     **/
    function setCurveMetadata(address[] calldata assets, DataTypes.CurveMetadata[] calldata vars) external override onlyGlobalAdmin {
        require(assets.length == vars.length, Errors.ARRAY_LENGTH_MISMATCH);
        for(uint256 i;i<assets.length;i++){
            curveMetadata[assets[i]] = vars[i];
        }
    }

    function getCurveMetadata(address asset) external view override returns (DataTypes.CurveMetadata memory) {
        return curveMetadata[asset];
    }

    /**
     * @dev Sets beethoven metadata for an array of assets.
     **/
    function setBeethovenMetadata(address[] calldata assets, DataTypes.BeethovenMetadata[] calldata vars) external onlyGlobalAdmin {
        require(assets.length == vars.length, Errors.ARRAY_LENGTH_MISMATCH);
        for(uint256 i;i<assets.length;i++){
            beethovenMetadata[assets[i]] = vars[i];
        }
    }

    function getBeethovenMetadata(address asset) external view override returns (DataTypes.BeethovenMetadata memory) {
        require(beethovenMetadata[asset]._exists, Errors.AM_ASSET_DOESNT_EXIST);
        return beethovenMetadata[asset];
    }


    /**
     * @dev Gets the configuration paramters of the reserve
     * @param asset Address of asset token you want params for
     **/
    function getParams(address asset, uint64 trancheId)
        external view override
        returns (
            uint256 baseLTV,
            uint256 liquidationThreshold,
            uint256 liquidationBonus,
            uint256 underlyingAssetDecimals,
            uint256 borrowFactor
        )
    {
        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED); //not existing
        ILendingPool pool = ILendingPool(addressesProvider.getLendingPool());
        if(pool.getTrancheParams(trancheId).verified) {
            DataTypes.ReserveData memory dat = pool.getReserveData(asset, trancheId);
            return (
                dat.baseLTV,
                dat.liquidationThreshold,
                dat.liquidationBonus,
                IERC20Detailed(asset).decimals(),
                dat.borrowFactor
            );
        } else {
            return (
                assetMappings[asset].baseLTV,
                assetMappings[asset].liquidationThreshold,
                assetMappings[asset].liquidationBonus,
                IERC20Detailed(asset).decimals(),
                assetMappings[asset].borrowFactor
            );
        }

    }

    /**
     * @dev Gets the configuration paramters of the reserve
     * @param asset Address of asset token you want params for
     **/
    function getDefaultCollateralParams(address asset)
        external view override
        returns (
            uint64,
            uint64,
            uint64,
            uint64
        )
    {
        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED); //not existing
        return (
            assetMappings[asset].baseLTV,
            assetMappings[asset].liquidationThreshold,
            assetMappings[asset].liquidationBonus,
            assetMappings[asset].borrowFactor
        );
    }

    function getDecimals(address asset) external view
        returns (
            uint256
        ){

        return IERC20Detailed(asset).decimals();
    }

    /**
     * @dev validates the vmex reserve factor
     **/
    function validateVMEXReserveFactor(uint256 vmexReserveFactor) internal pure {
        require(
                vmexReserveFactor < PercentageMath.PERCENTAGE_FACTOR,
                Errors.RC_INVALID_RESERVE_FACTOR
            );
    }
}