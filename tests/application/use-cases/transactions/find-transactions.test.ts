import { describe, it, expect, beforeEach } from 'vitest'
import { FakeTransactionRepository } from '../../../fakes/fake-transaction-repository'
import { FakeWalletRepository } from '../../../fakes/fake-wallet-repository'
import { FindTransactionsUseCase } from '../../../../src/application/use-cases/transactions/find-transactions'
import { Wallet } from '../../../../src/domain/entities/wallet'
import { Transaction, Category, TransactionType } from '../../../../src/domain/entities/transaction'

describe('FindTransactionsUseCase', () => {
    let transactionRepository: FakeTransactionRepository
    let walletRepository: FakeWalletRepository
    let useCase: FindTransactionsUseCase

    beforeEach(() => {
        transactionRepository = new FakeTransactionRepository()
        walletRepository = new FakeWalletRepository()
        useCase = new FindTransactionsUseCase(transactionRepository, walletRepository)
    })

    it('Deve retornar transações filtradas por tipo', async () => {
        const wallet = Wallet.create({ userId: 'userId123' })
        await walletRepository.create(wallet)

        await transactionRepository.create(Transaction.create({
            name: 'Salário',
            walletId: wallet.id,
            amount: 5000,
            category: Category.GROCERIES,
            transactionType: TransactionType.CREDIT
        }))

        await transactionRepository.create(Transaction.create({
            name: 'Aluguel',
            walletId: wallet.id,
            amount: 1500,
            category: Category.EXPENSES,
            transactionType: TransactionType.DEBIT
        }))

        const result = await useCase.execute({
            userId: 'userId123',
            filters: { transactionType: TransactionType.CREDIT }
        })

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Salário')
        expect(result[0].transactionType).toBe(TransactionType.CREDIT)
    })

    it('Deve retornar transações filtradas por category', async () => {
        const wallet = Wallet.create({ userId: 'userId123' })
        await walletRepository.create(wallet)

        await transactionRepository.create(Transaction.create({
            name: 'Salário',
            walletId: wallet.id,
            amount: 5000,
            category: Category.GROCERIES,
            transactionType: TransactionType.CREDIT
        }))

        await transactionRepository.create(Transaction.create({
            name: 'Aluguel',
            walletId: wallet.id,
            amount: 1500,
            category: Category.EXPENSES,
            transactionType: TransactionType.DEBIT
        }))

        const result = await useCase.execute({
            userId: 'userId123',
            filters: { category: Category.EXPENSES }
        })

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Aluguel')
        expect(result[0].category).toBe(Category.EXPENSES)
    })

    it('Deve retornar transações filtradas por tipo e category', async () => {
        const wallet = Wallet.create({ userId: 'userId123' })
        await walletRepository.create(wallet)

        await transactionRepository.create(Transaction.create({
            name: 'Salário',
            walletId: wallet.id,
            amount: 5000,
            category: Category.EXPENSES,
            transactionType: TransactionType.CREDIT
        }))

        await transactionRepository.create(Transaction.create({
            name: 'Freelance',
            walletId: wallet.id,
            amount: 2000,
            category: Category.EXPENSES,
            transactionType: TransactionType.CREDIT
        }))

        await transactionRepository.create(Transaction.create({
            name: 'Aluguel',
            walletId: wallet.id,
            amount: 1500,
            category: Category.EXPENSES,
            transactionType: TransactionType.DEBIT
        }))

        const result = await useCase.execute({
            userId: 'userId123',
            filters: { transactionType: TransactionType.CREDIT, category: Category.EXPENSES }
        })

        expect(result).toHaveLength(2)
        expect(result[0].name).toBe('Salário')
        expect(result[1].name).toBe('Freelance')
    })

    it('Deve retornar lista vazia se nenhuma transação bater com o filters', async () => {
        const wallet = Wallet.create({ userId: 'userId123' })
        await walletRepository.create(wallet)

        await transactionRepository.create(Transaction.create({
            name: 'Aluguel',
            walletId: wallet.id,
            amount: 1500,
            category: Category.EXPENSES,
            transactionType: TransactionType.DEBIT
        }))

        const result = await useCase.execute({
            userId: 'userId123',
            filters: { transactionType: TransactionType.CREDIT }
        })

        expect(result).toHaveLength(0)
    })

    it('Deve retornar apenas transações da wallet correta', async () => {
        const wallet1 = Wallet.create({ userId: 'userId1' })
        const wallet2 = Wallet.create({ userId: 'userId2' })
        await walletRepository.create(wallet1)
        await walletRepository.create(wallet2)

        await transactionRepository.create(Transaction.create({
            name: 'Salário user1',
            walletId: wallet1.id,
            amount: 5000,
            category: Category.EXPENSES,
            transactionType: TransactionType.CREDIT
        }))

        await transactionRepository.create(Transaction.create({
            name: 'Salário user2',
            walletId: wallet2.id,
            amount: 3000,
            category: Category.EXPENSES,
            transactionType: TransactionType.CREDIT
        }))

        const result = await useCase.execute({
            userId: 'userId1',
            filters: { transactionType: TransactionType.CREDIT }
        })

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Salário user1')
    })

    it('Deve lançar BusinessError se a wallet não for encontrada', async () => {
        await expect(
            useCase.execute({
                userId: 'id_inexistente',
                filters: { transactionType: TransactionType.CREDIT }
            })
        ).rejects.toMatchObject({
            message: 'Carteira não encontrada',
            statusCode: 404
        })
    })
})




