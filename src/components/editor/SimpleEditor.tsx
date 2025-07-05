import React, { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { 
  Bold, 
  Italic, 
  Code, 
  Plus,
  Type,
  Hash,
  List,
  ListOrdered,
  Quote,
  Link,
  Strikethrough,
  Sparkles,
  Wand2,
  X
} from 'lucide-react'
import './simple-editor.css'

interface SimpleEditorProps {
  content: string
  onChange: (content: string) => void
  onFocus?: () => void
  placeholder?: string
}

const SimpleEditor: React.FC<SimpleEditorProps> = ({ 
  content, 
  onChange, 
  onFocus, 
  placeholder = 'Press \'/\' for commands or just start typing...' 
}) => {
  const [showBlockMenu, setShowBlockMenu] = useState(false)
  const [blockMenuPosition, setBlockMenuPosition] = useState({ x: 0, y: 0 })
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // Handle editor focus to ensure proper cursor positioning
  const handleEditorFocus = () => {
    if (onFocus) {
      onFocus()
    }
    // Ensure cursor is at the beginning when editor is empty
    if (editor && (!content || content === '<p></p>' || content.trim() === '')) {
      setTimeout(() => {
        editor.chain().focus().setTextSelection(0).run()
      }, 50)
    }
  }

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 1000)
    },
    onFocus: handleEditorFocus,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none px-8 py-6 min-h-[500px] pl-10',
      },
      handleKeyDown: (view, event) => {
        // Handle slash commands
        if (event.key === '/') {
          const { state } = view
          const { selection } = state
          const { $from } = selection
          
          // Check if we're at the start of a line or after whitespace
          const isAtStartOfLine = $from.parent.textContent.trim() === ''
          
          if (isAtStartOfLine) {
            // Allow the slash to be typed first
            setTimeout(() => {
              try {
                const coords = view.coordsAtPos(selection.anchor)
                setBlockMenuPosition({ 
                  x: coords.left, 
                  y: coords.bottom + 10 
                })
                setShowBlockMenu(true)
              } catch (error) {
                console.error('Error positioning block menu:', error)
              }
            }, 100)
          }
        }
        
        // Handle keyboard shortcuts
        if (event.metaKey || event.ctrlKey) {
          switch (event.key) {
            case 'b':
              event.preventDefault()
              editor?.chain().focus().toggleBold().run()
              return true
            case 'i':
              event.preventDefault()
              editor?.chain().focus().toggleItalic().run()
              return true
            case 'u':
              event.preventDefault()
              editor?.chain().focus().toggleUnderline?.().run()
              return true
            case 'e':
              event.preventDefault()
              editor?.chain().focus().toggleCode().run()
              return true
            case 'k':
              event.preventDefault()
              setShowLinkDialog(true)
              return true
          }
        }
        
        // Close block menu on escape
        if (event.key === 'Escape') {
          setShowBlockMenu(false)
        }
        
        return false
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const insertBlock = (type: string) => {
    if (!editor) return
    
    // Remove the slash if it exists
    const { state } = editor
    const { selection } = state
    const { $from } = selection
    const currentText = $from.parent.textContent
    
    if (currentText === '/' || currentText.endsWith('/')) {
      // Find and remove the slash
      const pos = $from.pos
      const start = Math.max(0, pos - currentText.length)
      const slashPos = currentText.lastIndexOf('/')
      if (slashPos !== -1) {
        const deleteFrom = start + slashPos
        const deleteTo = deleteFrom + 1
        editor.chain().focus().deleteRange({ from: deleteFrom, to: deleteTo }).run()
      }
    }
    
    // Insert the block type
    switch (type) {
      case 'paragraph':
        editor.chain().focus().setParagraph().run()
        break
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run()
        break
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run()
        break
      case 'heading3':
        editor.chain().focus().toggleHeading({ level: 3 }).run()
        break
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run()
        break
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run()
        break
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run()
        break
      case 'codeBlock':
        editor.chain().focus().toggleCodeBlock().run()
        break
    }
    setShowBlockMenu(false)
  }

  const insertLink = () => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkDialog(false)
    }
  }

  const showFloatingPlus = () => {
    if (!editor) return false
    const { state } = editor
    const { selection } = state
    const { $from } = selection
    // Show plus button when cursor is on an empty line
    return $from.parent.textContent === '' && selection.empty
  }

  const getCursorPosition = () => {
    if (!editor) return { x: 0, y: 0 }
    try {
      const { state } = editor
      const { selection } = state
      const coords = editor.view.coordsAtPos(selection.anchor)
      return { 
        x: coords.left, 
        y: coords.top 
      }
    } catch (error) {
      // Fallback to a default position if calculation fails
      return { x: 50, y: 50 }
    }
  }

  // Add placeholder when editor is empty
  useEffect(() => {
    if (editor) {
      const editorElement = editor.view.dom as HTMLElement
      if (editorElement) {
        const isEmpty = !content || content === '<p></p>' || content.trim() === ''
        if (isEmpty) {
          editorElement.setAttribute('data-placeholder', placeholder)
        } else {
          editorElement.removeAttribute('data-placeholder')
        }
      }
    }
  }, [editor, content, placeholder])

  // Ensure cursor is positioned correctly when editor is first focused
  useEffect(() => {
    if (editor && (!content || content === '<p></p>' || content.trim() === '')) {
      // Set cursor at the beginning of the document
      setTimeout(() => {
        editor.commands.focus('start')
        // Ensure cursor is at the very beginning of the first paragraph
        editor.chain().focus().setTextSelection(0).run()
      }, 100)
    }
  }, [editor, content])

  // Close block menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showBlockMenu) {
        setShowBlockMenu(false)
      }
    }

    if (showBlockMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showBlockMenu])

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
        <div className="text-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group/editor bg-white rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden">
      {/* Ultra Modern Toolbar */}
      <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 backdrop-blur-sm border-b border-gray-200/60">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Primary Text Formatting */}
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/60 p-1">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    editor.isActive('bold') 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 hover:scale-105'
                  }`}
                  title="Bold (⌘B)"
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    editor.isActive('italic') 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 hover:scale-105'
                  }`}
                  title="Italic (⌘I)"
                >
                  <Italic size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    editor.isActive('strike') 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 hover:scale-105'
                  }`}
                  title="Strikethrough"
                >
                  <Strikethrough size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    editor.isActive('code') 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 hover:scale-105'
                  }`}
                  title="Code (⌘E)"
                >
                  <Code size={16} />
                </button>
              </div>

              {/* Link & Media */}
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/60 p-1">
                <button
                  onClick={() => setShowLinkDialog(true)}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    editor.isActive('link') 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 hover:scale-105'
                  }`}
                  title="Link (⌘K)"
                >
                  <Link size={16} />
                </button>
              </div>
              
              {/* Heading Controls */}
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/60 p-1">
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 text-sm font-bold ${
                    editor.isActive('heading', { level: 1 }) 
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 hover:scale-105'
                  }`}
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 text-sm font-semibold ${
                    editor.isActive('heading', { level: 2 }) 
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 hover:scale-105'
                  }`}
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                    editor.isActive('heading', { level: 3 }) 
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 hover:scale-105'
                  }`}
                  title="Heading 3"
                >
                  H3
                </button>
              </div>
              
              {/* Lists & Blocks */}
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/60 p-1">
                <button
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    editor.isActive('bulletList') 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 hover:scale-105'
                  }`}
                  title="Bullet List"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    editor.isActive('orderedList') 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 hover:scale-105'
                  }`}
                  title="Ordered List"
                >
                  <ListOrdered size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    editor.isActive('blockquote') 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 hover:scale-105'
                  }`}
                  title="Quote"
                >
                  <Quote size={16} />
                </button>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className={`flex items-center gap-1.5 transition-all duration-300 ${isTyping ? 'text-blue-600' : ''}`}>
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isTyping ? 'bg-blue-500 animate-pulse' : 'bg-emerald-400'}`}></div>
                  <span className="font-medium">{isTyping ? 'Typing...' : 'Saved'}</span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                <span>Press</span>
                <kbd className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono shadow-sm">/</kbd>
                <span>for commands</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Editor Container */}
      <div className="relative bg-gradient-to-br from-white to-gray-50/30 min-h-[600px]">
        {/* Floating Plus Button */}
        <div 
          className="absolute left-2 top-20 z-20 group/plus" 
          style={{ 
            pointerEvents: 'auto'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              try {
                // Use a fixed position relative to the plus button instead of cursor position
                const rect = e.currentTarget.getBoundingClientRect()
                setBlockMenuPosition({ 
                  x: rect.left + rect.width + 10, 
                  y: rect.top 
                })
                setShowBlockMenu(true)
              } catch (error) {
                console.error('Error in plus button:', error)
                // Fallback positioning
                setBlockMenuPosition({ x: 100, y: 100 })
                setShowBlockMenu(true)
              }
            }}
            className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 opacity-80 hover:opacity-100"
            title="Add block"
          >
            <Plus size={14} />
          </button>
        </div>
        
        {/* Editor Content */}
        <div className="relative">
          <EditorContent editor={editor} />
          
          {/* Enhanced Empty State */}
          {(!content || content === '<p></p>' || content.trim() === '') && (
            <div className="absolute top-6 left-12 pointer-events-none">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Wand2 size={20} className="text-gray-400" />
                  <div className="text-gray-400 text-xl font-light">
                    {placeholder}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-mono shadow-sm">Tab</kbd>
                    <span>for AI assistance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-mono shadow-sm">⌘ K</kbd>
                    <span>for quick actions</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <Sparkles size={14} />
                  <span>Start with a heading, list, or just begin typing</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>
      </div>

      {/* Ultra Modern Block Menu */}
      {showBlockMenu && createPortal(
        <div 
          className="fixed bg-white/95 backdrop-blur-lg border border-gray-200/80 rounded-2xl shadow-2xl p-4 w-96 z-[100] block-menu-portal"
          style={{
            left: `${Math.max(10, blockMenuPosition.x)}px`,
            top: `${Math.max(10, blockMenuPosition.y)}px`,
            maxWidth: '90vw',
            maxHeight: '80vh'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Plus size={16} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Add a block</h3>
              <button
                onClick={() => setShowBlockMenu(false)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-500">Choose what you'd like to add to your document</p>
          </div>
          
          <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
            {[
              { type: 'paragraph', icon: Type, title: 'Text', desc: 'Just start writing with plain text', color: 'from-gray-100 to-gray-200', hoverColor: 'from-gray-200 to-gray-300' },
              { type: 'heading1', icon: Hash, title: 'Heading 1', desc: 'Big section heading', color: 'from-indigo-100 to-blue-100', hoverColor: 'from-indigo-200 to-blue-200' },
              { type: 'heading2', icon: Hash, title: 'Heading 2', desc: 'Medium section heading', color: 'from-indigo-100 to-blue-100', hoverColor: 'from-indigo-200 to-blue-200' },
              { type: 'heading3', icon: Hash, title: 'Heading 3', desc: 'Small section heading', color: 'from-indigo-100 to-blue-100', hoverColor: 'from-indigo-200 to-blue-200' },
              { type: 'bulletList', icon: List, title: 'Bullet List', desc: 'Create a simple bulleted list', color: 'from-orange-100 to-red-100', hoverColor: 'from-orange-200 to-red-200' },
              { type: 'orderedList', icon: ListOrdered, title: 'Numbered List', desc: 'Create a list with numbering', color: 'from-orange-100 to-red-100', hoverColor: 'from-orange-200 to-red-200' },
              { type: 'blockquote', icon: Quote, title: 'Quote', desc: 'Capture a quote', color: 'from-yellow-100 to-orange-100', hoverColor: 'from-yellow-200 to-orange-200' },
              { type: 'codeBlock', icon: Code, title: 'Code Block', desc: 'Capture a code snippet', color: 'from-purple-100 to-pink-100', hoverColor: 'from-purple-200 to-pink-200' },
            ].map((block) => (
              <button
                key={block.type}
                onClick={() => insertBlock(block.type)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl text-sm text-left transition-all duration-300 group hover:shadow-md"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${block.color} group-hover:${block.hoverColor} rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm`}>
                  <block.icon size={20} className="text-gray-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{block.title}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{block.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Modern Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 border border-gray-200/80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Link size={18} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Add Link</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={insertLink}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  Add Link
                </button>
                <button
                  onClick={() => setShowLinkDialog(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleEditor
