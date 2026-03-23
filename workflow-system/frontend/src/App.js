import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';  // ✅ CORRECT IMPORT
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import WorkflowList from './pages/WorkflowList';
import WorkflowEditor from './pages/WorkflowEditor';
import ExecutionView from './pages/ExecutionView';
import AuditLog from './pages/AuditLog';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Workflow Automation System
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<WorkflowList />} />
            <Route path="/workflows/:id" element={<WorkflowEditor />} />
            <Route path="/executions/:id" element={<ExecutionView />} />
            <Route path="/audit" element={<AuditLog />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
