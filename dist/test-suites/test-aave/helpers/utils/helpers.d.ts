import { LendingPool } from "../../../../types/LendingPool";
import { ReserveData, UserReserveData } from "./interfaces";
import { tEthereumAddress } from "../../../../helpers/types";
import { AaveProtocolDataProvider } from "../../../../types/AaveProtocolDataProvider";
export declare const getReserveData: (helper: AaveProtocolDataProvider, reserve: tEthereumAddress, tranche: string) => Promise<ReserveData>;
export declare const getUserData: (pool: LendingPool, helper: AaveProtocolDataProvider, reserve: string, tranche: string, user: tEthereumAddress, sender?: tEthereumAddress) => Promise<UserReserveData>;
export declare const getReserveAddressFromSymbol: (symbol: string) => Promise<string>;
