import { NextFunction, Request, Response } from "express";
import { CreateTransactionUseCase } from "../../../application/use-cases/transactions/create-transaction";
import { FindTransactionsUseCase } from "../../../application/use-cases/transactions/find-transactions";
import { getAuthenticatedUserId } from "../helpers/get-authenticated-user-id";
import {
    createTransactionSchema,
    transactionFiltersSchema,
} from "../validators/transaction-validator";

export interface TransactionUseCases {
    create: CreateTransactionUseCase;
    findAll: FindTransactionsUseCase;
}

export class TransactionController {
    constructor(private readonly useCases: TransactionUseCases) {}

    async create(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const transaction = await this.useCases.create.execute({
                ...createTransactionSchema.parse(request.body),
                userId: getAuthenticatedUserId(request),
            });
            response.status(201).json(transaction);
        } catch (error) {
            next(error);
        }
    }

    async findAll(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const transactions = await this.useCases.findAll.execute({
                userId: getAuthenticatedUserId(request),
                filters: transactionFiltersSchema.parse(request.query),
            });
            response.status(200).json(transactions);
        } catch (error) {
            next(error);
        }
    }
}
