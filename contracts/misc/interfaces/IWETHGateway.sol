// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

interface IWETHGateway {
    function depositETH(
        address lendingPool,
        uint8 tranche,
        address onBehalfOf,
        uint16 referralCode
    ) external payable;

    function withdrawETH(
        address lendingPool,
        uint8 tranche,
        uint256 amount,
        address onBehalfOf
    ) external;

    function repayETH(
        address lendingPool,
        uint8 tranche,
        uint256 amount,
        uint256 rateMode,
        address onBehalfOf
    ) external payable;

    function borrowETH(
        address lendingPool,
        uint8 tranche,
        uint256 amount,
        uint256 interesRateMode,
        uint16 referralCode
    ) external;
}
