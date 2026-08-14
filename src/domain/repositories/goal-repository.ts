import { Goal } from "../entities/goal";

export interface GoalRepository {
    create(goal: Goal): Promise<Goal>;
    findAllByUserId(userId: string): Promise<Goal[]>;
    findByIdAndUserId(goalId: string, userId: string): Promise<Goal | null>;
    update(goal: Goal, userId: string): Promise<Goal>;
    delete(goalId: string, userId: string): Promise<void>;
}
