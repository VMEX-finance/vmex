/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface DeployATokensInterface extends ethers.utils.Interface {
  functions: {
    "getAbiEncodedAToken(tuple)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "getAbiEncodedAToken",
    values: [
      {
        pool: string;
        DefaultVMEXTreasury: string;
        internalInput: {
          input: {
            aTokenImpl: string;
            stableDebtTokenImpl: string;
            variableDebtTokenImpl: string;
            underlyingAssetDecimals: BigNumberish;
            interestRateStrategyAddress: string;
            underlyingAsset: string;
            treasury: string;
            incentivesController: string;
            underlyingAssetName: string;
            aTokenName: string;
            aTokenSymbol: string;
            variableDebtTokenName: string;
            variableDebtTokenSymbol: string;
            stableDebtTokenName: string;
            stableDebtTokenSymbol: string;
            params: BytesLike;
            assetType: BigNumberish;
            collateralCap: BigNumberish;
            usingGovernanceSetInterestRate: boolean;
            governanceSetInterestRate: BigNumberish;
          };
          trancheId: BigNumberish;
        };
      }
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "getAbiEncodedAToken",
    data: BytesLike
  ): Result;

  events: {};
}

export class DeployATokens extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: DeployATokensInterface;

  functions: {
    getAbiEncodedAToken(
      vars: {
        pool: string;
        DefaultVMEXTreasury: string;
        internalInput: {
          input: {
            aTokenImpl: string;
            stableDebtTokenImpl: string;
            variableDebtTokenImpl: string;
            underlyingAssetDecimals: BigNumberish;
            interestRateStrategyAddress: string;
            underlyingAsset: string;
            treasury: string;
            incentivesController: string;
            underlyingAssetName: string;
            aTokenName: string;
            aTokenSymbol: string;
            variableDebtTokenName: string;
            variableDebtTokenSymbol: string;
            stableDebtTokenName: string;
            stableDebtTokenSymbol: string;
            params: BytesLike;
            assetType: BigNumberish;
            collateralCap: BigNumberish;
            usingGovernanceSetInterestRate: boolean;
            governanceSetInterestRate: BigNumberish;
          };
          trancheId: BigNumberish;
        };
      },
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "getAbiEncodedAToken((ILendingPool,address,((address,address,address,uint8,address,address,address,address,string,string,string,string,string,string,string,bytes,uint8,uint256,bool,uint256),uint64)))"(
      vars: {
        pool: string;
        DefaultVMEXTreasury: string;
        internalInput: {
          input: {
            aTokenImpl: string;
            stableDebtTokenImpl: string;
            variableDebtTokenImpl: string;
            underlyingAssetDecimals: BigNumberish;
            interestRateStrategyAddress: string;
            underlyingAsset: string;
            treasury: string;
            incentivesController: string;
            underlyingAssetName: string;
            aTokenName: string;
            aTokenSymbol: string;
            variableDebtTokenName: string;
            variableDebtTokenSymbol: string;
            stableDebtTokenName: string;
            stableDebtTokenSymbol: string;
            params: BytesLike;
            assetType: BigNumberish;
            collateralCap: BigNumberish;
            usingGovernanceSetInterestRate: boolean;
            governanceSetInterestRate: BigNumberish;
          };
          trancheId: BigNumberish;
        };
      },
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;
  };

  getAbiEncodedAToken(
    vars: {
      pool: string;
      DefaultVMEXTreasury: string;
      internalInput: {
        input: {
          aTokenImpl: string;
          stableDebtTokenImpl: string;
          variableDebtTokenImpl: string;
          underlyingAssetDecimals: BigNumberish;
          interestRateStrategyAddress: string;
          underlyingAsset: string;
          treasury: string;
          incentivesController: string;
          underlyingAssetName: string;
          aTokenName: string;
          aTokenSymbol: string;
          variableDebtTokenName: string;
          variableDebtTokenSymbol: string;
          stableDebtTokenName: string;
          stableDebtTokenSymbol: string;
          params: BytesLike;
          assetType: BigNumberish;
          collateralCap: BigNumberish;
          usingGovernanceSetInterestRate: boolean;
          governanceSetInterestRate: BigNumberish;
        };
        trancheId: BigNumberish;
      };
    },
    overrides?: CallOverrides
  ): Promise<string>;

  "getAbiEncodedAToken((ILendingPool,address,((address,address,address,uint8,address,address,address,address,string,string,string,string,string,string,string,bytes,uint8,uint256,bool,uint256),uint64)))"(
    vars: {
      pool: string;
      DefaultVMEXTreasury: string;
      internalInput: {
        input: {
          aTokenImpl: string;
          stableDebtTokenImpl: string;
          variableDebtTokenImpl: string;
          underlyingAssetDecimals: BigNumberish;
          interestRateStrategyAddress: string;
          underlyingAsset: string;
          treasury: string;
          incentivesController: string;
          underlyingAssetName: string;
          aTokenName: string;
          aTokenSymbol: string;
          variableDebtTokenName: string;
          variableDebtTokenSymbol: string;
          stableDebtTokenName: string;
          stableDebtTokenSymbol: string;
          params: BytesLike;
          assetType: BigNumberish;
          collateralCap: BigNumberish;
          usingGovernanceSetInterestRate: boolean;
          governanceSetInterestRate: BigNumberish;
        };
        trancheId: BigNumberish;
      };
    },
    overrides?: CallOverrides
  ): Promise<string>;

  callStatic: {
    getAbiEncodedAToken(
      vars: {
        pool: string;
        DefaultVMEXTreasury: string;
        internalInput: {
          input: {
            aTokenImpl: string;
            stableDebtTokenImpl: string;
            variableDebtTokenImpl: string;
            underlyingAssetDecimals: BigNumberish;
            interestRateStrategyAddress: string;
            underlyingAsset: string;
            treasury: string;
            incentivesController: string;
            underlyingAssetName: string;
            aTokenName: string;
            aTokenSymbol: string;
            variableDebtTokenName: string;
            variableDebtTokenSymbol: string;
            stableDebtTokenName: string;
            stableDebtTokenSymbol: string;
            params: BytesLike;
            assetType: BigNumberish;
            collateralCap: BigNumberish;
            usingGovernanceSetInterestRate: boolean;
            governanceSetInterestRate: BigNumberish;
          };
          trancheId: BigNumberish;
        };
      },
      overrides?: CallOverrides
    ): Promise<string>;

    "getAbiEncodedAToken((ILendingPool,address,((address,address,address,uint8,address,address,address,address,string,string,string,string,string,string,string,bytes,uint8,uint256,bool,uint256),uint64)))"(
      vars: {
        pool: string;
        DefaultVMEXTreasury: string;
        internalInput: {
          input: {
            aTokenImpl: string;
            stableDebtTokenImpl: string;
            variableDebtTokenImpl: string;
            underlyingAssetDecimals: BigNumberish;
            interestRateStrategyAddress: string;
            underlyingAsset: string;
            treasury: string;
            incentivesController: string;
            underlyingAssetName: string;
            aTokenName: string;
            aTokenSymbol: string;
            variableDebtTokenName: string;
            variableDebtTokenSymbol: string;
            stableDebtTokenName: string;
            stableDebtTokenSymbol: string;
            params: BytesLike;
            assetType: BigNumberish;
            collateralCap: BigNumberish;
            usingGovernanceSetInterestRate: boolean;
            governanceSetInterestRate: BigNumberish;
          };
          trancheId: BigNumberish;
        };
      },
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {};

  estimateGas: {
    getAbiEncodedAToken(
      vars: {
        pool: string;
        DefaultVMEXTreasury: string;
        internalInput: {
          input: {
            aTokenImpl: string;
            stableDebtTokenImpl: string;
            variableDebtTokenImpl: string;
            underlyingAssetDecimals: BigNumberish;
            interestRateStrategyAddress: string;
            underlyingAsset: string;
            treasury: string;
            incentivesController: string;
            underlyingAssetName: string;
            aTokenName: string;
            aTokenSymbol: string;
            variableDebtTokenName: string;
            variableDebtTokenSymbol: string;
            stableDebtTokenName: string;
            stableDebtTokenSymbol: string;
            params: BytesLike;
            assetType: BigNumberish;
            collateralCap: BigNumberish;
            usingGovernanceSetInterestRate: boolean;
            governanceSetInterestRate: BigNumberish;
          };
          trancheId: BigNumberish;
        };
      },
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getAbiEncodedAToken((ILendingPool,address,((address,address,address,uint8,address,address,address,address,string,string,string,string,string,string,string,bytes,uint8,uint256,bool,uint256),uint64)))"(
      vars: {
        pool: string;
        DefaultVMEXTreasury: string;
        internalInput: {
          input: {
            aTokenImpl: string;
            stableDebtTokenImpl: string;
            variableDebtTokenImpl: string;
            underlyingAssetDecimals: BigNumberish;
            interestRateStrategyAddress: string;
            underlyingAsset: string;
            treasury: string;
            incentivesController: string;
            underlyingAssetName: string;
            aTokenName: string;
            aTokenSymbol: string;
            variableDebtTokenName: string;
            variableDebtTokenSymbol: string;
            stableDebtTokenName: string;
            stableDebtTokenSymbol: string;
            params: BytesLike;
            assetType: BigNumberish;
            collateralCap: BigNumberish;
            usingGovernanceSetInterestRate: boolean;
            governanceSetInterestRate: BigNumberish;
          };
          trancheId: BigNumberish;
        };
      },
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getAbiEncodedAToken(
      vars: {
        pool: string;
        DefaultVMEXTreasury: string;
        internalInput: {
          input: {
            aTokenImpl: string;
            stableDebtTokenImpl: string;
            variableDebtTokenImpl: string;
            underlyingAssetDecimals: BigNumberish;
            interestRateStrategyAddress: string;
            underlyingAsset: string;
            treasury: string;
            incentivesController: string;
            underlyingAssetName: string;
            aTokenName: string;
            aTokenSymbol: string;
            variableDebtTokenName: string;
            variableDebtTokenSymbol: string;
            stableDebtTokenName: string;
            stableDebtTokenSymbol: string;
            params: BytesLike;
            assetType: BigNumberish;
            collateralCap: BigNumberish;
            usingGovernanceSetInterestRate: boolean;
            governanceSetInterestRate: BigNumberish;
          };
          trancheId: BigNumberish;
        };
      },
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getAbiEncodedAToken((ILendingPool,address,((address,address,address,uint8,address,address,address,address,string,string,string,string,string,string,string,bytes,uint8,uint256,bool,uint256),uint64)))"(
      vars: {
        pool: string;
        DefaultVMEXTreasury: string;
        internalInput: {
          input: {
            aTokenImpl: string;
            stableDebtTokenImpl: string;
            variableDebtTokenImpl: string;
            underlyingAssetDecimals: BigNumberish;
            interestRateStrategyAddress: string;
            underlyingAsset: string;
            treasury: string;
            incentivesController: string;
            underlyingAssetName: string;
            aTokenName: string;
            aTokenSymbol: string;
            variableDebtTokenName: string;
            variableDebtTokenSymbol: string;
            stableDebtTokenName: string;
            stableDebtTokenSymbol: string;
            params: BytesLike;
            assetType: BigNumberish;
            collateralCap: BigNumberish;
            usingGovernanceSetInterestRate: boolean;
            governanceSetInterestRate: BigNumberish;
          };
          trancheId: BigNumberish;
        };
      },
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}