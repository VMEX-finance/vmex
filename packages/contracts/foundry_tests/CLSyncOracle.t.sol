// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.19;

import {Test, console2} from "forge-std/Test.sol";
import {CLSynchronicityPriceAdapterPegToBase} from "../contracts/protocol/oracles/CLSynchronicityPriceAdapterPegToBase.sol";

contract CLSyncOracle is Test {
    CLSynchronicityPriceAdapterPegToBase oracle;

    function setUp() public {
        oracle = new CLSynchronicityPriceAdapterPegToBase(
            0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70, // ETH to USD
            0xf397bF97280B488cA19ee3093E81C0a77F02e9a5, //rETH to ETH
            8,
            "rETH / USD"
        );
    }

    function testPrice() public {
        int256 answer = oracle.latestAnswer();
        assertEq(answer, 178814006284);
    }
}
