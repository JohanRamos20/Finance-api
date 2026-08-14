import { v4 as uuid } from "uuid";

export enum Category {
    LEISURE = "LEISURE",
    GROCERIES = "GROCERIES",
    EXPENSES = "EXPENSES",
    SHOPPING = "SHOPPING",
    FOOD = "FOOD",
    SALARY = "SALARY",
}

export enum TransactionType {
    DEBIT = "DEBIT",
    CREDIT = "CREDIT",
}

export function isCategory(value: unknown): value is Category {
    return Object.values(Category).includes(value as Category);
}

export function isTransactionType(value: unknown): value is TransactionType {
    return Object.values(TransactionType).includes(value as TransactionType);
}

export interface TransactionProperties {
    id?: string;
    walletId: string;
    name: string;
    amount: number;
    category: Category;
    transactionType: TransactionType;
    createdAt?: Date;
}

export class Transaction {
    readonly id: string;
    readonly walletId: string;
    name: string;
    amount: number;
    category: Category;
    transactionType: TransactionType;
    readonly createdAt: Date;

    constructor(properties: TransactionProperties) {
        this.id = properties.id ?? uuid();
        this.walletId = properties.walletId;
        this.name = properties.name;
        this.amount = properties.amount;
        this.category = properties.category;
        this.transactionType = properties.transactionType;
        this.createdAt = properties.createdAt ?? new Date();
    }

    static create(properties: TransactionProperties): Transaction {
        if (properties.amount <= 0) {
            throw new Error("O valor da transação deve ser maior que zero");
        }
        if (properties.name.length === 0) {
            throw new Error("O nome da transação não pode ser vazio");
        }
        if (!isCategory(properties.category)) {
            throw new Error("Categoria inválida");
        }
        if (!isTransactionType(properties.transactionType)) {
            throw new Error("Tipo de transação inválido");
        }

        return new Transaction(properties);
    }

    static createFromPrimitives(properties: {
        id: string;
        walletId: string;
        name: string;
        amount: number;
        category: string;
        transactionType: string;
        createdAt: Date;
    }): Transaction {
        return new Transaction({
            ...properties,
            category: properties.category as Category,
            transactionType: properties.transactionType as TransactionType,
        });
    }
}
