// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;
import {ILendingPool} from "../../../interfaces/ILendingPool.sol";
import {DataTypes} from "../types/DataTypes.sol";
import {InitializableImmutableAdminUpgradeabilityProxy} from "../../libraries/aave-upgradeability/InitializableImmutableAdminUpgradeabilityProxy.sol";
import {IInitializableAToken} from "../../../interfaces/IInitializableAToken.sol";
import {IAaveIncentivesController} from "../../../interfaces/IAaveIncentivesController.sol";
import {IInitializableDebtToken} from "../../../interfaces/IInitializableDebtToken.sol";
import {ILendingPoolAddressesProvider} from "../../../interfaces/ILendingPoolAddressesProvider.sol";
import "../../../dependencies/openzeppelin/contracts/utils/Strings.sol";
// import "hardhat/console.sol";
library DeployATokens {
    /**
     * @dev Deploys and initializes the aToken and variableDebtToken for a reserve through a proxy
     * @return aTokenProxyAddress The deployed aToken proxy
     * @return variableDebtTokenProxyAddress The deployed variable dep proxy
     **/
    function deployATokens(DataTypes.InitReserveInputInternal memory vars)
        public
        returns (
            address aTokenProxyAddress,
            address variableDebtTokenProxyAddress
        )
    {
        aTokenProxyAddress = _initTokenWithProxy(
            vars.aTokenImpl,
            getAbiEncodedAToken(vars)
        );


        variableDebtTokenProxyAddress = _initTokenWithProxy(
            vars.variableDebtTokenImpl,
            abi.encodeWithSelector(
                IInitializableDebtToken.initialize.selector,
                vars.cachedPool,
                vars.input.underlyingAsset,
                vars.trancheId,
                vars.addressesProvider
            )
        );
    }

    function getAbiEncodedAToken(DataTypes.InitReserveInputInternal memory vars)
        public
        view
        returns (bytes memory)
    {
        return
            abi.encodeWithSelector(
                IInitializableAToken.initialize.selector,
                vars.cachedPool,
                address(this), //lendingPoolConfigurator address
                address(vars.addressesProvider), //
                vars.input.underlyingAsset,
                vars.trancheId
            );
    }


    function _initTokenWithProxy(
        address implementation,
        bytes memory initParams
    ) public returns (address) {
        InitializableImmutableAdminUpgradeabilityProxy proxy = new InitializableImmutableAdminUpgradeabilityProxy(
                address(this)
            );

        proxy.initialize(implementation, initParams);

        return address(proxy);
    }
}
