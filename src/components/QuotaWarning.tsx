import React from 'react';
import { AlertTriangle, X, Zap, Users, Database, RefreshCw } from 'lucide-react';
import { UserQuota } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface QuotaWarningProps {
  quota: UserQuota;
  warningMessage?: string;
  onClose: () => void;
}

const QuotaWarning: React.FC<QuotaWarningProps> = ({ quota, warningMessage, onClose }) => {
  const { currentTheme } = useTheme();

  if (!warningMessage) return null;

  const getProgressColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const getProgressPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  return (
    <div className={`${currentTheme.colors.background.card} border-l-4 border-orange-500 p-4 mb-4 rounded-lg shadow-sm`}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h4 className={`font-medium ${currentTheme.colors.text.primary} text-sm`}>
              Quota Warning
            </h4>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg hover:${currentTheme.colors.background.hover} ${currentTheme.colors.text.muted} hover:${currentTheme.colors.text.primary} transition-colors`}
            >
              <X size={16} />
            </button>
          </div>
          
          <p className={`text-sm ${currentTheme.colors.text.secondary} mb-3`}>
            {warningMessage}
          </p>

          {/* Usage Statistics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Tasks Usage */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Database size={12} className={currentTheme.colors.text.muted} />
                <span className={currentTheme.colors.text.secondary}>Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(quota.tasksCount, quota.maxTasks)}`}
                    style={{ width: `${getProgressPercentage(quota.tasksCount, quota.maxTasks)}%` }}
                  />
                </div>
                <span className={`${currentTheme.colors.text.muted} font-mono`}>
                  {quota.tasksCount}/{quota.maxTasks}
                </span>
              </div>
            </div>

            {/* Workspaces Usage */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Users size={12} className={currentTheme.colors.text.muted} />
                <span className={currentTheme.colors.text.secondary}>Workspaces</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(quota.workspacesCount, quota.maxWorkspaces)}`}
                    style={{ width: `${getProgressPercentage(quota.workspacesCount, quota.maxWorkspaces)}%` }}
                  />
                </div>
                <span className={`${currentTheme.colors.text.muted} font-mono`}>
                  {quota.workspacesCount}/{quota.maxWorkspaces}
                </span>
              </div>
            </div>

            {/* Daily Reads */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <RefreshCw size={12} className={currentTheme.colors.text.muted} />
                <span className={currentTheme.colors.text.secondary}>Daily Reads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(quota.readsToday, quota.maxReadsPerDay)}`}
                    style={{ width: `${getProgressPercentage(quota.readsToday, quota.maxReadsPerDay)}%` }}
                  />
                </div>
                <span className={`${currentTheme.colors.text.muted} font-mono`}>
                  {quota.readsToday}/{quota.maxReadsPerDay}
                </span>
              </div>
            </div>

            {/* Daily Writes */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Zap size={12} className={currentTheme.colors.text.muted} />
                <span className={currentTheme.colors.text.secondary}>Daily Writes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(quota.writesToday, quota.maxWritesPerDay)}`}
                    style={{ width: `${getProgressPercentage(quota.writesToday, quota.maxWritesPerDay)}%` }}
                  />
                </div>
                <span className={`${currentTheme.colors.text.muted} font-mono`}>
                  {quota.writesToday}/{quota.maxWritesPerDay}
                </span>
              </div>
            </div>
          </div>

          {/* Upgrade suggestion */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className={`text-xs ${currentTheme.colors.text.muted}`}>
              Need more? Consider upgrading to our Pro plan for unlimited usage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotaWarning;
