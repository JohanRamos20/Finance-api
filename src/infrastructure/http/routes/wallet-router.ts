import { Router } from "express";
import { makeWalletController } from "../factories/wallet-factory";
import { authMiddleware } from "../middleware/auth-middleware";

const walletRoutes = Router();
const controller = makeWalletController();

walletRoutes.use(authMiddleware());
walletRoutes.get("/users/me/wallet", controller.find.bind(controller));
walletRoutes.get("/users/me/wallet/balance", controller.getBalance.bind(controller));

export { walletRoutes };
