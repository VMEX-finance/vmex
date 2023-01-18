// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

import {ILendingPool} from "../../interfaces/ILendingPool.sol";
import {IDelegationToken} from "../../interfaces/IDelegationToken.sol";
import {Errors} from "../libraries/helpers/Errors.sol";
import {AToken} from "./AToken.sol";

/**
 * @title Aave AToken enabled to delegate voting power of the underlying asset to a different address
 * @dev The underlying asset needs to be compatible with the COMP delegation interface
 * @author Aave
 */
contract DelegationAwareAToken is AToken {
    modifier onlyGlobalAdmin() {
        require(
            _msgSender() ==
                ILendingPool(_pool).getAddressesProvider().getGlobalAdmin(),
            Errors.CALLER_NOT_GLOBAL_ADMIN
        );
        _;
    }

    /**
     * @dev Delegates voting power of the underlying asset to a `delegatee` address
     * @param delegatee The address that will receive the delegation
     **/
    function delegateUnderlyingTo(address delegatee) external onlyGlobalAdmin {
        IDelegationToken(_underlyingAsset).delegate(delegatee);
    }
}
