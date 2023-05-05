// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {Ownable} from "../../dependencies/openzeppelin/contracts/Ownable.sol";
import {IERC20} from "../../dependencies/openzeppelin/contracts/IERC20.sol";
import {ILendingPoolAddressesProvider} from "../../interfaces/ILendingPoolAddressesProvider.sol";
import {ICurvePool} from "../../interfaces/ICurvePool.sol";
import {IPriceOracleGetter} from "../../interfaces/IPriceOracleGetter.sol";
import {IChainlinkPriceFeed} from "../../interfaces/IChainlinkPriceFeed.sol";
import {IChainlinkAggregator} from "../../interfaces/IChainlinkAggregator.sol";
import {SafeERC20} from "../../dependencies/openzeppelin/contracts/SafeERC20.sol";
import {IERC20Detailed} from "../../dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import {Initializable} from "../../dependencies/openzeppelin/upgradeability/Initializable.sol";
import {IAssetMappings} from "../../interfaces/IAssetMappings.sol";
import {DataTypes} from "../libraries/types/DataTypes.sol";
import {CurveOracle} from "./CurveOracle.sol";
import {IYearnToken} from "../../interfaces/IYearnToken.sol";
import {Address} from "../../dependencies/openzeppelin/contracts/Address.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {Helpers} from "../libraries/helpers/Helpers.sol";
import {AggregatorV3Interface} from "../../interfaces/AggregatorV3Interface.sol";
import {IBeefyVault} from "../../interfaces/IBeefyVault.sol";
import {IVeloPair} from "../../interfaces/IVeloPair.sol";
import {IBalancer} from "../../interfaces/IBalancer.sol";
import {IVault} from "../../interfaces/IVault.sol";
import {VelodromeOracle} from "./VelodromeOracle.sol";
import {BalancerOracle} from "./BalancerOracle.sol";

/// @title VMEXOracle
/// @author VMEX, with inspiration from Aave
/// @notice Proxy smart contract to get the price of an asset from a price source, with Chainlink Aggregator
///         smart contracts as primary option
/// - If the returned price by a Chainlink aggregator is <= 0, the call is forwarded to a fallbackOracle
/// - Owned by the VMEX governance system, allowed to add sources for assets, replace them
///   and change the fallbackOracle
contract VMEXOracle is Initializable, IPriceOracleGetter, Ownable {
    using SafeERC20 for IERC20;

    ILendingPoolAddressesProvider internal _addressProvider;
    IAssetMappings internal _assetMappings;
    mapping(address => IChainlinkPriceFeed) private _assetsSources;
    IPriceOracleGetter private _fallbackOracle;
    mapping(uint256 => AggregatorV3Interface) public sequencerUptimeFeeds;

    address public BASE_CURRENCY; //removed immutable keyword since
    uint256 public BASE_CURRENCY_UNIT;
    string public BASE_CURRENCY_STRING;

    address public constant ETH_NATIVE = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address public WETH;
    uint256 public constant SECONDS_PER_DAY = 1 days;
    uint256 private constant GRACE_PERIOD_TIME = 1 hours;

    modifier onlyGlobalAdmin() {
        //global admin will be able to have access to other tranches, also can set portion of reserve taken as fee for VMEX admin
        _onlyGlobalAdmin();
        _;
    }

    function _onlyGlobalAdmin() internal view {
        //this contract handles the updates to the configuration
        require(
            _addressProvider.getGlobalAdmin() == msg.sender,
            Errors.CALLER_NOT_GLOBAL_ADMIN
        );
    }

    function initialize (
        ILendingPoolAddressesProvider provider
    ) public initializer {
        _addressProvider = provider;
        _assetMappings = IAssetMappings(_addressProvider.getAssetMappings());
    }

    /**
     * @dev Sets the base currency that all other assets are priced based on. Can only be set once
     * @param baseCurrency The address of the base currency
     * @param baseCurrencyUnit What price the base currency is. Usually this is just how many decimals the base currency has
     * @param baseCurrencyString "ETH" or "USD" for purposes of checking correct denomination
     **/
    function setBaseCurrency(
        address baseCurrency,
        uint256 baseCurrencyUnit,
        string calldata baseCurrencyString
    ) external onlyGlobalAdmin {
        require(BASE_CURRENCY == address(0), Errors.VO_BASE_CURRENCY_SET_ONLY_ONCE);
        BASE_CURRENCY = baseCurrency;
        BASE_CURRENCY_UNIT = baseCurrencyUnit;
        BASE_CURRENCY_STRING = baseCurrencyString;
    }

    /**
     * @dev External function called by the VMEX governance to set or replace sources of assets
     * @param assets The addresses of the assets
     * @param sources The address of the source of each asset
     **/
    function setAssetSources(
        address[] calldata assets,
        address[] calldata sources
    ) external onlyGlobalAdmin {
        require(assets.length == sources.length, Errors.ARRAY_LENGTH_MISMATCH);
        for (uint256 i = 0; i < assets.length; i++) {
            require(Helpers.compareSuffix(IChainlinkPriceFeed(sources[i]).description(), BASE_CURRENCY_STRING), Errors.VO_BAD_DENOMINATION);
            _assetsSources[assets[i]] = IChainlinkPriceFeed(sources[i]);
            emit AssetSourceUpdated(assets[i], sources[i]);
        }
    }

    /**
     * @dev Sets the fallback oracle. Callable only by the VMEX governance
     * @param fallbackOracle The address of the fallbackOracle
     **/
    function setFallbackOracle(address fallbackOracle) external onlyGlobalAdmin {
        _fallbackOracle = IPriceOracleGetter(fallbackOracle);
        emit FallbackOracleUpdated(fallbackOracle);
    }

    function setWETH(
        address weth
    ) external onlyGlobalAdmin {
        require(WETH == address(0), Errors.VO_WETH_SET_ONLY_ONCE);
        WETH = weth;
    }

    /**
     * @dev Sets the sequencerUptimeFeed. Callable only by the VMEX governance
     * @param sequencerUptimeFeed The address of the sequencerUptimeFeed
     **/
    function setSequencerUptimeFeed(uint256 chainId, address sequencerUptimeFeed) external onlyGlobalAdmin {
        sequencerUptimeFeeds[chainId] = AggregatorV3Interface(sequencerUptimeFeed);
        emit SequencerUptimeFeedUpdated(chainId, sequencerUptimeFeed);
    }

    /**
     * @dev Checks if sequencer is up. If not, reverts. If sequencer came back online, need to wait for the grace period before resuming
     **/
    function checkSequencerUp() internal view {
        AggregatorV3Interface seqUpFeed = sequencerUptimeFeeds[block.chainid];

        if(address(seqUpFeed)!=address(0)) {
            // prettier-ignore
            (
                /*uint80 roundID*/,
                int256 answer,
                uint256 startedAt,
                /*uint256 updatedAt*/,
                /*uint80 answeredInRound*/
            ) = seqUpFeed.latestRoundData();

            // Answer == 0: Sequencer is up
            // Answer == 1: Sequencer is down
            bool isSequencerUp = answer == 0;
            require(isSequencerUp, Errors.VO_SEQUENCER_DOWN);

            // Make sure the grace period has passed after the sequencer is back up.
            uint256 timeSinceUp = block.timestamp - startedAt;

            require(timeSinceUp > GRACE_PERIOD_TIME, Errors.VO_SEQUENCER_GRACE_PERIOD_NOT_OVER);
        }
    }

    /**
     * @dev Gets an asset price by address. 
     * Note the result should always have 18 decimals if using ETH as base. If using USD as base, there will be 8 decimals
     * @param asset The asset address
     **/
    function getAssetPrice(address asset)
        public
        override
        returns (uint256)
    {
        if (asset == BASE_CURRENCY) {
            return BASE_CURRENCY_UNIT;
        }

        checkSequencerUp();

        DataTypes.ReserveAssetType tmp = _assetMappings.getAssetType(asset);

        if(tmp==DataTypes.ReserveAssetType.AAVE){
            return getOracleAssetPrice(asset);
        }
        else if(tmp==DataTypes.ReserveAssetType.CURVE || tmp==DataTypes.ReserveAssetType.CURVEV2){
            return getCurveAssetPrice(asset, tmp);
        }
        else if(tmp==DataTypes.ReserveAssetType.YEARN){
            return getYearnPrice(asset);
        }
        else if(tmp==DataTypes.ReserveAssetType.BEEFY) {
            return getBeefyPrice(asset);
        }
        else if(tmp==DataTypes.ReserveAssetType.VELODROME) {
            return getVeloPrice(asset);
        }
        else if(tmp == DataTypes.ReserveAssetType.BEETHOVEN) {
            return getBeethovenPrice(asset);
        }
        revert(Errors.VO_ORACLE_ADDRESS_NOT_FOUND);
    }

    /**
     * @dev Gets an asset price for an asset with a chainlink aggregator
     * @param asset The asset address
     **/
    function getOracleAssetPrice(address asset) internal returns (uint256){
        IChainlinkPriceFeed source = _assetsSources[asset];
        if (address(source) == address(0)) {
            return _fallbackOracle.getAssetPrice(asset);
        } else {
            (
                /* uint80 roundID */,
                int256 price,
                /*uint startedAt*/,
                uint256 updatedAt,
                /*uint80 answeredInRound*/
            ) = IChainlinkPriceFeed(source).latestRoundData();
            IChainlinkAggregator aggregator = IChainlinkAggregator(IChainlinkPriceFeed(source).aggregator());
            if (price > int256(aggregator.minAnswer()) && price < int256(aggregator.maxAnswer()) && block.timestamp - updatedAt < SECONDS_PER_DAY) {
                return uint256(price);
            } else {
                return _fallbackOracle.getAssetPrice(asset);
            }
        }
    }

    /**
     * @dev Gets an asset price for an asset with a chainlink aggregator
     * @param asset The asset address
     **/
    function getCurveAssetPrice(
        address asset,
        DataTypes.ReserveAssetType assetType
    ) internal returns (uint256 price) {
        DataTypes.CurveMetadata memory c = _assetMappings.getCurveMetadata(asset);

        if (!Address.isContract(c._curvePool)) {
            return _fallbackOracle.getAssetPrice(asset);
        }

        uint256[] memory prices = new uint256[](c._poolSize);
        uint8[] memory decimals = new uint8[](c._poolSize);

        for (uint256 i = 0; i < c._poolSize; i++) {
            address underlying = ICurvePool(c._curvePool).coins(i);
            if(underlying == ETH_NATIVE){
                underlying = WETH;
            }
            prices[i] = getAssetPrice(underlying); //handles case where underlying is curve too.
            decimals[i] = IERC20Detailed(underlying).decimals();
            require(prices[i] > 0, Errors.VO_UNDERLYING_FAIL);
        }

        if(assetType==DataTypes.ReserveAssetType.CURVE){
            price = CurveOracle.get_price_v1(c._curvePool, prices, decimals, c._checkReentrancy);
        }
        else if(assetType==DataTypes.ReserveAssetType.CURVEV2){
            price = CurveOracle.get_price_v2(c._curvePool, prices, c._checkReentrancy);
        }
        if(price == 0){
            return _fallbackOracle.getAssetPrice(asset);
        }
        return price;
    }

    /**
     * @dev Gets an asset price for a velodrome token
     * @param asset The asset address
     **/
    function getVeloPrice(
        address asset
    ) internal returns (uint256 price) {
        //assuming we only support velodrome pairs (exactly two assets)
        uint256[] memory prices = new uint256[](2);

        (address token0, address token1) = IVeloPair(asset).tokens();

        if(token0 == ETH_NATIVE){
            token0 = WETH;
        }
        prices[0] = getAssetPrice(token0); //handles case where underlying is curve too.
        require(prices[0] > 0, Errors.VO_UNDERLYING_FAIL);

        if(token1 == ETH_NATIVE){
            token1 = WETH;
        }
        prices[1] = getAssetPrice(token1); //handles case where underlying is curve too.
        require(prices[1] > 0, Errors.VO_UNDERLYING_FAIL);

        price = VelodromeOracle.get_lp_price(asset, prices);
        if(price == 0){
            return _fallbackOracle.getAssetPrice(asset);
        }
        return price;
    }

    /**
     * @dev Gets an asset price for a beethoven or balancer token
     * @param asset The asset address
     **/
    function getBeethovenPrice(
        address asset
    ) internal returns (uint256) {
        // get the underlying assets
        IVault vault = IBalancer(asset).getVault();
        bytes32 poolId = IBalancer(asset).getPoolId();


        (
            IERC20[] memory tokens,
            uint256[] memory _balances,
        ) = vault.getPoolTokens(poolId);

        uint256 i = 0;

        if(address(tokens[0]) == asset) { //boosted tokens first token is itself
            i = 1;
        }

        uint256[] memory prices = new uint256[](tokens.length-i);
        uint8[] memory decimals = new uint8[](tokens.length-i);
        uint256[] memory balances = new uint256[](tokens.length-i);

        uint256 j = 0;

        while(i<tokens.length) {
            address token = address(tokens[i]);
            if(token == ETH_NATIVE){
                token = WETH;
            }
            prices[j] = getAssetPrice(token);
            require(prices[j] > 0, Errors.VO_UNDERLYING_FAIL);
            balances[j] = _balances[i];
            decimals[j] = IERC20Detailed(token).decimals();
            i++;
            j++;
        }

        DataTypes.BeethovenMetadata memory md = _assetMappings.getBeethovenMetadata(asset);

        uint256 price = BalancerOracle.get_lp_price(
            asset,
            prices,
            balances,
            decimals,
            md._typeOfPool,
            md._legacy
        );

        if(price == 0){
            return _fallbackOracle.getAssetPrice(asset);
        }
        return price;
    }

    /**
     * @dev Gets an asset price for a yearn token
     * @param asset The asset address
     **/
    function getYearnPrice(address asset) internal returns (uint256){
        IYearnToken yearnVault = IYearnToken(asset);
        uint256 underlyingPrice = getAssetPrice(yearnVault.token()); //getAssetPrice() will always have 18 decimals for Aave and Curve tokens (prices in eth), or 8 decimals if prices in USD
        //note: pricePerShare has decimals equal to underlying tokens (ex: yvUSDC has 6 decimals). By dividing by 10**yearnVault.decimals(), we keep the decimals of underlyingPrice which is 18 decimals for eth base, 8 for usd base.
        uint256 price = yearnVault.pricePerShare()*underlyingPrice / 10**yearnVault.decimals();
        if(price == 0){
            return _fallbackOracle.getAssetPrice(asset);
        }
        return price;
    }

    /**
     * @dev Gets an asset price for a beefy token
     * @param asset The asset address
     **/
	function getBeefyPrice(address asset) internal returns (uint256) {
        IBeefyVault beefyVault = IBeefyVault(asset);
        uint256 underlyingPrice = getAssetPrice(beefyVault.want());
        uint256 price = beefyVault.getPricePerFullShare()*underlyingPrice / 10**beefyVault.decimals();
        if(price == 0){
            return _fallbackOracle.getAssetPrice(asset);
        }
        return price;
	}

    /// @notice Gets a list of prices from a list of assets addresses
    /// @param assets The list of assets addresses
    function getAssetsPrices(address[] calldata assets)
        external
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
        return address(_assetsSources[asset]);
    }

    /// @notice Gets the address of the fallback oracle
    /// @return address The addres of the fallback oracle
    function getFallbackOracle() external view returns (address) {
        return address(_fallbackOracle);
    }
}
