import { describe, it, expect, beforeEach } from "vitest";
import { FakeGoalRepository } from "../../../fakes/fake-goal-repository";
import { FakeUserRepository } from "../../../fakes/fake-user-repository";
import { CreateGoalUseCase } from "../../../../src/application/use-cases/goals/create-goal"
import { User } from "../../../../src/domain/entities/user";

describe("CreateGoalUseCase", () => {
    let goalsRepository : FakeGoalRepository
    let userRepository : FakeUserRepository
    let useCase : CreateGoalUseCase

    beforeEach(() =>{
        goalsRepository = new FakeGoalRepository()
        userRepository = new FakeUserRepository()

        useCase = new CreateGoalUseCase(goalsRepository, userRepository)
    })

    it("Deve ser capaz de criar uma goal", async() => {
        const user = User.create({
            id: "userId123",
            name: "Carlos Silva",
            email: "carlos@email.com",
            passwordHash: "hash",
        });

        await userRepository.create(user);


        await useCase.execute({
            userId: "userId123",
            name: "Viagem",
            description: "Viagem de férias",
            targetAmount: 200,
        })

        const goals = await goalsRepository.findAllByUserId("userId123")

        expect(goals).toHaveLength(1);
        expect(goals[0]).toMatchObject({
            userId: user.id,
            name: "Viagem",
            description: "Viagem de férias",
            targetAmount: 200,
            savedAmount: 0,
        });

        expect(goals[0].id).toEqual(expect.any(String));
        expect(goals[0].createdAt).toBeInstanceOf(Date);
    })

    it("Não deve criar uma goal para um user inexistente", async() => {
        await expect(
            useCase.execute({
                userId: "inexistente",
                name: "Viagem",
                targetAmount: 200,
            })
        ).rejects.toMatchObject({
            message: "Usuário não encontrado",
            statusCode: 404,
        });

        expect(
            await goalsRepository.findAllByUserId("inexistente")
        ).toHaveLength(0)

    })
})





