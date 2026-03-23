const { Schema, model } = require('mongoose');

const ruleSchema = new Schema({
  step_id: { type: Schema.Types.ObjectId, ref: 'Step', required: true },
  condition: { type: String, required: true },
  next_step_id: { type: Schema.Types.ObjectId, ref: 'Step' },
  priority: { type: Number, default: 999 },
  is_default: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = model('Rule', ruleSchema);