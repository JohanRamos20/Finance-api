import { Goal } from "../../domain/entities/goal";

export interface GoalDto {
    id: string;
    name: string;
    description: string;
    targetAmount: number;
    savedAmount: number;
    createdAt: Date;
}

export function toGoalDto(goal: Goal): GoalDto {
    return {
        id: goal.id,
        name: goal.name,
        description: goal.description,
        targetAmount: goal.targetAmount,
        savedAmount: goal.savedAmount,
        createdAt: goal.createdAt
    }
}

