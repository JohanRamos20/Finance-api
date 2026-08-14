import { Request } from "express";
import { BusinessError } from "../../../domain/errors/business-error";
import { userIdSchema } from "../validators/user-validator";

export function getAuthenticatedUserId(request: Request): string {
    const result = userIdSchema.safeParse(request.user);

    if(!result.success) {
        throw new BusinessError(
            "Usuário não autenticado",
            401
        );
    }
    return result.data.userId;
}

