export declare const TOKEN_PRICE: {
    AAVE: string;
    BAT: string;
    BUSD: string;
    DAI: string;
    ENJ: string;
    KNC: string;
    LINK: string;
    MANA: string;
    MKR: string;
    REN: string;
    SNX: string;
    SUSD: string;
    TUSD: string;
    UNI: string;
    USDC: string;
    USDT: string;
    WBTC: string;
    YFI: string;
    ZRX: string;
    USD: string;
};
export declare const TOKEN_PRICE_CONTRACTS: {
    AAVE: string[];
    BAT: string[];
    BUSD: string[];
    DAI: string[];
    ENJ: string[];
    KNC: string[];
    LINK: string[];
    MANA: string[];
    MKR: string[];
    REN: string[];
    SNX: string[];
    SUSD: string[];
    TUSD: string[];
    UNI: string[];
    USDC: string[];
    USDT: string[];
    WBTC: string[];
    YFI: string[];
    ZRX: string[];
};
export declare const TOKEN_ADDR_MAINNET: {
    AAVE: string;
    BAT: string;
    BUSD: string;
    DAI: string;
    ENJ: string;
    KNC: string;
    LINK: string;
    MANA: string;
    MKR: string;
    REN: string;
    SNX: string;
    SUSD: string;
    TUSD: string;
    UNI: string;
    USDC: string;
    USDT: string;
    WBTC: string;
    YFI: string;
    ZRX: string;
};
declare type Token<T> = {
    [k in keyof T]?: {
        address: string;
        decimals: string;
    };
};
export declare const TOKEN: Token<typeof TOKEN_PRICE>;
export declare const deployments: {
    LendingPoolAddressesProvider: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    ReserveLogic: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    GenericLogic: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    ValidationLogic: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    DepositWithdrawLogic: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    LendingPoolImpl: {
        localhost: {
            address: string;
        };
    };
    LendingPool: {
        localhost: {
            address: string;
        };
    };
    LendingPoolConfiguratorImpl: {
        localhost: {
            address: string;
        };
    };
    LendingPoolConfigurator: {
        localhost: {
            address: string;
        };
    };
    StableAndVariableTokensHelper: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    ATokensAndRatesHelper: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    AToken: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    DelegationAwareAToken: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    StableDebtToken: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    VariableDebtToken: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    AaveOracle: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    LendingRateOracle: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    vMath: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    CurveOracle: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    CurveWrapper: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    AaveProtocolDataProvider: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    WETHGateway: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    DefaultReserveInterestRateStrategy: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    rateStrategyAAVE: {
        localhost: {
            address: string;
        };
    };
    rateStrategyVolatileOne: {
        localhost: {
            address: string;
        };
    };
    rateStrategyStableOne: {
        localhost: {
            address: string;
        };
    };
    rateStrategyStableTwo: {
        localhost: {
            address: string;
        };
    };
    rateStrategyVolatileTwo: {
        localhost: {
            address: string;
        };
    };
    rateStrategyVolatileThree: {
        localhost: {
            address: string;
        };
    };
    rateStrategyStableThree: {
        localhost: {
            address: string;
        };
    };
    rateStrategyWETH: {
        localhost: {
            address: string;
        };
    };
    LendingPoolCollateralManagerImpl: {
        localhost: {
            address: string;
        };
    };
    LendingPoolCollateralManager: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    WalletBalanceProvider: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    UiPoolDataProvider: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    rateStrategyCurve: {
        localhost: {
            address: string;
        };
    };
    rateStrategyVolatileFour: {
        localhost: {
            address: string;
        };
    };
    vStrategyHelper: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    tricrypto2Strategy: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
};
export {};
