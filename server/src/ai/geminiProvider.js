import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { SYSTEM_PROMPT, EXTRACTION_USER_PROMPT } from './prompt.js';
import { ExtractionResultSchema } from './schemas.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class GeminiAIProvider {
  constructor() {
    this.name = 'GeminiAIProvider';
    if (!env.GEMINI_API_KEY) {
      logger.warn('[AI] GEMINI_API_KEY is not set. GeminiAIProvider will fall back to MockAIProvider.');
    }
    this.genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;
    this.modelName = env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  async analyzeImages({ images, inspectionContext }) {
    if (!this.genAI) {
      throw new AppError(ErrorCodes.AI_PROVIDER_ERROR, 'Gemini API key is not configured.', 500);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const imageParts = images.map(img => {
        // Strip data:image/...;base64, if present
        const base64Clean = img.base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
        return {
          inlineData: {
            data: base64Clean,
            mimeType: img.mimeType || 'image/jpeg',
          },
        };
      });

      const contextText = `Inspection Reference: ${inspectionContext.referenceNumber || 'N/A'}\nEstablishment: ${inspectionContext.establishmentName || 'N/A'}\nCategory: ${inspectionContext.commodityCategory || 'N/A'}`;

      const promptParts = [
        EXTRACTION_USER_PROMPT,
        contextText,
        ...imageParts,
      ];

      const response = await model.generateContent(promptParts);
      const rawText = response.response.text();

      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (parseErr) {
        logger.error('[AI] Failed to parse Gemini JSON output', { rawText });
        throw new AppError(ErrorCodes.AI_SCHEMA_ERROR, 'AI returned invalid JSON formatting.', 502);
      }

      // Schema validation via Zod
      const validation = ExtractionResultSchema.safeParse(parsed);
      if (!validation.success) {
        logger.error('[AI] Gemini output failed Zod schema validation', { errors: validation.error.format() });
        throw new AppError(ErrorCodes.AI_SCHEMA_ERROR, 'AI output did not conform to the required extraction schema.', 502, validation.error.issues);
      }

      return validation.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('[AI] Gemini Provider Execution Error', { message: error.message });
      throw new AppError(ErrorCodes.AI_PROVIDER_ERROR, `Gemini Extraction Failed: ${error.message}`, 502);
    }
  }
}

