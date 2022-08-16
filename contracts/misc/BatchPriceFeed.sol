// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;
import {IChainlinkAggregator} from "../interfaces/IChainlinkAggregator.sol";

contract BatchPriceFeed {
    constructor() {
        int256[21] memory answers = [
            IChainlinkAggregator(0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012)
                .latestAnswer(),
            IChainlinkAggregator(0x0d16d4528239e9ee52fa531af613AcdB23D88c94)
                .latestAnswer(),
            IChainlinkAggregator(0x614715d2Af89E6EC99A233818275142cE88d1Cfd)
                .latestAnswer(),
            IChainlinkAggregator(0x773616E4d11A78F511299002da57A0a94577F1f4)
                .latestAnswer(),
            IChainlinkAggregator(0x24D9aB51950F3d62E9144fdC2f3135DAA6Ce8D1B)
                .latestAnswer(),
            IChainlinkAggregator(0x656c0544eF4C98A6a98491833A89204Abb045d6b)
                .latestAnswer(),
            IChainlinkAggregator(0xDC530D9457755926550b59e8ECcdaE7624181557)
                .latestAnswer(),
            IChainlinkAggregator(0x82A44D92D6c329826dc557c5E1Be6ebeC5D5FeB9)
                .latestAnswer(),
            IChainlinkAggregator(0x24551a8Fb2A7211A25a17B1481f043A8a8adC7f2)
                .latestAnswer(),
            IChainlinkAggregator(0x3147D7203354Dc06D9fd350c7a2437bcA92387a4)
                .latestAnswer(),
            IChainlinkAggregator(0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c)
                .latestAnswer(),
            IChainlinkAggregator(0x8e0b7e6062272B5eF4524250bFFF8e5Bd3497757)
                .latestAnswer(),
            IChainlinkAggregator(0x3886BA987236181D98F2401c507Fb8BeA7871dF2)
                .latestAnswer(),
            IChainlinkAggregator(0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e)
                .latestAnswer(),
            IChainlinkAggregator(0x986b5E1e1755e3C2440e960477f25201B0a8bbD4)
                .latestAnswer(),
            IChainlinkAggregator(0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46)
                .latestAnswer(),
            IChainlinkAggregator(0xdeb288F737066589598e9214E782fa5A8eD689e8)
                .latestAnswer(),
            IChainlinkAggregator(0x7c5d4F8345e66f68099581Db340cd65B078C41f4)
                .latestAnswer(),
            IChainlinkAggregator(0x2Da4983a622a8498bb1a21FaE9D8F6C664939962)
                .latestAnswer(),
            IChainlinkAggregator(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419)
                .latestAnswer(),
            IChainlinkAggregator(0x9b26214bEC078E68a394AaEbfbffF406Ce14893F)
                .latestAnswer()
        ];
        bytes memory returnData = abi.encode(answers);
        assembly {
            return(add(0x20, returnData), mload(returnData))
        }
    }
}
