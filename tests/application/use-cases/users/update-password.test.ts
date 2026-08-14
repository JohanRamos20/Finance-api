import { describe, it, expect, beforeEach } from "vitest";
import { FakePasswordHasher } from "../../../fakes/fake-password-hasher";
import { User } from "../../../../src/domain/entities/user";
import { UpdatePasswordUseCase } from '../../../../src/application/use-cases/users/update-password';
import { FakeUserRepository } from "../../../fakes/fake-user-repository";

describe('UpdatePasswordUseCase', () => {
    let userRepository : FakeUserRepository;
    let passwordHasher : FakePasswordHasher
    let useCase : UpdatePasswordUseCase

    beforeEach(() => {
        userRepository = new FakeUserRepository()
        passwordHasher = new FakePasswordHasher()

        useCase = new UpdatePasswordUseCase(
            userRepository, 
            passwordHasher
        )
    })

    it('Deve mudar a password de um usuário existente', async () => {
        const user = User.create({
            name : "Carlos Silva",
            email : "Carlos@email.com",
            passwordHash : "hashed:1234"
        })

        await userRepository.create(user)

        await useCase.execute({
            userId : user.id, 
            currentPassword: "1234", 
            newPassword : "12345"
        })

        const savedUser = await userRepository.findById(user.id)

        expect(savedUser?.passwordHash).toBe("hashed:12345")
    })

    it('Deve lançar businessError se o usuário não for encontrado', async () => {
        const user = User.create({
            name : "Carlos Silva",
            email : "Carlos@email.com",
            passwordHash : "hashed:1234"
        }) 

        await userRepository.create(user)

        await expect(
            useCase.execute({
                userId : "id_errado", 
                currentPassword: "1234", 
                newPassword : "12345",
            })
        ).rejects.toMatchObject({
            message: "Usuário não encontrado",
            statusCode : 401
        })
    })

    it('Deve lançar businessError se a currentPassword for diferente da password do usuário', async () => {
        const user = User.create({
            name : "Carlos Silva",
            email : "Carlos@email.com",
            passwordHash : "hashed:1234"
        })

        await userRepository.create(user)

        await expect(
            useCase.execute({
                userId : user.id, 
                currentPassword: "password_errada", 
                newPassword : "12345",
            })
        ).rejects.toMatchObject({
            message: 'Senha incorreta',
            statusCode : 401
        });

        const savedUser = await userRepository.findById(user.id)
        expect(savedUser?.passwordHash).toBe("hashed:1234")
    })

    it("Deve lançar erro se newPassword for igual a passwordHash do user", async () => {
        const user = User.create({
            name : "Carlos Silva",
            email : "Carlos@email.com",
            passwordHash : "hashed:1234"
        })

        await userRepository.create(user)

        await expect(
            useCase.execute({
                userId : user.id, 
                currentPassword: "1234", 
                newPassword : "1234",
            })
        ).rejects.toMatchObject({
            message: 'A senha deve ser diferente da atual',
            statusCode : 401
        });
    })

})





