// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;
import {DataTypes} from "../types/DataTypes.sol";
import {IInitializableAToken} from "../../../interfaces/IInitializableAToken.sol";
import {IInitializableDebtToken} from "../../../interfaces/IInitializableDebtToken.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
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
            vars.aTokenBeacon,
            getAbiEncodedAToken(vars)
        );


        variableDebtTokenProxyAddress = _initTokenWithProxy(
            vars.variableDebtTokenBeacon,
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
        address beacon,
        bytes memory initParams
    ) public returns (address) {
        BeaconProxy proxy = new BeaconProxy(
                beacon, 
                initParams
            );

        return address(proxy);
    }
}
