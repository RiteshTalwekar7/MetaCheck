import { rule as nameRule } from './rules/PCR-R6-01-NAME.js';
import { rule as mfgPackerRule } from './rules/PCR-R6-01-MFG-PACKER.js';
import { rule as originRule } from './rules/PCR-R6-01-ORIGIN.js';
import { rule as netQtyRule } from './rules/PCR-R6-01-NET-QTY.js';
import { rule as mrpRule } from './rules/PCR-R6-01-MRP.js';
import { rule as unitPriceRule } from './rules/PCR-R6-11-UNIT-PRICE.js';
import { rule as mfgDateRule } from './rules/PCR-R6-01-MFG-DATE.js';
import { rule as expDateRule } from './rules/PCR-R6-01-EXP-DATE.js';
import { rule as consumerCareRule } from './rules/PCR-R6-01-CONSUMER-CARE.js';
import { rule as dimensionsRule } from './rules/PCR-R6-01-DIMENSIONS.js';

export const RULESET_VERSION = 'PCR-INDIA-2026-08-v1';

export const ALL_RULES = [
  nameRule,
  mfgPackerRule,
  originRule,
  netQtyRule,
  mrpRule,
  unitPriceRule,
  mfgDateRule,
  expDateRule,
  consumerCareRule,
  dimensionsRule,
];

export function getRuleById(ruleId) {
  return ALL_RULES.find(r => r.id === ruleId) || null;
}

