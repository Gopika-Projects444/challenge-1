const Execution = require('../models/Execution');
const RuleEngine = require('./RuleEngine');
const Step = require('../models/Step');

class WorkflowExecutor {
  static async executeStep(executionId, stepId) {
    const execution = await Execution.findById(executionId);
    if (!execution) throw new Error('Execution not found');

    const step = await Step.findById(stepId);
    if (!step) throw new Error('Step not found');

    // Simulate step execution
    const startTime = Date.now();
    
    // Log the step execution
    const logEntry = {
      step_id: stepId,
      status: 'completed',
      timestamp: new Date()
    };

    // Evaluate rules to determine next step
    const ruleResult = await RuleEngine.evaluateRules(stepId, execution);
    
    if (ruleResult.matchedRule) {
      logEntry.rules_evaluated = [{ rule_id: ruleResult.matchedRule._id, result: true }];
      logEntry.next_step_id = ruleResult.matchedRule.next_step_id?._id;
    }

    logEntry.duration = Date.now() - startTime;
    execution.logs.push(logEntry);
    execution.current_step_id = logEntry.next_step_id || null;

    if (!logEntry.next_step_id) {
      execution.status = 'completed';
      execution.ended_at = new Date();
    } else {
      execution.status = 'in_progress';
      setTimeout(() => this.executeStep(executionId, logEntry.next_step_id), 1000);
    }

    await execution.save();
    return execution;
  }

  static async startExecution(workflowId, data, userId) {
    const execution = new Execution({
      workflow_id: workflowId,
      workflow_version: 1, // Get from workflow
      data,
      triggered_by: userId,
      status: 'in_progress'
    });

    await execution.save();
    
    // Start first step
    const workflow = await require('../models/Workflow').findById(workflowId);
    await this.executeStep(execution._id, workflow.start_step_id);
    
    return execution;
  }
}

module.exports = WorkflowExecutor;
