import { Transaction } from "../../domain/entities/transaction";

export interface TransactionDto {
    name: string;
    amount: number;
    category: string;
    transactionType: string;
    createdAt: Date;
}

export function toTransactionDto(transaction: Transaction): TransactionDto {
    return {
        name: transaction.name,
        amount: transaction.amount,
        category: transaction.category,
        transactionType: transaction.transactionType,
        createdAt: transaction.createdAt,
    };
}

