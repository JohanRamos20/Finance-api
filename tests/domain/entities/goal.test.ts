import { it, describe, expect } from 'vitest'
import { Goal } from '../../../src/domain/entities/goal'

describe('Goal', () => {
    const validProperties = {
        userId : 'id_123',
        name : 'goal123',
        targetAmount : 1000,
    }
    describe('create()', () => {

        it('Deve criar uma goal valida', () => {
            const goal = Goal.create(validProperties)
            expect(goal.name).toBe('goal123')
            expect(goal.userId).toBe('id_123')
            expect(goal.targetAmount).toBe(1000)
        })
        it('Goal deve ter um id', () => {
            const goal = Goal.create(validProperties)
            expect(goal.id).toBeDefined()
            expect(typeof goal.id).toBe('string')
            expect(goal.id.length).toBeGreaterThan(0)
        })

    })
    describe('create() - validação de name', () => {

        it('O name deve ter no mínimo 1 caractere', () => {
            expect(() => 
            Goal.create({...validProperties, name:''})).toThrow("O nome é obrigatório")
        })

    })

    describe('create() - validação de balance', () => {

        it('o targetAmount deve ser maior que 0', () => {
            expect(() => 
            Goal.create({...validProperties, targetAmount:0})).toThrow("O valor total é obrigatório")
        })

    })
    
    describe('addSavedAmount()', () => {

        it('Deve atualizar uma goal', () => {
            const goal = Goal.create(validProperties)
            goal.addSavedAmount(100)
            expect(goal.savedAmount).toBe(100)
        })

    })

    describe('addSavedAmount() - validação de amount', () => {

        it('o amount deve ser maior que 0', () => {
            const goal = Goal.create(validProperties)
            expect(() => 
            goal.addSavedAmount(0)).toThrow("O valor guardado deve ser maior que 0")
        })
        it('o amount não pode ser maior que o targetAmount da goal', () => {
            const goal = Goal.create(validProperties)
            expect(() => 
            goal.addSavedAmount(1100)).toThrow("O valor guardado não pode ser maior que o valor total da meta")
        })
    })

    describe('isReached()', () => {
        
        it('Deve retornar true quando savedAmount for igual ao targetAmount', () => {
            const goal = Goal.create({...validProperties, savedAmount : 1000})
            expect(goal.isReached()).toBe(true)
        })

        it('Deve retornar false quando savedAmount for menor que targetAmount', () => {
            const goal = Goal.create({...validProperties, savedAmount : 900})
            expect(goal.isReached()).toBe(false)
        })

    })

    describe('getRemainingAmount()', () => {
        
        it('Deve retornar a diferença entre targetAmount e savedAmount', () => {
            const goal = Goal.create({...validProperties, savedAmount : 200})
            expect(goal.getRemainingAmount()).toBe(800)
        })

        it('Deve retornar 0 quando targetAmount e savedAmount forem iguais', () => {
            const goal = Goal.create({...validProperties, savedAmount : 1000})
            expect(goal.getRemainingAmount()).toBe(0)
        })

    })

    describe('createFromPrimitives()', () => {
            it('Deve recriar uma goal a partir de dados primitivos', () => {

                const data = new Date('2024-01-01')

                const goal = Goal.createFromPrimitives({
                    id : 'id',
                    userId : 'userId',
                    name: 'name_goal',
                    targetAmount : 1000,
                    savedAmount: 50,
                    description: '',
                    createdAt: data

                })
                expect(goal.id).toBe('id')
                expect(goal.userId).toBe('userId')
                expect(goal.name).toBe('name_goal')
                expect(goal.targetAmount).toBe(1000)
                expect(goal.savedAmount).toBe(50)
                expect(goal.description).toBe('')
                expect(goal.createdAt).toEqual(data)
            })
        })

})




