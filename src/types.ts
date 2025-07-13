export interface Task {
  id: number
  text: string
  notes: string
  completed: boolean
  createdAt?: string
  lastModified?: string
}

export interface Tab {
  id: string
  name: string
  createdAt?: string
  lastModified?: string
}

export interface TaskMap {
  [tabId: string]: Task[]
}

export interface TabsMap {
  [tabId: string]: Tab
}

export interface UserQuota {
  tasksCount: number
  workspacesCount: number
  maxTasks: number
  maxWorkspaces: number
  readsToday: number
  writesToday: number
  maxReadsPerDay: number
  maxWritesPerDay: number
  lastResetDate: string
}

export interface QuotaStatus {
  canCreateTask: boolean
  canCreateWorkspace: boolean
  canRead: boolean
  canWrite: boolean
  warningMessage?: string
}