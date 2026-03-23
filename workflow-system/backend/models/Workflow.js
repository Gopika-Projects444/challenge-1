const { Schema, model } = require('mongoose');

const workflowSchema = new Schema({
  name: { type: String, required: true },
  version: { type: Number, default: 1 },
  description: String,
  status: { type: String, default: 'active', enum: ['active', 'inactive', 'archived'] },  // ✅ Add this
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});
module.exports = model('Workflow', workflowSchema);
