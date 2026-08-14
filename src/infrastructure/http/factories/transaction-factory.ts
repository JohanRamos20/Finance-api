import { PrismaTransactionRepository } from "../../repositories/prisma-transaction-repository";
import { PrismaWalletRepository } from "../../repositories/prisma-wallet-repository";
import { TransactionController } from "../controller/transaction-controller";
import { CreateTransactionUseCase } from "../../../application/use-cases/transactions/create-transaction";
import { FindTransactionsUseCase } from "../../../application/use-cases/transactions/find-transactions";
import { prisma } from "../../../database/prisma";


export function makeTransactionController(): TransactionController {
    const transactionRepository = new PrismaTransactionRepository(prisma);
    const walletRepository = new PrismaWalletRepository(prisma);

    return new TransactionController({
        create: new CreateTransactionUseCase(transactionRepository, walletRepository),
        findAll: new FindTransactionsUseCase(transactionRepository, walletRepository)
    });
}

