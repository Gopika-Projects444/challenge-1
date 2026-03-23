class RuleEngine {
  constructor(data) {
    this.data = data;
  }

  evaluateCondition(condition) {
    try {
      // Replace field references with data values
      const evalCondition = condition
        .replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*([<>=!]+)\s*([^&\s|]+)/g, (match, field, op, value) => {
          const fieldValue = this.data[field];
          const val = parseFloat(value) || value.replace(/['"]/g, '');
          return `${JSON.stringify(fieldValue)} ${op} ${JSON.stringify(val)}`;
        })
        .replace(/contains\(([a-zA-Z_][a-zA-Z0-9_]*)[,\s]*['"]([^'"]+)['"]\)/g, (match, field, val) => {
          return `(${JSON.stringify(this.data[field] || '')}.indexOf(${JSON.stringify(val)}) !== -1)`;
        });

      return Function('"use strict"; return (function(data) {' + evalCondition + '})')()(this.data);
    } catch (error) {
      console.error('Rule evaluation error:', error);
      return false;
    }
  }

  async evaluateRules(rules, stepId) {
    const evaluations = [];
    
    // Sort by priority (lower number = higher priority)
    const sortedRules = rules.sort((a, b) => a.priority - b.priority);
    
    for (const rule of sortedRules) {
      const result = this.evaluateCondition(rule.condition);
      evaluations.push({
        rule_id: rule._id,
        condition: rule.condition,
        result,
        matched: result
      });
      
      if (result || rule.is_default) {
        return {
          nextStepId: rule.next_step_id,
          evaluations,
          selectedRule: rule
        };
      }
    }
    
    return { nextStepId: null, evaluations, selectedRule: null };
  }
}

module.exports = RuleEngine;
