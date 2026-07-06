import { runSkill } from '../skills/registry.js';
import { validateTaskPayload, sanitizeString } from '../security/validator.js';
import { blackboard, addSecurityAudit } from '../agents/orchestrator.js';

/**
 * Handles incoming JSON-RPC requests for the MCP Server.
 */
export async function handleMcpRequest(reqBody) {
  const { jsonrpc, method, params, id } = reqBody;

  if (jsonrpc !== '2.0') {
    return { jsonrpc: '2.0', error: { code: -32600, message: 'Invalid Request: Not JSON-RPC 2.0' }, id: id || null };
  }

  try {
    switch (method) {
      case 'tools/list':
        return {
          jsonrpc: '2.0',
          result: {
            tools: [
              {
                name: 'add_task',
                description: 'Add a new task to the system schedule after security validation checks.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: 'Title of the task' },
                    description: { type: 'string', description: 'Optional description of the task' },
                    priority: { type: 'string', enum: ['Q1', 'Q2', 'Q3', 'Q4'], description: 'Eisenhower matrix priority' }
                  },
                  required: ['title']
                }
              },
              {
                name: 'run_cli_skill',
                description: 'Securely execute one of the pre-registered CLI tools (skills).',
                inputSchema: {
                  type: 'object',
                  properties: {
                    skillName: { type: 'string', enum: ['study', 'block', 'prioritize'], description: 'The CLI tool to execute' },
                    args: { type: 'array', items: { type: 'string' }, description: 'Arguments passed to the CLI tool' }
                  },
                  required: ['skillName']
                }
              },
              {
                name: 'get_status',
                description: 'Fetch current statuses of the multi-agent blackboard.',
                inputSchema: { type: 'object', properties: {} }
              }
            ]
          },
          id
        };

      case 'tools/call':
        if (!params || !params.name) {
          return { jsonrpc: '2.0', error: { code: -32602, message: 'Invalid params: Missing tool name' }, id };
        }
        return {
          jsonrpc: '2.0',
          result: await callMcpTool(params.name, params.arguments || {}),
          id
        };

      case 'resources/list':
        return {
          jsonrpc: '2.0',
          result: {
            resources: [
              {
                uri: 'omnipilot://blackboard',
                name: 'Blackboard State',
                description: 'Complete shared memory, agent statuses, and logs of the system.',
                mimeType: 'application/json'
              },
              {
                uri: 'omnipilot://schedule',
                name: 'Active Daily Schedule',
                description: 'Current active time blocks and scheduled items.',
                mimeType: 'application/json'
              }
            ]
          },
          id
        };

      case 'resources/read':
        if (!params || !params.uri) {
          return { jsonrpc: '2.0', error: { code: -32602, message: 'Invalid params: Missing resource URI' }, id };
        }
        return {
          jsonrpc: '2.0',
          result: {
            contents: [
              {
                uri: params.uri,
                mimeType: 'application/json',
                text: JSON.stringify(readMcpResource(params.uri), null, 2)
              }
            ]
          },
          id
        };

      default:
        return { jsonrpc: '2.0', error: { code: -32601, message: `Method not found: ${method}` }, id };
    }
  } catch (error) {
    return { jsonrpc: '2.0', error: { code: -32603, message: error.message }, id };
  }
}

/**
 * Invokes an MCP tool.
 */
async function callMcpTool(toolName, args) {
  switch (toolName) {
    case 'add_task':
      try {
        // Enforce Security validation checks
        validateTaskPayload({
          title: args.title,
          description: args.description || '',
          priority: args.priority || 'Q2'
        });
        
        const newTask = {
          name: args.title,
          priority: args.priority || 'Q2 - Schedule',
          quadrant: args.priority ? parseInt(args.priority.replace('Q', '')) : 2
        };
        
        blackboard.tasks.push(newTask);
        addSecurityAudit('add_task execution', 'Passed', `Task "${args.title}" passed schema checks.`);
        return { success: true, message: `Task '${args.title}' added successfully.`, task: newTask };
      } catch (err) {
        addSecurityAudit('add_task execution', 'Blocked', `Validation failed: ${err.message}`);
        throw new Error(`Security Validation Blocked: ${err.message}`);
      }

    case 'run_cli_skill':
      try {
        const skill = sanitizeString(args.skillName);
        const skillArgs = (args.args || []).map(a => sanitizeString(a));
        
        addSecurityAudit(`run_cli_skill [${skill}]`, 'Passed', 'Input arguments successfully sanitized.');
        const result = await runSkill(skill, skillArgs);
        return { success: true, result };
      } catch (err) {
        addSecurityAudit(`run_cli_skill [${args.skillName}]`, 'Blocked', `Execution failed: ${err.message}`);
        throw new Error(`CLI safe execution rejected: ${err.message}`);
      }

    case 'get_status':
      return {
        success: true,
        agentStatuses: blackboard.agentStatuses,
        taskCount: blackboard.tasks.length,
        scheduleCount: blackboard.schedule.length
      };

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

/**
 * Reads an MCP resource.
 */
function readMcpResource(uri) {
  if (uri === 'omnipilot://blackboard') {
    return blackboard;
  } else if (uri === 'omnipilot://schedule') {
    return blackboard.schedule;
  } else {
    throw new Error(`Resource not found: ${uri}`);
  }
}
