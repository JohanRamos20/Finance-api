import {
    afterAll,
    afterEach,
    describe,
    expect,
    it,
} from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "../../../src/database/prisma";
import { PrismaTransactionManager } from "../../../src/database/prisma-transaction-manager";
import { User } from "../../../src/domain/entities/user";
import { Wallet } from "../../../src/domain/entities/wallet";

describe.sequential("PrismaTransactionManager", () => {
    const transactionManager =
        new PrismaTransactionManager(prisma);

    let userId: string | undefined;

    afterEach(async () => {
        if (!userId) return;

        await prisma.wallet.deleteMany({
            where: { userId: userId },
        });

        await prisma.user.deleteMany({
            where: { id: userId },
        });

        userId = undefined;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("deve confirmar todas as operações", async () => {
        const user = User.create({
            name: "Teste Commit",
            email: `commit-${randomUUID()}@teste.com`,
            passwordHash: "hash",
        });

        userId = user.id;

        const wallet = Wallet.create({
            userId: user.id,
        });

        await transactionManager.execute(
            async ({ userRepository, walletRepository }) => {
                await userRepository.create(user);
                await walletRepository.create(wallet);
            }
        );

        expect(
            await prisma.user.findUnique({
                where: { id: user.id },
            })
        ).not.toBeNull();

        expect(
            await prisma.wallet.findUnique({
                where: { userId: user.id },
            })
        ).not.toBeNull();
    });

    it("deve desfazer tudo quando ocorrer um erro", async () => {
        const user = User.create({
            name: "Teste Rollback",
            email: `rollback-${randomUUID()}@teste.com`,
            passwordHash: "hash",
        });

        userId = user.id;

        const wallet = Wallet.create({
            userId: user.id,
        });

        await expect(
            transactionManager.execute(
                async ({ userRepository, walletRepository }) => {
                    await userRepository.create(user);
                    await walletRepository.create(wallet);

                    throw new Error("Falha proposital");
                }
            )
        ).rejects.toThrow("Falha proposital");

        expect(
            await prisma.user.findUnique({
                where: { id: user.id },
            })
        ).toBeNull();

        expect(
            await prisma.wallet.findUnique({
                where: { userId: user.id },
            })
        ).toBeNull();
    });
});




