import {
    Category as PrismaCategory,
    Transaction as PrismaTransaction,
    TransactionType as PrismaTransactionType,
} from "@prisma/client";
import { PrismaRepositoryClient } from "../../database/prisma-repository-client";
import { Transaction } from "../../domain/entities/transaction";
import {
    TransactionFilters,
    TransactionRepository,
} from "../../domain/repositories/transaction-repository";

export class PrismaTransactionRepository implements TransactionRepository {
    constructor(private readonly client: PrismaRepositoryClient) {}

    async create(transaction: Transaction): Promise<Transaction> {
        const createdTransaction = await this.client.transaction.create({
            data: {
                id: transaction.id,
                walletId: transaction.walletId,
                name: transaction.name,
                amount: transaction.amount,
                category: transaction.category as PrismaCategory,
                transactionType: transaction.transactionType as PrismaTransactionType,
                createdAt: transaction.createdAt,
            },
        });
        return this.toDomain(createdTransaction);
    }

    async findByFilters(
        walletId: string,
        filters: TransactionFilters,
    ): Promise<Transaction[]> {
        const transactions = await this.client.transaction.findMany({
            where: {
                walletId,
                category: filters.category as PrismaCategory | undefined,
                transactionType: filters.transactionType as PrismaTransactionType | undefined,
            },
            orderBy: { createdAt: "desc" },
        });
        return transactions.map((transaction) => this.toDomain(transaction));
    }

    private toDomain(transaction: PrismaTransaction): Transaction {
        return Transaction.createFromPrimitives({
            ...transaction,
            amount: Number(transaction.amount),
        });
    }
}
