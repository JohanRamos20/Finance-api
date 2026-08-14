import { TokenGenerator } from "../../src/domain/services/token-generator";

export class FakeTokenGenerator implements TokenGenerator {
    generate(payload: { userId: string }): string {
        return `fake-token:${payload.userId}`;
    }

    verify(token: string): { userId: string } | null {
        const prefix = "fake-token:";
        return token.startsWith(prefix)
            ? { userId: token.slice(prefix.length) }
            : null;
    }
}


