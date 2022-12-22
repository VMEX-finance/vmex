pragma solidity >=0.8.0; 

interface IVoterProxy {

    function balanceOfPool(address) external view returns (uint256);

}
