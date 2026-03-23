import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Paper, Typography, List, ListItem, Chip } from '@mui/material';

const ExecutionView = () => {
  const { id } = useParams();
  const [execution, setExecution] = useState(null);

  useEffect(() => {
    fetchExecution();
  }, [id]);

  const fetchExecution = async () => {
    try {
      const res = await axios.get(`/executions/${id}`);
      setExecution(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!execution) return <div>Loading...</div>;

  return (
    <Paper sx={{ p: 4, maxWidth: 800 }}>
      <Typography variant="h4" gutterBottom>
        Execution: {execution._id.slice(-8)}
      </Typography>
      
      <Typography variant="h6">Status: <Chip label={execution.status} color={execution.status === 'completed' ? 'success' : 'default'} /></Typography>
      
      <Typography variant="h6" sx={{ mt: 3 }}>Logs:</Typography>
      <List>
        {execution.logs.map((log, index) => (
          <ListItem key={index}>
            <div>
              <Typography><strong>Step:</strong> {log.step_id?.name || 'Unknown'}</Typography>
              <Typography><strong>Status:</strong> {log.status}</Typography>
              {log.rule_evaluations && (
                <Typography><strong>Rules:</strong> {log.rule_evaluations.length} evaluated</Typography>
              )}
              <Typography><strong>Duration:</strong> {log.duration}ms</Typography>
            </div>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ExecutionView;
