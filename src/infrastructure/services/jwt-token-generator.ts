import * as jwt from 'jsonwebtoken';
import { TokenGenerator } from '../../domain/services/token-generator';

const EXPIRES_IN = '2h';

function getSecretKey(): string {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error("JWT_SECRET não está definida");
    }
    return secretKey;
}

export class JwtTokenGenerator implements TokenGenerator {
    private readonly secretKey: string;

    constructor() {
        this.secretKey = getSecretKey();
    }

    generate(payload: { userId: string }): string {
        return jwt.sign(payload, this.secretKey, { expiresIn: EXPIRES_IN });
    }

    verify(token: string): { userId: string } | null {
        try {
            const payload = jwt.verify(token, this.secretKey);
            if (typeof payload === "string" || typeof payload.userId !== "string") {
                return null;
            }
            return { userId: payload.userId };
        } catch {
            return null;
        }
    }
}

