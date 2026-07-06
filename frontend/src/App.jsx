import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [prompt, setPrompt] = useState('Plan my exam preparation for AI Capstone and balance it with daily workouts.');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('console'); // 'console' | 'messages'
  
  // Dashboard states synchronised from backend blackboard
  const [agentStatuses, setAgentStatuses] = useState({
    Planner: 'idle',
    Study: 'idle',
    Scheduler: 'idle',
    Optimizer: 'idle'
  });
  const [logs, setLogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [securityAudits, setSecurityAudits] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);

  const socketRef = useRef(null);
  const consoleEndRef = useRef(null);

  // Auto-scroll console logs to bottom
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, messages]);

  // Setup WebSocket connection
  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:3001/ws`;
    
    function connect() {
      console.log(`Connecting to WebSocket: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('WebSocket connection established.');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'INIT_STATE':
              setAgentStatuses(data.payload.agentStatuses);
              setLogs(data.payload.logs);
              setMessages(data.payload.messages);
              setSecurityAudits(data.payload.securityAudits || []);
              setSchedule(data.payload.schedule || []);
              setTasks(data.payload.tasks || []);
              setMilestones(data.payload.milestones || []);
              break;
            case 'AGENT_STATUS_UPDATE':
              setAgentStatuses(prev => ({
                ...prev,
                [data.payload.agent]: data.payload.status
              }));
              break;
            case 'LOG_ADDED':
              setLogs(prev => [...prev, data.payload]);
              break;
            case 'MESSAGE_ADDED':
              setMessages(prev => [...prev, data.payload]);
              break;
            case 'SECURITY_AUDIT_ADDED':
              setSecurityAudits(prev => [data.payload, ...prev]);
              break;
            case 'STATE_UPDATED':
              if (data.payload.key === 'schedule') setSchedule(data.payload.value);
              if (data.payload.key === 'tasks') setTasks(data.payload.value);
              if (data.payload.key === 'milestones') setMilestones(data.payload.value);
              break;
            default:
              break;
          }
        } catch (e) {
          console.error('Error parsing WebSocket message', e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        console.log('WebSocket disconnected. Reconnecting in 3s...');
        setTimeout(connect, 3000);
      };
      
      ws.onerror = (err) => {
        console.error('WebSocket Error', err);
        ws.close();
      };
    }

    connect();

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const handleRun = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!data.success) {
        alert(`Request failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  // Triggers mock security attacks to display safety feedback
  const handleTestSecurity = async (type) => {
    let input = '';
    let action = 'sanitize';

    if (type === 'injection') {
      input = 'Capstone Project; dir && rm -rf /';
    } else if (type === 'traversal') {
      input = '../../../../../windows/system32';
    } else if (type === 'payload') {
      input = { title: 'Dolphin task; cat file', priority: 'INVALID_PRIORITY' };
      action = 'validate_task';
    }

    try {
      const res = await fetch('/api/security/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, action })
      });
      const data = await res.json();
      if (data.success) {
        alert('Validation Check completed: Input passed.');
      }
    } catch (err) {
      console.warn('Security validation test caught expected error:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header glass-panel">
        <div className="logo-section">
          <div className="logo-icon">OP</div>
          <div className="logo-text">
            <h1>OmniPilot AI</h1>
            <p>ADK Multi-Agent & MCP Orchestration Center</p>
          </div>
        </div>
        <div className="connection-badge">
          <span className={`badge-dot ${connected ? 'connected' : 'disconnected'}`}></span>
          <span>{connected ? 'Orchestrator Connected' : 'Orchestrator Offline'}</span>
        </div>
      </header>

      {/* Agents Row */}
      <div className="agents-row">
        {[
          { id: 'Planner', name: 'Planner Agent', desc: 'Routes tasks, assigns parameters, and synthesizes plans.', icon: '🎯', border: 'Planner' },
          { id: 'Study', name: 'Exam/Study Agent', desc: 'Calculates topic coverage and flashcard intervals.', icon: '📚', border: 'Study' },
          { id: 'Scheduler', name: 'Life Scheduler Agent', desc: 'Coordinates daily tasks and resolves conflicts.', icon: '🗓️', border: 'Scheduler' },
          { id: 'Optimizer', name: 'Task Optimization Agent', desc: 'Prioritizes task queues using Eisenhower sorting.', icon: '⚡', border: 'Optimizer' }
        ].map(ag => (
          <div key={ag.id} className={`agent-card glass-panel active-${ag.border}`}>
            <div className="agent-meta">
              <span className="agent-avatar">{ag.icon}</span>
              <span className={`agent-status-tag ${agentStatuses[ag.id]}`}>
                {agentStatuses[ag.id]}
              </span>
            </div>
            <div className="agent-info">
              <h3>{ag.name}</h3>
              <p>{ag.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Prompt / Input Console */}
      <section className="prompt-panel glass-panel">
        <h2 className="prompt-title">Orchestrate Multi-Agent Session</h2>
        <form onSubmit={handleRun} className="prompt-form">
          <input
            type="text"
            className="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your goals, studies, routines..."
            disabled={loading}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Orchestrating...' : 'Run Agents'}
          </button>
        </form>
        
        <div className="security-quick-tests">
          <span>Security Sandbox Tests:</span>
          <button className="btn-sec-test" onClick={() => handleTestSecurity('injection')}>
            Test CLI Command Injection
          </button>
          <button className="btn-sec-test" onClick={() => handleTestSecurity('traversal')}>
            Test Directory Traversal
          </button>
          <button className="btn-sec-test" onClick={() => handleTestSecurity('payload')}>
            Test Schema Validation
          </button>
        </div>
      </section>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Hand: Console Logs & Security Auditing */}
        <div className="col-left">
          {/* Multi-agent logs terminal */}
          <div className="console-panel glass-panel">
            <div className="console-header">
              <div className="console-tabs">
                <button
                  className={`tab-btn ${activeTab === 'console' ? 'active' : ''}`}
                  onClick={() => setActiveTab('console')}
                >
                  Agent Reasoning Console
                </button>
                <button
                  className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
                  onClick={() => setActiveTab('messages')}
                >
                  Blackboard Inter-Agent Messages
                </button>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {activeTab === 'console' ? `${logs.length} events logged` : `${messages.length} messages posted`}
              </span>
            </div>

            <div className="console-body">
              {activeTab === 'console' ? (
                logs.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
                    Console idle. Enter a prompt above and click "Run Agents" to start.
                  </div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="log-line">
                      <span className="log-timestamp">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className={`log-badge ${log.agent}`}>{log.agent}</span>
                      <span className={`log-content ${log.type}`}>
                        {log.type === 'thought' ? `Thought: ${log.text}` : log.text}
                      </span>
                    </div>
                  ))
                )
              ) : (
                messages.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
                    No Blackboard messages posted yet.
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className="message-bubble">
                      <div className="message-header">
                        <span>From: <strong>{msg.from} Agent</strong> → To: <strong>{msg.to} Agent</strong></span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="message-text">
                        {msg.text}
                      </div>
                    </div>
                  ))
                )
              )}
              <div ref={consoleEndRef} />
            </div>
          </div>

          {/* Security Audits Monitor */}
          <div className="widget-panel glass-panel">
            <h3 className="widget-title">
              <span>Security Validation Monitor</span>
              <span style={{ fontSize: '12px', color: 'var(--text-danger)' }}>
                Blocked: {securityAudits.filter(a => a.status === 'Blocked').length}
              </span>
            </h3>
            <div className="audit-list">
              {securityAudits.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  No security audits logged. Click security tests to trigger validation filters.
                </div>
              ) : (
                securityAudits.map(audit => (
                  <div key={audit.id} className={`audit-item ${audit.status}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong>{audit.action}</strong>
                      <span className={`audit-status ${audit.status}`}>{audit.status}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                      {audit.details}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Hand: Schedule, Tasks & MCP Configuration */}
        <div className="col-right">
          {/* Calendar Visualiser */}
          <div className="widget-panel glass-panel">
            <h3 className="widget-title">Daily Calendar Blocks</h3>
            <div className="calendar-grid">
              {schedule.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '12px 0' }}>
                  Calendar empty. Run the agent workflow to compute schedule allocations.
                </div>
              ) : (
                schedule.map(slot => {
                  const isLecture = slot.occupiedBy === "Lectures/Class" || slot.occupiedBy === "Gym Routine" || slot.occupiedBy === "Lunch Break";
                  return (
                    <div key={slot.hour} className="calendar-hour-row">
                      <span className="hour-label">{slot.label}</span>
                      <div className={`hour-block ${slot.occupiedBy !== 'Free' ? (isLecture ? 'lecture' : 'occupied') : ''}`}>
                        {slot.occupiedBy}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Prioritized Task List */}
          <div className="widget-panel glass-panel">
            <h3 className="widget-title">Prioritized Task Board</h3>
            <div className="task-list">
              {tasks.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '12px 0' }}>
                  No prioritised tasks computed.
                </div>
              ) : (
                tasks.map((task, idx) => (
                  <div key={idx} className={`task-item q${task.quadrant}`}>
                    <span className="task-name">{task.name}</span>
                    <span className="task-tag">{task.priority}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Model Context Protocol tools */}
          <div className="widget-panel glass-panel">
            <h3 className="widget-title">Model Context Protocol (MCP) Tools</h3>
            <div className="mcp-tool-grid">
              {[
                { name: 'add_task', desc: 'Securely add custom scheduled tasks through validator check.' },
                { name: 'run_cli_skill', desc: 'Run sandboxed CLI skills (study, block, prioritize).' },
                { name: 'get_status', desc: 'Read active agent workload indicators.' }
              ].map(tool => (
                <div key={tool.name} className="mcp-tool-item">
                  <div className="mcp-tool-name">{tool.name}</div>
                  <div className="mcp-tool-desc">{tool.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
