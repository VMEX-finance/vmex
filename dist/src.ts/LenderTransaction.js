"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LendingTransaction = void 0;
const BaseTransactionClass_1 = require("./BaseTransactionClass");
const abi_1 = require("@ethersproject/abi");
class LendingTransaction extends BaseTransactionClass_1.BaseTransactionClass {
    constructor(params) {
        super();
        this.isCollateral = false;
        this.referralCode = '0';
        Object.assign(this, params);
    }
    async buildLoanTransaction() {
        const _iface = new abi_1.Interface([
            "function deposit(address, uint8, bool, uint256, address, uint16)"
        ]);
        const data = _iface.encodeFunctionData("deposit", [
            this.asset,
            this.tranche,
            this.isCollateral,
            this.amount,
            this.to,
            this.referralCode
        ]);
        await this.submitTransaction({
            chainId: this.getChainId(),
            to: LendingTransaction.contractAddress,
            data: data
        });
    }
}
exports.LendingTransaction = LendingTransaction;
LendingTransaction.contractAddress = "";
