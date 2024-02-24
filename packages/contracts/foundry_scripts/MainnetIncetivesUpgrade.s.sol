// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
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

contract IncentivesUpgradeScript is Script {
    address INCENTIVES_CONTROLLER_IMPL = 0x79dfAAd6CAE7Eb2569B97a9bdD46a8655612361e;

    address MULTISIG = 0x599e1DE505CfD6f10F64DD7268D856831f61627a;
    IncentivesController incentivesController = IncentivesController(0x8E2a4c71906640B058051c00783160bE306c38fE);
    ILendingPool lendingPool = ILendingPool(0x60F015F66F3647168831d31C7048ca95bb4FeaF9);
    ILendingPoolAddressesProvider addressesProvider =
        ILendingPoolAddressesProvider(0xFC2748D74703cf6f2CE8ca9C8F388C3DAB1856f0);

    address TOKEN_WETH = 0x4200000000000000000000000000000000000006;
    uint256 TOKEN_WETH_DECIMALS = 18;
    address TOKEN_USDC = 0x7F5c764cBc14f9669B88837ca1490cCa17c31607;
    uint256 TOKEN_USDC_DECIMALS = 6;
    address TOKEN_LUSD = 0xc40F949F8a4e094D1b49a23ea9241D289B7b2819;
    address TOKEN_WSTETH = 0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb;
    address TOKEN_OP_WETH_YEARN = 0xDdDCAeE873f2D9Df0E18a80709ef2B396d4a6EA5;
    address TOKEN_WETH_YEARN = 0x5B977577Eb8a480f63e11FC615D6753adB8652Ae;
    address TOKEN_ETH_RETH_AURA = 0x4Fd63966879300caFafBB35D157dC5229278Ed23;
    address TOKEN_ETH_WSTETH_VELO = 0x6dA98Bde0068d10DDD11b468b197eA97D96F96Bc;
    address TOKEN_ETH_LUSD_VELO = 0x6387765fFA609aB9A1dA1B16C455548Bfed7CbEA;
    address TOKEN_USDC_LUSD_VELO = 0xf04458f7B21265b80FC340dE7Ee598e24485c5bB;

    uint64 LP_TRANCHE_ID = 0;
    uint64 BASE_TRANCHE_ID = 1;
    uint64 LSD_TRANCHE_ID = 2;

    address VE_VMEX = 0xD5A3E749a03c2f9645fdF2d755f96e407d0A2D5a;
    address DVMEX_REWARD_POOL = 0xC4F1050a3216b116a78133038912BC3b9506aEF0;
    address DVMEX = 0xb5359eCdc13f055DF2b433520F9Df35D68F49D3d;

    function run() public {
        vm.startBroadcast(MULTISIG);

        _addMainnetRewards();

        vm.stopBroadcast();
    }

    function _updateBoostedBalances() internal {
        _readJsonAndUpdateBoosted("/usdcLPTrancheUsers.json");
        _readJsonAndUpdateBoosted("/wethLPTrancheUsers.json");
        _readJsonAndUpdateBoosted("/wethLSDTrancheUsers.json");
        _readJsonAndUpdateBoosted("/wstethLPTrancheUsers.json");
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

        incentivesController.updateBoostedBalanceOf(updateBoosted.aToken, updateBoosted.users);
    }

    function _addMainnetRewards() internal {
        IDVmex(DVMEX).mint(MULTISIG, 500_100e18);
        IDVmex(DVMEX).approve(address(incentivesController), 500_100e18);

        // USDC LP tranche
        DataTypes.ReserveData memory reserveData = lendingPool.getReserveData(TOKEN_USDC, LP_TRANCHE_ID);
        _queueNewRewards(reserveData.aTokenAddress, 100_000e18);

        // WETH accross base LP & LSD tranches
        reserveData = lendingPool.getReserveData(TOKEN_WETH, LP_TRANCHE_ID);
        _queueNewRewards(reserveData.aTokenAddress, 100_000e18);

        reserveData = lendingPool.getReserveData(TOKEN_WETH, LSD_TRANCHE_ID);
        _queueNewRewards(reserveData.aTokenAddress, 100_000e18);
        
        reserveData = lendingPool.getReserveData(TOKEN_OP_WETH_YEARN, LP_TRANCHE_ID);
        _queueNewRewards(reserveData.aTokenAddress, 33_350e18);

        reserveData = lendingPool.getReserveData(TOKEN_WETH_YEARN, LP_TRANCHE_ID);
        _queueNewRewards(reserveData.aTokenAddress, 33_350e18);

        reserveData = lendingPool.getReserveData(TOKEN_ETH_RETH_AURA, LP_TRANCHE_ID);
        _queueNewRewards(reserveData.aTokenAddress, 33_350e18);

        reserveData = lendingPool.getReserveData(TOKEN_ETH_WSTETH_VELO, LP_TRANCHE_ID);
        _queueNewRewards(reserveData.aTokenAddress, 33_350e18);

        reserveData = lendingPool.getReserveData(TOKEN_ETH_LUSD_VELO, LP_TRANCHE_ID);
        _queueNewRewards(reserveData.aTokenAddress, 33_350e18);

        reserveData = lendingPool.getReserveData(TOKEN_USDC_LUSD_VELO, LP_TRANCHE_ID);
        _queueNewRewards(reserveData.aTokenAddress, 33_350e18);
    }

    function _upgradeIncentivesController() internal {
        addressesProvider.setIncentivesController(INCENTIVES_CONTROLLER_IMPL);

        incentivesController.setVeVmex(VE_VMEX);
        incentivesController.setDVmexRewardPool(DVMEX_REWARD_POOL);
        incentivesController.setDVmex(DVMEX);
    }

    function _queueNewRewards(address asset, uint256 amount) internal {
        incentivesController.queueNewRewards(asset, amount);
    }
}
