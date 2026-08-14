import { User } from "../entities/user";

export interface UserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(user: User): Promise<User>;
    updatePassword(userId: string, passwordHash: string): Promise<void>;
}
