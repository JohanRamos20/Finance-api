import { Router } from "express";
import { makeUserController } from "../factories/user-factory";
import { authMiddleware } from "../middleware/auth-middleware";

const userRoutes = Router();
const controller = makeUserController();

userRoutes.post("/users", controller.create.bind(controller));
userRoutes.post("/sessions", controller.login.bind(controller));
userRoutes.post("/sessions/logout", controller.logout.bind(controller));
userRoutes.patch(
    "/users/me/password",
    authMiddleware(),
    controller.updatePassword.bind(controller),
);

export { userRoutes };
