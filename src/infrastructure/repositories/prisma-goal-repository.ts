import { Goal as PrismaGoal } from "@prisma/client";
import { PrismaRepositoryClient } from "../../database/prisma-repository-client";
import { Goal } from "../../domain/entities/goal";
import { GoalRepository } from "../../domain/repositories/goal-repository";

export class PrismaGoalRepository implements GoalRepository {
    constructor(private readonly client: PrismaRepositoryClient) {}

    async create(goal: Goal): Promise<Goal> {
        const createdGoal = await this.client.goal.create({
            data: {
                id: goal.id,
                userId: goal.userId,
                name: goal.name,
                description: goal.description,
                targetAmount: goal.targetAmount,
                savedAmount: goal.savedAmount,
                createdAt: goal.createdAt,
            },
        });
        return this.toDomain(createdGoal);
    }

    async findAllByUserId(userId: string): Promise<Goal[]> {
        const goals = await this.client.goal.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return goals.map((goal) => this.toDomain(goal));
    }

    async findByIdAndUserId(goalId: string, userId: string): Promise<Goal | null> {
        const goal = await this.client.goal.findFirst({
            where: { id: goalId, userId },
        });
        return goal ? this.toDomain(goal) : null;
    }

    async update(goal: Goal, userId: string): Promise<Goal> {
        const updatedGoal = await this.client.goal.update({
            where: { id: goal.id, userId },
            data: {
                name: goal.name,
                description: goal.description,
                targetAmount: goal.targetAmount,
                savedAmount: goal.savedAmount,
            },
        });
        return this.toDomain(updatedGoal);
    }

    async delete(goalId: string, userId: string): Promise<void> {
        await this.client.goal.delete({ where: { id: goalId, userId } });
    }

    private toDomain(goal: PrismaGoal): Goal {
        return Goal.createFromPrimitives({
            ...goal,
            targetAmount: Number(goal.targetAmount),
            savedAmount: Number(goal.savedAmount),
        });
    }
}
