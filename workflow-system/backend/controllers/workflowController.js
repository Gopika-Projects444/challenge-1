const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const AuditLog = require('../models/AuditLog');

exports.getWorkflowDetails = async (req, res) => {
  try {
    const workflowId = req.params.id;

    // Workflow info
    const workflow = await Workflow.findById(workflowId);

    // Executions with step logs
    const executions = await Execution.find({ workflow_id: workflowId })
      .sort({ started_at: -1 })
      .lean();

    // Audit logs
    const auditLogs = await AuditLog.find({ workflowId })
      .sort({ timestamp: -1 })
      .lean();

    res.json({ workflow, executions, auditLogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};