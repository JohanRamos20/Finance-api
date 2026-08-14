import { TransactionType as PrismaTransactionType, Wallet as PrismaWallet } from "@prisma/client";
import { PrismaRepositoryClient } from "../../database/prisma-repository-client";
import { Wallet } from "../../domain/entities/wallet";
import { WalletRepository } from "../../domain/repositories/wallet-repository";
import { redisClient } from "../cache/redis-client";

const cacheKey = (walletId: string): string => `wallet:balance:${walletId}`;
const CACHE_TTL_SECONDS = 3_600;

export class PrismaWalletRepository implements WalletRepository {
    constructor(private readonly client: PrismaRepositoryClient) {}

    async findByUserId(userId: string): Promise<Wallet | null> {
        const wallet = await this.client.wallet.findUnique({ where: { userId } });
        return wallet ? this.toDomain(wallet) : null;
    }

    async calculateBalance(walletId: string): Promise<number> {
        const groups = await this.client.transaction.groupBy({
            by: ["transactionType"],
            where: { walletId },
            _sum: { amount: true },
        });

        return groups.reduce((balance, group) => {
            const amount = Number(group._sum.amount ?? 0);
            return group.transactionType === PrismaTransactionType.CREDIT
                ? balance + amount
                : balance - amount;
        }, 0);
    }

    async getCachedBalance(walletId: string): Promise<number | null> {
        const value = await redisClient.get(cacheKey(walletId));
        return value === null ? null : Number.parseFloat(value);
    }

    async incrementCachedBalance(walletId: string, delta: number): Promise<void> {
        const key = cacheKey(walletId);
        if (!(await redisClient.exists(key))) {
            await this.setCachedBalance(walletId, await this.calculateBalance(walletId));
            return;
        }
        await redisClient.incrByFloat(key, delta);
    }

    async setCachedBalance(walletId: string, balance: number): Promise<void> {
        await redisClient.set(cacheKey(walletId), balance.toString(), {
            EX: CACHE_TTL_SECONDS,
        });
    }

    async create(wallet: Wallet): Promise<Wallet> {
        const createdWallet = await this.client.wallet.create({
            data: { id: wallet.id, userId: wallet.userId },
        });
        return this.toDomain(createdWallet);
    }

    private toDomain(wallet: PrismaWallet): Wallet {
        return Wallet.createFromPrimitives(wallet);
    }
}
