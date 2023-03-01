// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;
import {ICurveRegistry} from "./ICurveRegistry.sol";

interface ICurveAddressProvider {
    function get_registry() external view returns (address);
    // ...
}
