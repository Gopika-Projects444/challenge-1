const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');

router.get('/', workflowController.getWorkflows);
router.get('/:id', workflowController.getWorkflow);

router.post('/', workflowController.createWorkflow);
router.put('/:id', workflowController.updateWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);

// 🚀 EXECUTE WORKFLOW
router.post('/:id/execute', workflowController.executeWorkflow);

// 📜 AUDIT LOGS
router.get('/:id/audit-logs', workflowController.getAuditLogs);

module.exports = router;