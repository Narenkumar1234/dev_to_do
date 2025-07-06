export interface Task {
  id: number
  text: string
  notes: string
  completed: boolean
}

export interface Tab {
  id: string
  name: string
  createdAt?: string
}

export interface TaskMap {
  [tabId: string]: Task[]
}

export interface TabsMap {
  [tabId: string]: Tab
}