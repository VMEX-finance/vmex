// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19; 


interface ICurvePool {
    enum CurveReentrancyType {
        NO_CHECK, //0
        REMOVE_LIQUIDITY_ONE_COIN, //1
        REMOVE_LIQUIDITY_ONE_COIN_RETURNS, //2
        REMOVE_LIQUIDITY_2, //3
        REMOVE_LIQUIDITY_2_RETURNS, //4
        REMOVE_LIQUIDITY_3, //5
        REMOVE_LIQUIDITY_3_RETURNS, //6
        CLAIM_ADMIN_FEES //7
        // WITHDRAW_ADMIN_FEES
    }

	function get_virtual_price() external view returns (uint256 out);

    function add_liquidity(
        // renbtc/tbtc pool
        uint256[2] calldata amounts,
        uint256 min_mint_amount
    ) external payable;

    function add_liquidity(
        // sBTC pool
        uint256[3] calldata amounts,
        uint256 min_mint_amount
    ) external payable;

    function add_liquidity(
        // bUSD pool
        uint256[4] calldata amounts,
        uint256 min_mint_amount
    ) external payable;

    function get_dy(
        int128 i,
        int128 j,
        uint256 dx
    ) external returns (uint256 out);

    function get_dy_underlying(
        int128 i,
        int128 j,
        uint256 dx
    ) external returns (uint256 out);

    function exchange(
        int128 i,
        int128 j,
        uint256 dx,
        uint256 min_dy
    ) external;

    function exchange(
        int128 i,
        int128 j,
        uint256 dx,
        uint256 min_dy,
        uint256 deadline
    ) external;

    function exchange_underlying(
        int128 i,
        int128 j,
        uint256 dx,
        uint256 min_dy
    ) external;

    function exchange_underlying(
        int128 i,
        int128 j,
        uint256 dx,
        uint256 min_dy,
        uint256 deadline
    ) external;

    function remove_liquidity(
        uint256 _amount,
        uint256 deadline,
        uint256[2] calldata min_amounts
    ) external;

    function remove_liquidity(
        uint lp,
        uint[2] calldata min_amounts
    ) external returns (uint[2] memory);


    function remove_liquidity(
        uint lp,
        uint[3] calldata min_amounts
    ) external returns (uint[3] memory);

    function remove_liquidity_imbalance(
        uint256[2] calldata amounts,
        uint256 deadline
    ) external;

    function remove_liquidity_imbalance(
        uint256[3] calldata amounts,
        uint256 max_burn_amount
    ) external;

    function remove_liquidity_imbalance(
        uint256[4] calldata amounts,
        uint256 max_burn_amount) external;

    function remove_liquidity(uint256 _amount, uint256[4] calldata amounts)
        external returns(uint256);

    function remove_liquidity_one_coin(
        uint256 _token_amount,
        int128 i,
        uint256 _min_amount
    ) external;


    function commit_new_parameters(
        int128 amplification,
        int128 new_fee,
        int128 new_admin_fee
    ) external;

    function apply_new_parameters() external;

    function revert_new_parameters() external;

    function commit_transfer_ownership(address _owner) external;

    function apply_transfer_ownership() external;

    function revert_transfer_ownership() external;

    function withdraw_admin_fees() external;

    function coins(uint256 arg0) external view returns (address out);

    function underlying_coins(int128 arg0) external returns (address out);

    function balances(uint256 arg0) external view returns (uint256 out);

    function A() external returns (int128 out);

    function fee() external returns (int128 out);

    function admin_fee() external returns (int128 out);

    function owner() external returns (address out);

    function admin_actions_deadline() external returns (uint256 out);

    function transfer_ownership_deadline() external returns (uint256 out);

    function future_A() external returns (int128 out);

    function future_fee() external returns (int128 out);

    function future_admin_fee() external returns (int128 out);

    function future_owner() external returns (address out);

    function calc_withdraw_one_coin(uint256 _token_amount, int128 _i)
        external
        view
        returns (uint256 out);

    function claim_admin_fees() external;
}

interface ICurvePool2 {
    function remove_liquidity_one_coin(
        uint256 _token_amount,
        int128 i,
        uint256 _min_amount
    ) external returns(uint256);


    function remove_liquidity(
        uint lp,
        uint[2] calldata min_amounts
    ) external;


    function remove_liquidity(
        uint lp,
        uint[3] calldata min_amounts
    ) external;
}