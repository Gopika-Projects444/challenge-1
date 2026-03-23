const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  executionId: { type: String, required: true },
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },

  status: { type: String, enum: ['Running', 'Completed', 'Failed'], default: 'Running' },

  startTime: { type: Date },
  endTime: { type: Date },

  startedBy: { type: String },

  // optional (for debugging / history)
  action: String,
  newData: Object
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);