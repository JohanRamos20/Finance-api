export interface TokenGenerator {
    generate(payload: { userId: string}): string;
    verify(token: string): { userId: string } | null;
}

