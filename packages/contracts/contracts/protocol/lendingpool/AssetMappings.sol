// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";

import {DataTypes} from "../libraries/types/DataTypes.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {PercentageMath} from "../libraries/math/PercentageMath.sol";

contract AssetMappings {
    using PercentageMath for uint256;


    ILendingPoolAddressesProvider internal addressesProvider;
    mapping(address => DataTypes.AssetData) internal assetMappings;
    // mapping(address => DataTypes.AssetDataConfiguration) internal assetConfigurationMappings;
    mapping(address => mapping(uint8=>address)) internal interestRateStrategyAddress;
    mapping(address => mapping(uint8=>address)) internal curveStrategyAddress;
    mapping(address => DataTypes.CurveMetadata) internal curveMetadata;

    modifier onlyGlobalAdmin() {
        //global admin will be able to have access to other tranches, also can set portion of reserve taken as fee for VMEX admin
        require(
            addressesProvider.getGlobalAdmin() == msg.sender,
            "Caller not global VMEX admin"
        );
        _;
    }

    constructor(address provider) {
        addressesProvider = ILendingPoolAddressesProvider(provider);
    }

    function setAssetMapping(address[] calldata underlying, DataTypes.AssetData[] calldata input, address[] calldata defaultInterestRateStrategyAddress) external onlyGlobalAdmin {
        require(underlying.length==input.length);

        
        for(uint256 i = 0;i<input.length;i++){
            //validation of the parameters: the LTV can
            //only be lower or equal than the liquidation threshold
            //(otherwise a loan against the asset would cause instantaneous liquidation)
            require(input[i].baseLTV <= input[i].liquidationThreshold, Errors.LPC_INVALID_CONFIGURATION);

            if (input[i].liquidationThreshold != 0) {
                //liquidation bonus must be bigger than 100.00%, otherwise the liquidator would receive less
                //collateral than needed to cover the debt
                require(
                    input[i].liquidationBonus > PercentageMath.PERCENTAGE_FACTOR,
                    Errors.LPC_INVALID_CONFIGURATION
                );

                //if threshold * bonus is less than PERCENTAGE_FACTOR, it's guaranteed that at the moment
                //a loan is taken there is enough collateral available to cover the liquidation bonus
                require(
                    input[i].liquidationThreshold.percentMul(input[i].liquidationBonus) <=
                        PercentageMath.PERCENTAGE_FACTOR,
                    Errors.LPC_INVALID_CONFIGURATION
                );
            } 
            assetMappings[underlying[i]] = input[i];
            interestRateStrategyAddress[underlying[i]][0] = defaultInterestRateStrategyAddress[i];
        }
    }

    

    function getAssetMapping(address underlying) view external returns(DataTypes.AssetData memory){
        require(assetMappings[underlying].isAllowed, "Asset is not allowed in asset mappings"); //not existing
        return assetMappings[underlying];
    }

    function getAssetBorrowable(address asset) view external returns (bool){
        return assetMappings[asset].borrowingEnabled;
    }

    function getInterestRateStrategyAddress(address underlying, uint8 choice) view external returns(address){
        require(assetMappings[underlying].isAllowed, "Asset is not allowed in asset mappings"); //not existing
        return interestRateStrategyAddress[underlying][choice];
    }

    function getAssetType(address asset) view external returns(DataTypes.ReserveAssetType){
        return DataTypes.ReserveAssetType(assetMappings[asset].assetType);
    }

    function getCollateralCap(address asset) view external returns(uint256){
        return assetMappings[asset].collateralCap;
    }

    function setInterestRateStrategyAddress(address underlying, uint8 index, address strategy) external onlyGlobalAdmin {
        interestRateStrategyAddress[underlying][index] = strategy;
    }

    function setCurveStrategyAddress(address underlying, uint8 index, address strategy) external onlyGlobalAdmin {
        curveStrategyAddress[underlying][index] = strategy;
    }

    function getCurveStrategyAddress(address underlying, uint8 index) external view returns (address) {
        require(curveStrategyAddress[underlying][index]!=address(0), "No strategy is associated");
        return curveStrategyAddress[underlying][index];
    }

    function setCurveMetadata(address underlying, DataTypes.CurveMetadata calldata vars) external onlyGlobalAdmin {
        curveMetadata[underlying] = vars;
    }

    function getCurveMetadata(address underlying) external view returns (DataTypes.CurveMetadata memory) {
        require(curveMetadata[underlying].isAllowed, "Strategy doesn't have metadata");
        return curveMetadata[underlying];
    }
    //TODO: add governance functions to add or edit config
}