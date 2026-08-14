import { TransactionType } from "../../domain/entities/transaction";
import { eventBus } from "../../domain/events/event-bus";
import { TransactionCreatedEvent } from "../../domain/events/transaction-created.event";
import { WalletRepository } from "../../domain/repositories/wallet-repository";

export function registerBalanceCacheListener(
    walletRepository: WalletRepository,
): void {
    eventBus.subscribe<TransactionCreatedEvent>(
        TransactionCreatedEvent.eventName,
        async (event) => {
            const delta = event.transactionType === TransactionType.CREDIT
                ? event.amount
                : -event.amount;

            await walletRepository.incrementCachedBalance(event.walletId, delta);
        },
    );
}
