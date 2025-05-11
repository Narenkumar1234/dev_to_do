import { useState } from "react"
import dayjs from "dayjs"
import LeftPanel from "./components/LeftPanel"
import MiddlePanel from "./components/MiddlePanel"
import RightPanel from "./components/RightPanel"
import { Task, TaskMap } from "./types"
import "./styles.css"
import React from "react"

const App = () => {
  const today = dayjs().format("DD-MMM-YY")

  const [tasksByDate, setTasksByDate] = useState<TaskMap>({
    [today]: [],
  })
  const [selectedDate, setSelectedDate] = useState<string>(today)
  const [renamedDates, setRenamedDates] = useState<{ [key: string]: string }>({})
  const [showNotesPanel, setShowNotesPanel] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  
  const tasks = tasksByDate[selectedDate] || []

  const addTask = (text: string) => {
    const newTask: Task = {
      id: Date.now(),
      text,
      notes: "",
      completed: false,
    }
    const updatedTasks = [...tasks, newTask]
    setTasksByDate(prev => ({ ...prev, [selectedDate]: updatedTasks }))
  }

  const completeTask = (taskId: number) => {
    const updated = tasksByDate[selectedDate].map(task =>
      task.id === taskId ? { ...task, completed: true } : task
    )
    setTasksByDate(prev => ({ ...prev, [selectedDate]: updated.filter(t => !t.completed) }))
  }

  const openNotesPanel = (taskId: number) => {
    setSelectedTaskId(taskId)
    setShowNotesPanel(true)
  }

  const closeNotesPanel = () => {
    setSelectedTaskId(null)
    setShowNotesPanel(false)
  }

  const saveNotes = (taskId: number, notes: string) => {
    const updated = tasksByDate[selectedDate].map(task =>
      task.id === taskId ? { ...task, notes } : task
    )
    setTasksByDate(prev => ({ ...prev, [selectedDate]: updated }))
  }

  const handleRenameDate = (oldKey: string, newLabel: string) => {
    setRenamedDates(prev => ({ ...prev, [oldKey]: newLabel }))
  }

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null

  return (
    <div className="flex h-screen bg-gray-100">
<LeftPanel
  tabs={Object.keys(tasksByDate)} // Convert TaskMap to string[]
  activeTab={selectedDate}
  onTabClick={setSelectedDate}
  onRenameTab={(oldKey, newLabel) => {
    // Copy existing tasks to new key
    setTasksByDate(prev => {
      const { [oldKey]: oldTasks, ...rest } = prev;
      return { ...rest, [newLabel]: oldTasks };
    });

    // Update renamedDates
    handleRenameDate(oldKey, newLabel);

    // Update selected tab if the renamed tab is active
    if (selectedDate === oldKey) {
      setSelectedDate(newLabel);
    }
  }}
  onNewTab={(name: string) => {
    setTasksByDate(prev => {
      if (prev[name]) return prev; // Avoid overwriting existing tabs
      return { ...prev, [name]: [] };
    });
    setSelectedDate(name); // Auto-select new tab
  }}
/>

      <MiddlePanel
        tasks={tasks}
        addTask={addTask}
        onEditNotes={openNotesPanel}
        onCompleteTask={completeTask}
      />

      {showNotesPanel && (
        <RightPanel
          selectedTask={selectedTask}
          onClose={closeNotesPanel}
          onSaveNotes={saveNotes}
        />
      )}
    </div>
  )
}

export default App