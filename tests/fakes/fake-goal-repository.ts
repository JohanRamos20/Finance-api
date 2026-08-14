import { Goal } from "../../src/domain/entities/goal"
import { GoalRepository } from "../../src/domain/repositories/goal-repository"

export class FakeGoalRepository implements GoalRepository {
    private goals : Goal[] = []

    async create(data: Goal): Promise<Goal> {
        this.goals.push(data)
        return data
    }

    async findAllByUserId(userId: string): Promise<Goal[]> {
        return this.goals.filter(m => m.userId === userId)
    }

    async findByIdAndUserId(id: string, userId: string): Promise<Goal | null> {
        return this.goals.find(m => m.id === id && m.userId === userId) ?? null
    }

    async delete(id: string, userId: string): Promise<void> {
        const index = this.goals.findIndex(m => m.id === id && m.userId === userId)

        if(index !== -1){
            this.goals.splice(index, 1)
        }

    }

    async update(goal: Goal, userId: string): Promise<Goal> {
        const index = this.goals.findIndex(m => m.id === goal.id && m.userId === userId)
        if(index !== -1){
            this.goals[index] = goal
        }
        return goal
    }

    getAll(): Goal[] {
            return [...this.goals]
        }

}




