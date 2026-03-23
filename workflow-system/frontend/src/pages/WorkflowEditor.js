import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Paper, Typography, TextField, Button, Table, TableBody,
  TableCell, TableHead, TableRow, IconButton, Box, Chip
} from '@mui/material';
import { Edit, Delete, Add, PlayArrow } from '@mui/icons-material';

const WorkflowEditor = () => {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [inputSchema, setInputSchema] = useState([]);

  useEffect(() => {
    fetchWorkflow();
  }, [id]);

  const fetchWorkflow = async () => {
    try {
      const res = await axios.get(`/workflows/${id}`);
      setWorkflow(res.data);
      setInputSchema(res.data.input_schema || []);
      // Fetch steps
      const stepsRes = await axios.get(`/workflows/${id}/steps`);
      setSteps(stepsRes.data);
    } catch (error) {
      console.error('Error fetching workflow:', error);
    }
  };

  const addSchemaField = () => {
    setInputSchema([...inputSchema, {
      name: '',
      type: 'string',
      required: false,
      allowed_values: []
    }]);
  };

  const updateSchemaField = (index, field) => {
    const newSchema = [...inputSchema];
    newSchema[index] = field;
    setInputSchema(newSchema);
  };

  const executeWorkflow = async () => {
    const inputData = {
      amount: 250,
      country: 'US',
      department: 'Finance',
      priority: 'High'
    };
    try {
      const res = await axios.post(`/workflows/${id}/execute`, inputData);
      console.log('Execution started:', res.data);
    } catch (error) {
      console.error('Execution error:', error);
    }
  };

  if (!workflow) return <div>Loading...</div>;

  return (
    <Box sx={{ display: 'flex', gap: 4 }}>
      <Paper sx={{ p: 3, flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          {workflow.name} (v{workflow.version})
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Input Schema
        </Typography>
        {inputSchema.map((field, index) => (
          <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
            <TextField
              label="Field Name"
              value={field.name}
              onChange={(e) => updateSchemaField(index, { ...field, name: e.target.value })}
              size="small"
              sx={{ mr: 2 }}
            />
            <TextField
              label="Type"
              select
              value={field.type}
              onChange={(e) => updateSchemaField(index, { ...field, type: e.target.value })}
              size="small"
              sx={{ mr: 2, minWidth: 100 }}
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
            </TextField>
            <Button
              size="small"
              color={field.required ? 'error' : 'default'}
              onClick={() => updateSchemaField(index, { ...field, required: !field.required })}
            >
              {field.required ? 'Required' : 'Optional'}
            </Button>
          </Box>
        ))}
        <Button onClick={addSchemaField} startIcon={<Add />} size="small">
          Add Field
        </Button>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={executeWorkflow}
            sx={{ mr: 2 }}
          >
            Execute Workflow
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, flex: 1 }}>
        <Typography variant="h6" gutterBottom>Steps</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {steps.map((step, index) => (
              <TableRow key={step._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{step.name}</TableCell>
                <TableCell>
                  <Chip label={step.step_type} size="small" />
                </TableCell>
                <TableCell>
                  <IconButton size="small"><Edit /></IconButton>
                  <IconButton size="small"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default WorkflowEditor;
