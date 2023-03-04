// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";

import {DataTypes} from "../libraries/types/DataTypes.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {PercentageMath} from "../libraries/math/PercentageMath.sol";
import {VersionedInitializable} from "../libraries/aave-upgradeability/VersionedInitializable.sol";
import {Address} from "../../dependencies/openzeppelin/contracts/Address.sol";
import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import {Helpers} from "../libraries/helpers/Helpers.sol";

contract AssetMappings is VersionedInitializable{
    using PercentageMath for uint256;
    using Helpers for address;


    ILendingPoolAddressesProvider internal addressesProvider;
    address public approvedAssetsHead;
    address public approvedAssetsTail;

    mapping(address => DataTypes.AssetData) internal assetMappings;
    // mapping(address => DataTypes.AssetDataConfiguration) internal assetConfigurationMappings;
    mapping(address => mapping(uint8=>address)) internal interestRateStrategyAddress;
    mapping(address => uint8) public numInterestRateStrategyAddress;
    mapping(address => DataTypes.CurveMetadata) internal curveMetadata;

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

    event ConfiguredReserves(
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

    modifier onlyGlobalAdmin() {
        //global admin will be able to have access to other tranches, also can set portion of reserve taken as fee for VMEX admin
        require(
            addressesProvider.getGlobalAdmin() == msg.sender,
            Errors.CALLER_NOT_GLOBAL_ADMIN
        );
        _;
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
    ) public view returns(uint256) {
        return assetMappings[asset].VMEXReserveFactor;
    }

    /**
     * @dev Updates the vmex reserve factor of a reserve
     * @param asset The address of the reserve you want to set
     * @param reserveFactor The new reserve factor of the reserve
     **/
    function setVMEXReserveFactor(
        address asset,
        uint256 reserveFactor //the value here should only occupy 16 bits. This value only has two decimal points
    ) public onlyGlobalAdmin {
        uint256 thisReserveFactor = reserveFactor.convertToPercent();
        require(
                thisReserveFactor < PercentageMath.PERCENTAGE_FACTOR,
                Errors.LPC_INVALID_CONFIGURATION
            );
        assetMappings[asset].VMEXReserveFactor = uint64(thisReserveFactor);

        emit VMEXReserveFactorChanged(asset, thisReserveFactor);
    }

    /**
     * @dev Updates the vmex reserve factor of a reserve
     * @param asset The address of the reserve you want to set
     * @param borrowingEnabled The new borrowingEnabled of the reserve
     **/
    function setBorrowingEnabled(
        address asset,
        bool borrowingEnabled //the value here should only occupy 16 bits
    ) public onlyGlobalAdmin {
        assetMappings[asset].borrowingEnabled = borrowingEnabled;

        emit BorrowingEnabledChanged(asset, borrowingEnabled);
    }

    function validateCollateralParams(uint256 baseLTV, uint256 liquidationThreshold, uint256 liquidationBonus) internal pure {
        require(baseLTV <= liquidationThreshold, Errors.LPC_INVALID_CONFIGURATION);

        if (liquidationThreshold != 0) {
            //liquidation bonus must be bigger than 100.00%, otherwise the liquidator would receive less
            //collateral than needed to cover the debt
            require(
                liquidationBonus > PercentageMath.PERCENTAGE_FACTOR,
                Errors.LPC_INVALID_CONFIGURATION
            );

            //if threshold * bonus is less than PERCENTAGE_FACTOR, it's guaranteed that at the moment
            //a loan is taken there is enough collateral available to cover the liquidation bonus

            //ex: if liquidation threshold is 50%, that means during liquidation we should have half of the collateral not used to back up loan. If user wants to liquidate and gets 200% liquidation bonus, then they would need
            //2 times the amount of debt asset they are covering, meaning that they need twice the value of the ccollateral asset. Since liquidation threshold is 50%, this is possible

            //with borrow factors, the liquidation threshold is always less than or equal to what it should be, so this still stands
            require(
                liquidationThreshold.percentMul(liquidationBonus) <=
                    PercentageMath.PERCENTAGE_FACTOR,
                Errors.LPC_INVALID_CONFIGURATION
            );
        }
    }

    /**
     * @dev Sets an asset mapping's risk parameters and adds it to the linked list
     * @param assets List of addresses of the tokens to add
     **/
    function setAssetMapping(
        address[] calldata assets,
        DataTypes.AssetData[] memory input,
        address[] calldata defaultInterestRateStrategyAddress
    ) external onlyGlobalAdmin {
        require(assets.length==input.length);

        for(uint256 i = 0;i<input.length;i++){
            //validation of the parameters: the LTV can
            //only be lower or equal than the liquidation threshold
            //(otherwise a loan against the asset would cause instantaneous liquidation)
            //originally, aave used 4 decimals for percentages. VMEX is increasing the number, but the input still only has 4 decimals
            input[i].baseLTV = uint64(uint256(input[i].baseLTV).convertToPercent());
            input[i].liquidationThreshold = uint64(uint256(input[i].liquidationThreshold).convertToPercent());
            input[i].liquidationBonus = uint64(uint256(input[i].liquidationBonus).convertToPercent());
            input[i].borrowFactor = uint64(uint256(input[i].borrowFactor).convertToPercent());
            input[i].VMEXReserveFactor = uint64(uint256(input[i].VMEXReserveFactor).convertToPercent());
            input[i].isAllowed = true;

            validateCollateralParams(input[i].baseLTV, input[i].liquidationThreshold, input[i].liquidationBonus);

            assetMappings[assets[i]] = input[i];
            interestRateStrategyAddress[assets[i]][0] = defaultInterestRateStrategyAddress[i];

            if (approvedAssetsHead==address(0)) { //this means we are adding the first asset
                approvedAssetsHead = assets[i];
                approvedAssetsTail = assets[i];
            }
            else if (!isAssetInMappings(assets[i])) {
                // if the asset does not already exist in the linked list
                assetMappings[approvedAssetsTail].nextApprovedAsset = assets[i];
                approvedAssetsTail = assets[i];
            }

            assetMappings[assets[i]].exists = true;

            emit AssetDataSet(
                assets[i],
                IERC20Detailed(assets[i]).decimals(),
                assets[i].getSymbol(),
                input[i].supplyCap,
                input[i].borrowCap,
                input[i].baseLTV,
                input[i].liquidationThreshold,
                input[i].liquidationBonus,
                input[i].borrowFactor,
                input[i].borrowingEnabled,
                input[i].VMEXReserveFactor
            );
        }
    }

    /**
     * @dev Configures an existing asset mapping's risk parameters
     * @param asset Address of asset token you want to set
     **/
    function configureReserveAsCollateral(
        address asset,
        uint256 baseLTV,
        uint256 liquidationThreshold,
        uint256 liquidationBonus,
        uint256 supplyCap,
        uint256 borrowCap,
        uint256 borrowFactor
    ) external onlyGlobalAdmin {
        require(isAssetInMappings(asset), "Trying to configure an asset that doesn't exist");
        baseLTV = baseLTV.convertToPercent();
        liquidationThreshold = liquidationThreshold.convertToPercent();
        liquidationBonus = liquidationBonus.convertToPercent();
        borrowFactor = borrowFactor.convertToPercent();
        validateCollateralParams(baseLTV, liquidationThreshold, liquidationBonus);
        //originally, aave used 4 decimals for percentages. VMEX is increasing the number, but the input still only has 4 decimals

        assetMappings[asset].baseLTV = uint64(baseLTV);
        assetMappings[asset].liquidationThreshold = uint64(liquidationThreshold);
        assetMappings[asset].liquidationBonus = uint64(liquidationBonus);
        assetMappings[asset].supplyCap = uint128(supplyCap);
        assetMappings[asset].borrowCap = uint128(borrowCap);
        assetMappings[asset].borrowFactor = uint64(borrowFactor);
        assetMappings[asset].isAllowed = true;
        emit ConfiguredReserves(asset, baseLTV, liquidationThreshold, liquidationBonus, supplyCap, borrowCap, borrowFactor);
    }

    /**
     * @dev Set a existing asset to be allowed
     * @param asset Address of the asset
     * @param isAllowed true if allowed, false otherwise
     **/
    function setAssetAllowed(address asset, bool isAllowed) external onlyGlobalAdmin{
        require(isAssetInMappings(asset), "Trying to set asset that doesn't exist");
        assetMappings[asset].isAllowed = isAllowed;
    }

    /**
     * @dev Gets whether or not the asset is inside the mappings linked list, including disabled assets
     * @param asset Address of asset token you want to check
     **/
    function isAssetInMappings(address asset) view public returns (bool) {
        return assetMappings[asset].exists;
    }

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

    function getAllApprovedTokens() view external returns (address[] memory tokens) {
        //just a view function so this is a bit gassy. Could also store the length but for gas reasons, do not
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
        require(assetMappings[asset].isAllowed, "Asset is not allowed in asset mappings"); //not existing
        return assetMappings[asset];
    }

    function getAssetBorrowable(address asset) view external returns (bool){
        require(assetMappings[asset].isAllowed, "Asset is not allowed in asset mappings"); //not existing
        return assetMappings[asset].borrowingEnabled;
    }

    function getAssetCollateralizable(address asset) view external returns (bool){
        require(assetMappings[asset].isAllowed, "Asset is not allowed in asset mappings"); //not existing
        return assetMappings[asset].liquidationThreshold != 0;
    }

    function getInterestRateStrategyAddress(address asset, uint8 choice) view external returns(address){
        require(assetMappings[asset].isAllowed, "Asset is not allowed in asset mappings"); //not existing
        require(interestRateStrategyAddress[asset][choice]!=address(0), "No interest rate strategy is associated");
        return interestRateStrategyAddress[asset][choice];
    }

    function getAssetType(address asset) view external returns(DataTypes.ReserveAssetType){
        require(assetMappings[asset].isAllowed, "Asset is not allowed in asset mappings"); //not existing
        return DataTypes.ReserveAssetType(assetMappings[asset].assetType);
    }

    function getSupplyCap(address asset) view external returns(uint256){
        require(assetMappings[asset].isAllowed, "Asset is not allowed in asset mappings"); //not existing
        return assetMappings[asset].supplyCap;
    }

    function getBorrowCap(address asset) view external returns(uint256){
        require(assetMappings[asset].isAllowed, "Asset is not allowed in asset mappings"); //not existing
        return assetMappings[asset].borrowCap;
    }

    function getBorrowFactor(address asset) view external returns(uint256){
        require(assetMappings[asset].isAllowed, "Asset is not allowed in asset mappings"); //not existing
        return assetMappings[asset].borrowFactor;
    }

    function getAssetActive(address asset) view external returns(bool){
        return assetMappings[asset].isAllowed;
    }

    function addInterestRateStrategyAddress(address asset, address strategy) external onlyGlobalAdmin {
        require(Address.isContract(strategy), "input strategy is not a contract");
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

    function setCurveMetadata(address[] calldata asset, DataTypes.CurveMetadata[] calldata vars) external onlyGlobalAdmin {
        require(asset.length == vars.length, "Lists not same length");
        for(uint i = 0;i<asset.length;i++){
            curveMetadata[asset[i]] = vars[i];
        }
    }

    function getCurveMetadata(address asset) external view returns (DataTypes.CurveMetadata memory) {
        // require(curveMetadata[asset]._curvePool!=address(0), "Curve doesn't have metadata");
        return curveMetadata[asset];
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

        require(assetMappings[asset].isAllowed, "Asset is not allowed in asset mappings"); //not existing
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
    //TODO: add governance functions to add or edit config
}