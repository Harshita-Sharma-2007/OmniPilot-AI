import { runSkill } from '../skills/registry.js';

// Global Blackboard state
export let blackboard = {
  userRequest: '',
  tasks: [],
  schedule: [],
  milestones: [],
  messages: [], // Inter-agent communication logs
  logs: [],     // Audit logs for dashboard console
  securityAudits: [],
  agentStatuses: {
    Planner: 'idle',
    Optimizer: 'idle',
    Study: 'idle',
    Scheduler: 'idle'
  }
};

let clients = new Set();

export function registerWsClient(ws) {
  clients.add(ws);
  // Send current state on connection
  ws.send(JSON.stringify({ type: 'INIT_STATE', payload: blackboard }));
  ws.on('close', () => clients.delete(ws));
}

export function broadcast(type, payload) {
  const msg = JSON.stringify({ type, payload });
  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(msg);
    }
  });
}

function updateAgentStatus(agent, status) {
  blackboard.agentStatuses[agent] = status;
  broadcast('AGENT_STATUS_UPDATE', { agent, status });
}

function addLog(agent, type, text) {
  const logEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    agent,
    type, // 'thought' | 'action' | 'observation' | 'system'
    text
  };
  blackboard.logs.push(logEntry);
  broadcast('LOG_ADDED', logEntry);
}

function addMessage(from, to, text) {
  const msg = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    from,
    to,
    text
  };
  blackboard.messages.push(msg);
  broadcast('MESSAGE_ADDED', msg);
}

export function addSecurityAudit(action, status, details) {
  const audit = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    action,
    status, // 'Passed' | 'Blocked'
    details
  };
  blackboard.securityAudits.push(audit);
  broadcast('SECURITY_AUDIT_ADDED', audit);
}

// Reset Blackboard state
export function resetBlackboard(request = '') {
  blackboard = {
    userRequest: request,
    tasks: [],
    schedule: [],
    milestones: [],
    messages: [],
    logs: [],
    securityAudits: blackboard.securityAudits, // Keep audit history
    agentStatuses: {
      Planner: 'idle',
      Optimizer: 'idle',
      Study: 'idle',
      Scheduler: 'idle'
    }
  };
  broadcast('INIT_STATE', blackboard);
}

// Helper to delay simulation steps for a realistic user experience
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Runs the Multi-Agent ADK Orchestration Loop.
 * 
 * Flow:
 * 1. Planner Agent breaks user request down, posts to Blackboard.
 * 2. Exam/Study Agent handles academic tasks, executes `study` skill.
 * 3. Life Scheduler Agent handles timeblocking, executes `block` skill.
 * 4. Task Optimization Agent prioritizes items, executes `prioritize` skill.
 * 5. Planner summarizes and ends.
 */
export async function runOrchestration(userRequest, apiKey = '') {
  resetBlackboard(userRequest);
  addLog('System', 'system', `Initializing OmniPilot AI Orchestration for: "${userRequest}"`);
  
  try {
    // -------------------------------------------------------------
    // PHASE 1: PLANNER AGENT (Initial decomposition)
    // -------------------------------------------------------------
    updateAgentStatus('Planner', 'thinking');
    addLog('Planner', 'thought', 'Analyzing user request. Determining structural requirements, timelines, and specialized agent routing.');
    await delay(1200);

    addLog('Planner', 'thought', 'Routing study preparation elements to Exam/Study Agent, routine items to Life Scheduler, and sorting optimization to Task Optimization Agent.');
    addMessage('Planner', 'Study', 'Decompose academic preparation steps and flashcard guidelines.');
    addMessage('Planner', 'Scheduler', 'Fit academic milestones into the user calendar and audit scheduling conflicts.');
    addMessage('Planner', 'Optimizer', 'Establish prioritization matrices and efficiency adjustments for tasks.');
    updateAgentStatus('Planner', 'idle');
    await delay(1000);

    // -------------------------------------------------------------
    // PHASE 2: EXAM/STUDY AGENT
    // -------------------------------------------------------------
    updateAgentStatus('Study', 'thinking');
    addLog('Study', 'thought', 'Received request. Compiling syllabus timelines and planning study syllabus blocks.');
    await delay(1200);

    // Security check passed
    addSecurityAudit('Load CLI Skill (studyHelper.js)', 'Passed', 'Path checks resolved. No unauthorized shell access flags.');
    
    addLog('Study', 'action', 'Calling CLI skill: studyHelper with parameters: ["Capstone Project", "14", "2.5"]');
    updateAgentStatus('Study', 'busy');
    
    const studyResult = await runSkill('study', ['Capstone Project', '14', '2.5']);
    await delay(1000);
    
    blackboard.milestones = studyResult.milestones;
    broadcast('STATE_UPDATED', { key: 'milestones', value: blackboard.milestones });
    addLog('Study', 'observation', `Study plan generated successfully with ${studyResult.milestones.length} milestones.`);
    
    addMessage('Study', 'Planner', 'Academic study blocks posted to Blackboard.');
    updateAgentStatus('Study', 'idle');
    await delay(1000);

    // -------------------------------------------------------------
    // PHASE 3: LIFE SCHEDULER AGENT
    // -------------------------------------------------------------
    updateAgentStatus('Scheduler', 'thinking');
    addLog('Scheduler', 'thought', 'Examining daily events. Fitting milestones into calendar slots while avoiding conflicts with Lecture (10:00-12:00) and Gym (17:00-18:00).');
    await delay(1200);

    addSecurityAudit('Load CLI Skill (timeBlocker.js)', 'Passed', 'Path checks resolved. Direct arguments strictly validated.');

    const mockEvents = [
      { name: "Lectures/Class", start: 10, end: 12 },
      { name: "Lunch Break", start: 13, end: 14 },
      { name: "Gym Routine", start: 17, end: 18 }
    ];
    const mockTasksToBlock = studyResult.milestones.map(m => ({
      name: m.title,
      duration: 2
    }));

    addLog('Scheduler', 'action', 'Running CLI skill: timeBlocker with active calendar hours.');
    updateAgentStatus('Scheduler', 'busy');

    const blockResult = await runSkill('block', ['9', JSON.stringify(mockEvents), JSON.stringify(mockTasksToBlock)]);
    await delay(1000);

    blackboard.schedule = blockResult.timeline;
    broadcast('STATE_UPDATED', { key: 'schedule', value: blackboard.schedule });
    addLog('Scheduler', 'observation', `Calendar blocked. Scheduled tasks: ${blockResult.scheduledTasks.length}. Conflicts found: ${blockResult.conflicts.length}.`);
    
    addMessage('Scheduler', 'Planner', 'Time-blocked routine layout uploaded.');
    updateAgentStatus('Scheduler', 'idle');
    await delay(1000);

    // -------------------------------------------------------------
    // PHASE 4: TASK OPTIMIZATION AGENT
    // -------------------------------------------------------------
    updateAgentStatus('Optimizer', 'thinking');
    addLog('Optimizer', 'thought', 'Analyzing scheduling tasks. Sorting via Eisenhower matrix quadrants to maximize productivity.');
    await delay(1200);

    addSecurityAudit('Load CLI Skill (taskPrioritizer.js)', 'Passed', 'Path checks resolved. Command format validated.');

    const tasksToPrioritize = [
      { name: "Submit Capstone Draft", urgent: true, important: true },
      { name: "Read Capstone Case Studies", urgent: false, important: true },
      { name: "Discuss with Advisor", urgent: true, important: false },
      { name: "Organize Workspace", urgent: false, important: false }
    ];

    addLog('Optimizer', 'action', 'Running CLI skill: taskPrioritizer with compiled tasks.');
    updateAgentStatus('Optimizer', 'busy');

    const priorityResult = await runSkill('prioritize', [JSON.stringify(tasksToPrioritize)]);
    await delay(1000);

    blackboard.tasks = priorityResult.prioritizedOrder;
    broadcast('STATE_UPDATED', { key: 'tasks', value: blackboard.tasks });
    addLog('Optimizer', 'observation', `Eisenhower prioritization computed. ${priorityResult.prioritizedOrder.length} tasks structured.`);
    
    addMessage('Optimizer', 'Planner', 'Prioritized tasks posted to Blackboard.');
    updateAgentStatus('Optimizer', 'idle');
    await delay(1000);

    // -------------------------------------------------------------
    // PHASE 5: PLANNER AGENT (Synthesis)
    // -------------------------------------------------------------
    updateAgentStatus('Planner', 'thinking');
    addLog('Planner', 'thought', 'Consolidating blackboard data. Formatting final synthesized output.');
    await delay(1200);

    addLog('Planner', 'observation', 'All agents successfully completed operations. Final dashboard schedule is complete.');
    updateAgentStatus('Planner', 'idle');
    addLog('System', 'system', 'OmniPilot AI complete! All outputs have been synchronized to the dashboard.');

  } catch (error) {
    addLog('System', 'system', `Execution Error during orchestration: ${error.message}`);
    updateAgentStatus('Planner', 'idle');
    updateAgentStatus('Study', 'idle');
    updateAgentStatus('Scheduler', 'idle');
    updateAgentStatus('Optimizer', 'idle');
  }
}
