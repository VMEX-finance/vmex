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

contract DeployIncentivesImplScript is Script {
    address MULTISIG = 0x599e1DE505CfD6f10F64DD7268D856831f61627a;

    function run() public {
        vm.startBroadcast();

        IncentivesController incentivesImpl = new IncentivesController();

        vm.stopBroadcast();
    }
}
