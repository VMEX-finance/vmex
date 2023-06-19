import "./methods/erc20Methods.spec";

methods {
    // getters
    function assetMappings(address) internal;


    // addressesProvider functions
    function _.getGlobalAdmin() external => ALWAYS(333);
    function _.getLendingPoolConfigurator() external => CONSTANT; 
    function _.getLendingPool() external => CONSTANT;

    // ILendingPoolConfigurator functions
    function _.totalTranches() external => NONDET;

    // Lending Pool functions
    function _.getReserveData(address,uint64) external => DISPATCHER(true);
}

rule onlyOwner(method f, env e, calldataarg args, address asset) {
    bool existsBefore = assetExists[asset];

    f(e, args);

    bool existsAfter = assetExists[asset];

    assert existsAfter != existsBefore => e.msg.sender == 333; // 333 set as owner in methods block summary for getGlobalAdmin
}

invariant reasonableLiquidationBonus(address asset) 
    assetExists[asset] => assetLiqBonus[asset] > 10^18;

// Mirror of assetMappings[asset].liquidationBonus
ghost mapping (address => uint64) assetLiqBonus {
    init_state axiom forall address asset. assetLiqBonus[asset] == 0;
}

ghost mapping (address => bool) assetExists {
    init_state axiom forall address asset. assetExists[asset] == false;
}

// Stores the value accessed by SSLOAD in a ghost variable to keep track in CVL as the variable is internal in Solidity
hook Sload uint64 val assetMappings[KEY address asset].liquidationBonus STORAGE {
    require assetLiqBonus[asset] == val;
}

hook Sload bool val assetMappings[KEY address asset].(offset 78) STORAGE {
    require assetExists[asset] == val;
}