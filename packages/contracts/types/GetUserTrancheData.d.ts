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

interface GetUserTrancheDataInterface extends ethers.utils.Interface {
  functions: {
    "getType()": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "getType", values?: undefined): string;

  decodeFunctionResult(functionFragment: "getType", data: BytesLike): Result;

  events: {};
}

export class GetUserTrancheData extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: GetUserTrancheDataInterface;

  functions: {
    getType(overrides?: CallOverrides): Promise<{
      0: [
        {
          totalCollateralETH: BigNumber;
          totalDebtETH: BigNumber;
          availableBorrowsETH: BigNumber;
          currentLiquidationThreshold: BigNumber;
          ltv: BigNumber;
          healthFactor: BigNumber;
          0: BigNumber;
          1: BigNumber;
          2: BigNumber;
          3: BigNumber;
          4: BigNumber;
          5: BigNumber;
        },
        {
          totalCollateralETH: BigNumber;
          totalDebtETH: BigNumber;
          availableBorrowsETH: BigNumber;
          currentLiquidationThreshold: BigNumber;
          ltv: BigNumber;
          healthFactor: BigNumber;
          0: BigNumber;
          1: BigNumber;
          2: BigNumber;
          3: BigNumber;
          4: BigNumber;
          5: BigNumber;
        },
        {
          totalCollateralETH: BigNumber;
          totalDebtETH: BigNumber;
          availableBorrowsETH: BigNumber;
          currentLiquidationThreshold: BigNumber;
          ltv: BigNumber;
          healthFactor: BigNumber;
          0: BigNumber;
          1: BigNumber;
          2: BigNumber;
          3: BigNumber;
          4: BigNumber;
          5: BigNumber;
        }
      ];
    }>;

    "getType()"(overrides?: CallOverrides): Promise<{
      0: [
        {
          totalCollateralETH: BigNumber;
          totalDebtETH: BigNumber;
          availableBorrowsETH: BigNumber;
          currentLiquidationThreshold: BigNumber;
          ltv: BigNumber;
          healthFactor: BigNumber;
          0: BigNumber;
          1: BigNumber;
          2: BigNumber;
          3: BigNumber;
          4: BigNumber;
          5: BigNumber;
        },
        {
          totalCollateralETH: BigNumber;
          totalDebtETH: BigNumber;
          availableBorrowsETH: BigNumber;
          currentLiquidationThreshold: BigNumber;
          ltv: BigNumber;
          healthFactor: BigNumber;
          0: BigNumber;
          1: BigNumber;
          2: BigNumber;
          3: BigNumber;
          4: BigNumber;
          5: BigNumber;
        },
        {
          totalCollateralETH: BigNumber;
          totalDebtETH: BigNumber;
          availableBorrowsETH: BigNumber;
          currentLiquidationThreshold: BigNumber;
          ltv: BigNumber;
          healthFactor: BigNumber;
          0: BigNumber;
          1: BigNumber;
          2: BigNumber;
          3: BigNumber;
          4: BigNumber;
          5: BigNumber;
        }
      ];
    }>;
  };

  getType(
    overrides?: CallOverrides
  ): Promise<
    [
      {
        totalCollateralETH: BigNumber;
        totalDebtETH: BigNumber;
        availableBorrowsETH: BigNumber;
        currentLiquidationThreshold: BigNumber;
        ltv: BigNumber;
        healthFactor: BigNumber;
        0: BigNumber;
        1: BigNumber;
        2: BigNumber;
        3: BigNumber;
        4: BigNumber;
        5: BigNumber;
      },
      {
        totalCollateralETH: BigNumber;
        totalDebtETH: BigNumber;
        availableBorrowsETH: BigNumber;
        currentLiquidationThreshold: BigNumber;
        ltv: BigNumber;
        healthFactor: BigNumber;
        0: BigNumber;
        1: BigNumber;
        2: BigNumber;
        3: BigNumber;
        4: BigNumber;
        5: BigNumber;
      },
      {
        totalCollateralETH: BigNumber;
        totalDebtETH: BigNumber;
        availableBorrowsETH: BigNumber;
        currentLiquidationThreshold: BigNumber;
        ltv: BigNumber;
        healthFactor: BigNumber;
        0: BigNumber;
        1: BigNumber;
        2: BigNumber;
        3: BigNumber;
        4: BigNumber;
        5: BigNumber;
      }
    ]
  >;

  "getType()"(
    overrides?: CallOverrides
  ): Promise<
    [
      {
        totalCollateralETH: BigNumber;
        totalDebtETH: BigNumber;
        availableBorrowsETH: BigNumber;
        currentLiquidationThreshold: BigNumber;
        ltv: BigNumber;
        healthFactor: BigNumber;
        0: BigNumber;
        1: BigNumber;
        2: BigNumber;
        3: BigNumber;
        4: BigNumber;
        5: BigNumber;
      },
      {
        totalCollateralETH: BigNumber;
        totalDebtETH: BigNumber;
        availableBorrowsETH: BigNumber;
        currentLiquidationThreshold: BigNumber;
        ltv: BigNumber;
        healthFactor: BigNumber;
        0: BigNumber;
        1: BigNumber;
        2: BigNumber;
        3: BigNumber;
        4: BigNumber;
        5: BigNumber;
      },
      {
        totalCollateralETH: BigNumber;
        totalDebtETH: BigNumber;
        availableBorrowsETH: BigNumber;
        currentLiquidationThreshold: BigNumber;
        ltv: BigNumber;
        healthFactor: BigNumber;
        0: BigNumber;
        1: BigNumber;
        2: BigNumber;
        3: BigNumber;
        4: BigNumber;
        5: BigNumber;
      }
    ]
  >;

  callStatic: {
    getType(
      overrides?: CallOverrides
    ): Promise<
      [
        {
          totalCollateralETH: BigNumber;
          totalDebtETH: BigNumber;
          availableBorrowsETH: BigNumber;
          currentLiquidationThreshold: BigNumber;
          ltv: BigNumber;
          healthFactor: BigNumber;
          0: BigNumber;
          1: BigNumber;
          2: BigNumber;
          3: BigNumber;
          4: BigNumber;
          5: BigNumber;
        },
        {
          totalCollateralETH: BigNumber;
          totalDebtETH: BigNumber;
          availableBorrowsETH: BigNumber;
          currentLiquidationThreshold: BigNumber;
          ltv: BigNumber;
          healthFactor: BigNumber;
          0: BigNumber;
          1: BigNumber;
          2: BigNumber;
          3: BigNumber;
          4: BigNumber;
          5: BigNumber;
        },
        {
          totalCollateralETH: BigNumber;
          totalDebtETH: BigNumber;
          availableBorrowsETH: BigNumber;
          currentLiquidationThreshold: BigNumber;
          ltv: BigNumber;
          healthFactor: BigNumber;
          0: BigNumber;
          1: BigNumber;
          2: BigNumber;
          3: BigNumber;
          4: BigNumber;
          5: BigNumber;
        }
      ]
    >;

    "getType()"(
      overrides?: CallOverrides
    ): Promise<
      [
        {
          totalCollateralETH: BigNumber;
          totalDebtETH: BigNumber;
          availableBorrowsETH: BigNumber;
          currentLiquidationThreshold: BigNumber;
          ltv: BigNumber;
          healthFactor: BigNumber;
          0: BigNumber;
          1: BigNumber;
          2: BigNumber;
          3: BigNumber;
          4: BigNumber;
          5: BigNumber;
        },
        {
          totalCollateralETH: BigNumber;
          totalDebtETH: BigNumber;
          availableBorrowsETH: BigNumber;
          currentLiquidationThreshold: BigNumber;
          ltv: BigNumber;
          healthFactor: BigNumber;
          0: BigNumber;
          1: BigNumber;
          2: BigNumber;
          3: BigNumber;
          4: BigNumber;
          5: BigNumber;
        },
        {
          totalCollateralETH: BigNumber;
          totalDebtETH: BigNumber;
          availableBorrowsETH: BigNumber;
          currentLiquidationThreshold: BigNumber;
          ltv: BigNumber;
          healthFactor: BigNumber;
          0: BigNumber;
          1: BigNumber;
          2: BigNumber;
          3: BigNumber;
          4: BigNumber;
          5: BigNumber;
        }
      ]
    >;
  };

  filters: {};

  estimateGas: {
    getType(overrides?: CallOverrides): Promise<BigNumber>;

    "getType()"(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    getType(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "getType()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
