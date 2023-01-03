// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {IUniswapV3Pool} from "./uniswapv08/v3-core/interfaces/IUniswapV3Pool.sol"; 
import {OracleLibrary} from "./uniswapv08/v3-periphery/OracleLibrary.sol"; 
import {IPriceOracleGetter} from "../interfaces/IPriceOracleGetter.sol";
import {Ownable} from "../dependencies/openzeppelin/contracts/Ownable.sol";
import {IERC20Detailed} from "../dependencies/openzeppelin/contracts/IERC20Detailed.sol";

// import "hardhat/console.sol";
//this contract needs to calculate a price for a given LP token and return a 3 min TWAP
contract BaseUniswapOracle is IPriceOracleGetter, Ownable {

    event AssetSourceUpdated(address indexed asset, address indexed source, uint8 token_to_price);
	mapping(address=>IUniswapV3Pool) private assetsSources; 
	mapping(address=>uint8) private token_to_price; 

	uint32 public constant WINDOW_SIZE = 30 minutes; 
    address public immutable BASE_CURRENCY;
    uint256 public immutable BASE_CURRENCY_UNIT;
	
	//set the pool for each oracle here to have a feed
	//@param pool, the address of the univ3 pool
	//@param token_to_price, specify which coin is denominated in what order ie. ETH/DAI price would be 1, token0 priced in terms of token1
	constructor(
        address[] memory assets,
        address[] memory sources, 
		uint8[] memory _token_to_price,
        address baseCurrency,
        uint256 baseCurrencyUnit
	) {
		_setAssetsSources(assets,sources,_token_to_price);
        BASE_CURRENCY = baseCurrency;
        BASE_CURRENCY_UNIT = baseCurrencyUnit;
		
		//if returns are greater than 18 use POSTIVE if less use NEGATIVE 
		//i.e. ETH returns a 6 digit decimal from uni pools, so we scale by -12 to get a WAD fixed number
        //scale_factor = uint128(10**IERC20Detailed());		
		
	}	

	/// @notice External function called by the Aave governance to set or replace sources of assets
    /// @param assets The addresses of the assets
    /// @param sources The address of the source of each asset
    function setAssetSources(
        address[] calldata assets,
        address[] calldata sources, 
		uint8[] memory _token_to_price
    ) external onlyOwner {
        _setAssetsSources(assets, sources, _token_to_price);
    }

	/// @notice Internal function to set the sources for each asset
    /// @param assets The addresses of the assets
    /// @param sources The address of the source of each asset
    function _setAssetsSources(
        address[] memory assets,
        address[] memory sources, 
		uint8[] memory _token_to_price
    ) internal {
        require(assets.length == sources.length, "INCONSISTENT_PARAMS_LENGTH");
        require(assets.length == _token_to_price.length, "INCONSISTENT_PARAMS_LENGTH");

        for (uint256 i = 0; i < assets.length; i++) {
			require(_token_to_price[i] == 0 || _token_to_price[i] == 1, "must be 0 or 1"); 
            assetsSources[assets[i]] = IUniswapV3Pool(sources[i]);
			token_to_price[assets[i]] = _token_to_price[i];
            emit AssetSourceUpdated(assets[i], sources[i], _token_to_price[i]);
        }
    }
	
	//returns the latest price in a WAD fixed number 	
	function getAssetPrice(address asset) public view override returns(uint256) {
        if (asset == BASE_CURRENCY) {
            return BASE_CURRENCY_UNIT;
		}
		return getAssetPriceForTime(asset, WINDOW_SIZE);
	}


    function updateTWAP(address asset) external override{
		//no-op
	}

    function getAssetTWAPPrice(address asset) external view override returns (uint256){
		return getAssetPriceForTime(asset, 24 hours);
	}

	function getAssetPriceForTime(address asset, uint32 time) internal view returns (uint256) {
		// console.log("Address of pool: ", address(assetsSources[asset]));
		int24 twap_tick = OracleLibrary.consult(address(assetsSources[asset]), time); 	
		address token0 = assetsSources[asset].token0(); 
		address token1 = assetsSources[asset].token1(); 

		uint256 price; 
		uint128 scale_factor = uint128(10**IERC20Detailed(asset).decimals());
		if (token_to_price[asset] == 1) {
			price = OracleLibrary.getQuoteAtTick(
				twap_tick,
				scale_factor, 
				token1, //price token 1 in terms of token0  eg. ETH/DAI or DAI/USDC = 1 eth = 1200 dai
				token0
			); 
		} else {
			price = OracleLibrary.getQuoteAtTick(
				twap_tick,
				scale_factor, 
				token0, //price token 0 in terms of token1 eg. DAI/ETH = 1 dai = 0.00007 eth
				token1 
			);		
		}
		return price; 
	}

}
