import { User } from "../../domain/entities/user"

export interface UserDto{
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}

export interface UserLoginDto{
    user: User;
    token: string;
}

export function toUserDto(user: User): UserDto {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
    };
}

