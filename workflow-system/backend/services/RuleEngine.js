const safeEval = require('safe-eval');
const Rule = require('../models/Rule');

class RuleEngine {
  static async evaluateRules(stepId, executionData) {
    const rules = await Rule.find({ step_id: stepId })
      .sort({ priority: 1 })
      .populate('next_step_id');

    for (const rule of rules) {
      try {
        let result;
        if (rule.condition.toUpperCase() === 'DEFAULT') {
          result = true;
        } else {
          const context = { ...executionData.data };
          result = safeEval(rule.condition, context);
        }

        if (result) {
          return {
            matchedRule: rule,
            result: true
          };
        }
      } catch (error) {
        console.error(`Rule evaluation failed: ${rule.condition}`, error);
        continue;
      }
    }

    return { matchedRule: null, result: false };
  }
}

module.exports = RuleEngine;
