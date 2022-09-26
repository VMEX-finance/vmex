// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.8.0;

library DataTypes {
    // refer to the whitepaper, section 1.1 basic concepts for a formal description of these properties.

    struct InitReserveInput {
        address aTokenImpl;
        address stableDebtTokenImpl;
        address variableDebtTokenImpl;
        uint8 underlyingAssetDecimals;
        address interestRateStrategyAddress;
        address underlyingAsset;
        address treasury;
        address incentivesController;
        string underlyingAssetName;
        string aTokenName;
        string aTokenSymbol;
        string variableDebtTokenName;
        string variableDebtTokenSymbol;
        string stableDebtTokenName;
        string stableDebtTokenSymbol;
        bytes params;
        uint8 trancheId;
        uint8 trancheRisk;
        uint8 risk; //risk level for collateral
        bool allowHigherTranche;
        uint8 assetType;
        bool canBeCollateral;
        uint256 collateralCap;
        bool hasStrategy;
        bool usingGovernanceSetInterestRate; //if true, then the reserves that has this asset will
        uint256 governanceSetInterestRate;
    }

    enum ReserveAssetType {
        AAVE,
        CURVE
    } //update with other possible types of the underlying asset
    //AAVE is the original assets in the aave protocol
    //CURVE is the new LP tokens we are providing support for

    struct AssetData {
        uint8 collateralRisk; //this is a property of the asset. The asset has the same underlying risk as collateral regardless of what trancheId it is in
        bool isAllowedCollateralInHigherTranches; //this is a property of the asset. It can't be "allowed as collateral in higher tranches" in some tranches but not in others, logical inconsistency
        ReserveAssetType assetType; //this is asset property
    }

    struct Tranches {
        uint8 trancheid;
        uint16 numAssets;
    }

    struct TrancheAddress {
        uint8 trancheId;
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
        //maybe consider
        uint8 trancheId;
        uint8 trancheRisk;
        //trancheid and trancheRisk?
        //since we will keep adding more tranches but they might not necessarily have increasing risks
        //tranches of the same trancheid will be pooled together as collateral
        //assets can only be set as collateral in tranches that have a trancheRisk >= assetRisk

        //these can be considered to be put in reserveData instead, cause different reserves of the same asset can have different values of this property
        bool canBeCollateral;
        uint256 collateralCap; //this can definitely be different per trancheId
        bool hasStrategy; //this might be put as a property of a reserve rather than property of the asset since USDC might have a trancheId that has a strategy, but unlikely to happen
        bool usingGovernanceSetInterestRate; //if true, then the reserves that has this asset will
        uint256 governanceSetInterestRate;
    }

    // uint8 constant NUM_TRANCHES = 3;

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

    enum InterestRateMode {
        NONE,
        STABLE,
        VARIABLE
    }

    struct AcctTranche {
        address user;
        uint8 trancheId;
    }

    struct DepositVars {
        address asset;
        uint8 trancheId;
        address _addressesProvider;
        uint256 amount;
        address onBehalfOf;
        uint16 referralCode;
    }

    struct ExecuteBorrowParams {
        address asset;
        uint8 trancheId; //trancheId the user wants to borrow out of
        address user;
        address onBehalfOf;
        uint256 amount;
        uint256 interestRateMode;
        address aTokenAddress;
        uint16 referralCode;
        bool releaseUnderlying;
        uint256 _maxStableRateBorrowSizePercent;
        uint256 _reservesCount;
    }

    struct WithdrawParams {
        uint256 _reservesCount;
        address asset;
        uint8 trancheId;
        uint256 amount;
        address to;
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
        address _addressesprovider;
        // mapping(uint8 => uint256) _reservesCount;
    }
}
