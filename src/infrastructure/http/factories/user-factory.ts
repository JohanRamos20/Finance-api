import { CreateUserUseCase } from "../../../application/use-cases/users/create-user";
import { LoginUserUseCase } from "../../../application/use-cases/users/login-user";
import { UpdatePasswordUseCase } from "../../../application/use-cases/users/update-password";
import { prisma } from "../../../database/prisma";
import { PrismaTransactionManager } from "../../../database/prisma-transaction-manager";
import { PrismaUserRepository } from "../../repositories/prisma-user-repository";
import { BcryptPasswordHasher } from "../../services/bcrypt-password-hasher";
import { JwtTokenGenerator } from "../../services/jwt-token-generator";
import { UserController } from "../controller/user-controller";

export function makeUserController(): UserController {
    const userRepository = new PrismaUserRepository(prisma);
    const passwordHasher = new BcryptPasswordHasher();

    return new UserController({
        create: new CreateUserUseCase(
            new PrismaTransactionManager(prisma),
            passwordHasher,
        ),
        login: new LoginUserUseCase(
            userRepository,
            passwordHasher,
            new JwtTokenGenerator(),
        ),
        updatePassword: new UpdatePasswordUseCase(userRepository, passwordHasher),
    });
}
