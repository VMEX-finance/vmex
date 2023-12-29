// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.19;

import {Test, console2} from "forge-std/Test.sol";
import {LendingPool} from "../contracts/protocol/lendingpool/LendingPool.sol";
import {IncentivesController} from "../contracts/protocol/incentives/IncentivesController2.sol";
import {ILendingPool} from "../contracts/interfaces/ILendingPool.sol";
import {ILendingPoolAddressesProvider} from "../contracts/interfaces/ILendingPoolAddressesProvider.sol";
import {IAssetMappings} from "../contracts/interfaces/IAssetMappings.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {DataTypes} from "../contracts/protocol/libraries/types/DataTypes.sol";

contract DistributionManagerTest is Test {
    uint256 optimismFork;
    IncentivesController incentivesController = IncentivesController(0x8E2a4c71906640B058051c00783160bE306c38fE);
    ILendingPool lendingPool = ILendingPool(0x60F015F66F3647168831d31C7048ca95bb4FeaF9);
    ILendingPoolAddressesProvider addressesProvider = ILendingPoolAddressesProvider(0xFC2748D74703cf6f2CE8ca9C8F388C3DAB1856f0);

    address TOKEN_WETH = 0x4200000000000000000000000000000000000006;
    address TOKEN_USDC = 0x7F5c764cBc14f9669B88837ca1490cCa17c31607;
    address TOKEN_LUSD = 0xc40F949F8a4e094D1b49a23ea9241D289B7b2819;

    IERC20 VELO_USDC_LUSD_LP = IERC20(0xf04458f7B21265b80FC340dE7Ee598e24485c5bB);

    address USER = address(0xbabe);
    address OP_TEST_USER = 0xB79EA9a14FE37f289bD9C9ca6d53bBAB8Ebc4Df3;
    address SUPPLIER = address(0xbaba);
    uint64 TRANCHE_ID = 0;

    IAssetMappings ASSET_MAPPINGS = IAssetMappings(0x48CB441A85d6EA9798C72c4a1829658D786F3027);


    address MULTISIG = 0x599e1DE505CfD6f10F64DD7268D856831f61627a;
    

    function setUp() public {
        optimismFork = vm.createFork(vm.envString("OPTIMISM_RPC_URL"));
        vm.selectFork(optimismFork);

        vm.label(address(lendingPool), "lendingPool");
        vm.label(TOKEN_WETH, "WETH");
        vm.label(TOKEN_USDC, "USDC");
        vm.label(TOKEN_LUSD, "LUSD");
        vm.label(USER, "USER");
        vm.label(0x6324511D46c6339D49697C23ca35cde62089E32a, "DepositWithdrawLogic");
        vm.label(address(ASSET_MAPPINGS), "ASSET_MAPPINGS");
        vm.label(OP_TEST_USER, "OPTIMISM_TEST_USER");
        vm.label(address(incentivesController), "INCENTIVES_CONTROLLER");
    }

    function _upgradeIncentivesController() internal {
        vm.startPrank(MULTISIG);

        IncentivesController incentivesImpl = new IncentivesController();

        addressesProvider.setIncentivesController(address(incentivesImpl));
        vm.stopPrank();
    }

    function testUpgrade() public {
        _upgradeIncentivesController();

        DataTypes.ReserveData memory reserveData = lendingPool.getReserveData(address(TOKEN_USDC), TRANCHE_ID);

        assertEq(incentivesController.getAssetRewardsNum(reserveData.aTokenAddress), 0);
    }

    function testConfigureRewards() public {
        
    }
}
