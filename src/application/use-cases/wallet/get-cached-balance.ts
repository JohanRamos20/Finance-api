import { BusinessError } from "../../../domain/errors/business-error";
import { WalletRepository } from "../../../domain/repositories/wallet-repository";

export interface GetCachedBalanceRequest {
    userId: string;
}

export class GetCachedBalanceUseCase {
    constructor(private readonly walletRepository: WalletRepository) {}

    async execute(request: GetCachedBalanceRequest): Promise<number> {
        const wallet = await this.walletRepository.findByUserId(request.userId);
        if (!wallet) {
            throw new BusinessError("Carteira não encontrada", 404);
        }

        let balance = await this.walletRepository.getCachedBalance(wallet.id);
        if (balance === null) {
            balance = await this.walletRepository.calculateBalance(wallet.id);
            await this.walletRepository.setCachedBalance(wallet.id, balance);
        }

        return balance;
    }
}
