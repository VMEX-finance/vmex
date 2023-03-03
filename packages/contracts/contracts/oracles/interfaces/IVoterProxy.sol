// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17; 

interface IVoterProxy {

    function balanceOfPool(address) external view returns (uint256);

}
