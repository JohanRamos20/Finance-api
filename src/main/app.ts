import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRoutes } from "../infrastructure/http/routes/user-router";
import { goalRoutes } from "../infrastructure/http/routes/goal-router";
import { transactionRoutes } from "../infrastructure/http/routes/transaction-router";
import { errorMiddleware } from "../infrastructure/http/middleware/error-middleware";
import { walletRoutes } from "../infrastructure/http/routes/wallet-router";

const app = express();

app.use(cors({
  origin: "http://localhost:8080",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(userRoutes);
app.use(goalRoutes);
app.use(transactionRoutes);
app.use(walletRoutes)
app.use(errorMiddleware)

export { app }

