// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.19;

import "forge-std/Test.sol";
import {LendingPool} from "../contracts/protocol/lendingpool/LendingPool.sol";
import {IncentivesController} from "../contracts/protocol/incentives/IncentivesController2.sol";
import {ILendingPool} from "../contracts/interfaces/ILendingPool.sol";
import {ILendingPoolAddressesProvider} from "../contracts/interfaces/ILendingPoolAddressesProvider.sol";
import {IAssetMappings} from "../contracts/interfaces/IAssetMappings.sol";
import {IVeVmex} from "../contracts/interfaces/IVeVmex.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {DataTypes} from "../contracts/protocol/libraries/types/DataTypes.sol";
import {IDistributionManager} from "../contracts/interfaces/IDistributionManager.sol";
import {MockERC20} from "solmate/test/utils/mocks/MockERC20.sol";

contract IncentivesController2Test is Test {
    uint256 optimismFork;
    IncentivesController incentivesController = IncentivesController(0x8E2a4c71906640B058051c00783160bE306c38fE);
    ILendingPool lendingPool = ILendingPool(0x60F015F66F3647168831d31C7048ca95bb4FeaF9);
    ILendingPoolAddressesProvider addressesProvider = ILendingPoolAddressesProvider(0xFC2748D74703cf6f2CE8ca9C8F388C3DAB1856f0);

    MockERC20 dVmexMock;

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

    address VE_VMEX = 0xD5A3E749a03c2f9645fdF2d755f96e407d0A2D5a;
    address DVMEX_REWARD_POOL = 0xC4F1050a3216b116a78133038912BC3b9506aEF0;

    uint128 EMISSION_PER_SECOND = 4133597884e8;

    bytes32 internal constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    uint256 FIVE_YEARS = 5 * 365 days;

    address VE_VMEX_DEPOSIT_TOKEN;

    function setUp() public {
        optimismFork = vm.createFork(vm.envString("OPTIMISM_RPC_URL"));
        vm.selectFork(optimismFork);

        dVmexMock = new MockERC20("dVMEX", "dVMEX", 18);

        VE_VMEX_DEPOSIT_TOKEN = IVeVmex(VE_VMEX).token();

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

    function testUpgrade() public {
        bytes32 oldImpl = vm.load(addressesProvider.getIncentivesController(), IMPLEMENTATION_SLOT);

        _upgradeIncentivesController();

        assertFalse(oldImpl == vm.load(addressesProvider.getIncentivesController(), IMPLEMENTATION_SLOT));
        assertEq(incentivesController.VE_VMEX(), VE_VMEX);
        assertEq(incentivesController.PENALTY_RECIEVER(), DVMEX_REWARD_POOL);
    }

    function testConfigureRewards() public {
        _upgradeIncentivesController();

        DataTypes.ReserveData memory reserveData = lendingPool.getReserveData(TOKEN_USDC, TRANCHE_ID);
        _configureRewards(1, uint128(block.timestamp + 14 days), reserveData.aTokenAddress, address(dVmexMock));

        assertEq(incentivesController.getAssetRewardsNum(reserveData.aTokenAddress), 1);
        assertEq(incentivesController.getAssetRewardAddress(reserveData.aTokenAddress, 0), address(dVmexMock));

        (uint128 emissionPerSecond, uint128 lastUpdateTimestamp, uint256 index, uint128 endTimestamp) = incentivesController.getAssetReward(reserveData.aTokenAddress, address(dVmexMock));
        assertEq(emissionPerSecond, 1);
        assertEq(lastUpdateTimestamp, block.timestamp);
        assertEq(index, 0);
        assertEq(endTimestamp, uint128(block.timestamp + 14 days));
    }

    function testClaimMinBoost() public {
        _upgradeIncentivesController();

        DataTypes.ReserveData memory reserveData = lendingPool.getReserveData(TOKEN_USDC, TRANCHE_ID);
        _configureRewards(EMISSION_PER_SECOND, uint128(block.timestamp + 14 days), reserveData.aTokenAddress, address(dVmexMock));
        
        _deposit(USER, TOKEN_USDC, TRANCHE_ID, 1e9);

        vm.warp(block.timestamp + 5 days);

        address[] memory assets = new address[](1);
        assets[0] = reserveData.aTokenAddress;

        (, uint256[] memory amounts) = incentivesController.getPendingRewards(assets, USER);
        uint256 dvmexRewardPoolBalanceBefore = dVmexMock.balanceOf(DVMEX_REWARD_POOL);

        vm.prank(USER);
        incentivesController.claimAllRewards(assets, USER);

        assertEq(dVmexMock.balanceOf(USER), amounts[0] / 10);
        assertEq(dVmexMock.balanceOf(DVMEX_REWARD_POOL), dvmexRewardPoolBalanceBefore + amounts[0] - amounts[0] / 10);
    }

    function testClaimMaxBoost() public {
        _upgradeIncentivesController();

        DataTypes.ReserveData memory reserveData = lendingPool.getReserveData(TOKEN_USDC, TRANCHE_ID);
        _configureRewards(EMISSION_PER_SECOND, uint128(block.timestamp + 14 days), reserveData.aTokenAddress, address(dVmexMock));
        
        _deposit(USER, TOKEN_USDC, TRANCHE_ID, 1e9);

        vm.warp(block.timestamp + 5 days);

        address[] memory assets = new address[](1);
        assets[0] = reserveData.aTokenAddress;

        (, uint256[] memory amounts) = incentivesController.getPendingRewards(assets, USER);
        uint256 dvmexRewardPoolBalanceBefore = dVmexMock.balanceOf(DVMEX_REWARD_POOL);

        _lockVmexLp(USER, 1e21, block.timestamp + FIVE_YEARS);

        vm.prank(USER);
        incentivesController.claimAllRewards(assets, USER);

        assertEq(dVmexMock.balanceOf(USER), amounts[0]);
        assertEq(dVmexMock.balanceOf(DVMEX_REWARD_POOL), dvmexRewardPoolBalanceBefore);
    }

    function testClaimManyUsers() public {
        
    }

    function _upgradeIncentivesController() internal {
        vm.startPrank(MULTISIG);

        IncentivesController incentivesImpl = new IncentivesController();

        addressesProvider.setIncentivesController(address(incentivesImpl));

        incentivesController.setVeVmex(VE_VMEX);
        incentivesController.setPenaltyReciever(DVMEX_REWARD_POOL);
        vm.stopPrank();
    }

    function _configureRewards(uint128 emissionPerSecond, uint128 endTimestamp, address asset, address reward) internal {
        vm.startPrank(MULTISIG);

        IDistributionManager.RewardConfig[] memory config = new IDistributionManager.RewardConfig[](1);
        config[0] = IDistributionManager.RewardConfig({
            emissionPerSecond: emissionPerSecond,
            endTimestamp: endTimestamp,
            incentivizedAsset: asset,
            reward: reward
        });
        incentivesController.configureRewards(config);
        
        address rewardsVault = incentivesController.REWARDS_VAULT();

        dVmexMock.mint(rewardsVault, emissionPerSecond * (endTimestamp - block.timestamp));

        vm.stopPrank();

        vm.prank(rewardsVault); // multisig but its ok
        dVmexMock.approve(address(incentivesController), type(uint256).max);
    }

    function _deposit(address user, address token, uint64 trancheId, uint256 amount) internal {
        deal(token, user, amount, true);

        vm.startPrank(user);

        IERC20(token).approve(address(lendingPool), amount);

        lendingPool.deposit(token, trancheId, amount, user, 0);

        vm.stopPrank();
    }

    function _lockVmexLp(address user, uint256 amount, uint256 end) internal {
        deal(VE_VMEX_DEPOSIT_TOKEN, user, amount, true);
        
        vm.startPrank(user);

        IERC20(VE_VMEX_DEPOSIT_TOKEN).approve(VE_VMEX, amount);
        IVeVmex(VE_VMEX).modify_lock(amount, end, user);

        vm.stopPrank();
    }
}
