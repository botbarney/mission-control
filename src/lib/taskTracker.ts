import fs from 'fs';
import path from 'path';

const TASK_TRACKER_PATH = path.join(process.cwd(), '..', 'agents', 'task_tracker.json');

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
    
    // Add progress based on status
    parsed.agents = parsed.agents.map((agent: Agent) => ({
      ...agent,
      progress: agent.status === 'active' ? 75 : agent.status === 'working' ? 50 : 0
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
