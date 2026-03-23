const { Schema, model } = require('mongoose');

const stepSchema = new Schema({
  workflow_id: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
  name: { type: String, required: true },
  step_type: { 
    type: String, 
    enum: ['task', 'approval', 'notification'], 
    required: true 
  },
  order: { type: Number, default: 0 },
  metadata: {
    assignee_email: String,
    notification_channel: String,
    template: String,
    instructions: String
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

stepSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = model('Step', stepSchema);