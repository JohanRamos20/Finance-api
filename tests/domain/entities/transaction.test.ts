import { it, expect, describe } from 'vitest'
import { Transaction, Category, TransactionType} from '../../../src/domain/entities/transaction'

describe('Transaction', () =>{


    const validProperties = {
        name : 'transaction_teste',
        walletId : 'walletId',
        amount : 100,
        category: Category.LEISURE,
        transactionType: TransactionType.DEBIT,
    }

    describe('Create()', () => {

        it('Deve ser capaz de criar uma transação', () => {
            const transaction = Transaction.create(validProperties)
            expect(transaction.name).toBe('transaction_teste')
            expect(transaction.walletId).toBe('walletId')
            expect(transaction.amount).toBe(100)
            expect(transaction.category).toBe(Category.LEISURE)
            expect(transaction.transactionType).toBe(TransactionType.DEBIT)
        })

        it('Uma transação deve ter um id', () => {
            const transaction = Transaction.create(validProperties)
            expect(transaction.id).toBeDefined()
            expect(typeof transaction.id).toBe('string')
            expect(transaction.id.length).toBeGreaterThan(0)
        })

    })

    describe('Create() - validação de amount', () => {
        it('Valor deve ser maior que zero', () =>{
            expect(() => Transaction.create({...validProperties, amount : 0})).toThrow('O valor da transação deve ser maior que zero')
        })
    })

    describe('Create() - validação de name', () => {
        it('A transação tem que ter name', () =>{
            expect(() => Transaction.create({...validProperties, name: ''})).toThrow('O nome da transação não pode ser vazio')
        })
    })

    describe('createFromPrimitives()', () => {
    
        it('deve recriar uma transação a partir de dados primitivos', () => {
          const data = new Date('2024-01-01')
    
          const transaction = Transaction.createFromPrimitives({
            id: 'uuid-123',
            walletId : 'uuwalletId',
            name: 'Syssa',
            amount : 100,
            category: Category.LEISURE,
            transactionType: TransactionType.DEBIT,
            createdAt : data
          })
    
          expect(transaction.id).toBe('uuid-123')
          expect(transaction.walletId).toBe('uuwalletId')
          expect(transaction.name).toBe('Syssa')
          expect(transaction.amount).toBe(100)
          expect(transaction.category).toBe(Category.LEISURE)
          expect(transaction.transactionType).toBe(TransactionType.DEBIT)
          expect(transaction.createdAt).toEqual(data)
        })
    
      })

})




