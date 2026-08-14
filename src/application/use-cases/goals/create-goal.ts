import { GoalDto, toGoalDto } from "../../dtos/goal-dtos";
import { Goal } from "../../../domain/entities/goal";
import { BusinessError } from "../../../domain/errors/business-error";
import { GoalRepository } from "../../../domain/repositories/goal-repository";
import { UserRepository } from "../../../domain/repositories/user-repository";

export interface CreateGoalRequest {
    userId: string;
    name: string;
    description?: string;
    targetAmount: number;
}

export class CreateGoalUseCase {
    constructor(
        private readonly goalRepository: GoalRepository,
        private readonly userRepository: UserRepository,
    ) {}

    async execute(request: CreateGoalRequest): Promise<GoalDto> {
        const user = await this.userRepository.findById(request.userId);
        if (!user) {
            throw new BusinessError("Usuário não encontrado", 404);
        }

        const goal = Goal.create(request);
        await this.goalRepository.create(goal);
        return toGoalDto(goal);
    }
}
