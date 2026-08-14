import { Transaction } from "../../src/domain/entities/transaction";
import {
    TransactionFilters,
    TransactionRepository,
} from "../../src/domain/repositories/transaction-repository";

export class FakeTransactionRepository implements TransactionRepository {
    private readonly transactions: Transaction[] = [];

    async create(transaction: Transaction): Promise<Transaction> {
        this.transactions.push(transaction);
        return transaction;
    }

    async findByFilters(
        walletId: string,
        filters: TransactionFilters,
    ): Promise<Transaction[]> {
        return this.transactions.filter(transaction => {
            if (transaction.walletId !== walletId) return false;
            if (filters.transactionType && transaction.transactionType !== filters.transactionType) return false;
            if (filters.category && transaction.category !== filters.category) return false;
            return true;
        });
    }

    getAll(): Transaction[] {
        return [...this.transactions];
    }
}


