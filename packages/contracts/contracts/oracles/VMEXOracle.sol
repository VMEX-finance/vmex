// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {Ownable} from "../dependencies/openzeppelin/contracts/Ownable.sol";
import {IERC20} from "../dependencies/openzeppelin/contracts/IERC20.sol";
import {ILendingPoolAddressesProvider} from "../interfaces/ILendingPoolAddressesProvider.sol";
import {ICurveFi} from "../protocol/strategies/deps/curve/ICurveFi.sol";
import {IPriceOracleGetter} from "../interfaces/IPriceOracleGetter.sol";
import {IChainlinkAggregator} from "../interfaces/IChainlinkAggregator.sol";
import {SafeERC20} from "../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {Initializable} from "../dependencies/openzeppelin/upgradeability/Initializable.sol";
import {AssetMappings} from "../protocol/lendingpool/AssetMappings.sol";
import {DataTypes} from "../protocol/libraries/types/DataTypes.sol";
import {CurveOracle} from "./CurveOracle.sol";
import {IYearnToken} from "./interfaces/IYearnToken.sol";
import {Address} from "../dependencies/openzeppelin/contracts/Address.sol";
/// @title VMEXOracle
/// @author VMEX, with inspiration from Aave
/// @notice Proxy smart contract to get the price of an asset from a price source, with Chainlink Aggregator
///         smart contracts as primary option
/// - If the returned price by a Chainlink aggregator is <= 0, the call is forwarded to a fallbackOracle
/// - Owned by the VMEX governance system, allowed to add sources for assets, replace them
///   and change the fallbackOracle
contract VMEXOracle is Initializable, IPriceOracleGetter, Ownable {
    using SafeERC20 for IERC20;

    event BaseCurrencySet(
        address indexed baseCurrency,
        uint256 baseCurrencyUnit
    );
    event AssetSourceUpdated(address indexed asset, address indexed source);
    event FallbackOracleUpdated(address indexed fallbackOracle);


    ILendingPoolAddressesProvider internal addressProvider;
    AssetMappings internal assetMappings;
    mapping(address => IChainlinkAggregator) private assetsSources;
    IPriceOracleGetter private _fallbackOracle;
    address public BASE_CURRENCY; //removed immutable keyword since
    uint256 public BASE_CURRENCY_UNIT;
    address public constant THREE_POOL = 0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490;
    address public constant ethNative = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    modifier onlyGlobalAdmin() {
        //global admin will be able to have access to other tranches, also can set portion of reserve taken as fee for VMEX admin
        _onlyGlobalAdmin();
        _;
    }

    function _onlyGlobalAdmin() internal view {
        //this contract handles the updates to the configuration
        require(
            addressProvider.getGlobalAdmin() == msg.sender,
            "Caller not global VMEX admin"
        );
    }

    function initialize (
        ILendingPoolAddressesProvider provider
    ) public initializer {
        addressProvider = provider;
        assetMappings = AssetMappings(addressProvider.getAssetMappings());
    }

    function setBaseCurrency(
        address baseCurrency,
        uint256 baseCurrencyUnit
    ) external onlyGlobalAdmin {
        BASE_CURRENCY = baseCurrency;
        BASE_CURRENCY_UNIT = baseCurrencyUnit;
    }

    /// @notice External function called by the Aave governance to set or replace sources of assets
    /// @param assets The addresses of the assets
    /// @param sources The address of the source of each asset
    function setAssetSources(
        address[] calldata assets,
        address[] calldata sources
    ) external onlyGlobalAdmin {
        _setAssetsSources(assets, sources);
    }

    /// @notice Sets the fallbackOracle
    /// - Callable only by the Aave governance
    /// @param fallbackOracle The address of the fallbackOracle
    function setFallbackOracle(address fallbackOracle) external onlyGlobalAdmin {
        _setFallbackOracle(fallbackOracle);
    }

    /// @notice Internal function to set the sources for each asset
    /// @param assets The addresses of the assets
    /// @param sources The address of the source of each asset
    function _setAssetsSources(
        address[] memory assets,
        address[] memory sources
    ) internal {
        require(assets.length == sources.length, "INCONSISTENT_PARAMS_LENGTH");
        for (uint256 i = 0; i < assets.length; i++) {
            assetsSources[assets[i]] = IChainlinkAggregator(sources[i]);
            emit AssetSourceUpdated(assets[i], sources[i]);
        }
    }

    /// @notice Internal function to set the fallbackOracle
    /// @param fallbackOracle The address of the fallbackOracle
    function _setFallbackOracle(address fallbackOracle) internal {
        _fallbackOracle = IPriceOracleGetter(fallbackOracle);
        emit FallbackOracleUpdated(fallbackOracle);
    }

    /// @notice Gets an asset price by address
    /// @param asset The asset address
    function getAssetPrice(address asset)
        public
        view
        override
        returns (uint256)
    {
        if (asset == BASE_CURRENCY) {
            return BASE_CURRENCY_UNIT;
        }

        DataTypes.ReserveAssetType tmp = assetMappings.getAssetType(asset);

        if(tmp==DataTypes.ReserveAssetType.AAVE){
            return getAaveAssetPrice(asset);
        }
        else if(tmp==DataTypes.ReserveAssetType.CURVE || tmp==DataTypes.ReserveAssetType.CURVEV2){
            return getCurveAssetPrice(asset, tmp);
        }
        else if(tmp==DataTypes.ReserveAssetType.YEARN){
            return getYearnPrice(asset);
        }
        require(false, "error determining oracle address");
        return 0;
    }


    function getAaveAssetPrice(address asset) internal view returns (uint256){
        IChainlinkAggregator source = assetsSources[asset];
        if (address(source) == address(0)) {
            return _fallbackOracle.getAssetPrice(asset);
        } else {
            int256 price = IChainlinkAggregator(source).latestAnswer();
            if (price > 0) {
                return uint256(price);
            } else {
                return _fallbackOracle.getAssetPrice(asset);
            }
        }
    }

    function getCurveAssetPrice(
        address asset,
        DataTypes.ReserveAssetType assetType
    ) internal view returns (uint256 price) {
        DataTypes.CurveMetadata memory c = assetMappings.getCurveMetadata(asset);
        
        if (c._curvePool == address(0) || !Address.isContract(c._curvePool)) {
            return _fallbackOracle.getAssetPrice(asset);
        }

        uint256[] memory prices = new uint256[](c._poolSize);

        for (uint256 i = 0; i < c._poolSize; i++) {
            address underlying = ICurveFi(c._curvePool).coins(i);
            if(underlying == ethNative){
                underlying = WETH;
            }
            if (underlying == THREE_POOL) {
                //this is the only underlying in our supported assets that is a curve token instead of aave token
                prices[i] = getCurveAssetPrice(underlying, assetType); //recursion!!
            } else {
                prices[i] = getAaveAssetPrice(underlying);
            }
            require(prices[i] > 0, "underlying oracle encountered an error");
        }

        if(assetType==DataTypes.ReserveAssetType.CURVE){
            price = CurveOracle.get_price_v1(c._curvePool, prices);
        }
        else if(assetType==DataTypes.ReserveAssetType.CURVEV2){
            price = CurveOracle.get_price_v2(c._curvePool, prices);
        }
        //TODO: incorporate backup oracles here?
        // require(price > 0, "Curve oracle encountered an error");
        if(price == 0){
            return _fallbackOracle.getAssetPrice(asset);
        }
        return price;
    }

    function getYearnPrice(address asset) internal view returns (uint256){
        IYearnToken yearnVault = IYearnToken(asset);
        uint256 underlyingPrice = getAssetPrice(yearnVault.token());
        uint256 price = yearnVault.pricePerShare()*underlyingPrice / 10**yearnVault.decimals();
        if(price == 0){
            return _fallbackOracle.getAssetPrice(asset);
        }
        return price;
    }

    //updateTWAP (average O(1))
    //recent +=1 and cover case where it goes over
    //cumulatedPrices[asset][recent] =
    //If block.timestamp - cumulatedPrices[asset][last].timestamp > 24 hours,
    //  then keep increasing last until you find until find cumulatedPrices[asset][last].timestamp < 24 hours (most likely close to O(1))
    function updateTWAP(address asset) public override{
        require(numPrices[asset]<type(uint16).max, "Overflow updateTWAP");
        uint256 currentPrice = getAssetPrice(asset);
        _updateState(asset,currentPrice);
    }

    //getAssetTWAPPrice
    //first call updateTWAP
    //return (cumulatedPrices[asset][recent].cumulatedPrice - cumulatedPrices[asset][last].cumulatedPrice)/(cumulatedPrices[asset][recent].timestamp - cumulatedPrices[asset][last].timestamp)
    function getAssetTWAPPrice(address asset) external view override returns (uint256){
        return _getAssetTWAPPrice(asset, getAssetPrice(asset));
    }

    /// @notice Gets a list of prices from a list of assets addresses
    /// @param assets The list of assets addresses
    function getAssetsPrices(address[] calldata assets)
        external
        view
        returns (uint256[] memory)
    {
        uint256[] memory prices = new uint256[](assets.length);
        for (uint256 i = 0; i < assets.length; i++) {
            prices[i] = getAssetPrice(assets[i]);
        }
        return prices;
    }

    /// @notice Gets the address of the source for an asset address
    /// @param asset The address of the asset
    /// @return address The address of the source
    function getSourceOfAsset(address asset) external view returns (address) {
        return address(assetsSources[asset]);
    }

    /// @notice Gets the address of the fallback oracle
    /// @return address The addres of the fallback oracle
    function getFallbackOracle() external view returns (address) {
        return address(_fallbackOracle);
    }
}
