import { PrismaAuditLogRepository } from "../../repositories/prisma-audit-log-repository";
import { PrismaWalletRepository } from "../../repositories/prisma-wallet-repository";
import { registerBalanceCacheListener } from "../../../application/listeners/update-balance-cache.listener";
import { registerTransactionAuditLogListener } from "../../../application/listeners/create-transaction-audit-log.listener"
import { prisma } from "../../../database/prisma";

export function makeListeners() {
    const walletRepository = new PrismaWalletRepository(prisma)
    const auditLogRepository = new PrismaAuditLogRepository(prisma);
    registerBalanceCacheListener(walletRepository)
    registerTransactionAuditLogListener(auditLogRepository);
}

