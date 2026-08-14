import { NextFunction, Request, Response } from "express";
import { CreateGoalUseCase } from "../../../application/use-cases/goals/create-goal";
import { DeleteGoalUseCase } from "../../../application/use-cases/goals/delete-goal";
import { FindAllGoalsUseCase } from "../../../application/use-cases/goals/find-all-goals";
import { UpdateGoalUseCase } from "../../../application/use-cases/goals/update-goal";
import { getAuthenticatedUserId } from "../helpers/get-authenticated-user-id";
import {
    createGoalSchema,
    goalIdSchema,
    updateGoalSchema,
} from "../validators/goal-validator";

export interface GoalUseCases {
    create: CreateGoalUseCase;
    update: UpdateGoalUseCase;
    delete: DeleteGoalUseCase;
    findAll: FindAllGoalsUseCase;
}

export class GoalController {
    constructor(private readonly useCases: GoalUseCases) {}

    async create(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const goal = await this.useCases.create.execute({
                ...createGoalSchema.parse(request.body),
                userId: getAuthenticatedUserId(request),
            });
            response.status(201).json(goal);
        } catch (error) {
            next(error);
        }
    }

    async update(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.useCases.update.execute({
                ...updateGoalSchema.parse(request.body),
                ...goalIdSchema.parse(request.params),
                userId: getAuthenticatedUserId(request),
            });
            response.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async delete(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            await this.useCases.delete.execute({
                ...goalIdSchema.parse(request.params),
                userId: getAuthenticatedUserId(request),
            });
            response.status(200).json({ message: "Meta deletada com sucesso!" });
        } catch (error) {
            next(error);
        }
    }

    async findAll(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const goals = await this.useCases.findAll.execute({
                userId: getAuthenticatedUserId(request),
            });
            response.status(200).json(goals);
        } catch (error) {
            next(error);
        }
    }
}
