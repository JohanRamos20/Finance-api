import { Wallet } from "../entities/wallet";

export interface WalletRepository {
    findByUserId(userId: string): Promise<Wallet | null>;
    calculateBalance(walletId: string): Promise<number>;
    getCachedBalance(walletId: string): Promise<number | null>;
    setCachedBalance(walletId: string, balance: number): Promise<void>;
    incrementCachedBalance(walletId: string, delta: number): Promise<void>;
    create(wallet: Wallet): Promise<Wallet>;
}
