import { Category, TransactionType } from "../entities/transaction";
import { Event } from "./domain-event";

export class TransactionCreatedEvent implements Event {
    static readonly eventName = "transaction.created";

    readonly name = TransactionCreatedEvent.eventName;
    readonly occurredAt = new Date();

    constructor(
        readonly userId: string,
        readonly transactionId: string,
        readonly walletId: string,
        readonly amount: number,
        readonly transactionName: string,
        readonly category: Category,
        readonly transactionType: TransactionType,
    ) {}
}
