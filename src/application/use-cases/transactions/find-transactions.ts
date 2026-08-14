import { TransactionDto, toTransactionDto } from "../../dtos/transaction-dtos";
import { BusinessError } from "../../../domain/errors/business-error";
import { TransactionFilters, TransactionRepository } from "../../../domain/repositories/transaction-repository";
import { WalletRepository } from "../../../domain/repositories/wallet-repository";

export interface FindTransactionsRequest {
    userId: string;
    filters: TransactionFilters;
}

export class FindTransactionsUseCase {
    constructor(
        private readonly transactionRepository: TransactionRepository,
        private readonly walletRepository: WalletRepository,
    ) {}

    async execute(request: FindTransactionsRequest): Promise<TransactionDto[]> {
        const wallet = await this.walletRepository.findByUserId(request.userId);
        if (!wallet) {
            throw new BusinessError("Carteira não encontrada", 404);
        }

        const transactions = await this.transactionRepository.findByFilters(
            wallet.id,
            request.filters,
        );
        return transactions.map(toTransactionDto);
    }
}
