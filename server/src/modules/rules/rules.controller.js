import { ALL_RULES, RULESET_VERSION, getRuleById } from '../../rules/index.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export function listRules(req, res) {
  const rules = ALL_RULES.map(r => ({
    id: r.id,
    title: r.title,
    legalSource: r.legalSource,
    severity: r.severity,
  }));

  return sendSuccess(res, {
    ruleSetVersion: RULESET_VERSION,
    count: rules.length,
    rules,
  }, 'Active Legal Metrology Rule Registry');
}

export function getRule(req, res) {
  const rule = getRuleById(req.params.ruleId);
  if (!rule) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Rule '${req.params.ruleId}' not found` } });
  }

  return sendSuccess(res, {
    ruleSetVersion: RULESET_VERSION,
    rule: {
      id: rule.id,
      title: rule.title,
      legalSource: rule.legalSource,
      severity: rule.severity,
    },
  }, 'Rule details retrieved');
}

