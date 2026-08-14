import { describe, it, expect, beforeEach } from 'vitest'
import { FakeGoalRepository } from '../../../fakes/fake-goal-repository'
import { FakeUserRepository } from '../../../fakes/fake-user-repository'
import { FindAllGoalsUseCase } from '../../../../src/application/use-cases/goals/find-all-goals'
import { Goal } from '../../../../src/domain/entities/goal'
import { User } from '../../../../src/domain/entities/user'

describe('FindAllGoalsUseCase', () => {
    let goalsRepository: FakeGoalRepository
    let userRepository: FakeUserRepository
    let useCase: FindAllGoalsUseCase

    beforeEach(() => {
        goalsRepository = new FakeGoalRepository()
        userRepository = new FakeUserRepository()
        useCase = new FindAllGoalsUseCase(goalsRepository, userRepository)
    })

    it('Deve retornar todas as goals de um usuário', async () => {
        const user = User.create({
            name: 'Carlos Silva',
            email: 'carlos@email.com',
            passwordHash: 'hashed:1234',
        })

        await userRepository.create(user)

        await goalsRepository.create(Goal.create({
            userId: user.id,
            name: 'Viagem',
            targetAmount: 5000,
        }))

        await goalsRepository.create(Goal.create({
            userId: user.id,
            name: 'Carro',
            targetAmount: 30000,
        }))

        const result = await useCase.execute({ userId: user.id })

        expect(result).toHaveLength(2)
        expect(result[0].name).toBe('Viagem')
        expect(result[1].name).toBe('Carro')
    })

    it('Deve retornar apenas as goals do usuário correto', async () => {
        const user1 = User.create({
            name: 'Carlos Silva',
            email: 'carlos@email.com',
            passwordHash: 'hashed:1234',
        })

        const user2 = User.create({
            name: 'João Lima',
            email: 'joao@email.com',
            passwordHash: 'hashed:5678',
        })

        await userRepository.create(user1)
        await userRepository.create(user2)

        await goalsRepository.create(Goal.create({
            userId: user1.id,
            name: 'Viagem',
            targetAmount: 5000,
        }))

        await goalsRepository.create(Goal.create({
            userId: user2.id,
            name: 'Carro',
            targetAmount: 30000,
        }))

        const result = await useCase.execute({ userId: user1.id })

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Viagem')
    })

    it('Deve retornar lista vazia se o usuário não tiver goals', async () => {
        const user = User.create({
            name: 'Carlos Silva',
            email: 'carlos@email.com',
            passwordHash: 'hashed:1234',
        })

        await userRepository.create(user)

        const result = await useCase.execute({ userId: user.id })

        expect(result).toHaveLength(0)
    })

    it('Deve lançar BusinessError se o usuário não for encontrado', async () => {
        await expect(
            useCase.execute({ userId: 'inexistente' })
        ).rejects.toMatchObject({
            message: 'Usuário não encontrado',
            statusCode: 404
        })
    })
})




