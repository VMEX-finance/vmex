// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {Ownable} from "../dependencies/openzeppelin/contracts/Ownable.sol";
import {IERC20} from "../dependencies/openzeppelin/contracts/IERC20.sol";

import {IPriceOracleGetter} from "../interfaces/IPriceOracleGetter.sol";
import {SafeERC20} from "../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {AaveOracle} from "../misc/AaveOracle.sol";
import {ILendingPoolAddressesProvider} from "../interfaces/ILendingPoolAddressesProvider.sol";
import {ICurveOracle} from "./interfaces/ICurveOracle.sol";

// import {IPriceOracleGetter} from "../interfaces/IPriceOracleGetter.sol";
// import {ICurveAddressProvider} from "./interfaces/ICurveAddressProvider.sol";
// import {ICurveRegistry} from "./interfaces/ICurveRegistry.sol";

/// @title AaveOracle
/// @author Aave
/// @notice Proxy smart contract to get the price of an asset from a price source, with Chainlink Aggregator
///         smart contracts as primary option
/// - If the returned price by a Chainlink aggregator is <= 0, the call is forwarded to a fallbackOracle
/// - Owned by the Aave governance system, allowed to add sources for assets, replace them
///   and change the fallbackOracle

//TODO: this contract needs the addressprovider contract to get the addressprovider of the Curve pools (we don't know what network yet)
contract CurveWrapper is IPriceOracleGetter, Ownable {
    using SafeERC20 for IERC20;

    event BaseCurrencySet(
        address indexed baseCurrency,
        uint256 baseCurrencyUnit
    );
    event AssetSourceUpdated(address indexed asset, address indexed source);
    event FallbackOracleUpdated(address indexed fallbackOracle);

    ILendingPoolAddressesProvider internal _addressesProvider;
    IPriceOracleGetter private _fallbackOracle;
    address public immutable BASE_CURRENCY;
    uint256 public immutable BASE_CURRENCY_UNIT;
    mapping(address => address) internal lpTokenToPool;
    mapping(address => uint256) internal numCoins; //pool address to number of coins
    //underlyingCoins[tricrypto2 pool add][0] gets the address of the first underlying coin
    mapping(address => mapping(uint256 => address)) internal underlyingCoins;

    /// @notice Constructor
    /// @param addressProvider The address of the vmex address provider (not the curve address provider)
    /// @param fallbackOracle The address of the fallback oracle to use if the data of an
    ///        aggregator is not consistent
    /// @param baseCurrency the base currency used for the price quotes. If USD is used, base currency is 0x0
    /// @param baseCurrencyUnit the unit of the base currency
    constructor(
        address addressProvider,
        address fallbackOracle, //this will likely not be set for the Curve wrappers, maybe can use the fallback oracles from AaveOracle, but if the pool price cannot be determined then it doesn't matter if the other asset prices can be determined
        address baseCurrency,
        uint256 baseCurrencyUnit
    ) public {
        _addressesProvider = ILendingPoolAddressesProvider(addressProvider);
        _setFallbackOracle(fallbackOracle);
        BASE_CURRENCY = baseCurrency;
        BASE_CURRENCY_UNIT = baseCurrencyUnit;
        initializeMappings();

        emit BaseCurrencySet(baseCurrency, baseCurrencyUnit);
    }

    function setAddressProvider(address addressProvider) external onlyOwner {
        _addressesProvider = ILendingPoolAddressesProvider(addressProvider);
    }

    function initializeMappings() internal {
        //Tricrypto2
        lpTokenToPool[
            0xc4AD29ba4B3c580e6D59105FFf484999997675Ff
        ] = 0xD51a44d3FaE010294C616388b506AcdA1bfAAE46; //Tricrypto2
        numCoins[0xD51a44d3FaE010294C616388b506AcdA1bfAAE46] = 3; //3 coins in tricrypto2
        underlyingCoins[0xD51a44d3FaE010294C616388b506AcdA1bfAAE46][
            0
        ] = 0xdAC17F958D2ee523a2206206994597C13D831ec7; //first underlying coin is USDT
        underlyingCoins[0xD51a44d3FaE010294C616388b506AcdA1bfAAE46][
            1
        ] = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599; //first underlying coin is WBTC
        underlyingCoins[0xD51a44d3FaE010294C616388b506AcdA1bfAAE46][
            2
        ] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; //first underlying coin is WETH
    }

    /// @notice Sets the fallbackOracle
    /// - Callable only by the Aave governance
    /// @param fallbackOracle The address of the fallbackOracle
    function setFallbackOracle(address fallbackOracle) external onlyOwner {
        _setFallbackOracle(fallbackOracle);
    }

    /// @notice Internal function to set the fallbackOracle
    /// @param fallbackOracle The address of the fallbackOracle
    function _setFallbackOracle(address fallbackOracle) internal {
        _fallbackOracle = IPriceOracleGetter(fallbackOracle);
        emit FallbackOracleUpdated(fallbackOracle);
    }

    /// @notice Gets an asset price by address
    /// @param asset The asset address
    function getAssetPrice(
        address asset //this will be the token address, not the pool address
    ) public view override returns (uint256) {
        if (asset == BASE_CURRENCY) {
            return BASE_CURRENCY_UNIT;
        }
        //need to import the curve address provider interface X
        // ICurveAddressProvider provider =
        //     ICurveAddressProvider(_addressesProvider.getCurveAddressProvider());
        //need to import the registry interface Y
        // ICurveRegistry registry = ICurveRegistry(provider.get_registry()); //registry contains the addresses for the pools

        address pool = lpTokenToPool[asset]; //asset is the LP token

        //TODO: check if we should use underlying or not. [0] is not underlying, [1] includes underlying
        uint256 num_coins = numCoins[pool];

        uint256[] memory prices = new uint256[](num_coins);

        IPriceOracleGetter aave_oracle = IPriceOracleGetter(
            _addressesProvider.getAavePriceOracle()
        );

        for (uint256 i = 0; i < num_coins; i++) {
            address underlying = underlyingCoins[pool][i];
            require(underlying != address(0), "underlying token is null");
            prices[i] = aave_oracle.getAssetPrice(underlying);
            require(prices[i] > 0, "aave oracle encountered an error");
        }

        ICurveOracle oracle = ICurveOracle(
            _addressesProvider.getCurvePriceOracle()
        );

        uint256 price = oracle.get_price(pool, prices);
        //TODO: incorporate backup oracles here?
        require(price > 0, "Curve oracle encountered an error");
        return price;
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

    /// @notice Gets the address of the fallback oracle
    /// @return address The addres of the fallback oracle
    function getFallbackOracle() external view returns (address) {
        return address(_fallbackOracle);
    }
}