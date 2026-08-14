import { z } from 'zod'

export const createGoalSchema = z.object({
    name : z.string().trim().min(3).max(100),
    description : z.string().min(10).max(150).optional(),
    targetAmount: z.number().positive()
})

export const updateGoalSchema = z.object({
    amount: z.number().positive()
})

export const goalIdSchema = z.object({
    goalId : z.string().uuid()
})

