import { UserLoginDto } from "../../dtos/user-dtos";
import { BusinessError } from "../../../domain/errors/business-error";
import { UserRepository } from "../../../domain/repositories/user-repository";
import { PasswordHasher } from "../../../domain/services/password-hasher";
import { TokenGenerator } from "../../../domain/services/token-generator";

export interface LoginUserRequest {
    email: string;
    password: string;
}

export class LoginUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher,
        private readonly tokenGenerator: TokenGenerator,
    ) {}

    async execute(request: LoginUserRequest): Promise<UserLoginDto> {
        const user = await this.userRepository.findByEmail(
            request.email.trim().toLowerCase(),
        );
        if (!user) {
            throw new BusinessError("E-mail ou senha inválidos");
        }

        const isPasswordValid = await this.passwordHasher.compare(
            request.password,
            user.passwordHash,
        );
        if (!isPasswordValid) {
            throw new BusinessError("E-mail ou senha inválidos");
        }

        return {user, token: this.tokenGenerator.generate({ userId: user.id }) };
    }
}
