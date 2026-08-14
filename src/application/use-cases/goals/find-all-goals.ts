import { GoalDto, toGoalDto } from "../../dtos/goal-dtos";
import { BusinessError } from "../../../domain/errors/business-error";
import { GoalRepository } from "../../../domain/repositories/goal-repository";
import { UserRepository } from "../../../domain/repositories/user-repository";

export interface FindAllGoalsRequest {
    userId: string;
}

export class FindAllGoalsUseCase {
    constructor(
        private readonly goalRepository: GoalRepository,
        private readonly userRepository: UserRepository,
    ) {}

    async execute(request: FindAllGoalsRequest): Promise<GoalDto[]> {
        const user = await this.userRepository.findById(request.userId);
        if (!user) {
            throw new BusinessError("Usuário não encontrado", 404);
        }

        const goals = await this.goalRepository.findAllByUserId(request.userId);
        return goals.map(toGoalDto);
    }
}
