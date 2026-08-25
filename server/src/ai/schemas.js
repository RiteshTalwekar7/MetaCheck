import { z } from 'zod';

export const VisibilityEnum = z.enum(['VISIBLE', 'PARTIALLY_VISIBLE', 'NOT_VISIBLE', 'ILLEGIBLE', 'CONFLICTING']);

export const BoundingBoxSchema = z.object({
  x: z.number().min(0).max(1).describe('Top-left X coordinate normalized 0-1'),
  y: z.number().min(0).max(1).describe('Top-left Y coordinate normalized 0-1'),
  width: z.number().min(0).max(1).describe('Width normalized 0-1'),
  height: z.number().min(0).max(1).describe('Height normalized 0-1'),
});

export const EvidenceItemSchema = z.object({
  imageId: z.string(),
  bbox: BoundingBoxSchema.optional(),
  text: z.string().optional(),
});

export const FieldDeclarationSchema = z.object({
  value: z.string().nullable().default(null),
  unit: z.string().nullable().optional().default(null),
  confidence: z.number().min(0).max(1).nullable().default(null),
  visibility: VisibilityEnum.default('NOT_VISIBLE'),
  evidence: z.array(EvidenceItemSchema).default([]),
});

export const ConsumerCareSchema = z.object({
  nameOrDesignation: z.string().nullable().default(null),
  address: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  email: z.string().nullable().default(null),
  confidence: z.number().min(0).max(1).nullable().default(null),
  visibility: VisibilityEnum.default('NOT_VISIBLE'),
  evidence: z.array(EvidenceItemSchema).default([]),
});

export const DateMarkingSchema = z.object({
  month: z.number().min(1).max(12).nullable().default(null),
  year: z.number().min(2000).max(2050).nullable().default(null),
  formatted: z.string().nullable().default(null),
  confidence: z.number().min(0).max(1).nullable().default(null),
  visibility: VisibilityEnum.default('NOT_VISIBLE'),
  evidence: z.array(EvidenceItemSchema).default([]),
});

export const ExtractionResultSchema = z.object({
  schemaVersion: z.literal('1.0').default('1.0'),
  imageQuality: z.enum(['GOOD', 'DEGRADED', 'UNREADABLE']).default('GOOD'),
  product: z.object({
    productName: FieldDeclarationSchema,
    genericName: FieldDeclarationSchema,
    manufacturer: FieldDeclarationSchema,
    packer: FieldDeclarationSchema,
    importer: FieldDeclarationSchema,
    countryOfOrigin: FieldDeclarationSchema,
    netQuantity: FieldDeclarationSchema,
    mrp: FieldDeclarationSchema,
    manufactureDate: DateMarkingSchema,
    bestBefore: FieldDeclarationSchema,
    consumerCare: ConsumerCareSchema,
    unitSalePrice: FieldDeclarationSchema,
    dimensions: FieldDeclarationSchema,
  }),
  rawText: z.array(z.string()).default([]),
  overallConfidence: z.number().min(0).max(1).nullable().default(null),
});