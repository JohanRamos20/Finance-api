import { beforeEach, describe, expect, it } from "vitest";
import { DeleteGoalUseCase } from "../../../../src/application/use-cases/goals/delete-goal";
import { Goal } from "../../../../src/domain/entities/goal";
import { FakeGoalRepository } from "../../../fakes/fake-goal-repository";

describe("DeleteGoalUseCase", () => {
    const userId = "userId123";
    let goalsRepository: FakeGoalRepository;
    let useCase: DeleteGoalUseCase;

    beforeEach(() => {
        goalsRepository = new FakeGoalRepository();
        useCase = new DeleteGoalUseCase(goalsRepository);
    });

    it("Deve deletar uma goal existente", async () => {
        const goal = Goal.create({
            userId: userId,
            name: "Viagem",
            targetAmount: 5000,
        });
        await goalsRepository.create(goal);

        await useCase.execute({ goalId: goal.id, userId: userId });

        expect(goalsRepository.getAll()).toHaveLength(0);
    });

    it("Deve lançar BusinessError se a goal não for encontrada", async () => {
        await expect(
            useCase.execute({ goalId: "id_inexistente", userId: userId })
        ).rejects.toMatchObject({
            message: "Meta não encontrada",
            statusCode: 404,
        });
    });

    it("Deve deletar apenas a goal correta quando existem várias", async () => {
        const goal1 = Goal.create({
            userId: userId,
            name: "Viagem",
            targetAmount: 5000,
        });
        const goal2 = Goal.create({
            userId: userId,
            name: "Carro",
            targetAmount: 30000,
        });
        await goalsRepository.create(goal1);
        await goalsRepository.create(goal2);

        await useCase.execute({ goalId: goal1.id, userId: userId });

        const goals = goalsRepository.getAll();
        expect(goals).toHaveLength(1);
        expect(goals[0].id).toBe(goal2.id);
    });

    it("Não deve deletar uma goal de outro usuário", async () => {
        const goal = Goal.create({
            userId: userId,
            name: "Viagem",
            targetAmount: 5000,
        });
        await goalsRepository.create(goal);

        await expect(
            useCase.execute({
                goalId: goal.id,
                userId: "outro_user",
            })
        ).rejects.toMatchObject({
            message: "Meta não encontrada",
            statusCode: 404,
        });

        expect(goalsRepository.getAll()).toHaveLength(1);
    });
});





