import { AaveProtocolDataProvider } from "../misc/AaveProtocolDataProvider.sol";
import { LendingPoolConfigurator } from "../protocol/lendingpool/LendingPoolConfigurator.sol";
import { ILendingPoolAddressesProvider } from "../interfaces/ILendingPoolAddressesProvider.sol";
import { IERC20 } from "../dependencies/openzeppelin/contracts/IERC20.sol";
import { IAToken } from "../interfaces/IAToken.sol";

contract QueryTopTranches {
	constructor(address provider, address dataProvider) {
		address configurator = ILendingPoolAddressesProvider(provider).getLendingPoolConfigurator();
		uint64 totalTranches = LendingPoolConfigurator(configurator).totalTranches();
		uint256[] memory trancheArray = new uint256[](totalTranches);
		for (uint64 i = 0; i < totalTranches; i++) {
			trancheArray[i] = getTokenData(i, dataProvider);
		}

		bytes memory returnData = abi.encode(trancheArray);
		assembly {
			return(add(0x20, returnData), mload(returnData))
		}
	}
	function getType() public view returns(uint256[] memory trancheBalances){}

	function getTokenData(uint64 tranche, address _dataProvider) private view returns(uint256) {
		AaveProtocolDataProvider.TokenData[] memory data = AaveProtocolDataProvider(_dataProvider).getAllATokens(tranche);
		return getUnderlyingToken(data);
	}

	function computeBalanceOfTranche(address[] memory _atokens, address[] memory _vtokens) private view returns(uint256) {
		uint256 acc = 0;
		for (uint i = 0; i < _atokens.length; i++) {
			acc += IERC20(_atokens[i]).balanceOf(_vtokens[i]);
		}
		return acc;
	}

	function getUnderlyingToken(AaveProtocolDataProvider.TokenData[] memory tokens) private view returns(uint256) {
		address [] memory _atokens = new address[](tokens.length);
		address[] memory _vtokens = new address[](tokens.length);
		for (uint i = 0; i < tokens.length; i++) {
			_atokens[i] = (IAToken(tokens[i].tokenAddress).UNDERLYING_ASSET_ADDRESS());
			_vtokens[i] = (tokens[i].tokenAddress);
		}
		return computeBalanceOfTranche(_atokens, _vtokens);
	}
}
