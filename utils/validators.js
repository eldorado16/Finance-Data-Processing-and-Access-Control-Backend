const { z } = require("zod");

const roles = ["admin", "analyst", "viewer"];
const statuses = ["active", "inactive"];

const passwordSchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
  });

const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(120).toLowerCase(),
    password: passwordSchema,
    role: z.enum(roles).optional(),
    status: z.enum(statuses).optional(),
  })
  .strict();

const loginSchema = z
  .object({
    email: z.string().trim().email().max(120).toLowerCase(),
    password: z.string().min(8).max(128),
  })
  .strict();

const updateUserSchema = z
  .object({
    role: z.enum(roles).optional(),
    status: z.enum(statuses).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const transactionCreateSchema = z
  .object({
    amount: z.coerce.number().positive().max(1_000_000_000),
    type: z.enum(["income", "expense"]),
    category: z.string().trim().min(1).max(60),
    date: z.coerce.date(),
    description: z.string().trim().max(400).optional(),
  })
  .strict();

const transactionUpdateSchema = z
  .object({
    amount: z.coerce.number().positive().max(1_000_000_000).optional(),
    type: z.enum(["income", "expense"]).optional(),
    category: z.string().trim().min(1).max(60).optional(),
    date: z.coerce.date().optional(),
    description: z.string().trim().max(400).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const recordQuerySchema = z
  .object({
    category: z.string().trim().min(1).max(60).optional(),
    type: z.enum(["income", "expense"]).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .strict()
  .refine((data) => !(data.startDate && data.endDate) || data.startDate <= data.endDate, {
    message: "startDate must be before or equal to endDate",
    path: ["startDate"],
  });

const analyticsQuerySchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .strict()
  .refine((data) => !(data.startDate && data.endDate) || data.startDate <= data.endDate, {
    message: "startDate must be before or equal to endDate",
    path: ["startDate"],
  });

module.exports = {
  roles,
  statuses,
  registerSchema,
  loginSchema,
  updateUserSchema,
  transactionCreateSchema,
  transactionUpdateSchema,
  recordQuerySchema,
  analyticsQuerySchema,
};