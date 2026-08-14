import { v4 as uuid } from "uuid";

export interface GoalProperties {
    id?: string;
    userId: string;
    name: string;
    description?: string;
    targetAmount: number;
    savedAmount?: number;
    createdAt?: Date;
}

export class Goal {
    readonly id: string;
    readonly userId: string;
    name: string;
    description: string;
    targetAmount: number;
    savedAmount: number;
    readonly createdAt: Date;

    constructor(properties: GoalProperties) {
        this.id = properties.id ?? uuid();
        this.userId = properties.userId;
        this.name = properties.name;
        this.description = properties.description ?? "Sem descrição";
        this.targetAmount = properties.targetAmount;
        this.savedAmount = properties.savedAmount ?? 0;
        this.createdAt = properties.createdAt ?? new Date();
    }

    static create(properties: GoalProperties): Goal {
        if (properties.name.length === 0) {
            throw new Error("O nome é obrigatório");
        }
        if (properties.targetAmount <= 0) {
            throw new Error("O valor total é obrigatório");
        }
        return new Goal(properties);
    }

    addSavedAmount(amount: number): void {
        if (amount <= 0) {
            throw new Error("O valor guardado deve ser maior que 0");
        }
        if (this.savedAmount + amount > this.targetAmount) {
            throw new Error("O valor guardado não pode ser maior que o valor total da meta");
        }
        this.savedAmount += amount;
    }

    isReached(): boolean {
        return this.savedAmount >= this.targetAmount;
    }

    getRemainingAmount(): number {
        return this.targetAmount - this.savedAmount;
    }

    static createFromPrimitives(properties: Required<GoalProperties>): Goal {
        return new Goal(properties);
    }
}
