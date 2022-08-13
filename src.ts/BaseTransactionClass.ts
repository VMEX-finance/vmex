import { BigNumberish } from "@ethersproject/bignumber";
import { EventEmitter } from "events";
import { Interface } from "@ethersproject/abi";

interface Transaction {
    chainId: number,
    to: string,
    data: any
}

export abstract class BaseTransactionClass extends EventEmitter {
    constructor(
    ) {
        super()
    }

    getChainId(): number {
        return 1 //TODO Implement
    };

    async submitTransaction(transaction: Transaction): Promise<void> {
        //TODO implement submitTransaction
    }

}

