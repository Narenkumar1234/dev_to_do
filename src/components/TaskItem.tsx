import React, { useState } from 'react'
import { Task } from '../types'

interface Props {
  task: Task
  onComplete: () => void
  onUpdateNotes: (id: number, notes: string) => void
}

const TaskItem: React.FC<Props> = ({ task, onComplete, onUpdateNotes }) => {
  const [showNotes, setShowNotes] = useState(false)

  return (
    <div className="mb-4 border rounded p-3 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <span className="font-medium">{task.text}</span>
        <div className="flex gap-2">
          <button className="text-blue-600 text-sm" onClick={() => setShowNotes(!showNotes)}>
            {showNotes ? 'Hide Notes' : 'Add/View Notes'}
          </button>
          <input type="checkbox" onChange={onComplete} title="Mark complete" />
        </div>
      </div>

      {showNotes && (
        <textarea
          className="w-full mt-2 border rounded px-2 py-1 text-sm"
          rows={3}
          placeholder="Write notes here..."
          value={task.notes}
          onChange={e => onUpdateNotes(task.id, e.target.value)}
        />
      )}
    </div>
  )
}

export default TaskItem