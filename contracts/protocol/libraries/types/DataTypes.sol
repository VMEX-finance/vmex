// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

library DataTypes {
    // refer to the whitepaper, section 1.1 basic concepts for a formal description of these properties.

    enum ReserveAssetType {AAVE, CURVE} //update with other possible types of the underlying asset
    //AAVE is the original assets in the aave protocol
    //CURVE is the new LP tokens we are providing support for

    struct AssetData {
        uint8 collateralRisk;
        bool isLendable;
        bool isAllowedCollateralInHigherTranches;
        ReserveAssetType assetType;
    }

    struct TrancheAddress {
        uint8 tranche;
        address asset;
    }
    struct ReserveData {
        //stores the reserve configuration
        ReserveConfigurationMap configuration;
        //the liquidity index. Expressed in ray
        uint128 liquidityIndex; //not used for nonlendable assets
        //variable borrow index. Expressed in ray
        uint128 variableBorrowIndex; //not used for nonlendable assets
        //the current supply rate. Expressed in ray
        uint128 currentLiquidityRate; //deposit APR is defined as liquidityRate / RAY //not used for nonlendable assets
        //the current variable borrow rate. Expressed in ray
        uint128 currentVariableBorrowRate; //not used for nonlendable assets
        //the current stable borrow rate. Expressed in ray
        uint128 currentStableBorrowRate; //not used for nonlendable assets
        uint40 lastUpdateTimestamp;
        //tokens addresses
        address aTokenAddress;
        address stableDebtTokenAddress; //not used for nonlendable assets
        address variableDebtTokenAddress; //not used for nonlendable assets
        //address of the interest rate strategy
        address interestRateStrategyAddress; //not used for nonlendable assets
        //the id of the reserve. Represents the position in the list of the active reserves
        uint8 id;
        uint8 tranche; //I think this will be used for nonlendable assets, cause your collateral only asset can be placed in higher tranche if necessary
    }

    struct TrancheMultiplier {
        uint256 liquidityRateMultiplier;
        uint256 variableBorrowRateMultiplier;
        uint256 stableBorrowRateMultiplier;
    }

    uint8 constant NUM_TRANCHES = 3;

    struct ReserveConfigurationMap {
        //bit 0-15: LTV
        //bit 16-31: Liq. threshold
        //bit 32-47: Liq. bonus
        //bit 48-55: Decimals
        //bit 56: Reserve is active
        //bit 57: reserve is frozen
        //bit 58: borrowing is enabled
        //bit 59: stable rate borrowing enabled
        //bit 60-63: reserved
        //bit 64-79: reserve factor
        uint256 data;
    }

    struct UserConfigurationMap {
        uint256 data;
    }

    enum InterestRateMode {NONE, STABLE, VARIABLE}

    struct AcctTranche {
        address user;
        uint8 tranche;
    }

    struct DepositVars {
        address asset;
        uint8 tranche;
        uint8 risk;
        bool allowHigherTranche;
        bool isLendable;
        TrancheMultiplier t;
    }

    struct ExecuteBorrowParams {
        address asset;
        uint8 tranche; //tranche the user wants to borrow out of
        address user;
        address onBehalfOf;
        uint256 amount;
        uint256 interestRateMode;
        address aTokenAddress;
        uint16 referralCode;
        bool releaseUnderlying;
        uint256 _maxStableRateBorrowSizePercent;
        uint256 _reservesCount;
        TrancheMultiplier t;
    }

    struct WithdrawParams {
        uint256 _reservesCount;
        address asset;
        uint8 tranche;
        uint256 amount;
        address to;
        TrancheMultiplier t;
    }

    struct ValidateSetUseReserveAsCollateralParams {
        uint8 risk;
        bool allowHigherTranche;
    }

    struct calculateInterestRatesVars {
        address reserve;
        address aToken;
        uint256 liquidityAdded;
        uint256 liquidityTaken;
        uint256 reserveFactor;
    }

    struct flashLoanVars {
        address receiverAddress;
        DataTypes.TrancheAddress[] assets;
        uint256[] amounts;
        uint256[] modes;
        address onBehalfOf;
        bytes params;
        uint16 referralCode;
        uint256 _flashLoanPremiumTotal;
        address oracle;
        uint256 _maxStableRateBorrowSizePercent;
        uint256 _reservesCount;
    }
}
