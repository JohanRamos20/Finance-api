import { BusinessError } from "../../../domain/errors/business-error";
import { GoalRepository } from "../../../domain/repositories/goal-repository";

export interface UpdateGoalRequest {
    goalId: string;
    userId: string;
    amount: number;
}

export interface UpdateGoalResult {
    goalReached: boolean;
    remainingAmount: number;
}

export class UpdateGoalUseCase {
    constructor(private readonly goalRepository: GoalRepository) {}

    async execute(request: UpdateGoalRequest): Promise<UpdateGoalResult> {
        const goal = await this.goalRepository.findByIdAndUserId(
            request.goalId,
            request.userId,
        );
        if (!goal) {
            throw new BusinessError("Meta não encontrada", 404);
        }

        goal.addSavedAmount(request.amount);
        await this.goalRepository.update(goal, request.userId);

        return {
            goalReached: goal.isReached(),
            remainingAmount: goal.getRemainingAmount(),
        };
    }
}
