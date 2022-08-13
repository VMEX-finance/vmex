import { BaseTransactionClass } from "./BaseTransactionClass";
import { BigNumberish } from "@ethersproject/bignumber";
import { Interface } from "@ethersproject/abi";

export class LendingTransaction extends BaseTransactionClass {
    
    asset: string;
    tranche: number;
    amount: BigNumberish;
    to: string;
    isCollateral: boolean = false;
    referralCode: string | number = '0'

    static contractAddress = ""
    constructor(params: {
        asset: string;
        tranche: number;
        amount: BigNumberish;
        to?: string;
        isCollateral?: boolean;
        referralCode?: string;
    }) {
        super()
        Object.assign(this, params)
    }

    async buildLoanTransaction() {
        const _iface = new Interface([
            "function deposit(address, uint8, bool, uint256, address, uint16)"
        ])

        const data = _iface.encodeFunctionData("deposit", [
            this.asset,
            this.tranche,
            this.isCollateral,
            this.amount,
            this.to,
            this.referralCode
        ])

        await this.submitTransaction({
            chainId: this.getChainId(),
            to: LendingTransaction.contractAddress,
            data: data
        })
    }

}