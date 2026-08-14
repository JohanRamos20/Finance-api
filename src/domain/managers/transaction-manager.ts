import { UserRepository } from "../repositories/user-repository";
import { WalletRepository } from "../repositories/wallet-repository";

export interface UnitOfWork {
    userRepository: UserRepository;
    walletRepository: WalletRepository;
}

export type TransactionCallback<T> = (unitOfWork: UnitOfWork) => Promise<T>;

export type TransactionIsolationLevel =
    | "ReadUncommitted"
    | "ReadCommitted"
    | "RepeatableRead"
    | "Serializable";

export interface TransactionConfig {
    timeout?: number;
    isolationLevel?: TransactionIsolationLevel;
}

export interface TransactionManager {
    execute<T>(
        action: TransactionCallback<T>,
        config?: TransactionConfig,
    ): Promise<T>;
}
