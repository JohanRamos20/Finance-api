import { Prisma } from "@prisma/client";
import { PrismaRepositoryClient } from "../../database/prisma-repository-client";
import {
    AuditLogData,
    AuditLogRepository,
} from "../../domain/repositories/audit-log-repository";

export class PrismaAuditLogRepository implements AuditLogRepository {
    constructor(private readonly client: PrismaRepositoryClient) {}

    async register(auditLog: AuditLogData): Promise<void> {
        await this.client.auditLog.create({
            data: {
                event: auditLog.event,
                userId: auditLog.userId,
                entityId: auditLog.entityId,
                data: auditLog.data as Prisma.InputJsonValue,
            },
        });
    }
}
