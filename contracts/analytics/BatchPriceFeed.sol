// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {IChainlinkAggregator} from "../interfaces/IChainlinkAggregator.sol";

library DataUtility {
    function getTokenInfo(address[][] memory _tokens)
        internal
        view
        returns (int256[] memory, int256[] memory)
    {
        int256[] memory ethPrices = new int256[](_tokens.length);
        int256[] memory usdPrice = new int256[](_tokens.length);

        for (uint256 i = 0; i < _tokens.length; i++) {
            ethPrices[i] = IChainlinkAggregator(_tokens[i][0]).latestAnswer();
            usdPrice[i] = IChainlinkAggregator(_tokens[i][1]).latestAnswer();
        }
        return (ethPrices, usdPrice);
    }
}

contract BatchPriceFeed {
    constructor(address[][] memory _tokens) {
        (int256[] memory ethPrices, int256[] memory usdPrices) = DataUtility
            .getTokenInfo(_tokens);
        bytes memory returnData = abi.encode(ethPrices, usdPrices);
        assembly {
            return(add(0x20, returnData), mload(returnData))
        }
    }
}
