import { Router } from "express";
import { makeTransactionController } from "../factories/transaction-factory";
import { authMiddleware } from "../middleware/auth-middleware";

const transactionRoutes = Router();
const controller = makeTransactionController();

transactionRoutes.use(authMiddleware());
transactionRoutes.post(
    "/users/me/transactions",
    controller.create.bind(controller),
);
transactionRoutes.get(
    "/users/me/transactions",
    controller.findAll.bind(controller),
);

export { transactionRoutes };
