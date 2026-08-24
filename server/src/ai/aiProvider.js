import { env } from '../config/env.js';
import { MockAIProvider } from './mockProvider.js';
import { GeminiAIProvider } from './geminiProvider.js';

let activeProvider = null;

export function getAIProvider() {
  if (activeProvider) return activeProvider;

  if (env.AI_PROVIDER === 'gemini' && env.GEMINI_API_KEY) {
    activeProvider = new GeminiAIProvider();
  } else {
    activeProvider = new MockAIProvider();
  }

  return activeProvider;
}

