const { Schema, model } = require('mongoose');

const logEntrySchema = new Schema({
  step_id: { type: Schema.Types.ObjectId, ref: 'Step' },
  status: String,
  rule_evaluations: [
    {
      condition: String,
      result: Boolean
    }
  ],
  timestamp: { type: Date, default: Date.now }
});

const executionSchema = new Schema({
  workflow_id: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
  workflow_version: Number,
  status: String,
  data: Schema.Types.Mixed,
  logs: [logEntrySchema],
  started_at: { type: Date, default: Date.now },
  ended_at: Date
}, {
  timestamps: true  
});

module.exports = model('Execution', executionSchema);
