import { UserDto, toUserDto } from "../../dtos/user-dtos";
import { User } from "../../../domain/entities/user";
import { Wallet } from "../../../domain/entities/wallet";
import { BusinessError } from "../../../domain/errors/business-error";
import { TransactionManager } from "../../../domain/managers/transaction-manager";
import { PasswordHasher } from "../../../domain/services/password-hasher";

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
}

export class CreateUserUseCase {
    constructor(
        private readonly transactionManager: TransactionManager,
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async execute(request: CreateUserRequest): Promise<UserDto> {
        const email = request.email.trim().toLowerCase();

        if (request.password.length < 4) {
            throw new BusinessError("A senha deve conter no mínimo 4 caracteres");
        }

        const passwordHash = await this.passwordHasher.hash(request.password);
        const user = User.create({ name: request.name, email, passwordHash });
        const wallet = Wallet.create({ userId: user.id });

        return this.transactionManager.execute(async ({ userRepository, walletRepository }) => {
            const existingUser = await userRepository.findByEmail(email);
            if (existingUser) {
                throw new BusinessError("Email já cadastrado", 409);
            }

            await userRepository.create(user);
            await walletRepository.create(wallet);
            return toUserDto(user);
        });
    }
}
