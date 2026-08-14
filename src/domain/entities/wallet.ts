import { v4 as uuid } from "uuid";

export interface WalletProperties {
    id?: string;
    userId: string;
}

export class Wallet {
    readonly id: string;
    readonly userId: string;

    constructor(properties: WalletProperties) {
        this.id = properties.id ?? uuid();
        this.userId = properties.userId;
    }

    static create(properties: WalletProperties): Wallet {
        return new Wallet(properties);
    }

    static createFromPrimitives(properties: Required<WalletProperties>): Wallet {
        return new Wallet(properties);
    }
}
