// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";

import {DataTypes} from "../libraries/types/DataTypes.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {PercentageMath} from "../libraries/math/PercentageMath.sol";

contract AssetMappings {
    using PercentageMath for uint256;


    ILendingPoolAddressesProvider internal addressesProvider;
    mapping(uint256 => address) public approvedAssets;
    uint256 public numApprovedAssets;

    mapping(address => DataTypes.AssetData) internal assetMappings;
    // mapping(address => DataTypes.AssetDataConfiguration) internal assetConfigurationMappings;
    mapping(address => mapping(uint8=>address)) internal interestRateStrategyAddress;
    mapping(address => uint8) public numInterestRateStrategyAddress;
    mapping(address => mapping(uint8=>address)) internal curveStrategyAddress;
    mapping(address => uint8) public numCurveStrategyAddress;
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
        numApprovedAssets=0;
        curveMetadata[0xc4AD29ba4B3c580e6D59105FFf484999997675Ff] = DataTypes.CurveMetadata( //tricrypto2
            38,
            3,
            0xD51a44d3FaE010294C616388b506AcdA1bfAAE46
        );
        curveMetadata[0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490] = DataTypes.CurveMetadata( //threepool
            9,
            3,
            0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7
        );
        curveMetadata[0x06325440D014e39736583c165C2963BA99fAf14E] = DataTypes.CurveMetadata( //steth
            25,
            2,
            0xDC24316b9AE028F1497c275EB9192a3Ea0f67022
        );
        curveMetadata[0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC] = DataTypes.CurveMetadata( //fraxusdc
            100,
            2,
            0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2
        );
        curveMetadata[0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B] = DataTypes.CurveMetadata( //frax3crv
            32,
            2,
            0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B
        );


    }

    //by setting it, you automatically also approve it for the protocol
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

                //ex: if liquidation threshold is 50%, that means during liquidation we should have half of the collateral not used to back up loan. If user wants to liquidate and gets 200% liquidation bonus, then they would need 
                //2 times the amount of debt asset they are covering, meaning that they need twice the value of the ccollateral asset. Since liquidation threshold is 50%, this is possible

                //with borrow factors, the liquidation threshold is always less than or equal to what it should be, so this still stands
                require(
                    input[i].liquidationThreshold.percentMul(input[i].liquidationBonus) <=
                        PercentageMath.PERCENTAGE_FACTOR,
                    Errors.LPC_INVALID_CONFIGURATION
                );
            } 
            assetMappings[underlying[i]] = input[i];
            interestRateStrategyAddress[underlying[i]][0] = defaultInterestRateStrategyAddress[i];
            approvedAssets[numApprovedAssets++] = underlying[i];
        }
    }

    function removeAsset(address underlying) external onlyGlobalAdmin{
        for(uint256 i = 0;i<numApprovedAssets;i++){
            if(approvedAssets[i]==underlying){
                for(uint256 j = i;j<numApprovedAssets-1;j++){
                    approvedAssets[j] = approvedAssets[j+1];
                }
                break;
            }
        }
        numApprovedAssets--;
        assetMappings[underlying].isAllowed = false;
    }

    //setAssetMapping

    function getAllApprovedTokens() view external returns(address[] memory tokens){
        tokens = new address[](
            numApprovedAssets
        );

        for (uint256 i = 0; i < numApprovedAssets; i++) {
            tokens[i] = approvedAssets[i];
        }
    }

    function getAssetMapping(address underlying) view external returns(DataTypes.AssetData memory){
        require(assetMappings[underlying].isAllowed, "Asset is not allowed in asset mappings"); //not existing
        return assetMappings[underlying];
    }

    function getAssetBorrowable(address asset) view external returns (bool){
        return assetMappings[asset].borrowingEnabled;
    }

    function getAssetCollateralizable(address asset) view external returns (bool){
        return assetMappings[asset].liquidationThreshold != 0;
    }

    function getInterestRateStrategyAddress(address underlying, uint8 choice) view external returns(address){
        require(assetMappings[underlying].isAllowed, "Asset is not allowed in asset mappings"); //not existing
        require(interestRateStrategyAddress[underlying][choice]!=address(0), "No interest rate strategy is associated");
        return interestRateStrategyAddress[underlying][choice];
    }

    function getAssetType(address asset) view external returns(DataTypes.ReserveAssetType){
        return DataTypes.ReserveAssetType(assetMappings[asset].assetType);
    }

    function getSupplyCap(address asset) view external returns(uint256){
        return assetMappings[asset].supplyCap;
    }
    
    function getBorrowCap(address asset) view external returns(uint256){
        return assetMappings[asset].borrowCap;
    }

    function getBorrowFactor(address asset) view external returns(uint256){
        return assetMappings[asset].borrowFactor;
    }


    function addInterestRateStrategyAddress(address underlying, address strategy) external onlyGlobalAdmin {
        while(interestRateStrategyAddress[underlying][numInterestRateStrategyAddress[underlying]]!=address(0)){
            numInterestRateStrategyAddress[underlying]++;
        }
        interestRateStrategyAddress[underlying][numInterestRateStrategyAddress[underlying]] = strategy;
    }

    function addCurveStrategyAddress(address underlying, address strategy) external onlyGlobalAdmin {
        while(curveStrategyAddress[underlying][numCurveStrategyAddress[underlying]]!=address(0)){
            numCurveStrategyAddress[underlying]++;
        }
        curveStrategyAddress[underlying][numCurveStrategyAddress[underlying]] = strategy;
    }

    function getCurveStrategyAddress(address underlying, uint8 index) external view returns (address) {
        require(assetMappings[underlying].isAllowed, "Asset is not allowed in asset mappings"); //not existing
        require(curveStrategyAddress[underlying][index]!=address(0), "No strategy is associated");
        return curveStrategyAddress[underlying][index];
    }

    function setCurveMetadata(address underlying, DataTypes.CurveMetadata calldata vars) external onlyGlobalAdmin {
        curveMetadata[underlying] = vars;
    }

    function getCurveMetadata(address underlying) external view returns (DataTypes.CurveMetadata memory) {
        require(curveMetadata[underlying]._curvePool!=address(0), "Strategy doesn't have metadata");
        return curveMetadata[underlying];
    }


    /**
     * @dev Gets the configuration paramters of the reserve
     * @param underlying Address of underlying token you want params for
     * @return The state params representing ltv, liquidation threshold, liquidation bonus, the reserve decimals, and NEW: the borrow factor
     **/
    function getParams(address underlying)
        external view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            assetMappings[underlying].baseLTV,
            assetMappings[underlying].liquidationThreshold,
            assetMappings[underlying].liquidationBonus,
            assetMappings[underlying].underlyingAssetDecimals,
            assetMappings[underlying].borrowFactor
        );
    }

    function getDecimals(address underlying) external view
        returns (
            uint256
        ){

        return assetMappings[underlying].underlyingAssetDecimals;
    }
    //TODO: add governance functions to add or edit config
}