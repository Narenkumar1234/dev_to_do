import { useState, useEffect } from 'react';
import { UserQuota, QuotaStatus, TaskMap, TabsMap } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Free tier limits
const FREE_TIER_LIMITS = {
  maxTasks: 50,
  maxWorkspaces: 10,
  maxReadsPerDay: 200,
  maxWritesPerDay: 100
};

const QUOTA_STORAGE_KEY = 'devtab_user_quota';

export const useQuotaManager = (tasks: TaskMap, tabs: TabsMap) => {
  const { user } = useAuth();
  const [quota, setQuota] = useState<UserQuota | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus>({
    canCreateTask: true,
    canCreateWorkspace: true,
    canRead: true,
    canWrite: true
  });

  // Initialize or load quota data
  useEffect(() => {
    if (!user) {
      setQuota(null);
      return;
    }

    const today = new Date().toDateString();
    const storedQuota = localStorage.getItem(`${QUOTA_STORAGE_KEY}_${user.uid}`);
    
    let userQuota: UserQuota;
    
    if (storedQuota) {
      const parsed = JSON.parse(storedQuota);
      // Reset daily counters if it's a new day
      if (parsed.lastResetDate !== today) {
        userQuota = {
          ...parsed,
          readsToday: 0,
          writesToday: 0,
          lastResetDate: today
        };
      } else {
        userQuota = parsed;
      }
    } else {
      // Initialize new quota
      userQuota = {
        tasksCount: 0,
        workspacesCount: 0,
        maxTasks: FREE_TIER_LIMITS.maxTasks,
        maxWorkspaces: FREE_TIER_LIMITS.maxWorkspaces,
        readsToday: 0,
        writesToday: 0,
        maxReadsPerDay: FREE_TIER_LIMITS.maxReadsPerDay,
        maxWritesPerDay: FREE_TIER_LIMITS.maxWritesPerDay,
        lastResetDate: today
      };
    }

    // Update current counts
    const totalTasks = Object.values(tasks).reduce((acc, taskList) => acc + taskList.length, 0);
    const totalWorkspaces = Object.keys(tabs).length;
    
    userQuota.tasksCount = totalTasks;
    userQuota.workspacesCount = totalWorkspaces;

    setQuota(userQuota);
    saveQuota(userQuota);
  }, [user, tasks, tabs]);

  // Update quota status based on current quota
  useEffect(() => {
    if (!quota) {
      setQuotaStatus({
        canCreateTask: true,
        canCreateWorkspace: true,
        canRead: true,
        canWrite: true
      });
      return;
    }

    const canCreateTask = quota.tasksCount < quota.maxTasks && quota.writesToday < quota.maxWritesPerDay;
    const canCreateWorkspace = quota.workspacesCount < quota.maxWorkspaces && quota.writesToday < quota.maxWritesPerDay;
    const canRead = quota.readsToday < quota.maxReadsPerDay;
    const canWrite = quota.writesToday < quota.maxWritesPerDay;

    let warningMessage: string | undefined = undefined;
    
    // Generate warning messages
    if (quota.tasksCount >= quota.maxTasks * 0.8) {
      warningMessage = `You're approaching the task limit (${quota.tasksCount}/${quota.maxTasks})`;
    } else if (quota.workspacesCount >= quota.maxWorkspaces * 0.8) {
      warningMessage = `You're approaching the workspace limit (${quota.workspacesCount}/${quota.maxWorkspaces})`;
    } else if (quota.writesToday >= quota.maxWritesPerDay * 0.8) {
      warningMessage = `You're approaching today's write limit (${quota.writesToday}/${quota.maxWritesPerDay})`;
    } else if (quota.readsToday >= quota.maxReadsPerDay * 0.8) {
      warningMessage = `You're approaching today's read limit (${quota.readsToday}/${quota.maxReadsPerDay})`;
    }

    setQuotaStatus({
      canCreateTask,
      canCreateWorkspace,
      canRead,
      canWrite,
      warningMessage
    });
  }, [quota]);

  const saveQuota = (userQuota: UserQuota) => {
    if (user) {
      localStorage.setItem(`${QUOTA_STORAGE_KEY}_${user.uid}`, JSON.stringify(userQuota));
    }
  };

  const incrementReads = () => {
    if (quota && user) {
      const updated = { ...quota, readsToday: quota.readsToday + 1 };
      setQuota(updated);
      saveQuota(updated);
    }
  };

  const incrementWrites = () => {
    if (quota && user) {
      const updated = { ...quota, writesToday: quota.writesToday + 1 };
      setQuota(updated);
      saveQuota(updated);
    }
  };

  const getQuotaWarning = (action: 'task' | 'workspace' | 'read' | 'write'): string | null => {
    if (!quota) return null;

    switch (action) {
      case 'task':
        if (quota.tasksCount >= quota.maxTasks) {
          return `You've reached the maximum number of tasks (${quota.maxTasks}). Delete some tasks or upgrade your plan.`;
        }
        break;
      case 'workspace':
        if (quota.workspacesCount >= quota.maxWorkspaces) {
          return `You've reached the maximum number of workspaces (${quota.maxWorkspaces}). Delete some workspaces or upgrade your plan.`;
        }
        break;
      case 'write':
        if (quota.writesToday >= quota.maxWritesPerDay) {
          return `You've reached today's write limit (${quota.maxWritesPerDay}). Try again tomorrow or upgrade your plan.`;
        }
        break;
      case 'read':
        if (quota.readsToday >= quota.maxReadsPerDay) {
          return `You've reached today's read limit (${quota.maxReadsPerDay}). Try again tomorrow or upgrade your plan.`;
        }
        break;
    }
    return null;
  };

  return {
    quota,
    quotaStatus,
    incrementReads,
    incrementWrites,
    getQuotaWarning
  };
};
