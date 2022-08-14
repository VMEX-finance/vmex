// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {IChainlinkAggregator} from "../interfaces/IChainlinkAggregator.sol";

contract BatchPriceFeed {
    address AAVE = 0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012;
    address BAT = 0x0d16d4528239e9ee52fa531af613AcdB23D88c94;

    constructor() {
        int256 _AAVE = IChainlinkAggregator(AAVE).latestAnswer();
        int256 _BAT = IChainlinkAggregator(BAT).latestAnswer();
        bytes memory returnData = abi.encode(_AAVE, _BAT);
        assembly {
            return(add(0x20, returnData), mload(returnData))
        }
    }
}
