"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IUiPoolDataProviderV2Factory = void 0;
const ethers_1 = require("ethers");
class IUiPoolDataProviderV2Factory {
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.IUiPoolDataProviderV2Factory = IUiPoolDataProviderV2Factory;
const _abi = [
    {
        inputs: [
            {
                internalType: "contract ILendingPoolAddressesProvider",
                name: "provider",
                type: "address",
            },
            {
                internalType: "uint64",
                name: "trancheId",
                type: "uint64",
            },
        ],
        name: "getReservesData",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "underlyingAsset",
                        type: "address",
                    },
                    {
                        internalType: "string",
                        name: "name",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "symbol",
                        type: "string",
                    },
                    {
                        internalType: "uint256",
                        name: "decimals",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "baseLTVasCollateral",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "reserveLiquidationThreshold",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "reserveLiquidationBonus",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "reserveFactor",
                        type: "uint256",
                    },
                    {
                        internalType: "bool",
                        name: "usageAsCollateralEnabled",
                        type: "bool",
                    },
                    {
                        internalType: "bool",
                        name: "borrowingEnabled",
                        type: "bool",
                    },
                    {
                        internalType: "bool",
                        name: "stableBorrowRateEnabled",
                        type: "bool",
                    },
                    {
                        internalType: "bool",
                        name: "isActive",
                        type: "bool",
                    },
                    {
                        internalType: "bool",
                        name: "isFrozen",
                        type: "bool",
                    },
                    {
                        internalType: "uint128",
                        name: "liquidityIndex",
                        type: "uint128",
                    },
                    {
                        internalType: "uint128",
                        name: "variableBorrowIndex",
                        type: "uint128",
                    },
                    {
                        internalType: "uint128",
                        name: "liquidityRate",
                        type: "uint128",
                    },
                    {
                        internalType: "uint128",
                        name: "variableBorrowRate",
                        type: "uint128",
                    },
                    {
                        internalType: "uint128",
                        name: "stableBorrowRate",
                        type: "uint128",
                    },
                    {
                        internalType: "uint40",
                        name: "lastUpdateTimestamp",
                        type: "uint40",
                    },
                    {
                        internalType: "address",
                        name: "aTokenAddress",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "stableDebtTokenAddress",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "variableDebtTokenAddress",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "interestRateStrategyAddress",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "availableLiquidity",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "totalPrincipalStableDebt",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "averageStableRate",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "stableDebtLastUpdateTimestamp",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "totalScaledVariableDebt",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "priceInMarketReferenceCurrency",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "variableRateSlope1",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "variableRateSlope2",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "stableRateSlope1",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "stableRateSlope2",
                        type: "uint256",
                    },
                ],
                internalType: "struct IUiPoolDataProviderV2.AggregatedReserveData[]",
                name: "",
                type: "tuple[]",
            },
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "marketReferenceCurrencyUnit",
                        type: "uint256",
                    },
                    {
                        internalType: "int256",
                        name: "marketReferenceCurrencyPriceInUsd",
                        type: "int256",
                    },
                    {
                        internalType: "int256",
                        name: "networkBaseTokenPriceInUsd",
                        type: "int256",
                    },
                    {
                        internalType: "uint8",
                        name: "networkBaseTokenPriceDecimals",
                        type: "uint8",
                    },
                ],
                internalType: "struct IUiPoolDataProviderV2.BaseCurrencyInfo",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ILendingPoolAddressesProvider",
                name: "provider",
                type: "address",
            },
            {
                internalType: "uint64",
                name: "trancheId",
                type: "uint64",
            },
        ],
        name: "getReservesList",
        outputs: [
            {
                internalType: "address[]",
                name: "",
                type: "address[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract ILendingPoolAddressesProvider",
                name: "provider",
                type: "address",
            },
            {
                internalType: "uint64",
                name: "trancheId",
                type: "uint64",
            },
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getUserReservesData",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "underlyingAsset",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "scaledATokenBalance",
                        type: "uint256",
                    },
                    {
                        internalType: "bool",
                        name: "usageAsCollateralEnabledOnUser",
                        type: "bool",
                    },
                    {
                        internalType: "uint256",
                        name: "stableBorrowRate",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "scaledVariableDebt",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "principalStableDebt",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "stableBorrowLastUpdateTimestamp",
                        type: "uint256",
                    },
                ],
                internalType: "struct IUiPoolDataProviderV2.UserReserveData[]",
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
//# sourceMappingURL=IUiPoolDataProviderV2Factory.js.map