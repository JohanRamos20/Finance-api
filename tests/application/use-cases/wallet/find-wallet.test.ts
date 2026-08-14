import { FakeWalletRepository } from "../../../fakes/fake-wallet-repository";
import { Wallet } from "../../../../src/domain/entities/wallet";
import { FindWalletUseCase } from "../../../../src/application/use-cases/wallet/find-wallet"
import { describe, it, expect, beforeEach } from "vitest";

describe("FindWalletUseCase", () => {
    let walletRepository : FakeWalletRepository
    let useCase : FindWalletUseCase

    beforeEach(() => {
        walletRepository = new FakeWalletRepository
        useCase = new FindWalletUseCase(
            walletRepository
        )
    })

    it("Deve encontrar a wallet de um usuário", async () => {
        const userId = "userId123"

        const wallet = Wallet.create({
            userId
        })

        await walletRepository.create(wallet)

        const result = await useCase.execute({userId : userId})

        expect(result.userId).toBe(userId)

    })

    it("Deve lançar um businessError se a wallet não for encontrado", async () =>{
        const userId = "userId123"
        const invalidUserId = "incorreto"

        const wallet = Wallet.create({
            userId
        })

        await walletRepository.create(wallet)

        await expect(useCase.execute({userId : invalidUserId})).rejects.toMatchObject({
            message: "Carteira não encontrada para o usuário",
            statusCode: 404
        })
    })
})





