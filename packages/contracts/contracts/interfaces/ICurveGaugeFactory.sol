// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

interface ICurveGaugeFactory {
    function mint(address gauge) external;
}