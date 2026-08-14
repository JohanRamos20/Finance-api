import { BusinessError } from "../../../domain/errors/business-error";
import { UserRepository } from "../../../domain/repositories/user-repository";
import { PasswordHasher } from "../../../domain/services/password-hasher";

export interface UpdatePasswordRequest {
    userId: string;
    currentPassword: string;
    newPassword: string;
}

export class UpdatePasswordUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async execute(request: UpdatePasswordRequest): Promise<void> {
        const user = await this.userRepository.findById(request.userId);
        if (!user) {
            throw new BusinessError("Usuário não encontrado", 401);
        }

        const isCurrentPasswordValid = await this.passwordHasher.compare(
            request.currentPassword,
            user.passwordHash,
        );
        if (!isCurrentPasswordValid) {
            throw new BusinessError("Senha incorreta", 401);
        }

        const isSamePassword = await this.passwordHasher.compare(
            request.newPassword,
            user.passwordHash,
        );
        if (isSamePassword) {
            throw new BusinessError("A senha deve ser diferente da atual", 401);
        }

        const passwordHash = await this.passwordHasher.hash(request.newPassword);
        await this.userRepository.updatePassword(user.id, passwordHash);
    }
}
