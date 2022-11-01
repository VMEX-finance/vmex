/// <reference types="node" />
/// <reference types="node" />
import { Contract, Signer, ethers, BigNumberish } from "ethers";
import { ECDSASignature } from "ethereumjs-util";
import { tEthereumAddress, eContractid, tStringTokenSmallUnits, AavePools, iParamsPerNetwork, iParamsPerPool, eNetwork } from "./types";
import { MintableERC20 } from "../types/MintableERC20";
import { Artifact } from "hardhat/types";
import { Artifact as BuidlerArtifact } from "@nomiclabs/buidler/types";
import { ConfigNames } from "./configuration";
export declare type MockTokenMap = {
    [symbol: string]: MintableERC20;
};
export declare const registerContractInJsonDb: (contractId: string, contractInstance: Contract) => Promise<void>;
export declare const insertContractAddressInDb: (id: eContractid, address: tEthereumAddress) => Promise<void & Promise<void>>;
export declare const rawInsertContractAddressInDb: (id: string, address: tEthereumAddress) => Promise<void & Promise<void>>;
export declare const getEthersSigners: () => Promise<Signer[]>;
export declare const getEthersSignersAddresses: () => Promise<tEthereumAddress[]>;
export declare const getCurrentBlock: () => Promise<any>;
export declare const decodeAbiNumber: (data: string) => number;
export declare const deployContract: <ContractType extends Contract>(contractName: string, args: any[]) => Promise<ContractType>;
export declare const withSaveAndVerify: <ContractType extends Contract>(instance: ContractType, id: string, args: (string | string[])[], verify?: boolean) => Promise<ContractType>;
export declare const getContract: <ContractType extends Contract>(contractName: string, address: string) => Promise<ContractType>;
export declare const linkBytecode: (artifact: BuidlerArtifact | Artifact, libraries: any) => string;
export declare const getParamPerNetwork: <T>(param: iParamsPerNetwork<T>, network: eNetwork) => T;
export declare const getOptionalParamAddressPerNetwork: (param: iParamsPerNetwork<tEthereumAddress> | undefined | null, network: eNetwork) => string;
export declare const getParamPerPool: <T>({ proto, amm, matic, avalanche }: iParamsPerPool<T>, pool: AavePools) => T;
export declare const convertToCurrencyDecimals: (tokenAddress: tEthereumAddress, amount: string) => Promise<ethers.BigNumber>;
export declare const convertToCurrencyUnits: (tokenAddress: string, amount: string) => Promise<string>;
export declare const buildPermitParams: (chainId: number, token: tEthereumAddress, revision: string, tokenName: string, owner: tEthereumAddress, spender: tEthereumAddress, nonce: number, deadline: string, value: tStringTokenSmallUnits) => {
    types: {
        EIP712Domain: {
            name: string;
            type: string;
        }[];
        Permit: {
            name: string;
            type: string;
        }[];
    };
    primaryType: "Permit";
    domain: {
        name: string;
        version: string;
        chainId: number;
        verifyingContract: string;
    };
    message: {
        owner: string;
        spender: string;
        value: string;
        nonce: number;
        deadline: string;
    };
};
export declare const getSignatureFromTypedData: (privateKey: string, typedData: any) => ECDSASignature;
export declare const buildLiquiditySwapParams: (assetToSwapToList: tEthereumAddress[], minAmountsToReceive: BigNumberish[], swapAllBalances: BigNumberish[], permitAmounts: BigNumberish[], deadlines: BigNumberish[], v: BigNumberish[], r: (string | Buffer)[], s: (string | Buffer)[], useEthPath: boolean[]) => string;
export declare const buildRepayAdapterParams: (collateralAsset: tEthereumAddress, collateralAmount: BigNumberish, rateMode: BigNumberish, permitAmount: BigNumberish, deadline: BigNumberish, v: BigNumberish, r: string | Buffer, s: string | Buffer, useEthPath: boolean) => string;
export declare const buildFlashLiquidationAdapterParams: (collateralAsset: tEthereumAddress, debtAsset: tEthereumAddress, user: tEthereumAddress, debtToCover: BigNumberish, useEthPath: boolean) => string;
export declare const buildParaSwapLiquiditySwapParams: (assetToSwapTo: tEthereumAddress, minAmountToReceive: BigNumberish, swapAllBalanceOffset: BigNumberish, swapCalldata: string | Buffer, augustus: tEthereumAddress, permitAmount: BigNumberish, deadline: BigNumberish, v: BigNumberish, r: string | Buffer, s: string | Buffer) => string;
export declare const verifyContract: (id: string, instance: Contract, args: (string | string[])[]) => Promise<Contract>;
export declare const getContractAddressWithJsonFallback: (id: string, pool: ConfigNames) => Promise<tEthereumAddress>;
