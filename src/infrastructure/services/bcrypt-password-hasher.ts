import bcrypt from 'bcryptjs';
import { PasswordHasher } from '../../domain/services/password-hasher';

export class BcryptPasswordHasher implements PasswordHasher {
    private readonly saltRounds: number;

    constructor(saltRounds: number = 10) {
        this.saltRounds = saltRounds;
    }

    async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    }
    async compare(password: string, hash: string): Promise<boolean> {
        const passwordHash = await bcrypt.hash(password, this.saltRounds);
        return await bcrypt.compare(password, hash);
    }
}

