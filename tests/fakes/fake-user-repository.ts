import { User } from "../../src/domain/entities/user";
import { UserRepository } from "../../src/domain/repositories/user-repository";

export class FakeUserRepository implements UserRepository {
    private readonly users: User[] = [];

    async findByEmail(email: string): Promise<User | null> {
        return this.users.find(user => user.email === email) ?? null;
    }

    async findById(id: string): Promise<User | null> {
        return this.users.find(user => user.id === id) ?? null;
    }

    async create(user: User): Promise<User> {
        this.users.push(user);
        return user;
    }

    async updatePassword(userId: string, passwordHash: string): Promise<void> {
        const user = this.users.find(candidate => candidate.id === userId);
        if (user) user.passwordHash = passwordHash;
    }

    getAll(): User[] {
        return [...this.users];
    }
}


