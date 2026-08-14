import { PrismaGoalRepository } from "../../repositories/prisma-goal-repository";
import { PrismaUserRepository } from "../../repositories/prisma-user-repository";
import { GoalController } from "../controller/goal-controller";
import { CreateGoalUseCase } from "../../../application/use-cases/goals/create-goal";
import { UpdateGoalUseCase } from "../../../application/use-cases/goals/update-goal";
import { DeleteGoalUseCase } from "../../../application/use-cases/goals/delete-goal";
import { FindAllGoalsUseCase } from "../../../application/use-cases/goals/find-all-goals";
import { prisma } from "../../../database/prisma";

export function makeGoalController(): GoalController {

    const userRepository = new PrismaUserRepository(prisma);
    const goalRepository = new PrismaGoalRepository(prisma);

    return new GoalController({
        create: new CreateGoalUseCase(goalRepository, userRepository),
        update: new UpdateGoalUseCase(goalRepository),
        delete: new DeleteGoalUseCase(goalRepository),
        findAll: new FindAllGoalsUseCase(goalRepository, userRepository)
    });

}

