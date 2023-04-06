// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {ILendingPool} from "../../interfaces/ILendingPool.sol";
import {ILendingPoolConfigurator} from "../../interfaces/ILendingPoolConfigurator.sol";
import {IAssetMappings} from "../../interfaces/IAssetMappings.sol";
import {DataTypes} from "../libraries/types/DataTypes.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {PercentageMath} from "../libraries/math/PercentageMath.sol";
import {VersionedInitializable} from "../../dependencies/aave-upgradeability/VersionedInitializable.sol";
import {Address} from "../../dependencies/openzeppelin/contracts/Address.sol";
import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import {Helpers} from "../libraries/helpers/Helpers.sol";

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
contract AssetMappings is IAssetMappings, VersionedInitializable{
    using PercentageMath for uint256;
    using Helpers for address;

    ILendingPoolAddressesProvider internal addressesProvider;
    address public approvedAssetsHead;
    address public approvedAssetsTail;

    mapping(address => DataTypes.AssetData) internal assetMappings;
    mapping(address => mapping(uint8=>address)) internal interestRateStrategyAddress;
    mapping(address => uint8) public numInterestRateStrategyAddress;
    mapping(address => DataTypes.CurveMetadata) internal curveMetadata;
    mapping(address => DataTypes.BeethovenMetadata) internal beethovenMetadata;

    modifier onlyGlobalAdmin() {
        require(
            addressesProvider.getGlobalAdmin() == msg.sender,
            Errors.CALLER_NOT_GLOBAL_ADMIN
        );
        _;
    }

    function validateAssetAllowed(address asset) internal view {
        require(!assetMappings[asset].borrowingEnabled, Errors.AM_UNABLE_TO_DISALLOW_ASSET);
        require(assetMappings[asset].baseLTV == 0, Errors.AM_UNABLE_TO_DISALLOW_ASSET);
        //check no borrows open
        uint64 totalTranches = ILendingPoolConfigurator(
            addressesProvider.getLendingPoolConfigurator()
        ).totalTranches();

        for (uint64 tranche = 0; tranche < totalTranches; tranche++) {
            DataTypes.ReserveData memory reserve = ILendingPool(
                addressesProvider.getLendingPool()
            ).getReserveData(asset, tranche);
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

    function getRevision() internal pure override returns (uint256) {
        return 0x1;
    }

    function initialize(ILendingPoolAddressesProvider provider)
        public
        initializer
    {
        addressesProvider = ILendingPoolAddressesProvider(provider);
        approvedAssetsHead = address(0);
        approvedAssetsTail = address(0);
    }

    function getVMEXReserveFactor(
        address asset
    ) external view returns(uint256) {
        return assetMappings[asset].VMEXReserveFactor;
    }

    /**
     * @dev Updates the vmex reserve factor of a reserve
     * @param asset The address of the reserve you want to set
     * @param reserveFactor The new reserve factor of the reserve. Passed in with 2 decimal places (0 < reserveFactor < 10000).
     **/
    function setVMEXReserveFactor(
        address asset,
        uint256 reserveFactor
    ) public onlyGlobalAdmin {
        uint256 thisReserveFactor = reserveFactor.convertToPercent();
        validateVMEXReserveFactor(thisReserveFactor);

        assetMappings[asset].VMEXReserveFactor = uint64(thisReserveFactor);

        emit VMEXReserveFactorChanged(asset, thisReserveFactor);
    }

    /**
     * @dev Updates the vmex reserve factor of a reserve
     * @param asset The address of the reserve you want to set
     * @param borrowingEnabled True to enable borrowing, false to disable borrowing
     **/
    function setBorrowingEnabled(
        address asset,
        bool borrowingEnabled
    ) external onlyGlobalAdmin {
        assetMappings[asset].borrowingEnabled = borrowingEnabled;

        emit BorrowingEnabledChanged(asset, borrowingEnabled);
    }

    function validateCollateralParams(
        uint64 baseLTV,
        uint64 liquidationThreshold,
        uint64 liquidationBonus,
        uint64 borrowFactor,
        bool borrowingEnabled
    ) internal pure {
        require(baseLTV <= liquidationThreshold, Errors.AM_INVALID_CONFIGURATION);

        if (liquidationThreshold != 0) {
            //liquidation bonus must be bigger than 100.00%, otherwise the liquidator would receive less
            //collateral than needed to cover the debt
            require(
                uint256(liquidationBonus) > PercentageMath.PERCENTAGE_FACTOR,
                Errors.AM_INVALID_CONFIGURATION
            );

            //if threshold * bonus is less than PERCENTAGE_FACTOR, it's guaranteed that at the moment
            //a loan is taken there is enough collateral available to cover the liquidation bonus

            require(
                uint256(liquidationThreshold).percentMul(uint256(liquidationBonus)) <=
                    PercentageMath.PERCENTAGE_FACTOR,
                Errors.AM_INVALID_CONFIGURATION
            );
        }
        if(borrowingEnabled){
            require(
                uint256(borrowFactor) >= PercentageMath.PERCENTAGE_FACTOR,
                Errors.AM_INVALID_CONFIGURATION
            );
        }
    }

    function validateAddAssetMapping(AddAssetMappingInput memory inputAsset) internal view {
        address currentAssetAddress = inputAsset.asset;
        require(!isAssetInMappings(currentAssetAddress),Errors.AM_ASSET_ALREADY_IN_MAPPINGS);
        require(Address.isContract(currentAssetAddress),Errors.AM_ASSET_NOT_CONTRACT);
        require(Address.isContract(inputAsset.defaultInterestRateStrategyAddress), Errors.AM_INTEREST_STRATEGY_NOT_CONTRACT);
    }

    /**
     * @dev Adds a new asset mapping to the linked list, will skip assets
     *      that were already added
     **/
    function addAssetMapping(
        AddAssetMappingInput[] memory input
    ) external onlyGlobalAdmin {
        for(uint256 i = 0; i<input.length; i++) {
            AddAssetMappingInput memory inputAsset = input[i];
            address currentAssetAddress = inputAsset.asset;
            validateAddAssetMapping(inputAsset);

            inputAsset.baseLTV = uint64(uint256(inputAsset.baseLTV).convertToPercent());
            inputAsset.liquidationThreshold = uint64(uint256(inputAsset.liquidationThreshold).convertToPercent());
            inputAsset.liquidationBonus = uint64(uint256(inputAsset.liquidationBonus).convertToPercent());
            inputAsset.borrowFactor = uint64(uint256(inputAsset.borrowFactor).convertToPercent());
            inputAsset.VMEXReserveFactor = uint64(uint256(inputAsset.VMEXReserveFactor).convertToPercent());

            validateCollateralParams(inputAsset.baseLTV, inputAsset.liquidationThreshold, inputAsset.liquidationBonus, inputAsset.borrowFactor, inputAsset.borrowingEnabled);
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
            currentAssetMapping.isAllowed = true;
            currentAssetMapping.exists = true;

            interestRateStrategyAddress[currentAssetAddress][0] = inputAsset.defaultInterestRateStrategyAddress;

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
                inputAsset.borrowingEnabled,
                inputAsset.VMEXReserveFactor
            );
        }
    }

    /**
     * @dev Configures an existing asset mapping's risk parameters
     * @param asset Address of asset token you want to set
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
        baseLTV = uint64(uint256(baseLTV).convertToPercent());
        liquidationThreshold = uint64(uint256(liquidationThreshold).convertToPercent());
        liquidationBonus = uint64(uint256(liquidationBonus).convertToPercent());
        borrowFactor = uint64(uint256(borrowFactor).convertToPercent());
        validateCollateralParams(baseLTV, liquidationThreshold, liquidationBonus, borrowFactor, assetMappings[asset].borrowingEnabled);

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
        uint256 i = 0;

        while(tmp != address(0)) {
            if(assetMappings[tmp].isAllowed) {
                tokens[i] = tmp;
                i++;
            }

            tmp = assetMappings[tmp].nextApprovedAsset;
        }
    }

    function getAssetMapping(address asset) view external returns(DataTypes.AssetData memory){
        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED); //not existing
        return assetMappings[asset];
    }

    function getAssetBorrowable(address asset) view external returns (bool){
        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED); //not existing
        return assetMappings[asset].borrowingEnabled;
    }

    function getAssetCollateralizable(address asset) view external returns (bool){
        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED); //not existing
        return assetMappings[asset].liquidationThreshold != 0;
    }

    function getInterestRateStrategyAddress(address asset, uint8 choice) view external returns(address){
        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED); //not existing
        require(interestRateStrategyAddress[asset][choice]!=address(0), Errors.AM_NO_INTEREST_STRATEGY);
        return interestRateStrategyAddress[asset][choice];
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
    function addInterestRateStrategyAddress(address asset, address strategy) external onlyGlobalAdmin {
        require(Address.isContract(strategy), Errors.AM_INTEREST_STRATEGY_NOT_CONTRACT);
        while(interestRateStrategyAddress[asset][numInterestRateStrategyAddress[asset]]!=address(0)){
            numInterestRateStrategyAddress[asset]++;
        }
        interestRateStrategyAddress[asset][numInterestRateStrategyAddress[asset]] = strategy;
        emit AddedInterestRateStrategyAddress(
            asset,
            numInterestRateStrategyAddress[asset],
            strategy
        );
    }

    /**
     * @dev Sets curve metadata for an array of assets.
     **/
    function setCurveMetadata(address[] calldata assets, DataTypes.CurveMetadata[] calldata vars) external onlyGlobalAdmin {
        require(assets.length == vars.length, Errors.ARRAY_LENGTH_MISMATCH);
        for(uint i = 0;i<assets.length;i++){
            curveMetadata[assets[i]] = vars[i];
        }
    }

    function getCurveMetadata(address asset) external view returns (DataTypes.CurveMetadata memory) {
        return curveMetadata[asset];
    }

    /**
     * @dev Sets beethoven metadata for an array of assets.
     **/
    function setBeethovenMetadata(address[] calldata assets, DataTypes.BeethovenMetadata[] calldata vars) external onlyGlobalAdmin {
        require(assets.length == vars.length, Errors.ARRAY_LENGTH_MISMATCH);
        for(uint i = 0;i<assets.length;i++){
            beethovenMetadata[assets[i]] = vars[i];
        }
    }

    function getBeethovenMetadata(address asset) external view returns (DataTypes.BeethovenMetadata memory) {
        require(beethovenMetadata[asset]._exists, Errors.AM_ASSET_DOESNT_EXIST);
        return beethovenMetadata[asset];
    }


    /**
     * @dev Gets the configuration paramters of the reserve
     * @param asset Address of asset token you want params for
     **/
    function getParams(address asset)
        external view
        returns (
            uint256 baseLTV,
            uint256 liquidationThreshold,
            uint256 liquidationBonus,
            uint256 underlyingAssetDecimals,
            uint256 borrowFactor
        )
    {

        require(assetMappings[asset].isAllowed, Errors.AM_ASSET_NOT_ALLOWED); //not existing
        return (
            assetMappings[asset].baseLTV,
            assetMappings[asset].liquidationThreshold,
            assetMappings[asset].liquidationBonus,
            IERC20Detailed(asset).decimals(),
            assetMappings[asset].borrowFactor
        );
    }

    function getDecimals(address asset) external view
        returns (
            uint256
        ){

        return IERC20Detailed(asset).decimals();
    }

    function validateVMEXReserveFactor(uint256 vmexReserveFactor) internal pure {
        require(
                vmexReserveFactor < PercentageMath.PERCENTAGE_FACTOR,
                Errors.RC_INVALID_RESERVE_FACTOR
            );
    }
}