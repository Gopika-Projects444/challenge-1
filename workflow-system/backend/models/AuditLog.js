const { Schema, model } = require('mongoose');
const auditSchema = new Schema({
  workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
  action: { type: String, required: true },
  oldData: Object,
  newData: Object,
  userId: String,
  timestamp: { type: Date, default: Date.now }
});
module.exports = model('AuditLog', auditSchema);
