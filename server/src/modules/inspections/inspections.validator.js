import { z } from 'zod';

export const createInspectionSchema = {
  body: z.object({
    establishmentName: z.string().min(1, 'Establishment name is required'),
    location: z.string().optional().default(''),
    commodityCategory: z.string().optional().default('General Packaged Commodity'),
    notes: z.string().optional().default(''),
    referenceNumber: z.string().optional(),
  }),
};

export const updateInspectionSchema = {
  body: z.object({
    establishmentName: z.string().optional(),
    location: z.string().optional(),
    commodityCategory: z.string().optional(),
    notes: z.string().optional(),
  }),
};

export const reviewFieldSchema = {
  body: z.object({
    fieldPath: z.string().min(1, 'fieldPath is required (e.g. netQuantity, mrp)'),
    value: z.string().nullable(),
    unit: z.string().nullable().optional(),
    reason: z.string().min(1, 'Review reason is required'),
  }),
};

