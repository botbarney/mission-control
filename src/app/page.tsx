'use client';

import { useState, useEffect } from 'react';
import { checkAndSendAlerts } from '@/lib/notifications';

interface Agent {
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
  progress: number;
  avatar: string;
  color: string;
}

interface Project {
  name: string;
  priority: string;
  status: 'planned' | 'in-progress' | 'blocked' | 'completed';
  owner: string;
  assignedTo: string;
  deadline: string;
  notes: string;
  progress: number;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  details?: string;
}

const statusColors = {
  active: 'bg-green-500',
  working: 'bg-yellow-500',
  standby: 'bg-gray-400',
  error: 'bg-red-500',
};

const projectStatusColors = {
  'in-progress': 'bg-blue-500',
  blocked: 'bg-red-500',
  planned: 'bg-gray-500',
  completed: 'bg-green-500',
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export default function MissionControl() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showSpawnModal, setShowSpawnModal] = useState(false);
  const [showKillModal, setShowKillModal] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [stats, setStats] = useState({
    activeAgents: 0,
    workingAgents: 0,
    blockedProjects: 0,
    totalProjects: 0
  });

  const fetchData = async () => {
    try {
      const [trackerRes, activityRes] = await Promise.all([
        fetch('/api/task-tracker'),
        fetch('/api/activity')
      ]);
      
      const trackerData = await trackerRes.json();
      const activityData = await activityRes.json();
      
      setAgents(trackerData.agents);
      setProjects(trackerData.projects);
      setActivity(activityData);
      setLastUpdate(new Date().toISOString());
      
      // Calculate stats
      setStats({
        activeAgents: trackerData.agents.filter((a: Agent) => a.status === 'active').length,
        workingAgents: trackerData.agents.filter((a: Agent) => a.status === 'working').length,
        blockedProjects: trackerData.projects.filter((p: Project) => p.status === 'blocked').length,
        totalProjects: trackerData.projects.length
      });
      
      setLoading(false);
      setIsOffline(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsOffline(true);
      setLoading(false);
    }
  };

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }

    // Check online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
      // Check for alerts every 30 seconds
      checkAndSendAlerts();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl font-mono">Loading Mission Control...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* PWA Install Prompt - Hidden by default, shown via JS */}
      <div id="pwa-install" className="hidden fixed bottom-4 left-4 right-4 bg-cyan-900/90 p-4 rounded-lg z-50 border border-cyan-500/50">
        <div className="flex items-center justify-between">
          <span>📱 Install Mission Control for offline access</span>
          <button id="pwa-install-btn" className="px-4 py-2 bg-cyan-600 rounded-lg">Install</button>
        </div>
      </div>

      {/* Offline Indicator */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-600/90 text-white text-center py-2 z-50">
          📴 Offline Mode - Showing cached data
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Mission Control
                </h1>
                <p className="text-xs text-gray-400">Velez Apps Command Center</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500">Last updated</p>
                <p className="text-sm text-cyan-400 font-mono">{lastUpdate ? formatTime(lastUpdate) : '--:--'}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`></div>
            </div>
          </div>        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Active Agents</p>
            <p className="text-2xl font-bold text-green-400">{stats.activeAgents}</p>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Working</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.workingAgents}</p>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Projects</p>
            <p className="text-2xl font-bold text-blue-400">{stats.totalProjects}</p>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Blocked</p>
            <p className={`text-2xl font-bold ${stats.blockedProjects > 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {stats.blockedProjects}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowSpawnModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <span>🚀</span> Spawn Agent
          </button>
          <button
            onClick={() => setShowKillModal(true)}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>💀</span> Kill Agent
          </button>
          <button
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>📋</span> View Logs
          </button>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>🔄</span> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Status Panel */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>👥</span> Agent Status
              <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">
                {stats.activeAgents + stats.workingAgents} active
              </span>
            </h2>
            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Large Avatar */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}>
                      {agent.avatar}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{agent.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[agent.status]} bg-opacity-20 text-white`}>
                              {agent.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{agent.role}</p>
                          <p className="text-xs text-gray-500 mt-1">{agent.specialty}</p>
                        </div>
                        <span className="text-xs text-gray-500">{formatRelativeTime(agent.lastReport)}</span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400 truncate">{agent.currentTask}</span>
                          <span className="text-cyan-400">{agent.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${statusColors[agent.status]} transition-all duration-500`}
                            style={{ width: `${agent.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Projects Panel */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📁</span> Active Projects
              <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">
                {projects.filter(p => p.status !== 'completed').length} active
              </span>
            </h2>
            <div className="space-y-3">
              {projects.map((project, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{project.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{project.notes}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${projectStatusColors[project.status]} bg-opacity-20 text-white`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        project.priority === 'P0' ? 'bg-red-500/20 text-red-400' :
                        project.priority === 'P1' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {project.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        Assigned: <span className="text-cyan-400">{project.assignedTo}</span>
                      </span>
                    </div>
                    <span className="text-sm font-mono text-cyan-400">{project.progress}%</span>
                  </div>
                  
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full ${projectStatusColors[project.status]} transition-all duration-500`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📡</span> Live Activity Feed
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full animate-pulse">
              LIVE
            </span>
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {activity.map((item) => {
              // Get avatar for agent
              const agent = agents.find(a => a.name.toLowerCase().includes(item.agent.toLowerCase()));
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
                >
                  <span className="text-2xl">{agent?.avatar || '🤖'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-mono">{formatTime(item.timestamp)}</span>
                      <span className="text-cyan-400 font-medium">{item.agent}</span>
                    </div>
                    <span className="text-gray-400"> — {item.action}</span>
                    {item.details && (
                      <p className="text-xs text-gray-500 mt-1">{item.details}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Auto-updates every 30 seconds • PWA Enabled • Telegram Notifications Active
          </p>
        </div>
      </main>

      {/* Spawn Agent Modal */}
      {showSpawnModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setShowSpawnModal(false)}>
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">🚀 Spawn Agent</h3>
            <p className="text-gray-400 mb-4">Select an agent type to spawn:</p>
            <div className="space-y-2">
              {[
                { type: 'iOS Developer', icon: '🤖', desc: 'Swift, SwiftUI, Xcode' },
                { type: 'ASO Specialist', icon: '🎯', desc: 'Keywords, screenshots, optimization' },
                { type: 'Research Agent', icon: '🔍', desc: 'Reddit/X scanning, competitor analysis' },
                { type: 'Growth Specialist', icon: '⚡', desc: 'X growth, content marketing' }
              ].map(({ type, icon, desc }) => (
                <button
                  key={type}
                  className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-cyan-500 transition-colors flex items-center gap-3"
                >
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="font-medium">{type}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSpawnModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Kill Agent Modal */}
      {showKillModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setShowKillModal(false)}>
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4 text-red-400">💀 Kill Agent</h3>
            <p className="text-gray-400 mb-4">Select an agent to terminate:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {agents.filter(a => a.status !== 'standby').map((agent) => (
                <button
                  key={agent.id}
                  className="w-full text-left p-3 bg-gray-800 hover:bg-red-900/50 rounded-lg border border-gray-700 hover:border-red-500 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{agent.avatar}</span>
                    <span>{agent.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[agent.status]} bg-opacity-20`}>
                    {agent.status}
                  </span>
                </button>
              ))}
              {agents.filter(a => a.status !== 'standby').length === 0 && (
                <p className="text-gray-500 text-center py-4">No active agents to terminate</p>
              )}
            </div>
            <button
              onClick={() => setShowKillModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-gray-600 border-t border-gray-800 mt-8">
        <p>Mission Control v1.0 • PWA Enabled • Works Offline</p>
      </footer>
    </div>
  );
}
