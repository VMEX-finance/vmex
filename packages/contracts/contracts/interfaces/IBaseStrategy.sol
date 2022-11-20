// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IBaseStrategy {
    struct TokenAmount {
        address token;
        uint256 amount;
    }

    struct TendData {
        uint256 crvTended;
        uint256 cvxTended;
        uint256 cvxCrvTended;
        uint256 extraRewardsTended;
    }

    event Tend (
        TendData t
    );

    event InterestRateUpdated (
        uint256 scaledAmount,
        uint256 timeDifference,
        uint256 p,
        uint256 seconds_per_year,
        uint256 r
    );

    event SetWithdrawalMaxDeviationThreshold(uint256 newMaxDeviationThreshold);

    event StrategyPullFromLendingPool(address lendingPool, uint256 amount);

    function baseStrategyVersion() external pure returns (string memory);

    function balanceOf() external view returns (uint256);

    function setWithdrawalMaxDeviationThreshold(uint256 _threshold) external;

    function pull() external returns (uint256);

    function withdrawAll() external;

    function withdraw(uint256 _amount) external;

    function emitNonProtectedToken(address _token) external;

    function withdrawOther(address _asset) external;

    function pause() external;

    function unpause() external;

    function harvest() external returns (TokenAmount[] memory harvested);

    function tend() external returns (uint256);

    function getName() external returns (string memory);

    function balanceOfRewards() external returns (TokenAmount[] memory rewards);

    function calculateAverageRate() external view returns (uint256 r);
}
