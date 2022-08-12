abstract class BaseLendingClass {
    constructor() {

    }

    abstract createLendingTransaction(): void;
    abstract submitTransaction(): void;
}