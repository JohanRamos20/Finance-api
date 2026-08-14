import { describe, it, expect, beforeEach } from 'vitest';
import { CreateUserUseCase } from '../../../../src/application/use-cases/users/create-user';
import { User } from '../../../../src/domain/entities/user';
import { FakeUserRepository } from '../../../fakes/fake-user-repository';
import { FakeWalletRepository } from '../../../fakes/fake-wallet-repository';
import { FakePasswordHasher } from '../../../fakes/fake-password-hasher';
import { FakeTransactionManager } from '../../../fakes/fake-transaction-manager';

describe('CreateUserUseCase', () => {
    let userRepository: FakeUserRepository;
    let walletRepository: FakeWalletRepository;
    let transactionManager : FakeTransactionManager
    let passwordHasher: FakePasswordHasher;
    let useCase: CreateUserUseCase;

    beforeEach(() => {

        userRepository = new FakeUserRepository()
        walletRepository = new FakeWalletRepository()

        transactionManager = new FakeTransactionManager({
            userRepository,
            walletRepository
        })
        passwordHasher = new FakePasswordHasher()

        useCase = new CreateUserUseCase(
            transactionManager,
            passwordHasher
        );
    });

    it('deve criar um usuário e sua wallet com sucesso', async () => {
        const result = await useCase.execute({
            name: 'Carlos Silva',
            email: 'Carlos@Email.com',
            password: '1234',
        });

        const createdUser = await userRepository.findByEmail("carlos@email.com")
        expect(createdUser).not.toBeNull()
        expect(createdUser?.email).toBe("carlos@email.com")
        expect(createdUser?.passwordHash).toBe("hashed:1234")

        const wallets = walletRepository.getAll()
        expect(wallets).toHaveLength(1)
        expect(wallets[0].userId).toBe(createdUser?.id)

        expect(result).not.toHaveProperty('passwordHash');
        expect(result.email).toBe('carlos@email.com');
        expect(result.name).toBe('Carlos Silva');
    });

    it('deve lançar BusinessError 409 se o email já estiver cadastrado', async () => {
        const existingUser = User.create({
            name: 'Existente',
            email: 'ja@existe.com',
            passwordHash: 'qualquer_hash',
        });
        await userRepository.create(existingUser)

        await expect(
            useCase.execute({
                name: 'Novo Usuário',
                email: 'ja@existe.com',
                password: '1234',
            })
        ).rejects.toMatchObject({
            message: 'Email já cadastrado',
            statusCode: 409,
        });

        expect(userRepository.getAll()).toHaveLength(1)
        expect(walletRepository.getAll()).toHaveLength(0)
    });

    it('deve lançar BusinessError se a password tiver menos de 4 caracteres', async () => {
        await expect(
            useCase.execute({
                name: 'Carlos Silva',
                email: 'carlos@email.com',
                password: '123',
            })
        ).rejects.toThrow('A senha deve conter no mínimo 4 caracteres');

        expect(userRepository.getAll()).toHaveLength(0)
        expect(walletRepository.getAll()).toHaveLength(0)
    });

    it('deve propagar erro de validação da entidade User (ex: email inválido)', async () => {
        await expect(
            useCase.execute({
                name: 'Carlos Silva',
                email: 'email-invalido',
                password: '1234',
            })
        ).rejects.toThrow('O email é inválido');
    });
});




