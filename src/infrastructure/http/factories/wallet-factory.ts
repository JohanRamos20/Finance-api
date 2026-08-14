import { PrismaWalletRepository } from "../../repositories/prisma-wallet-repository";
import { WalletController } from "../controller/wallet-controller";
import { FindWalletUseCase } from "../../../application/use-cases/wallet/find-wallet";
import { GetCachedBalanceUseCase } from "../../../application/use-cases/wallet/get-cached-balance";
import { prisma } from "../../../database/prisma";

export function makeWalletController(): WalletController {

    const walletRepository = new PrismaWalletRepository(prisma)

    return new WalletController({
        find: new FindWalletUseCase(walletRepository),
        getBalance: new GetCachedBalanceUseCase(walletRepository)
    })

}

