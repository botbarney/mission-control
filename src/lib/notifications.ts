// Telegram notification utility for Mission Control
const TELEGRAM_CHAT_ID = '6128414881';

interface NotificationPayload {
  message: string;
  priority: 'critical' | 'warning' | 'info';
  agent?: string;
  project?: string;
}

export async function sendTelegramNotification(payload: NotificationPayload): Promise<boolean> {
  const { message, priority, agent, project } = payload;
  
  // Add emoji prefix based on priority
  const prefix = priority === 'critical' ? '🚨' : 
                 priority === 'warning' ? '⚠️' : 'ℹ️';
  
  const fullMessage = `${prefix} *Mission Control Alert*\n\n${message}${
    agent ? `\n👤 Agent: ${agent}` : ''
  }${
    project ? `\n📁 Project: ${project}` : ''
  }\n\n⏰ ${new Date().toLocaleString()}`;

  try {
    // Use the message tool via API call
    const response = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: TELEGRAM_CHAT_ID,
        message: fullMessage,
        priority
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}

// Pre-defined alert types
export const Alerts = {
  agentFailure: (agentName: string, agentAvatar: string, error: string) => 
    sendTelegramNotification({
      message: `Agent ${agentName} ${agentAvatar} has FAILED!\n\nError: ${error}`,
      priority: 'critical',
      agent: agentName
    }),
  
  buildFailure: (project: string, error: string) =>
    sendTelegramNotification({
      message: `Build FAILED for ${project}!\n\nError: ${error}`,
      priority: 'critical',
      project
    }),
  
  taskOverdue: (agentName: string, agentAvatar: string, hours: number) =>
    sendTelegramNotification({
      message: `Task OVERDUE for ${agentName} ${agentAvatar}\n\nNo update in ${hours} hours`,
      priority: 'warning',
      agent: agentName
    }),
  
  projectBlocked: (projectName: string, reason: string) =>
    sendTelegramNotification({
      message: `Project BLOCKED: ${projectName}\n\nReason: ${reason}`,
      priority: 'warning',
      project: projectName
    }),
  
  agentSpawned: (agentName: string, agentAvatar: string) =>
    sendTelegramNotification({
      message: `New agent spawned: ${agentName} ${agentAvatar}`,
      priority: 'info',
      agent: agentName
    }),
  
  agentKilled: (agentName: string, agentAvatar: string) =>
    sendTelegramNotification({
      message: `Agent terminated: ${agentName} ${agentAvatar}`,
      priority: 'info',
      agent: agentName
    })
};

// Check and send alerts periodically
export async function checkAndSendAlerts(): Promise<void> {
  try {
    const response = await fetch('/api/alerts');
    const alerts: string[] = await response.json();
    
    for (const alert of alerts) {
      await sendTelegramNotification({
        message: alert,
        priority: alert.includes('🚨') ? 'critical' : 'warning'
      });
    }
  } catch (error) {
    console.error('Error checking alerts:', error);
  }
}
