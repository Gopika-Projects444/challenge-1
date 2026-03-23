import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, TextField, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, CircularProgress
} from '@mui/material';
import { Add, Edit, PlayArrow } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const WorkflowList = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [workflowName, setWorkflowName] = useState('');

  // Load workflows on mount and refresh
  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📡 Fetching workflows...');
      
      const response = await axios.get('http://localhost:5000/workflows');
      console.log('✅ Workflows response:', response.data);
      
      setWorkflows(response.data.workflows || []);
    } catch (err) {
      console.error('❌ Load workflows failed:', err);
      setError('Backend not running? Check http://localhost:5000/workflows');
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async () => {
    if (!workflowName.trim()) return;
    
    try {
      setCreating(true);
      setError('');
      
      console.log('🆕 Creating workflow:', workflowName);
      
      const response = await axios.post('http://localhost:5000/workflows', {
        name: workflowName.trim(),
        input_schema: [],
        is_active: true
      });
      
      console.log('✅ Created:', response.data);
      
      // Add to list immediately + refresh
      const newWorkflow = { ...response.data, steps: 0 };
      setWorkflows([newWorkflow, ...workflows]);
      
      setShowDialog(false);
      setWorkflowName('');
      
    } catch (err) {
      console.error('❌ Create failed:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Creation failed');
    } finally {
      setCreating(false);
    }
  };

  const executeWorkflow = async (workflowId) => {
    try {
      const response = await axios.post(`http://localhost:5000/workflows/${workflowId}/execute`, {
        amount: 250,
        country: 'US',
        priority: 'High',
        user_id: 'demo'
      });
      alert(`✅ Executed! Check /audit - ID: ${response.data._id.slice(-8)}`);
      window.location.href = '/audit';
    } catch (err) {
      alert('❌ Execution failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Workflows</h2>
      
      {/* Error Alert */}
      {error && (
        <div style={{ 
          background: '#fee', 
          color: '#c33', 
          padding: '12px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          ❌ {error}
          <br />
          <button onClick={loadWorkflows} style={{ marginTop: '8px' }}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* Controls */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <input
          placeholder="🔍 Search workflows..."
          style={{ flex: 1, padding: '8px', fontSize: '16px' }}
          onChange={loadWorkflows}
        />
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => setShowDialog(true)}
          disabled={creating}
        >
          Create Workflow
        </Button>
        <Button 
          variant="outlined" 
          onClick={loadWorkflows}
          disabled={loading}
        >
          🔄 Refresh
        </Button>
      </div>

      {/* Table */}
      <Paper style={{ overflow: 'auto' }}>
        <TableContainer style={{ minHeight: '400px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Steps</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Version</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    <CircularProgress /> Loading...
                  </TableCell>
                </TableRow>
              ) : workflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    📭 No workflows yet. Create your first one above!
                  </TableCell>
                </TableRow>
              ) : (
                workflows.map((workflow) => (
                  <TableRow key={workflow._id} hover>
                    <TableCell>{workflow._id.slice(-8)}</TableCell>
                    <TableCell>{workflow.name}</TableCell>
                    <TableCell>0</TableCell>
                    <TableCell>{workflow.version}</TableCell>
                    <TableCell style={{ color: workflow.is_active ? 'green' : 'red' }}>
                      {workflow.is_active ? 'Active' : 'Inactive'}
                    </TableCell>
                    <TableCell>
                      <IconButton component={Link} to={`/workflows/${workflow._id}`}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => executeWorkflow(workflow._id)}>
                        <PlayArrow />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Workflow Name"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createWorkflow()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={createWorkflow}
            disabled={!workflowName.trim() || creating}
          >
            {creating ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default WorkflowList;
