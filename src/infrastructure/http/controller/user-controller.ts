import { NextFunction, Request, Response } from "express";
import { CreateUserUseCase } from "../../../application/use-cases/users/create-user";
import { LoginUserUseCase } from "../../../application/use-cases/users/login-user";
import { UpdatePasswordUseCase } from "../../../application/use-cases/users/update-password";
import { toUserDto } from "../../../application/dtos/user-dtos";
import { getAuthenticatedUserId } from "../helpers/get-authenticated-user-id";
import {
    createUserSchema,
    loginUserSchema,
    updateUserPasswordSchema,
} from "../validators/user-validator";

export interface UserUseCases {
    create: CreateUserUseCase;
    login: LoginUserUseCase;
    updatePassword: UpdatePasswordUseCase;
}

export class UserController {
    constructor(private readonly useCases: UserUseCases) {}

    async create(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const user = await this.useCases.create.execute(
                createUserSchema.parse(request.body),
            );
            response.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    async login(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            const { user, token } = await this.useCases.login.execute(
                loginUserSchema.parse(request.body),
            );
            response.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7200000,
                path: "/",
            });
            response.status(200).json({ user: toUserDto(user) });
        } catch (error) {
            next(error);
        }
    }

    async logout(_request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            response.clearCookie("token", { path: "/" });
            response.status(200).json({ message: "Logout realizado com sucesso!" });
        } catch (error) {
            next(error);
        }
    }

    async updatePassword(
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            await this.useCases.updatePassword.execute({
                ...updateUserPasswordSchema.parse(request.body),
                userId: getAuthenticatedUserId(request),
            });
            response.status(200).json({ message: "Senha alterada com sucesso!" });
        } catch (error) {
            next(error);
        }
    }
}
