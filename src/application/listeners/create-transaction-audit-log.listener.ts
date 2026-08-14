import { eventBus } from "../../domain/events/event-bus";
import { TransactionCreatedEvent } from "../../domain/events/transaction-created.event";
import { AuditLogRepository } from "../../domain/repositories/audit-log-repository";

export function registerTransactionAuditLogListener(
    auditLogRepository: AuditLogRepository,
): void {
    eventBus.subscribe<TransactionCreatedEvent>(
        TransactionCreatedEvent.eventName,
        async (event) => {
            await auditLogRepository.register({
                event: event.name,
                userId: event.userId,
                entityId: event.transactionId,
                data: {
                    id: event.transactionId,
                    name: event.transactionName,
                    amount: event.amount,
                    category: event.category,
                    transactionType: event.transactionType,
                    walletId: event.walletId,
                },
            });
        },
    );
}
