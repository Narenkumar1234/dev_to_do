import React, { useEffect, useRef, useState } from "react"
import { X, FileText, Calendar, Clock, User, Keyboard } from "lucide-react"
import { Task } from "../types"
import SimpleEditor from "./editor/SimpleEditor"
import KeyboardShortcuts from "./editor/KeyboardShortcuts"

interface RightPanelProps {
  selectedTask: Task | null
  onClose: () => void
  onSaveNotes: (taskId: number, notes: string) => void
  visible: boolean
}

const RightPanel: React.FC<RightPanelProps> = ({ 
  selectedTask, 
  onClose, 
  onSaveNotes, 
  visible 
}) => {
  const [notes, setNotes] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      
      // Check if the user clicked on a task item (prevent closing when switching tasks)
      if (target instanceof HTMLElement && target.closest('[id^="task"]')) {
        return // Don't close if clicking on a task item
      }
      
      // Check if the click is inside the right panel
      if (panelRef.current && !panelRef.current.contains(target)) {
        // Check if the click is on the block menu (which is portaled to document.body)
        const blockMenu = document.querySelector('.block-menu-portal')
        if (blockMenu && blockMenu.contains(target)) {
          return // Don't close if clicking on block menu
        }
        
        // Check if the click is on any other editor-related UI elements
        const editorElements = document.querySelectorAll('.ProseMirror, [data-tippy-root], .tippy-box')
        for (const element of editorElements) {
          if (element.contains(target)) {
            return // Don't close if clicking on editor elements
          }
        }
        
        handleClose()
      }
    }
    
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [visible, selectedTask, notes])

  useEffect(() => {
    if (selectedTask && selectedTask.id !== currentTaskId) {
      // Save current notes before switching if we have a currentTaskId
      if (currentTaskId !== null) {
        onSaveNotes(currentTaskId, notes)
      }
      
      // Set new task
      setCurrentTaskId(selectedTask.id)
      setTaskTitle(selectedTask.text)
      
      // Initialize with existing notes or empty content
      if (!selectedTask.notes || selectedTask.notes.trim() === "") {
        setNotes("")
      } else {
        setNotes(selectedTask.notes)
      }
      
      // Reset editing state when switching tasks
      setIsEditing(false)
    }
  }, [selectedTask?.id, currentTaskId, notes, onSaveNotes])

  const handleClose = () => {
    if (currentTaskId) {
      onSaveNotes(currentTaskId, notes)
    }
    setCurrentTaskId(null)
    onClose()
    setIsEditing(false)
  }

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes)
    // Only auto-save if we have a valid currentTaskId and it matches the selected task
    if (currentTaskId && selectedTask && currentTaskId === selectedTask.id) {
      onSaveNotes(currentTaskId, newNotes)
    }
  }

  const handleEditorFocus = () => {
    setIsEditing(true)
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!visible || !selectedTask) {
    return null
  }

  return (
    <div
      ref={panelRef}
      className={`
        fixed top-0 right-0 h-full w-2/5 bg-white shadow-2xl overflow-hidden z-50
        transform transition-all duration-300 ease-in-out
        ${visible ? "translate-x-0" : "translate-x-full"}
        border-l border-gray-200
      `}
      style={{ 
        willChange: "transform",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 truncate max-w-64">
                {taskTitle}
              </h2>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  {getCurrentDate()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {getCurrentTime()}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Keyboard shortcuts"
            >
              <Keyboard size={18} className="text-gray-500" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close notes"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-full overflow-y-auto pb-20">
        <div className="px-6 py-4">
          {/* Status indicators */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${selectedTask.completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm text-gray-600">
                {selectedTask.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2">
              <User size={12} className="text-gray-400" />
              <span className="text-sm text-gray-600">You</span>
            </div>
          </div>

          {/* Rich text editor */}
          <div className="bg-white rounded-lg">
            <SimpleEditor
              key={selectedTask.id} // Force re-mount when task changes
              content={notes}
              onChange={handleNotesChange}
              onFocus={handleEditorFocus}
              placeholder="Start writing your notes..."
            />
          </div>
        </div>
      </div>

      {/* Floating action hint */}
      {!isEditing && (
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Click anywhere in the editor to start writing. Use <kbd className="bg-blue-100 px-1 rounded">Cmd+B</kbd> for bold, <kbd className="bg-blue-100 px-1 rounded">Cmd+I</kbd> for italic, and more!
            </p>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcuts 
        show={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    </div>
  )
}

export default RightPanel