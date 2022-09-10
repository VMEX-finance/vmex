/// <reference types="node" />
import { EventEmitter } from "events";
interface Transaction {
    chainId: number;
    to: string;
    data: any;
}
export declare abstract class BaseTransactionClass extends EventEmitter {
    constructor();
    getChainId(): number;
    submitTransaction(transaction: Transaction): Promise<void>;
}
export {};
