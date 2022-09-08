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

        //3pool
        lpTokenToPool[
            0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490
        ] = 0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7;
        numCoins[0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7] = 3; //3 coins in tricrypto2
        underlyingCoins[0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7][
            0
        ] = 0x6B175474E89094C44Da98b954EedeAC495271d0F; //first underlying coin is DAI
        underlyingCoins[0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7][
            1
        ] = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; //first underlying coin is USDC
        underlyingCoins[0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7][
            2
        ] = 0xdAC17F958D2ee523a2206206994597C13D831ec7; //first underlying coin is USDT

        //StethEth
        lpTokenToPool[
            0x06325440D014e39736583c165C2963BA99fAf14E
        ] = 0xDC24316b9AE028F1497c275EB9192a3Ea0f67022;
        numCoins[0xDC24316b9AE028F1497c275EB9192a3Ea0f67022] = 2; //2 coins in StethEth
        underlyingCoins[0xDC24316b9AE028F1497c275EB9192a3Ea0f67022][
            0
        ] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; //first underlying coin is WETH
        underlyingCoins[0xDC24316b9AE028F1497c275EB9192a3Ea0f67022][
            1
        ] = 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84; //first underlying coin is Steth

        //fraxusdc
        lpTokenToPool[
            0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC
        ] = 0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2;
        numCoins[0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2] = 2; //2 coins in fraxusdc
        underlyingCoins[0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2][
            0
        ] = 0x853d955aCEf822Db058eb8505911ED77F175b99e; //first underlying coin is frax
        underlyingCoins[0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2][
            1
        ] = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; //first underlying coin is usdc

        //frax3crv
        lpTokenToPool[
            0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B
        ] = 0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B;
        numCoins[0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B] = 2; //2 coins in frax + 3crv
        underlyingCoins[0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B][
            0
        ] = 0x853d955aCEf822Db058eb8505911ED77F175b99e; //first underlying coin is frax
        underlyingCoins[0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B][
            1
        ] = 0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490; //first underlying coin is 3crv
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
