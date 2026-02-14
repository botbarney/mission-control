import fs from 'fs';
import path from 'path';

const TASK_TRACKER_PATH = path.join(process.cwd(), '..', 'agents', 'task_tracker.json');

// Agent avatar mapping
export const AGENT_AVATARS: Record<string, string> = {
  barney: '🦞',
  tony: '🤖',
  spark: '⚡',
  insight: '🔍',
  robin: '🎯',
};

// Agent colors for theming
export const AGENT_COLORS: Record<string, string> = {
  barney: 'from-cyan-500 to-blue-600',
  tony: 'from-red-500 to-orange-600',
  spark: 'from-yellow-500 to-amber-600',
  insight: 'from-purple-500 to-indigo-600',
  robin: 'from-green-500 to-emerald-600',
};

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'working' | 'standby' | 'error';
  specialty: string;
  model: string;
  reportsTo: string;
  manages: string[];
  github: string;
  lastReport: string;
  currentTask: string;
  notes?: string;
  progress?: number;
  avatar?: string;
  color?: string;
}

export interface Project {
  name: string;
  priority: string;
  status: 'planned' | 'in-progress' | 'blocked' | 'completed';
  owner: string;
  assignedTo: string;
  deadline: string;
  notes: string;
  progress?: number;
}

export interface TaskTrackerData {
  company: string;
  lastUpdated: string;
  agents: Agent[];
  projects: Project[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  details?: string;
}

// Sample activity log - in production this would come from actual agent logs
const generateActivityLog = (): ActivityLog[] => {
  const now = new Date();
  const logs: ActivityLog[] = [
    {
      id: '1',
      timestamp: new Date(now.getTime() - 2 * 60000).toISOString(),
      agent: 'Barney',
      action: 'Company setup',
      details: 'Configuring Mission Control dashboard'
    },
    {
      id: '2',
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
      agent: 'Robin',
      action: 'ASO Analysis',
      details: 'Completed keyword research for TotTracker'
    },
    {
      id: '3',
      timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
      agent: 'Tony',
      action: 'iOS Setup',
      details: 'Agent setup complete - ready for iOS tasks'
    },
    {
      id: '4',
      timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
      agent: 'Spark',
      action: 'Content Creation',
      details: 'Wrote 3 X posts for TotTracker'
    },
    {
      id: '5',
      timestamp: new Date(now.getTime() - 60 * 60000).toISOString(),
      agent: 'Insight',
      action: 'Research',
      details: 'Found baby tracker app opportunities on Reddit'
    },
    {
      id: '6',
      timestamp: new Date(now.getTime() - 90 * 60000).toISOString(),
      agent: 'Barney',
      action: 'Delegation',
      details: 'Assigned iPad Kids Book App to team'
    }
  ];
  return logs;
};

export async function getTaskTrackerData(): Promise<TaskTrackerData> {
  try {
    const data = fs.readFileSync(TASK_TRACKER_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Add progress, avatars, and colors based on status
    parsed.agents = parsed.agents.map((agent: Agent) => ({
      ...agent,
      progress: agent.status === 'active' ? 75 : agent.status === 'working' ? 50 : 0,
      avatar: AGENT_AVATARS[agent.id] || '🤖',
      color: AGENT_COLORS[agent.id] || 'from-gray-500 to-gray-600'
    }));
    
    parsed.projects = parsed.projects.map((project: Project) => ({
      ...project,
      progress: project.status === 'completed' ? 100 : 
                project.status === 'in-progress' ? 60 : 
                project.status === 'blocked' ? 30 : 0
    }));
    
    return parsed;
  } catch (error) {
    console.error('Error reading task tracker:', error);
    return {
      company: 'Velez Apps',
      lastUpdated: new Date().toISOString(),
      agents: [],
      projects: []
    };
  }
}

export async function getActivityLog(): Promise<ActivityLog[]> {
  return generateActivityLog();
}

// Check for overdue tasks and critical conditions
export async function checkAlerts(): Promise<string[]> {
  const data = await getTaskTrackerData();
  const alerts: string[] = [];
  const now = new Date();
  
  // Check for agents in error state
  data.agents.forEach(agent => {
    if (agent.status === 'error') {
      alerts.push(`🚨 AGENT FAILURE: ${agent.name} (${agent.avatar}) is in ERROR state`);
    }
  });
  
  // Check for blocked projects (overdue)
  data.projects.forEach(project => {
    if (project.status === 'blocked') {
      alerts.push(`⚠️ PROJECT BLOCKED: ${project.name} needs attention`);
    }
  });
  
  // Check for stale agents (no report in 4+ hours)
  data.agents.forEach(agent => {
    const lastReport = new Date(agent.lastReport);
    const hoursSinceReport = (now.getTime() - lastReport.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceReport > 4 && agent.status === 'active') {
      alerts.push(`⏰ TASK OVERDUE: ${agent.name} (${agent.avatar}) - no update in ${Math.floor(hoursSinceReport)}h`);
    }
  });
  
  return alerts;
}
