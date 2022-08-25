"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTransactionClass = void 0;
const events_1 = require("events");
class BaseTransactionClass extends events_1.EventEmitter {
    constructor() {
        super();
    }
    getChainId() {
        return 1; //TODO Implement
    }
    ;
    async submitTransaction(transaction) {
        //TODO implement submitTransaction
    }
}
exports.BaseTransactionClass = BaseTransactionClass;
