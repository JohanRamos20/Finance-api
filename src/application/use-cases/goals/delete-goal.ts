import { BusinessError } from "../../../domain/errors/business-error";
import { GoalRepository } from "../../../domain/repositories/goal-repository";

export interface DeleteGoalRequest {
    goalId: string;
    userId: string;
}

export class DeleteGoalUseCase {
    constructor(private readonly goalRepository: GoalRepository) {}

    async execute(request: DeleteGoalRequest): Promise<void> {
        const goal = await this.goalRepository.findByIdAndUserId(
            request.goalId,
            request.userId,
        );
        if (!goal) {
            throw new BusinessError("Meta não encontrada", 404);
        }

        await this.goalRepository.delete(request.goalId, request.userId);
    }
}
