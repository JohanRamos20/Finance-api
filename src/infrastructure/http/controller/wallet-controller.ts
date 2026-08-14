import { NextFunction, Request, Response } from "express";
import { FindWalletUseCase } from "../../../application/use-cases/wallet/find-wallet";
import { GetCachedBalanceUseCase } from "../../../application/use-cases/wallet/get-cached-balance";
import { getAuthenticatedUserId } from "../helpers/get-authenticated-user-id";

export interface WalletUseCases {
    find: FindWalletUseCase;
    getBalance: GetCachedBalanceUseCase;
}

export class WalletController {
    constructor(private readonly useCases: WalletUseCases) {}

    async find(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const wallet = await this.useCases.find.execute({
                userId: getAuthenticatedUserId(request),
            });
            response.status(200).json(wallet);
        } catch (error) {
            next(error);
        }
    }

    async getBalance(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const balance = await this.useCases.getBalance.execute({
                userId: getAuthenticatedUserId(request),
            });
            response.status(200).json({ balance });
        } catch (error) {
            next(error);
        }
    }
}
