import { Category, Transaction, TransactionType } from "../entities/transaction";

export interface TransactionFilters {
    category?: Category;
    transactionType?: TransactionType;
}

export interface TransactionRepository {
    create(transaction: Transaction): Promise<Transaction>;
    findByFilters(walletId: string, filters: TransactionFilters): Promise<Transaction[]>;
}
