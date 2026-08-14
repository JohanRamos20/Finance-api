import { describe, it, expect, beforeEach } from 'vitest';
import { LoginUserUseCase } from '../../../../src/application/use-cases/users/login-user';
import { User } from '../../../../src/domain/entities/user';
import { FakeUserRepository } from '../../../fakes/fake-user-repository';
import { FakePasswordHasher } from '../../../fakes/fake-password-hasher';
import { FakeTokenGenerator } from '../../../fakes/fake-token-generator';
import { BusinessError } from '../../../../src/domain/errors/business-error';

describe('LoginUserUseCase', () => {
    let userRepository: FakeUserRepository;
    let passwordHasher: FakePasswordHasher;
    let tokenGenerator: FakeTokenGenerator;
    let useCase: LoginUserUseCase;

    beforeEach(() => {
        userRepository = new FakeUserRepository()
        passwordHasher = new FakePasswordHasher()
        tokenGenerator = new FakeTokenGenerator()

        useCase = new LoginUserUseCase(
            userRepository,
            passwordHasher,
            tokenGenerator
        );
    });

    it('deve autenticar com sucesso e retornar um token', async () => {
        const user = User.create({
            name: 'Carlos Silva',
            email: 'carlos@email.com',
            passwordHash: 'hashed:1234',
        });
        await userRepository.create(user)

        const result = await useCase.execute({
            email: 'Carlos@Email.com',
            password: '1234',
        });

        expect(result.token).toBe(`fake-token:${user.id}`)
    });

    it('deve normalizar o email antes de buscar o usuário', async () => {
        const user = User.create({
            name: 'Carlos Silva',
            email: 'carlos@email.com',
            passwordHash: 'hashed:1234',
        });
        await userRepository.create(user)

        const result = await useCase.execute({
            email: '  CARLOS@EMAIL.COM  ',
            password: '1234',
        });

        expect(result.token).toBeDefined()
    });

    it('deve lançar BusinessError se o email não estiver cadastrado', async () => {
        await expect(
            useCase.execute({
                email: 'inexistente@email.com',
                password: '1234',
            })
        ).rejects.toMatchObject({
            message: 'E-mail ou senha inválidos',
            statusCode: 400
        });
    });

    it('deve lançar BusinessError se a password estiver incorreta', async () => {
        const user = User.create({
            name: 'Carlos Silva',
            email: 'carlos@email.com',
            passwordHash: 'hashed:1234',
        });
        await userRepository.create(user)

        await expect(
            useCase.execute({
                email: 'carlos@email.com',
                password: 'password_errada',
            })
        ).rejects.toThrow(BusinessError);
    });

    it('não deve revelar se o erro foi de email ou password (mesma mensagem)', async () => {
        const user = User.create({
            name: 'Carlos Silva',
            email: 'carlos@email.com',
            passwordHash: 'hashed:1234',
        });
        await userRepository.create(user)

        let invalidEmailError: any;
        let invalidPasswordError: any;

        try {
            await useCase.execute({ email: 'naoexiste@email.com', password: '1234' });
        } catch (e) {
            invalidEmailError = e;
        }

        try {
            await useCase.execute({ email: 'carlos@email.com', password: 'errada' });
        } catch (e) {
            invalidPasswordError = e;
        }

        expect(invalidEmailError.message).toBe(invalidPasswordError.message);
    });
});




