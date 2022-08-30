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
    xSUSHI: string;
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
    xSUSHI: string[];
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
    xSUSHI: string;
};
declare type Token<T> = {
    [k in keyof T]?: {
        address: string;
        decimals: string;
    };
};
export declare const TOKEN: Token<typeof TOKEN_PRICE>;
export declare const deployments: {
    MintableERC20: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    DAI: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    AAVE: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    TUSD: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    BAT: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    WETHMocked: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    WETH: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    USDC: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    USDT: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    SUSD: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    ZRX: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    MKR: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    WBTC: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    LINK: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    KNC: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    MANA: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    REN: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    SNX: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    BUSD: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    USD: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    YFI: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UNI: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    ENJ: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UNIDAIWETH: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UNIWBTCWETH: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UNIAAVEWETH: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UNIBATWETH: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UNIDAIUSDC: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UNICRVWETH: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UNILINKWETH: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UNIMKRWETH: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UNIRENWETH: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UNISNXWETH: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UNIUNIWETH: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UNIUSDCWETH: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UNIWBTCUSDC: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UNIYFIWETH: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    BPTWBTCWETH: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    BPTBALWETH: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    WMATIC: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    STAKE: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    XSUSHI: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    WAVAX: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    LendingPoolAddressesProvider: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    LendingPoolAddressesProviderRegistry: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    ReserveLogic: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    GenericLogic: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    ValidationLogic: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    LendingPoolImpl: {
        hardhat: {
            address: string;
        };
        localhost: {
            address: string;
        };
    };
    LendingPool: {
        hardhat: {
            address: string;
        };
        localhost: {
            address: string;
        };
    };
    LendingPoolConfiguratorImpl: {
        hardhat: {
            address: string;
        };
        localhost: {
            address: string;
        };
    };
    LendingPoolConfigurator: {
        hardhat: {
            address: string;
        };
        localhost: {
            address: string;
        };
    };
    StableAndVariableTokensHelper: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    ATokensAndRatesHelper: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    PriceOracle: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    MockAggregator: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    AaveOracle: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    LendingRateOracle: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    AaveProtocolDataProvider: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    AToken: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    DelegationAwareAToken: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    StableDebtToken: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    VariableDebtToken: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    DefaultReserveInterestRateStrategy: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    rateStrategyAAVE: {
        hardhat: {
            address: string;
        };
        localhost: {
            address: string;
        };
    };
    rateStrategyVolatileOne: {
        hardhat: {
            address: string;
        };
        localhost: {
            address: string;
        };
    };
    rateStrategyStableOne: {
        hardhat: {
            address: string;
        };
        localhost: {
            address: string;
        };
    };
    rateStrategyStableTwo: {
        hardhat: {
            address: string;
        };
        localhost: {
            address: string;
        };
    };
    rateStrategyVolatileTwo: {
        hardhat: {
            address: string;
        };
        localhost: {
            address: string;
        };
    };
    rateStrategyVolatileThree: {
        hardhat: {
            address: string;
        };
        localhost: {
            address: string;
        };
    };
    rateStrategyStableThree: {
        hardhat: {
            address: string;
        };
        localhost: {
            address: string;
        };
    };
    rateStrategyWETH: {
        hardhat: {
            address: string;
        };
        localhost: {
            address: string;
        };
    };
    rateStrategyVolatileFour: {
        hardhat: {
            address: string;
        };
        localhost: {
            address: string;
        };
    };
    LendingPoolCollateralManagerImpl: {
        hardhat: {
            address: string;
        };
    };
    LendingPoolCollateralManager: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    MockFlashLoanReceiver: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    MockUniswapV2Router02: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UniswapLiquiditySwapAdapter: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    UniswapRepayAdapter: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    FlashLiquidationAdapter: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    MockParaSwapAugustus: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    MockParaSwapAugustusRegistry: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    ParaSwapLiquiditySwapAdapter: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    WalletBalanceProvider: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    WETHGateway: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    MintableDelegationERC20: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    MockAToken: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    MockStableDebtToken: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    MockVariableDebtToken: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    SelfdestructTransferMock: {
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    DepositWithdrawLogic: {
        hardhat: {
            address: string;
            deployer: string;
        };
        localhost: {
            address: string;
            deployer: string;
        };
    };
    UiPoolDataProvider: {
        hardhat: {
            address: string;
            deployer: string;
        };
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
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    curveOracleImpl: {
        localhost: {
            address: string;
            deployer: string;
        };
        hardhat: {
            address: string;
            deployer: string;
        };
    };
    rateStrategyCurve: {
        localhost: {
            address: string;
        };
        hardhat: {
            address: string;
        };
    };
    curveOracle: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
    curveWrapper: {
        localhost: {
            address: string;
            deployer: string;
        };
    };
};
export {};
