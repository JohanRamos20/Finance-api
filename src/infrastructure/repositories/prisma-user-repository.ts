import { User as PrismaUser } from "@prisma/client";
import { PrismaRepositoryClient } from "../../database/prisma-repository-client";
import { User } from "../../domain/entities/user";
import { UserRepository } from "../../domain/repositories/user-repository";

export class PrismaUserRepository implements UserRepository {
    constructor(private readonly client: PrismaRepositoryClient) {}

    async create(user: User): Promise<User> {
        const createdUser = await this.client.user.create({
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                passwordHash: user.passwordHash,
                createdAt: user.createdAt,
            },
        });
        return this.toDomain(createdUser);
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.client.user.findUnique({ where: { email } });
        return user ? this.toDomain(user) : null;
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.client.user.findUnique({ where: { id } });
        return user ? this.toDomain(user) : null;
    }

    async updatePassword(userId: string, passwordHash: string): Promise<void> {
        await this.client.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
    }

    private toDomain(user: PrismaUser): User {
        return User.createFromPrimitives(user);
    }
}
