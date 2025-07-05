import { useState } from "react"
import { Task } from "../types"
import React from "react"

interface MiddlePanelProps {
  tasks: Task[]
  addTask: (text: string) => void
  onEditNotes: (taskId: number) => void
  onCompleteTask: (taskId: number) => void
  onDeleteTask: (taskId: number) => void
}

const MiddlePanel = ({
  tasks,
  addTask,
  onEditNotes,
  onCompleteTask,
  onDeleteTask,
}: MiddlePanelProps) => {
  const [newTask, setNewTask] = useState("")

  const handleAdd = () => {
    if (newTask.trim() !== "") {
      addTask(newTask.trim())
      setNewTask("")
    }
  }

  return (
    <div className={`w-3/5 transition-all duration-300w-2/5 border-r border-gray-300 p-4 overflow-y-auto`}>
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
            className={`border p-3 rounded shadow-sm bg-white flex justify-between items-center cursor-pointer hover:bg-gray-50 ${
              task.completed ? 'bg-gray-100' : ''
            }`}
            onClick={() => onEditNotes(task.id)}
          >
            <div className="flex flex-col flex-grow">
              <span className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.text}
              </span>
              <span className="text-sm text-blue-500 mt-1">
                {task.notes ? 'Click to view/edit notes' : 'Click to add notes'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCompleteTask(task.id);
                }}
                className={`px-2 py-1 text-xs rounded ${
                  task.completed 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={task.completed ? "Mark as incomplete" : "Mark as complete"}
              >
                {task.completed ? '✓' : '○'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete task "${task.text}"?`)) {
                    onDeleteTask(task.id);
                  }
                }}
                className="px-2 py-1 text-xs rounded bg-red-100 text-red-800 hover:bg-red-200"
                title="Delete task"
              >
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MiddlePanel