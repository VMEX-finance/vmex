// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.19;

import "forge-std/Test.sol";
import "../contracts/protocol/oracles/VMEXOracle.sol"; 
import {ILendingPool} from "../contracts/interfaces/ILendingPool.sol";
import {ILendingPoolAddressesProvider} from "../contracts/interfaces/ILendingPoolAddressesProvider.sol";


interface IVmexOracle {
	function getReaperPrice(address asset) external view returns (uint256); 
}


contract ReaperOracleTest is Test {

	uint256 optimismFork;
    ILendingPool lendingPool = ILendingPool(0x60F015F66F3647168831d31C7048ca95bb4FeaF9);
    ILendingPoolAddressesProvider addressesProvider =
        ILendingPoolAddressesProvider(0xFC2748D74703cf6f2CE8ca9C8F388C3DAB1856f0);
	
	VMEXOracle vmexOracle; 

    address MULTISIG = 0x599e1DE505CfD6f10F64DD7268D856831f61627a;

	function setUp() public {
        optimismFork = vm.createFork(vm.envString("OPTIMISM_RPC_URL"));
        vm.selectFork(optimismFork);
		
        vmexOracle = new VMEXOracle();
	
        vm.prank(MULTISIG);
        addressesProvider.setPriceOracle(address(vmexOracle));
	}

	function testReaperPrice() public {
		address reaperVault = 0x1bAd45E92DCe078Cf68C2141CD34f54A02c92806; 
		uint256 price = vmexOracle.getReaperPrice(reaperVault); 	

		console.log("price of vault token", price); 
	}
}
