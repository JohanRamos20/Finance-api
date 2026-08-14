import { describe, it, expect, beforeEach} from 'vitest'
import { Transaction, Category, TransactionType } from '../../../../src/domain/entities/transaction'
import { Wallet } from '../../../../src/domain/entities/wallet'
import { FakeTransactionRepository } from '../../../fakes/fake-transaction-repository'
import { FakeWalletRepository } from '../../../fakes/fake-wallet-repository'
import { CreateTransactionUseCase } from "../../../../src/application/use-cases/transactions/create-transaction"

describe("CreateTransactionUseCase", () => {
    let transactionRepository : FakeTransactionRepository
    let walletRepository : FakeWalletRepository
    let useCase : CreateTransactionUseCase

    beforeEach(() => {
        transactionRepository = new FakeTransactionRepository()
        walletRepository = new FakeWalletRepository()

        useCase = new CreateTransactionUseCase(
            transactionRepository,
            walletRepository
        )
    })

    it("Deve criar uma transaction", async () => {
        const wallet = Wallet.create({userId :'userId123'})
        await walletRepository.create(wallet)

        const result = await useCase.execute({
            name: 'Aluguel',
            userId: 'userId123',
            amount: 1500,
            category: Category.EXPENSES,
            transactionType: TransactionType.DEBIT
        })

        expect(result.name).toBe('Aluguel')
        expect(result.amount).toBe(1500)
        expect(result.category).toBe(Category.EXPENSES)
        expect(result.transactionType).toBe(TransactionType.DEBIT)

    })

    it("Deve persistir uma transaction no repositório", async () => {
        const wallet = Wallet.create({userId :'userId123'})
        await walletRepository.create(wallet)

        await useCase.execute({
            name: 'Aluguel',
            userId: 'userId123',
            amount: 1500,
            category: Category.EXPENSES,
            transactionType: TransactionType.DEBIT
        })

        const transactions = transactionRepository.getAll()

        expect(transactions[0]).toMatchObject({
            walletId: wallet.id,
            name: "Aluguel",
            amount: 1500,
            category : Category.EXPENSES,
            transactionType : TransactionType.DEBIT
        });

    })

    it("Deve lançar businessError se a wallet não for encotrada", async () => {
        const wallet = Wallet.create({userId :'userId123'})
        await walletRepository.create(wallet)

        await expect( useCase.execute({
            name: 'Aluguel',
            userId: 'id_invalido',
            amount: 1500,
            category: Category.EXPENSES,
            transactionType: TransactionType.DEBIT
        })
        ).rejects.toMatchObject({
            message: "Carteira não encontrada",
            statusCode: 404
        })
    })


})




