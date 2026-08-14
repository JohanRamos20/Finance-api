import { Router } from "express";
import { makeGoalController } from "../factories/goal-factory";
import { authMiddleware } from "../middleware/auth-middleware";

const goalRoutes = Router();
const controller = makeGoalController();

goalRoutes.use(authMiddleware());
goalRoutes.post("/users/me/goals", controller.create.bind(controller));
goalRoutes.get("/users/me/goals", controller.findAll.bind(controller));
goalRoutes.patch("/users/me/goals/:goalId", controller.update.bind(controller));
goalRoutes.delete("/users/me/goals/:goalId", controller.delete.bind(controller));

export { goalRoutes };
