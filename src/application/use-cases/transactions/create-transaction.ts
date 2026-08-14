import { TransactionDto, toTransactionDto } from "../../dtos/transaction-dtos";
import { Category, Transaction, TransactionType } from "../../../domain/entities/transaction";
import { BusinessError } from "../../../domain/errors/business-error";
import { eventBus } from "../../../domain/events/event-bus";
import { TransactionCreatedEvent } from "../../../domain/events/transaction-created.event";
import { TransactionRepository } from "../../../domain/repositories/transaction-repository";
import { WalletRepository } from "../../../domain/repositories/wallet-repository";

export interface CreateTransactionRequest {
    userId: string;
    name: string;
    amount: number;
    category: Category;
    transactionType: TransactionType;
}

export class CreateTransactionUseCase {
    constructor(
        private readonly transactionRepository: TransactionRepository,
        private readonly walletRepository: WalletRepository,
    ) {}

    async execute(request: CreateTransactionRequest): Promise<TransactionDto> {
        const wallet = await this.walletRepository.findByUserId(request.userId);
        if (!wallet) {
            throw new BusinessError("Carteira não encontrada", 404);
        }

        const transaction = Transaction.create({
            walletId: wallet.id,
            name: request.name,
            amount: request.amount,
            category: request.category,
            transactionType: request.transactionType,
        });
        const createdTransaction = await this.transactionRepository.create(transaction);

        eventBus.publish(new TransactionCreatedEvent(
            request.userId,
            createdTransaction.id,
            wallet.id,
            createdTransaction.amount,
            createdTransaction.name,
            createdTransaction.category,
            createdTransaction.transactionType,
        ));

        return toTransactionDto(createdTransaction);
    }
}
