pragma solidity 0.8.17;

interface ICurveRegistry {
    function get_pool_from_lp_token(address) external view returns (address);

    function get_n_coins(address) external view returns (uint256[2] memory);

    function get_underlying_coins(address)
        external
        view
        returns (address[8] memory);
    // ...
}
