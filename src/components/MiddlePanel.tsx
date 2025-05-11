import { useState } from "react"
import { Task } from "../types"
import React from "react"

interface MiddlePanelProps {
  tasks: Task[]
  addTask: (text: string) => void
  onEditNotes: (taskId: number) => void
  onCompleteTask: (taskId: number) => void
  showRightPanel: boolean
}

const MiddlePanel = ({
  tasks,
  addTask,
  onEditNotes,
  onCompleteTask,
  showRightPanel
}: MiddlePanelProps) => {
  const [newTask, setNewTask] = useState("")

  const handleAdd = () => {
    if (newTask.trim() !== "") {
      addTask(newTask.trim())
      setNewTask("")
    }
  }

  return (
    // <div className={`${showRightPanel ? "w-3/5" : "w-full"} transition-all duration-300`}></div>
    <div className={`${showRightPanel ? "w-3/5" : "w-full"} transition-all duration-300w-2/5 border-r border-gray-300 p-4 overflow-y-auto`}>
      <h2 className="text-lg font-semibold mb-4">Tasks</h2>

      <div className="flex mb-4">
        <input
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Add a new task..."
          className="flex-grow border px-3 py-2 rounded-l"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.map(task => (
          <li
            key={task.id}
            className="border p-3 rounded shadow-sm bg-white flex justify-between items-center"
          >
            <div className="flex flex-col">
              <span className="font-medium">{task.text}</span>
              <button
                onClick={() => onEditNotes(task.id)}
                className="text-sm text-blue-500 mt-1 hover:underline"
              >
                View / Modify Notes
              </button>
            </div>
            <input
              type="checkbox"
              onChange={() => onCompleteTask(task.id)}
              title="Mark Complete"
              className="w-5 h-5"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MiddlePanel