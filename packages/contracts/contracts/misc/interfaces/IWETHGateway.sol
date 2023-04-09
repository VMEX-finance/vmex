// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

interface IWETHGateway {
    function depositETH(
        address lendingPool,
        uint64 trancheId,
        address onBehalfOf,
        uint16 referralCode
    ) external payable;

    function withdrawETH(
        address lendingPool,
        uint64 trancheId,
        uint256 amount,
        address onBehalfOf
    ) external;

    function repayETH(
        address lendingPool,
        uint64 trancheId,
        uint256 amount,
        address onBehalfOf
    ) external payable;

    function borrowETH(
        address lendingPool,
        uint64 trancheId,
        uint256 amount,
        uint16 referralCode
    ) external;
}
