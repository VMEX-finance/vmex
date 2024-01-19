// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.19;

import "forge-std/Test.sol";
import {LendingPool} from "../contracts/protocol/lendingpool/LendingPool.sol";
import {IncentivesController} from "../contracts/protocol/incentives/IncentivesController.sol";
import {ILendingPool} from "../contracts/interfaces/ILendingPool.sol";
import {ILendingPoolAddressesProvider} from "../contracts/interfaces/ILendingPoolAddressesProvider.sol";
import {IAssetMappings} from "../contracts/interfaces/IAssetMappings.sol";
import {IVeVmex} from "../contracts/interfaces/IVeVmex.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {DataTypes} from "../contracts/protocol/libraries/types/DataTypes.sol";
import {IDistributionManager} from "../contracts/interfaces/IDistributionManager.sol";
import {MockERC20} from "solmate/test/utils/mocks/MockERC20.sol";
import {IDVmex} from "../contracts/interfaces/IDVmex.sol";
import {IScaledBalanceToken} from "../contracts/interfaces/IScaledBalanceToken.sol";
import {IVMEXOracle} from "../contracts/interfaces/IVMEXOracleLegacy.sol";
import {IChainlinkPriceFeed} from "../contracts/interfaces/IChainlinkPriceFeed.sol";

contract IncentivesControllerProdTest is Test {
    uint256 optimismFork;
    IncentivesController incentivesController = IncentivesController(0x8E2a4c71906640B058051c00783160bE306c38fE);
    ILendingPool lendingPool = ILendingPool(0x60F015F66F3647168831d31C7048ca95bb4FeaF9);
    ILendingPoolAddressesProvider addressesProvider =
        ILendingPoolAddressesProvider(0xFC2748D74703cf6f2CE8ca9C8F388C3DAB1856f0);
    IVMEXOracle oracle = IVMEXOracle(0xA1F5DDf4A9C4Bc2b1b63A6A4e7707B7afc58f010);

    address TOKEN_WETH = 0x4200000000000000000000000000000000000006;
    uint256 TOKEN_WETH_DECIMALS = 18;
    address TOKEN_USDC = 0x7F5c764cBc14f9669B88837ca1490cCa17c31607;
    uint256 TOKEN_USDC_DECIMALS = 6;
    address TOKEN_LUSD = 0xc40F949F8a4e094D1b49a23ea9241D289B7b2819;
    address TOKEN_WSTETH = 0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb;

    IERC20 VELO_USDC_LUSD_LP = IERC20(0xf04458f7B21265b80FC340dE7Ee598e24485c5bB);

    address USER = address(0xbabe);
    address VE_VMEX_USER = 0x1552B1A051430290f1B5E31F156E3CD501f520C3;
    address OP_TEST_USER = 0xB79EA9a14FE37f289bD9C9ca6d53bBAB8Ebc4Df3;
    address SUPPLIER = address(0xbaba);
    uint64 LP_TRANCHE_ID = 0;
    uint64 BASE_TRANCHE_ID = 1;
    uint64 LSD_TRANCHE_ID = 2;

    IAssetMappings ASSET_MAPPINGS = IAssetMappings(0x48CB441A85d6EA9798C72c4a1829658D786F3027);

    address MULTISIG = 0x599e1DE505CfD6f10F64DD7268D856831f61627a;

    address VE_VMEX = 0xD5A3E749a03c2f9645fdF2d755f96e407d0A2D5a;
    address DVMEX_REWARD_POOL = 0xC4F1050a3216b116a78133038912BC3b9506aEF0;
    address DVMEX = 0xb5359eCdc13f055DF2b433520F9Df35D68F49D3d;

    uint128 EMISSION_PER_SECOND = 4133597884e8;

    bytes32 internal constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    uint256 FIVE_YEARS = 5 * 365 days;
    uint256 REWARD_AMOUNT = 5e23; // 500k
    uint256 internal constant PRECISION_FACTOR = 10 ** 18;
    uint256 internal constant STANDARD_DECIMALS = 18;

    address VE_VMEX_DEPOSIT_TOKEN;

    address[] users;
    uint256[] usdcDepositAmounts;
    uint256[] wethDepositAmounts;
    uint256[] vmexLpLockAmounts;
    uint256[] vmexLpLockDurations;

    function setUp() public {
        optimismFork = vm.createFork(vm.envString("OPTIMISM_RPC_URL"));
        vm.selectFork(optimismFork);

        VE_VMEX_DEPOSIT_TOKEN = IVeVmex(VE_VMEX).token();

        _createUsers();

        vm.label(address(lendingPool), "lendingPool");
        vm.label(TOKEN_WETH, "WETH");
        vm.label(TOKEN_USDC, "USDC");
        vm.label(TOKEN_LUSD, "LUSD");
        vm.label(USER, "USER");
        vm.label(0x6324511D46c6339D49697C23ca35cde62089E32a, "DepositWithdrawLogic");
        vm.label(address(ASSET_MAPPINGS), "ASSET_MAPPINGS");
        vm.label(OP_TEST_USER, "OPTIMISM_TEST_USER");
        vm.label(address(incentivesController), "INCENTIVES_CONTROLLER");

        _setChainlinkOracle();
    }

    function _setChainlinkOracle() internal {
        vm.startPrank(MULTISIG);
        address[] memory tokens = new address[](3);
        IVMEXOracle.ChainlinkData[] memory data = new IVMEXOracle.ChainlinkData[](3);

        tokens[0]=TOKEN_USDC;
        tokens[1] = TOKEN_WETH;
        tokens[2] = TOKEN_WSTETH;
        data[0]=IVMEXOracle.ChainlinkData(IChainlinkPriceFeed(0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3), 864000000);
        data[1]=IVMEXOracle.ChainlinkData(IChainlinkPriceFeed(0x13e3Ee699D1909E989722E753853AE30b17e08c5), 864000000);
        data[2]=IVMEXOracle.ChainlinkData(IChainlinkPriceFeed(0x698B585CbC4407e2D54aa898B2600B53C68958f7), 864000000);

        oracle.setAssetSources(tokens,data);
        vm.stopPrank();
    }

    function _createUsers() internal {
        users.push(makeAddr("alice"));
        usdcDepositAmounts.push(1e9);
        wethDepositAmounts.push(1 ether);
        vmexLpLockAmounts.push(1e20);
        vmexLpLockDurations.push(365 days);

        users.push(makeAddr("bob"));
        usdcDepositAmounts.push(1e9);
        wethDepositAmounts.push(1 ether);
        vmexLpLockAmounts.push(1e20);
        vmexLpLockDurations.push(2 * 365 days);

        users.push(makeAddr("eve"));
        usdcDepositAmounts.push(1e9);
        wethDepositAmounts.push(1 ether);
        vmexLpLockAmounts.push(1e20);
        vmexLpLockDurations.push(3 * 365 days);

        users.push(makeAddr("joe"));
        usdcDepositAmounts.push(1e9);
        wethDepositAmounts.push(1 ether);
        vmexLpLockAmounts.push(1e20);
        vmexLpLockDurations.push(4 * 365 days);

        users.push(makeAddr("mike"));
        usdcDepositAmounts.push(1e9);
        wethDepositAmounts.push(1 ether);
        vmexLpLockAmounts.push(1e20);
        vmexLpLockDurations.push(5 * 365 days);
    }

    function testWithdraw() public {
        _upgradeIncentivesController();
        _withdraw(0x464eD76C6B2DdeCC9aa1E990211670a81b93474B, TOKEN_USDC, LP_TRANCHE_ID, type(uint256).max);
    }


    function _upgradeIncentivesController() internal {
        vm.startPrank(MULTISIG);

        IncentivesController incentivesImpl = new IncentivesController();

        addressesProvider.setIncentivesController(address(incentivesImpl));
        vm.stopPrank();
    }

    struct UpdateBoosted {
        address aToken;
        address[] users;
    }

    function _readJsonAndUpdateBoosted(string memory file) internal {
        string memory root = vm.projectRoot();
        string memory path = string.concat(root, file);
        string memory json = vm.readFile(path);
        UpdateBoosted memory updateBoosted = abi.decode(vm.parseJson(json), (UpdateBoosted));
        
        vm.prank(MULTISIG);
        incentivesController.updateBoostedBalanceOf(updateBoosted.aToken, updateBoosted.users);

    }

    function _addMainnetRewards() internal {
        // USDC LP tranche
        DataTypes.ReserveData memory reserveData = lendingPool.getReserveData(TOKEN_USDC, LP_TRANCHE_ID);
        _queueNewRewards(reserveData.aTokenAddress, 175_000e18);

        // WETH accross base LP & LSD tranches
        reserveData = lendingPool.getReserveData(TOKEN_WETH, LP_TRANCHE_ID);
        _queueNewRewards(reserveData.aTokenAddress, 100_000e18);

        reserveData = lendingPool.getReserveData(TOKEN_WETH, LSD_TRANCHE_ID);
        _queueNewRewards(reserveData.aTokenAddress, 125_000e18);

        // wstETH accross base LP & LSD tranches
        reserveData = lendingPool.getReserveData(TOKEN_WSTETH, LP_TRANCHE_ID);
        _queueNewRewards(reserveData.aTokenAddress, 100_000e18);
    }

    function _queueNewRewards(address asset, uint256 amount) internal {
        vm.prank(MULTISIG);
        IDVmex(DVMEX).mint(address(this), amount);

        IDVmex(DVMEX).approve(address(incentivesController), amount);

        incentivesController.queueNewRewards(asset, amount);
    }

    function _deposit(address user, address token, uint64 trancheId, uint256 amount) internal {
        deal(token, user, amount);

        vm.startPrank(user);

        IERC20(token).approve(address(lendingPool), amount);

        lendingPool.deposit(token, trancheId, amount, user, 0);

        vm.stopPrank();
    }

    function _withdraw(address user, address token, uint64 trancheId, uint256 amount) internal {
        vm.startPrank(user);

        lendingPool.withdraw(token, trancheId, amount, user);

        vm.stopPrank();
    }

    function _borrow(address user, address token, uint64 trancheId, uint256 amount) internal {
        vm.startPrank(user);

        lendingPool.borrow(token, trancheId, amount, 0, user);

        vm.stopPrank();
    }

    function _repay(address user, address token, uint64 trancheId, uint256 amount) internal {
        deal(token, user, amount);

        vm.startPrank(user);

        IERC20(token).approve(address(lendingPool), amount);

        lendingPool.repay(token, trancheId, amount, user);

        vm.stopPrank();
    }

    function _lockVmexLp(address user, uint256 amount, uint256 end) internal {
        deal(VE_VMEX_DEPOSIT_TOKEN, user, amount);

        vm.startPrank(user);

        IERC20(VE_VMEX_DEPOSIT_TOKEN).approve(VE_VMEX, amount);
        IVeVmex(VE_VMEX).modify_lock(amount, end, user);

        vm.stopPrank();
    }

    // assumes biggest decimals is 18
    function _standardizeDecimals(uint256 amount, uint256 decimals) internal pure returns (uint256) {
        return decimals != STANDARD_DECIMALS ? amount * 10 ** (STANDARD_DECIMALS - decimals) : amount;
    }
}
