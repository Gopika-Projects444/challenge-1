// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

console.log('🚀 Starting Workflow Backend...');
console.log('📁 Env vars loaded:', Object.keys(process.env).filter(k => k.includes('MONGODB') || k === 'PORT'));

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Models
const Workflow = require('./models/Workflow');
const Step = require('./models/Step');
const Rule = require('./models/Rule');
const Execution = require('./models/Execution');
const AuditLog = require('./models/AuditLog'); // Audit log model

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workflow-system')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });

// ================== BASIC ROUTE ==================
app.get('/', (req, res) => {
  res.json({ message: 'Workflow API running! 🎉' });
});

// ================== WORKFLOWS ROUTES ==================

// Create workflow
app.post('/workflows', async (req, res) => {
  try {
    console.log('🆕 Creating workflow:', req.body.name);
    const workflow = new Workflow({
      ...req.body,
      version: req.body.version || 1
    });
    await workflow.save();
    console.log('✅ Workflow created:', workflow._id);
    res.status(201).json(workflow);
  } catch (error) {
    console.error('❌ Create workflow error:', error);
    res.status(400).json({ error: error.message });
  }
});

// List workflows
app.get('/workflows', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    
    console.log('🔍 GET /workflows:', { page, limit, search });
    
    const workflows = await Workflow.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ created_at: -1 });
    
    const total = await Workflow.countDocuments(query);
    
    console.log('📊 Found workflows:', workflows.length, 'Total:', total);
    
    res.json({ workflows, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('❌ Workflow GET error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get workflow by ID
app.get('/workflows/:id', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================== EXECUTE WORKFLOW ==================
app.post('/workflows/:id/execute', async (req, res) => {
  try {
    console.log('▶️ Executing workflow with data:', req.body);
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });

    // Create execution (keep your current working logic)
    const execution = new Execution({
      workflow_id: workflow._id,
      workflow_version: workflow.version,
      status: 'completed',
      data: req.body,
      logs: [{
        step_id: null,
        status: 'completed',
        rule_evaluations: [{
          condition: 'amount > 100 && country == "US"',
          result: req.body.amount > 100 && req.body.country === 'US'
        }],
        timestamp: new Date()
      }],
      started_at: new Date(),
      ended_at: new Date()
    });

    await execution.save();
    console.log('✅ Execution saved:', execution._id);

    // Insert audit log
    try {
      await AuditLog.create({
        workflowId: workflow._id,
        action: 'execute',
        newData: execution,
        userId: 'system', // replace with logged-in user if needed
        timestamp: new Date()
      });
      console.log('📝 Audit log created for execution:', execution._id);
    } catch (err) {
      console.error('❌ Failed to create audit log:', err.message);
    }

    res.status(201).json(execution);

  } catch (error) {
    console.error('❌ Execution error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ================== GET AUDIT LOGS ==================
app.get('/workflows/:id/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find({ workflowId: req.params.id }).sort({ timestamp: -1 });
    if (logs.length === 0) console.log('⚠️ No audit logs found for this workflow');
    res.json(logs);
  } catch (error) {
    console.error('❌ Failed to fetch audit logs:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ================== GET STEPS ==================
app.get('/workflows/:id/steps', async (req, res) => {
  try {
    const steps = await Step.find({ workflow_id: req.params.id }).sort({ order: 1 });
    if (steps.length === 0) console.log('⚠️ No steps found for this workflow');
    res.json(steps);
  } catch (error) {
    console.error('❌ Failed to fetch steps:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ================== GET WORKFLOW DETAILS (combined) ==================
app.get('/workflows/:id/details', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });

    const steps = await Step.find({ workflow_id: workflow._id }).sort({ order: 1 });
    const executions = await Execution.find({ workflow_id: workflow._id }).sort({ started_at: -1 });
    const auditLogs = await AuditLog.find({ workflowId: workflow._id }).sort({ timestamp: -1 });

    res.json({
      workflow,
      steps,
      executions,
      auditLogs
    });

  } catch (error) {
    console.error('❌ Failed to fetch workflow details:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ================== DEBUG ROUTE ==================
app.get('/debug/db', async (req, res) => {
  try {
    const workflows = await Workflow.find();
    const steps = await Step.find();
    const executions = await Execution.find();
    const auditLogs = await AuditLog.find();

    res.json({
      workflows: workflows.length,
      steps: steps.length,
      executions: executions.length,
      auditLogs: auditLogs.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});