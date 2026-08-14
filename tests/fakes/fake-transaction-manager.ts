import {
    TransactionCallback,
    TransactionConfig,
    TransactionManager,
    UnitOfWork,
} from "../../src/domain/managers/transaction-manager";

export class FakeTransactionManager implements TransactionManager {
    constructor(private readonly unitOfWork: UnitOfWork) {}

    execute<T>(
        action: TransactionCallback<T>,
        _config?: TransactionConfig,
    ): Promise<T> {
        return action(this.unitOfWork);
    }
}


