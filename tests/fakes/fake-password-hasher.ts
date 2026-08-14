import { PasswordHasher } from "../../src/domain/services/password-hasher";

export class FakePasswordHasher implements PasswordHasher {
    async hash(password: string): Promise<string> {
        return `hashed:${password}`
    }

    async compare(password: string, hash: string): Promise<boolean> {
        return hash === `hashed:${password}`
    }
}



