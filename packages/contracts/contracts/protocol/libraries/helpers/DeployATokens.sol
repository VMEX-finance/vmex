// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {ILendingPool} from "../../../interfaces/ILendingPool.sol";
import {DataTypes} from "../types/DataTypes.sol";
import {InitializableImmutableAdminUpgradeabilityProxy} from "../../libraries/aave-upgradeability/InitializableImmutableAdminUpgradeabilityProxy.sol";
import {IInitializableAToken} from "../../../interfaces/IInitializableAToken.sol";
import {IAaveIncentivesController} from "../../../interfaces/IAaveIncentivesController.sol";
import {IInitializableDebtToken} from "../../../interfaces/IInitializableDebtToken.sol";
import {ILendingPoolAddressesProvider} from "../../../interfaces/ILendingPoolAddressesProvider.sol";
import "../../../dependencies/openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";
library DeployATokens {
    struct DeployATokensVars {
        ILendingPool pool;
        ILendingPoolAddressesProvider addressProvider;
        DataTypes.InitReserveInputInternal internalInput;
    }

    function deployATokens(DeployATokensVars memory vars)
        public
        returns (
            address aTokenProxyAddress,
            address variableDebtTokenProxyAddress
        )
    {
        aTokenProxyAddress = _initTokenWithProxy(
            vars.internalInput.aTokenImpl,
            getAbiEncodedAToken(vars)
        );


        variableDebtTokenProxyAddress = _initTokenWithProxy(
            vars.internalInput.variableDebtTokenImpl,
            abi.encodeWithSelector(
                IInitializableDebtToken.initialize.selector,
                vars.pool,
                vars.internalInput.input.underlyingAsset,
                vars.internalInput.trancheId,
                IAaveIncentivesController(
                    vars.internalInput.input.incentivesController
                ),
                vars.internalInput.assetdata.underlyingAssetDecimals,
                string(
                    abi.encodePacked(
                        vars.internalInput.assetdata.variableDebtTokenName,
                        Strings.toString(vars.internalInput.trancheId)
                    )
                ), //abi.encodePacked(input.variableDebtTokenName, trancheId),
                string(
                    abi.encodePacked(
                        vars.internalInput.assetdata.variableDebtTokenSymbol,
                        Strings.toString(vars.internalInput.trancheId)
                    )
                )
            )
        );
    }

    function getAbiEncodedAToken(DeployATokensVars memory vars)
        public
        view
        returns (bytes memory)
    {
        return
            abi.encodeWithSelector(
                IInitializableAToken.initialize.selector,
                vars.pool,
                address(this), //lendingPoolConfigurator address
                vars.internalInput.input.treasury,
                vars.addressProvider.getVMEXTreasury(),
                vars.internalInput.input.underlyingAsset,
                vars.internalInput.trancheId,
                IAaveIncentivesController(
                    vars.internalInput.input.incentivesController
                ),
                vars.internalInput.assetdata.underlyingAssetDecimals,
                string(
                    abi.encodePacked(
                        vars.internalInput.assetdata.aTokenName,
                        Strings.toString(vars.internalInput.trancheId)
                    )
                ),
                string(
                    abi.encodePacked(
                        vars.internalInput.assetdata.aTokenSymbol,
                        Strings.toString(vars.internalInput.trancheId)
                    )
                )
            );
    }



    function _initTokenWithProxy(
        address implementation,
        bytes memory initParams
    ) public returns (address) {
        // console.log("Admin of token or strategy proxy: ", address(this));
        InitializableImmutableAdminUpgradeabilityProxy proxy = new InitializableImmutableAdminUpgradeabilityProxy(
                address(this)
            );

        proxy.initialize(implementation, initParams);

        return address(proxy);
    }
}
