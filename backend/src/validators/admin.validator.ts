import { z } from "zod";

export const adminRoleMutationBodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const adminCustomerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().min(1).max(120).optional(),
});

export const adminCustomerIdParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export const adminCustomerStatusBodySchema = z.object({
  isActive: z.boolean(),
});
