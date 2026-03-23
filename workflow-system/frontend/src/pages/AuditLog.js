import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper
} from '@mui/material';

const AuditLog = ({ workflowId }) => {
  const [executions, setExecutions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    if (workflowId) {
      fetchWorkflowDetails();
    }
  }, [workflowId]);

  const fetchWorkflowDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/workflows/${workflowId}/details`);
      setExecutions(res.data.executions);
      setAuditLogs(res.data.auditLogs);
    } catch (error) {
      console.error('Error fetching workflow details:', error);
    }
  };

  return (
    <div>
      <h2>Executions</h2>
      <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Execution ID</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Started By</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {executions.map((execution) => (
              <TableRow key={execution._id}>
                <TableCell>{execution._id.slice(-8)}</TableCell>
                <TableCell>{execution.workflow_version}</TableCell>
                <TableCell>{execution.status}</TableCell>
                <TableCell>{execution.triggered_by || 'system'}</TableCell>
                <TableCell>{new Date(execution.started_at).toLocaleString()}</TableCell>
                <TableCell>{execution.ended_at ? new Date(execution.ended_at).toLocaleString() : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <h2>Audit Logs</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.userId || 'system'}</TableCell>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AuditLog;