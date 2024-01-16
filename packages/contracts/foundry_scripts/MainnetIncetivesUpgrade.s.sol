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

    uint64 LP_TRANCHE_ID = 0;
    uint64 BASE_TRANCHE_ID = 1;
    uint64 LSD_TRANCHE_ID = 2;

    address VE_VMEX = 0xD5A3E749a03c2f9645fdF2d755f96e407d0A2D5a;
    address DVMEX_REWARD_POOL = 0xC4F1050a3216b116a78133038912BC3b9506aEF0;
    address DVMEX = 0xb5359eCdc13f055DF2b433520F9Df35D68F49D3d;

    function run() public {
        vm.startBroadcast(MULTISIG);

        _upgradeIncentivesController();

        _addMainnetRewards();

        _updateBoostedBalances();

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

    function _upgradeIncentivesController() internal {

        IncentivesController incentivesImpl = new IncentivesController();

        addressesProvider.setIncentivesController(address(incentivesImpl));

        incentivesController.setVeVmex(VE_VMEX);
        incentivesController.setDVmexRewardPool(DVMEX_REWARD_POOL);
        incentivesController.setDVmex(DVMEX);
    }

    function _queueNewRewards(address asset, uint256 amount) internal {
        IDVmex(DVMEX).mint(MULTISIG, amount);

        IDVmex(DVMEX).approve(address(incentivesController), amount);

        incentivesController.queueNewRewards(asset, amount);
    }
}
