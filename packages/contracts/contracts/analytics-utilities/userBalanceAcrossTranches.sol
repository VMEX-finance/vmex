pragma solidity >=0.8.0;
import {ILendingPool} from "../interfaces/ILendingPool.sol";
import {IERC20} from "../dependencies/openzeppelin/contracts/IERC20.sol";
import {WalletBalanceProvider} from "../misc/WalletBalanceProvider.sol";
import {ILendingPoolAddressesProvider} from "../interfaces/ILendingPoolAddressesProvider.sol";
import {LendingPoolConfigurator} from "../protocol/lendingpool/LendingPoolConfigurator.sol";


contract UserBalanceAcrossTranches {

    constructor(address user, address provider, address payable balProvider) {
        address configurator = ILendingPoolAddressesProvider(provider).getLendingPoolConfigurator();
        uint64 totalTranches = LendingPoolConfigurator(configurator).totalTranches();
	address[][] memory _addrBank = new address[][](totalTranches);
	uint256[][] memory _balBank = new uint256[][](totalTranches);
        for(uint64 i = 0; i < totalTranches; i++) {
            (address[] memory reserves, uint256[] memory balances) = (queryTrancheBalances(i, provider, user, balProvider));
	    _addrBank[i] = reserves;
	    _balBank[i] = balances;
        } 

        bytes memory returnData = abi.encode(_addrBank, _balBank);
    	assembly {
                return(add(0x20, returnData), mload(returnData))
        }

    }
    function getType() 
	public
   	view
    returns(address[][] memory _addresses, uint256[][] memory _balances){}

    function queryTrancheBalances(uint64 trancheId, address addressProvider, address user, address payable balProvider) 
       internal
       view
       returns (address[] memory, uint256[] memory) 
    {
       return WalletBalanceProvider(balProvider).getUserWalletBalances(addressProvider, user, trancheId);
    }
}

