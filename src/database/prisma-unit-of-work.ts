import { UnitOfWork } from "../domain/managers/transaction-manager";
import { UserRepository } from "../domain/repositories/user-repository";
import { WalletRepository } from "../domain/repositories/wallet-repository";
import { PrismaUserRepository } from "../infrastructure/repositories/prisma-user-repository";
import { PrismaWalletRepository } from "../infrastructure/repositories/prisma-wallet-repository";
import { PrismaRepositoryClient } from "./prisma-repository-client";

export class PrismaUnitOfWork implements UnitOfWork {
    readonly userRepository: UserRepository;
    readonly walletRepository: WalletRepository;

    constructor(client: PrismaRepositoryClient) {
        this.userRepository = new PrismaUserRepository(client);
        this.walletRepository = new PrismaWalletRepository(client);
    }
}
