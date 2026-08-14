export interface AuditLogData {
    event: string;
    userId: string;
    entityId: string;
    data: unknown;
}

export interface AuditLogRepository {
    register(data: AuditLogData): Promise<void>;
}
