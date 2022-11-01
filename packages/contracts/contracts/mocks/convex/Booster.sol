// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract Booster {
    struct PoolInfo {
        address lptoken;
        address token;
        address gauge;
        address crvRewards;
        address stash;
        bool shutdown;
    }

    //index(pid) -> pool
    mapping(uint256 => PoolInfo) public poolInfo;

    /// SETTER SECTION ///

    //create a new pool
    function addPool(uint256 _pid, address _baseRewardsPool)
        external
        returns (bool)
    {
        //add the new pool
        poolInfo[_pid].crvRewards = _baseRewardsPool;
        return true;
    }

    //deposit lp tokens and stake
    function deposit(
        uint256 _pid,
        uint256 _amount,
        bool _stake
    ) public returns (bool) {
        return true;
    }

    //withdraw lp tokens
    function withdraw(uint256 _pid, uint256 _amount) public returns (bool) {
        return true;
    }

    //withdraw all lp tokens
    function withdrawAll(uint256 _pid) public returns (bool) {
        return true;
    }

    //allow reward contracts to send here and withdraw to user
    function withdrawTo(
        uint256 _pid,
        uint256 _amount,
        address _to
    ) external returns (bool) {
        return true;
    }

    function claimRewards(uint256 _pid, address _gauge)
        external
        returns (bool)
    {
        return true;
    }
}
