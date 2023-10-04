// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.19;

import {IAssetMappings} from "../../../interfaces/IAssetMappings.sol";
import {ILendingPoolAddressesProvider} from "../../../interfaces/ILendingPoolAddressesProvider.sol";
import {ILendingPool} from "../../../interfaces/ILendingPool.sol";
import {ICurvePool} from "../../../interfaces/ICurvePool.sol";

library DataTypes {
    struct TrancheParams {
        uint8 reservesCount;
        bool paused;
        bool isUsingWhitelist;
        bool verified;
    }

    struct CurveMetadata {
        ICurvePool.CurveReentrancyType _reentrancyType;
        uint8 _poolSize;
        address _curvePool;
    }

    struct BeethovenMetadata {
        uint8 _typeOfPool;
        bool _legacy;
        bool _exists;
    }

    // refer to the whitepaper, section 1.1 basic concepts for a formal description of these properties.
    struct AssetData {
        //if we assume most decimals is 18, storing these in uint128 should be ok, that means the maximum someone can deposit is 3.4 * 10^20
        uint128 supplyCap; //can get up to 10^38. Good enough.
        uint128 borrowCap; //can get up to 10^38. Good enough.
        uint64 baseLTV; // % of value of collateral that can be used to borrow. "Collateral factor." 64 bits
        uint64 liquidationThreshold; //if this is zero, then disabled as collateral. 64 bits
        uint64 liquidationBonus; // 64 bits
        uint64 borrowFactor; // borrowFactor * baseLTV * value = truly how much you can borrow of an asset. 64 bits

        bool borrowingEnabled;
        bool isAllowed; //default to false, unless set
        bool exists;    //true if the asset was added to the linked list, false otherwise
        uint8 assetType; //to choose what oracle to use
        uint64 VMEXReserveFactor; //64 bits. is sufficient (percentages can all be stored in 64 bits)
        address defaultInterestRateStrategyAddress;
        //pointer to the next asset that is approved. This allows us to avoid using a list
        address nextApprovedAsset;
    }

    enum ReserveAssetType {
        CHAINLINK, //0
        CURVE, //1
        CURVEV2, //2
        YEARN, //3
        BEEFY, //4
        VELODROME, //5
        BEETHOVEN, //6
        RETH, //7
        CL_PRICE_ADAPTER, //8
        CAMELOT //9
    } //update with other possible types of the underlying asset

    struct TrancheAddress {
        uint64 trancheId;
        address asset;
    }
    struct ReserveData {
        //stores the reserve configuration
        ReserveConfigurationMap configuration; //a lot of this is per asset rather than per reserve. But it's fine to keep since pretty gas efficient

        //the liquidity index. Expressed in ray
        uint128 liquidityIndex; //not used for nonlendable assets
        //variable borrow index. Expressed in ray
        uint128 variableBorrowIndex; //not used for nonlendable assets
        //the current supply rate. Expressed in ray
        uint128 currentLiquidityRate; //deposit APR is defined as liquidityRate / RAY //not used for nonlendable assets
        //the current variable borrow rate. Expressed in ray
        uint128 currentVariableBorrowRate; //not used for nonlendable assets
        uint40 lastUpdateTimestamp; //last updated timestamp for interest rates
        //tokens addresses
        address aTokenAddress;
        address variableDebtTokenAddress; //not used for nonlendable assets
        //the id of the reserve. Represents the position in the list of the active reserves
        uint8 id;

        // these are only set if tranche becomes verified
        address interestRateStrategyAddress;
        uint64 baseLTV; // % of value of collateral that can be used to borrow. "Collateral factor." 64 bits
        uint64 liquidationThreshold; //if this is zero, then disabled as collateral. 64 bits
        uint64 liquidationBonus; // 64 bits
        uint64 borrowFactor; // borrowFactor * baseLTV * value = truly how much you can borrow of an asset. 64 bits
    }

    // uint8 constant NUM_TRANCHES = 3;

    struct ReserveConfigurationMap {
        //new mappings to account for larger reserve factors
        //bit 0: Reserve is active
        //bit 1: reserve is frozen
        //bit 2: borrowing is enabled
        //bit 3: collateral is enabled
        //bit 4-67: reserve factor (64 bit)
        uint256 data; //in total we only need 68 bits, so that's 9 bytes = 72 bits
    }

    struct UserData {
        UserConfigurationMap configuration;
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
        uint64 trancheId;
    }

    struct DepositVars {
        address asset;
        uint64 trancheId;
        address _addressesProvider;
        IAssetMappings _assetMappings;
        uint256 amount;
        address onBehalfOf;
        uint16 referralCode;
    }

    struct ExecuteBorrowParams {
        uint256 amount;
        uint256 _reservesCount;
        uint256 assetPrice;
        uint64 trancheId; //trancheId the user wants to borrow out of
        uint16 referralCode;
        address asset;
        address user;
        address onBehalfOf;
        address aTokenAddress;
        bool releaseUnderlying;
        IAssetMappings _assetMappings;

    }

    struct WithdrawParams {
        uint8 _reservesCount; //number of reserves per tranche cannot exceed 128 (126 if we are packing whitelist and blacklist too)
        address asset;
        uint64 trancheId;
        uint256 amount;
        address to;
    }

    struct calculateInterestRatesVars {
        address reserve;
        address aToken;
        uint256 liquidityAdded;
        uint256 liquidityTaken;
        uint256 totalVariableDebt;
        uint256 reserveFactor;
        uint256 globalVMEXReserveFactor;
    }
}
