# Mission Control

A visual Mission Control dashboard for managing the Velez Apps agent company.

## Features

- **Agent Status Panel**: Real-time status of all 5 agents (Barney, Tony, Spark, Insight, Robin)
  - Visual status indicators (🟢 Active / 🟡 Working / 🔴 Error / ⚪ Standby)
  - Progress bars for current tasks
  - Current task name and last activity timestamp

- **Active Projects Panel**: Track ongoing projects
  - Project name and description
  - Progress bars (0-100%)
  - Status labels and assigned agents
  - Priority indicators (P0, P1, P2)

- **Live Activity Feed**: Timestamped log of recent actions
  - Auto-updates every 30 seconds
  - Agent name + action details
  - Real-time monitoring

- **Action Buttons**:
  - Spawn Agent - dropdown to select agent type
  - Kill Agent - list running agents to terminate
  - View Logs - link to system logs

## Tech Stack

- Next.js 15 with TypeScript
- Tailwind CSS for styling
- Dark mode UI (professional)
- Mobile-responsive design
- Real-time polling (30 second refresh)

## Data Source

Reads from `task_tracker.json` in the agents directory for real-time agent status and project information.

## Running Locally

```bash
npm install
npm run dev
```

The dashboard will be available at http://localhost:3457

## Integration

- Runs on port 3457 (separate from Second Brain on port 3000/3001)
- Link from Second Brain sidebar for quick access
- Optimized for mobile viewing

---

Built for Velez Apps Agent Company
