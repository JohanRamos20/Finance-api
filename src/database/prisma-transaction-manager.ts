import { PrismaClient } from "@prisma/client";
import {
    TransactionCallback,
    TransactionConfig,
    TransactionManager,
} from "../domain/managers/transaction-manager";
import { prisma } from "./prisma";
import { PrismaUnitOfWork } from "./prisma-unit-of-work";

const DEFAULT_CONFIG: Required<TransactionConfig> = {
    timeout: 30_000,
    isolationLevel: "ReadCommitted",
};

export class PrismaTransactionManager implements TransactionManager {
    private readonly config: Required<TransactionConfig>;

    constructor(
        private readonly client: PrismaClient = prisma,
        config: TransactionConfig = {},
    ) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    execute<T>(
        action: TransactionCallback<T>,
        config?: TransactionConfig,
    ): Promise<T> {
        return this.client.$transaction(
            async (transactionClient) => {
                return action(new PrismaUnitOfWork(transactionClient));
            },
            { ...this.config, ...config },
        );
    }
}
