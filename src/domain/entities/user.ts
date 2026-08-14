import { v4 as uuid } from "uuid";

export interface UserProperties {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt?: Date;
}

export class User {
    readonly id: string;
    name: string;
    email: string;
    passwordHash: string;
    readonly createdAt: Date;

    constructor(properties: UserProperties) {
        this.id = properties.id ?? uuid();
        this.name = properties.name;
        this.email = properties.email;
        this.passwordHash = properties.passwordHash;
        this.createdAt = properties.createdAt ?? new Date();
    }

    static create(properties: UserProperties): User {
        if (properties.name.length === 0) {
            throw new Error("O nome é obrigatório");
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!properties.email || !emailPattern.test(properties.email)) {
            throw new Error("O email é inválido");
        }

        return new User(properties);
    }

    static createFromPrimitives(properties: Required<UserProperties>): User {
        return new User(properties);
    }
}
