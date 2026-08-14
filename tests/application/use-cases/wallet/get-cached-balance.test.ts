import { describe, it, expect, beforeEach } from 'vitest'
import { FakeWalletRepository } from "../../../fakes/fake-wallet-repository"
import { GetCachedBalanceUseCase } from "../../../../src/application/use-cases/wallet/get-cached-balance"
import { Wallet } from '../../../../src/domain/entities/wallet'
import { TransactionType } from '../../../../src/domain/entities/transaction'


describe('GetSaldoCache', () => {
    let walletRepository : FakeWalletRepository
    let useCase : GetCachedBalanceUseCase

    beforeEach(() => {
        walletRepository = new FakeWalletRepository()
        useCase = new GetCachedBalanceUseCase(walletRepository)
    })

    it('Deve conseguir o balance armazenado na cache já populada', async () => {
        const userId = "userId123"

        const wallet = Wallet.create({
            userId
        })

        await walletRepository.create(wallet)
        await walletRepository.setCachedBalance(wallet.id, 250)

        const balance = await useCase.execute({userId : userId})

        expect(balance).toBe(250)
    })

    it('Deve popular a cache caso ela não exista e retornar o balance', async () => {
        const userId = "userId123"

        const wallet = Wallet.create({
            userId
        })

        await walletRepository.create(wallet)
        walletRepository.addTransaction(wallet.id, 300, TransactionType.CREDIT)
        walletRepository.addTransaction(wallet.id, 200, TransactionType.DEBIT)

        const balance = await useCase.execute({userId : userId})
        expect(balance).toBe(100)

        const balanceNoCache = await walletRepository.getCachedBalance(wallet.id)
        expect(balanceNoCache).toBe(100)

    })

    it('Deve lançar BusinessError se a wallet não for encontrada', async () => {
        await expect(
            useCase.execute({ userId: "inexistente" })
        ).rejects.toMatchObject({
            message: "Carteira não encontrada",
            statusCode: 404
        })
    })

})




