import { z } from 'zod'
import { Category, TransactionType } from '../../../domain/entities/transaction'

export const createTransactionSchema = z.object({
    name: z.string().trim().min(3).max(30),
    amount: z.number().positive(),
    category: z.nativeEnum(Category),
    transactionType: z.nativeEnum(TransactionType)
}).strict()

export const transactionFiltersSchema = z.object({
    category: z.nativeEnum(Category).optional(),
    transactionType: z.nativeEnum(TransactionType).optional()
}).strict()


