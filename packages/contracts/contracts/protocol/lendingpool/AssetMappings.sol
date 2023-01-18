// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";

import {DataTypes} from "../libraries/types/DataTypes.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {PercentageMath} from "../libraries/math/PercentageMath.sol";
import {VersionedInitializable} from "../libraries/aave-upgradeability/VersionedInitializable.sol";

contract AssetMappings is VersionedInitializable{
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

    event AssetDataSet(
        address indexed asset,
        uint8 underlyingAssetDecimals,
        string underlyingAssetName,
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

    event AddedCurveStrategyAddress(
        address indexed asset,
        uint256 index,
        address curveStrategyAddress
    );

    event VMEXReserveFactorChanged(address indexed asset, uint256 factor);


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
        uint256 reserveFactor //the value here should only occupy 16 bits
    ) public onlyGlobalAdmin {
        assetMappings[asset].VMEXReserveFactor = reserveFactor;

        emit VMEXReserveFactorChanged(asset, reserveFactor);
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

    //by setting it, you automatically also approve it for the protocol
    function setAssetMapping(address[] calldata underlying, DataTypes.AssetData[] memory input, address[] calldata defaultInterestRateStrategyAddress) external onlyGlobalAdmin {
        require(underlying.length==input.length);


        for(uint256 i = 0;i<input.length;i++){
            //validation of the parameters: the LTV can
            //only be lower or equal than the liquidation threshold
            //(otherwise a loan against the asset would cause instantaneous liquidation)
            {
                uint256 factor = 10**(PercentageMath.NUM_DECIMALS-4);
                input[i].baseLTV *= factor;
                input[i].liquidationThreshold *= factor;
                input[i].liquidationBonus *= factor;
                input[i].borrowFactor *= factor;
                input[i].VMEXReserveFactor *= factor;
            }
            validateCollateralParams(input[i].baseLTV, input[i].liquidationThreshold, input[i].liquidationBonus);

            assetMappings[underlying[i]] = input[i];
            //originally, aave used 4 decimals for percentages. VMEX is increasing the number, but the input still only has 4 decimals


            interestRateStrategyAddress[underlying[i]][0] = defaultInterestRateStrategyAddress[i];
            approvedAssets[numApprovedAssets++] = underlying[i];
            emit AssetDataSet(
                underlying[i],
                input[i].underlyingAssetDecimals,
                input[i].underlyingAssetName,
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

    function configureReserveAsCollateral(
        address asset,
        uint256 baseLTV,
        uint256 liquidationThreshold,
        uint256 liquidationBonus,
        uint256 supplyCap,
        uint256 borrowCap,
        uint256 borrowFactor
    ) external onlyGlobalAdmin {
        uint256 factor = 10**(PercentageMath.NUM_DECIMALS-4);
        baseLTV *= factor;
        liquidationThreshold *= factor;
        liquidationBonus *= factor;
        borrowFactor *= factor;
        validateCollateralParams(baseLTV, liquidationThreshold, liquidationBonus);
        //originally, aave used 4 decimals for percentages. VMEX is increasing the number, but the input still only has 4 decimals

        assetMappings[asset].baseLTV = baseLTV;
        assetMappings[asset].liquidationThreshold = liquidationThreshold;
        assetMappings[asset].liquidationBonus = liquidationBonus;
        assetMappings[asset].supplyCap = supplyCap;
        assetMappings[asset].borrowCap = borrowCap;
        assetMappings[asset].borrowFactor = borrowFactor;
        emit ConfiguredReserves(asset, baseLTV, liquidationThreshold, liquidationBonus, supplyCap, borrowCap, borrowFactor);
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
        emit AddedInterestRateStrategyAddress(
            underlying,
            numInterestRateStrategyAddress[underlying],
            strategy
        );
    }

    function addCurveStrategyAddress(address underlying, address strategy) external onlyGlobalAdmin {
        while(curveStrategyAddress[underlying][numCurveStrategyAddress[underlying]]!=address(0)){
            numCurveStrategyAddress[underlying]++;
        }
        curveStrategyAddress[underlying][numCurveStrategyAddress[underlying]] = strategy;
        emit AddedCurveStrategyAddress(
            underlying,
            numInterestRateStrategyAddress[underlying],
            strategy
        );
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
     **/
    function getParams(address underlying)
        external view
        returns (
            uint256 baseLTV,
            uint256 liquidationThreshold,
            uint256 liquidationBonus,
            uint256 underlyingAssetDecimals,
            uint256 borrowFactor
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