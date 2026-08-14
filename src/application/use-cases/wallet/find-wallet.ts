import { Wallet } from "../../../domain/entities/wallet";
import { BusinessError } from "../../../domain/errors/business-error";
import { WalletRepository } from "../../../domain/repositories/wallet-repository";

export interface FindWalletRequest {
    userId: string;
}

export class FindWalletUseCase {
    constructor(private readonly walletRepository: WalletRepository) {}

    async execute(request: FindWalletRequest): Promise<Wallet> {
        const wallet = await this.walletRepository.findByUserId(request.userId);
        if (!wallet) {
            throw new BusinessError("Carteira não encontrada para o usuário", 404);
        }
        return wallet;
    }
}
