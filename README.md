# 🚀 OmniPilot AI
### Multi-Agent Orchestration Platform with ADK, MCP, Secure CLI Skills & Interactive Dashboard

<p align="center">

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)
![Express](https://img.shields.io/badge/Framework-Express-black?logo=express)
![MCP](https://img.shields.io/badge/Protocol-MCP-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Project-Capstone-success)

</p>

---

# 📌 Overview

**OmniPilot AI** is an intelligent multi-agent orchestration platform designed to demonstrate collaborative AI systems using **Google ADK-inspired multi-agent architecture**, **Model Context Protocol (MCP)**, secure backend execution, and modular AI skills.

The system enables multiple specialized agents to coordinate through a shared blackboard, execute secure CLI-based skills, and stream their reasoning in real time to a modern React dashboard.

Designed as a capstone project, OmniPilot AI combines modern AI architecture with full-stack engineering principles to create a scalable orchestration environment.

---

# ✨ Features

- 🤖 Multi-Agent Collaboration
- 🧠 Planner (Coordinator) Agent
- 📚 Study Assistant Agent
- 📅 Smart Scheduler Agent
- ⚡ Task Optimization Agent
- 🔗 Model Context Protocol (MCP) Server
- 🔒 Secure Input Validation
- 🛡️ Shell Injection Protection
- 📡 Real-Time Event Streaming
- 🎨 Glassmorphism React Dashboard
- 📊 Interactive Blackboard Visualization
- ⚙️ Modular CLI Skills
- 🚀 Full Stack Architecture

---

# 🏗️ System Architecture

```
                     USER PROMPT
                          │
                          ▼
                 Planner Coordinator
          ┌──────────┼───────────┐
          ▼          ▼           ▼
   Study Agent   Scheduler   Optimizer
          │          │           │
          ▼          ▼           ▼
    Study Skill  Time Block  Prioritize
          └──────────┼───────────┘
                     ▼
            Shared Blackboard
                     │
                     ▼
      WebSocket + React Dashboard
```

---

# 🧠 Multi-Agent Workflow

The Planner Agent receives the user request and decomposes it into specialized subtasks.

Each task is delegated to dedicated agents:

### 📚 Study Agent
- Generates revision plans
- Creates study milestones
- Produces structured timelines

### 📅 Scheduler Agent
- Creates daily schedules
- Resolves calendar conflicts
- Blocks productive study sessions

### ⚡ Task Optimizer
- Prioritizes tasks
- Applies Eisenhower Matrix
- Organizes workloads efficiently

All agents communicate through a centralized **Blackboard Pattern**, allowing transparent reasoning and collaboration.

---
<img width="1919" height="958" alt="Image" src="https://github.com/user-attachments/assets/0c7b16ed-6202-49cf-b0fd-74871b1bf83c" />
--- 
<img width="1892" height="952" alt="Image" src="https://github.com/user-attachments/assets/59773290-8cfe-459f-a0b7-61db7736bb7d" />

---
# 🔗 Model Context Protocol (MCP)

OmniPilot AI exposes a JSON-RPC compliant MCP server.

## Available Tools

| Tool | Description |
|-------|-------------|
| add_task | Securely adds a new task |
| run_cli_skill | Executes sandboxed CLI skills |
| get_status | Returns current orchestration status |

## Available Resources

```
omnipilot://blackboard
omnipilot://schedule
```

---

# 🔒 Security

Security is a first-class component of OmniPilot AI.

## Input Validation

The backend blocks:

- Shell Injection
- Directory Traversal
- Command Chaining
- Malicious Symbols
- Unsafe CLI Execution

Examples of blocked characters:

```
;
&
|
$
..
```

## Safe Execution

CLI skills are executed using:

- execFile()
- Sandboxed execution
- 5-second timeout
- No shell spawning

---

# ⚙️ CLI Skills

The platform contains modular AI utilities.

## 📚 Study Helper

Generates:

- Study plans
- Revision schedules
- Learning milestones

---

## 📅 Time Blocker

Creates:

- Calendar blocks
- Daily schedules
- Conflict resolution

---

## ⚡ Task Prioritizer

Organizes tasks using:

- Eisenhower Matrix
- Priority scoring
- Productivity optimization

---

# 🎨 Dashboard

The React dashboard provides:

- ✨ Glassmorphism UI
- 🌈 Neon Gradient Theme
- 📡 Live Agent Console
- 🧠 Agent Thought Streams
- 📊 Blackboard Updates
- 📅 Schedule Visualization
- 📋 Task Boards
- 🔒 Security Monitoring

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- CSS3
- WebSocket

## Backend

- Node.js
- Express.js
- MCP Server
- REST APIs

## AI Architecture

- Multi-Agent System
- Blackboard Pattern
- ADK-inspired Orchestration
- CLI Skills

---

# 📂 Project Structure

```
OmniPilot-AI/

│
├── backend/
│   ├── agents/
│   ├── mcp/
│   ├── skills/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── App.jsx
│
├── package.json
├── README.md
└── start.bat
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/Harshita-Sharma-2007/OmniPilot-AI.git
cd OmniPilot-AI
```

---

## Install Dependencies

```bash
npm install
npm run install:all
```

---

## Start Development Server

```bash
npm run dev
```

---

## Windows

Simply run:

```text
start.bat
```

---

# 🌐 Local URLs

| Service | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |
| MCP Endpoint | http://localhost:3001/api/mcp |

---

# 📸 Screenshots

> Add screenshots of your dashboard here.

```
screenshots/

dashboard.png
agents.png
security.png
scheduler.png
```

---

# 🎯 Future Improvements

- Google Gemini Integration
- Voice Assistant
- RAG Knowledge Base
- Long-Term Memory
- Authentication
- Docker Deployment
- Kubernetes Support
- Cloud Deployment
- Multi-user Collaboration

---

# 👩‍💻 Author

**Harshita Sharma**

GitHub:
https://github.com/Harshita-Sharma-2007

---

# 📜 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you like this project,

⭐ Star the repository

🍴 Fork it

💡 Contribute

and help improve OmniPilot AI!
