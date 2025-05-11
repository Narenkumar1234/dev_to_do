export interface Task {
  id: number
  text: string
  notes: string
  completed: boolean
}

interface LeftPanelProps {
  tasksByDate: TaskMap
  selectedDate: string
  setSelectedDate: (date: string) => void
  renamedDates: { [key: string]: string }
  onRename: (oldKey: string, newLabel: string) => void
  onCreateNewNote: () => void
}

export interface TaskMap {
  [date: string]: Task[]
}