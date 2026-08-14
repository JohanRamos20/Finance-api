import { beforeEach, describe, expect, it } from "vitest";
import { UpdateGoalUseCase } from "../../../../src/application/use-cases/goals/update-goal";
import { Goal } from "../../../../src/domain/entities/goal";
import { FakeGoalRepository } from "../../../fakes/fake-goal-repository";

describe("UpdateGoalUseCase", () => {
    const userId = "userId123";
    let goalRepository: FakeGoalRepository;
    let useCase: UpdateGoalUseCase;

    beforeEach(() => {
        goalRepository = new FakeGoalRepository();
        useCase = new UpdateGoalUseCase(goalRepository);
    });

    it("Deve atualizar os amountes de uma goal", async () => {
        const goal = Goal.create({
            userId: userId,
            name: "Viagem",
            targetAmount: 5000,
        });
        await goalRepository.create(goal);

        await useCase.execute({
            goalId: goal.id,
            userId: userId,
            amount: 300,
        });

        const updatedGoal = await goalRepository.findByIdAndUserId(goal.id, userId);
        expect(updatedGoal?.savedAmount).toBe(300);
    });

    it("Deve atualizar uma goal várias vezes", async () => {
        const goal = Goal.create({
            userId: userId,
            name: "Viagem",
            targetAmount: 5000,
        });
        await goalRepository.create(goal);

        await useCase.execute({ goalId: goal.id, userId: userId, amount: 300 });
        await useCase.execute({ goalId: goal.id, userId: userId, amount: 500 });

        const updatedGoal = await goalRepository.findByIdAndUserId(goal.id, userId);
        expect(updatedGoal?.savedAmount).toBe(800);
    });

    it("Deve retornar true se o amount for completado", async () => {
        const goal = Goal.create({
            userId: userId,
            name: "Viagem",
            targetAmount: 5000,
        });
        await goalRepository.create(goal);

        const result = await useCase.execute({
            goalId: goal.id,
            userId: userId,
            amount: 5000,
        });

        expect(result.goalReached).toBe(true);
    });

    it("Deve retornar o amount restante de uma goal", async () => {
        const goal = Goal.create({
            userId: userId,
            name: "Viagem",
            targetAmount: 5000,
        });
        await goalRepository.create(goal);

        const result = await useCase.execute({
            goalId: goal.id,
            userId: userId,
            amount: 3000,
        });

        expect(result.remainingAmount).toBe(2000);
    });

    it("Deve lançar BusinessError se a goal não for encontrada", async () => {
        await expect(
            useCase.execute({
                goalId: "id_inválido",
                userId: userId,
                amount: 300,
            })
        ).rejects.toMatchObject({
            message: "Meta não encontrada",
            statusCode: 404,
        });
    });

    it("Não deve atualizar uma goal de outro usuário", async () => {
        const goal = Goal.create({
            userId: userId,
            name: "Viagem",
            targetAmount: 5000,
        });
        await goalRepository.create(goal);

        await expect(
            useCase.execute({
                goalId: goal.id,
                userId: "outro_user",
                amount: 300,
            })
        ).rejects.toMatchObject({
            message: "Meta não encontrada",
            statusCode: 404,
        });

        const originalGoal = await goalRepository.findByIdAndUserId(goal.id, userId);
        expect(originalGoal?.savedAmount).toBe(0);
    });
});





