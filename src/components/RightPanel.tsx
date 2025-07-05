import ReactQuill from "react-quill"
import { useEffect, useRef, useState } from "react"
import { Task } from "../types"

interface RightPanelProps {
  selectedTask: Task | null
  onClose: () => void
  onSaveNotes: (taskId: number, notes: string) => any
  visible: boolean // <-- Add this prop
}

const RightPanel = ({ selectedTask, onClose, onSaveNotes, visible }: RightPanelProps) => {
  const [notes, setNotes] = useState("")
  const panelRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<ReactQuill>(null) 

   useEffect(() => {
    if (!visible) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
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
    if (visible && quillRef.current) {
      // Focus the editor when panel opens
      quillRef.current.focus()
      
      // If this is a new task with just the heading, position cursor at the end of heading
      if (selectedTask && (!selectedTask.notes || selectedTask.notes.trim() === "")) {
        setTimeout(() => {
          const quill = quillRef.current?.getEditor()
          if (quill) {
            // Position cursor at the end of the heading
            const headingLength = selectedTask.text.length
            quill.setSelection(headingLength, 0)
          }
        }, 100)
      }
    }
  }, [visible, selectedTask])

  useEffect(() => {
    if (selectedTask) {
      // If notes are empty, pre-fill with task name as heading
      if (!selectedTask.notes || selectedTask.notes.trim() === "") {
        setNotes(`<h1>${selectedTask.text}</h1><p><br></p>`)
      } else {
        setNotes(selectedTask.notes)
      }
    }
  }, [selectedTask])

  const handleClose = () => {
    if (selectedTask) {
      onSaveNotes(selectedTask.id, notes)
    }
    onClose();
  }
  // Always render the panel, but slide it in/out
  return (
    <div
      ref={panelRef}
      className={`
        fixed top-0 right-0 h-full w-2/5 bg-white shadow-md overflow-y-auto z-50
        transform transition-transform duration-300
        ${visible ? "translate-x-0" : "translate-x-full"}
      `}
      style={{ willChange: "transform" }}
    >
      {selectedTask && (
        <>
          <div className="flex justify-between items-center mb-4 p-4">
            <h2 className="text-lg font-semibold">Notes for: {selectedTask.text}</h2>
            <button onClick={
              handleClose
            } className="text-gray-500 hover:text-red-500 text-xl">
              ✖
            </button>
          </div>
          <div className="px-4">
            <ReactQuill 
            ref={quillRef}
            theme="snow" 
            value={notes} 
            onChange={setNotes} 
            className="min-h-[300px] h-[400px] mb-4"/>
           
          </div>
        </>
      )}
    </div>
  )
}

export default RightPanel