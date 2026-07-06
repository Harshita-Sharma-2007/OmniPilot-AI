import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import dotenv from 'dotenv';
import { runOrchestration, registerWsClient, blackboard, addSecurityAudit } from './agents/orchestrator.js';
import { handleMcpRequest } from './mcp/mcpServer.js';
import { sanitizeString, validateTaskPayload } from './security/validator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Express REST Endpoint to trigger orchestration
app.post('/api/run', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt parameter' });
  }

  try {
    const sanitizedPrompt = sanitizeString(prompt, 500);
    // Execute asynchronously to let WS stream steps in real-time
    runOrchestration(sanitizedPrompt);
    res.json({ success: true, message: 'Orchestration started' });
  } catch (error) {
    addSecurityAudit('Trigger Orchestration', 'Blocked', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Express REST Endpoint for MCP Protocol requests (JSON-RPC over HTTP)
app.post('/api/mcp', async (req, res) => {
  const mcpResponse = await handleMcpRequest(req.body);
  res.json(mcpResponse);
});

// Express REST Endpoint to test Security validation
app.post('/api/security/test', (req, res) => {
  const { input, action } = req.body;
  
  try {
    if (action === 'validate_task') {
      validateTaskPayload(input);
    } else {
      sanitizeString(input);
    }
    
    addSecurityAudit('Manual Input Validation Test', 'Passed', `Input "${input}" successfully passed all security filters.`);
    res.json({ success: true, message: 'Validation passed successfully.' });
  } catch (error) {
    addSecurityAudit('Manual Input Validation Test', 'Blocked', `Rejected input: "${input}". Reason: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Basic status route
app.get('/api/status', (req, res) => {
  res.json({ status: 'running', agents: Object.keys(blackboard.agentStatuses).length });
});

// Create HTTP server to share with WebSocket
const server = http.createServer(app);

// WebSocket server setup
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (ws) => {
  registerWsClient(ws);
});

server.listen(PORT, () => {
  console.log(`OmniPilot AI backend listening on port ${PORT}`);
  console.log(`MCP Endpoint active at http://localhost:${PORT}/api/mcp`);
});
