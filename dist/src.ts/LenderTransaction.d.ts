import { BaseTransactionClass } from "./BaseTransactionClass";
import { BigNumberish } from "@ethersproject/bignumber";
export declare class LendingTransaction extends BaseTransactionClass {
    asset?: string;
    tranche?: number;
    amount?: BigNumberish;
    to?: string;
    isCollateral: boolean;
    referralCode: string | number;
    static contractAddress: string;
    constructor(params: {
        asset: string;
        tranche: number;
        amount: BigNumberish;
        to?: string;
        isCollateral?: boolean;
        referralCode?: string;
    });
    buildLoanTransaction(): Promise<void>;
}
