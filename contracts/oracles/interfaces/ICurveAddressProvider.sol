pragma solidity >=0.8.0;
import {ICurveRegistry} from "./ICurveRegistry.sol";

interface ICurveAddressProvider {
    function get_registry() external view returns (address);
    // ...
}
