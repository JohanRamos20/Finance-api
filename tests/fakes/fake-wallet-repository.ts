import { TransactionType } from "../../src/domain/entities/transaction";
import { Wallet } from "../../src/domain/entities/wallet";
import { WalletRepository } from "../../src/domain/repositories/wallet-repository";

interface StoredTransaction {
    walletId: string;
    amount: number;
    transactionType: TransactionType;
}

export class FakeWalletRepository implements WalletRepository {
    private readonly wallets: Wallet[] = [];
    private readonly transactions: StoredTransaction[] = [];
    private readonly cache = new Map<string, { balance: number; expiresAt: number }>();
    private readonly cacheTtlMs = 3_600_000;

    async findByUserId(userId: string): Promise<Wallet | null> {
        return this.wallets.find(wallet => wallet.userId === userId) ?? null;
    }

    async calculateBalance(walletId: string): Promise<number> {
        return this.transactions
            .filter(transaction => transaction.walletId === walletId)
            .reduce((balance, transaction) => {
                return transaction.transactionType === TransactionType.CREDIT
                    ? balance + transaction.amount
                    : balance - transaction.amount;
            }, 0);
    }

    async getCachedBalance(walletId: string): Promise<number | null> {
        const entry = this.cache.get(this.cacheKey(walletId));
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(this.cacheKey(walletId));
            return null;
        }
        return entry.balance;
    }

    async incrementCachedBalance(walletId: string, delta: number): Promise<void> {
        const key = this.cacheKey(walletId);
        const entry = this.cache.get(key);
        if (!entry) {
            await this.setCachedBalance(walletId, await this.calculateBalance(walletId));
            return;
        }
        entry.balance += delta;
    }

    async setCachedBalance(walletId: string, balance: number): Promise<void> {
        this.cache.set(this.cacheKey(walletId), {
            balance,
            expiresAt: Date.now() + this.cacheTtlMs,
        });
    }

    async create(wallet: Wallet): Promise<Wallet> {
        this.wallets.push(wallet);
        return wallet;
    }

    addTransaction(walletId: string, amount: number, transactionType: TransactionType): void {
        this.transactions.push({ walletId, amount, transactionType });
    }

    getAll(): Wallet[] {
        return [...this.wallets];
    }

    private cacheKey(walletId: string): string {
        return `wallet:balance:${walletId}`;
    }
}


