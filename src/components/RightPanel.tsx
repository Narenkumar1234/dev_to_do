import ReactQuill from "react-quill"
import { useEffect, useState } from "react"
import { Task } from "../types"
import React from "react"

interface RightPanelProps {
  selectedTask: Task | null
  onClose: () => void
  onSaveNotes: (taskId: number, notes: string) => any
}

const RightPanel = ({ selectedTask, onClose, onSaveNotes }: RightPanelProps) => {
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (selectedTask) {
      setNotes(selectedTask.notes || "")
    }
  }, [selectedTask])

  if (!selectedTask) return null

  const handleSave = () => {
    onSaveNotes(selectedTask.id, notes)
    onClose()
  }

  return (
    <div className="w-2/5 p-4 bg-white shadow-md overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Notes for: {selectedTask.text}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl">
          ✖
        </button>
      </div>

      <ReactQuill theme="snow" value={notes} onChange={setNotes} />

      <button
        onClick={handleSave}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Save Notes
      </button>
    </div>
  )
}

export default RightPanel