import { it, expect, describe } from 'vitest'
import { Wallet } from '../../../src/domain/entities/wallet'

describe ('Wallet', () =>{
    const validProperties = {
        userId : 'uuuserId',
    }

    describe('create()', () =>{
        it('Deve criar uma wallet', () =>{
            const wallet = Wallet.create(validProperties)
            expect(wallet.userId).toBe('uuuserId')
        })
        it('Deve gerar um id', () => {
            const wallet = Wallet.create(validProperties)
            expect(wallet.id).toBeDefined()
            expect(typeof wallet.id).toBe('string')
            expect(wallet.id.length).toBeGreaterThan(0)
        })
    })

    describe('createFromPrimitives()', () => {
        it('Deve recriar uma wallet a partir de dados primitivos', () => {
            const wallet = Wallet.createFromPrimitives({
                id : 'id',
                userId : 'userId',
            })
            expect(wallet.id).toBe('id')
            expect(wallet.userId).toBe('userId')
        })
    })
})



