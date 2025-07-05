import React, { useRef, useEffect, useState } from 'react'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Typography from '@tiptap/extension-typography'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Blockquote from '@tiptap/extension-blockquote'
import OrderedList from '@tiptap/extension-ordered-list'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { createLowlight } from 'lowlight'
import './editor.css'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Plus,
  Type,
  Image,
  FileText,
  Palette
} from 'lucide-react'

// Import common languages for syntax highlighting
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'

// Create lowlight instance and register languages
const lowlight = createLowlight()
lowlight.register('javascript', javascript)
lowlight.register('typescript', typescript)
lowlight.register('python', python)
lowlight.register('css', css)
lowlight.register('html', html)
lowlight.register('json', json)
lowlight.register('bash', bash)
lowlight.register('sql', sql)
lowlight.register('java', java)
lowlight.register('cpp', cpp)

interface NotionEditorProps {
  content: string
  onChange: (content: string) => void
  onFocus?: () => void
  placeholder?: string
}

const NotionEditor: React.FC<NotionEditorProps> = ({ 
  content, 
  onChange, 
  onFocus, 
  placeholder = 'Start writing...' 
}) => {
  const [showFloatingMenu, setShowFloatingMenu] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        paragraph: false,
        codeBlock: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        strike: false,
      }),
      Typography,
      Underline,
      Strike,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
        },
      }),
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: 'font-bold',
        },
      }),
      Paragraph.configure({
        HTMLAttributes: {
          class: 'mb-2',
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'ml-4 list-disc',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'ml-4 list-decimal',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'mb-1',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'ml-4',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2 mb-2',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-md bg-gray-100 p-4 font-mono text-sm border',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        style: 'font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
        'data-placeholder': placeholder,
      },
      handleKeyDown: (view, event) => {
        // Handle slash commands
        if (event.key === '/') {
          const { state } = view
          const { selection } = state
          const { $from } = selection
          
          // Check if we're at the beginning of a line
          if ($from.parent.textContent === '') {
            setTimeout(() => {
              setShowFloatingMenu(true)
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
              editor?.chain().focus().toggleUnderline().run()
              return true
            case 'k':
              event.preventDefault()
              setShowLinkInput(true)
              return true
            case 'e':
              event.preventDefault()
              editor?.chain().focus().toggleCode().run()
              return true
          }
        }
        
        // Handle shortcuts with numbers for headings
        if ((event.metaKey || event.ctrlKey) && event.altKey) {
          switch (event.key) {
            case '1':
              event.preventDefault()
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
              return true
            case '2':
              event.preventDefault()
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
              return true
            case '3':
              event.preventDefault()
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
              return true
          }
        }
        
        return false
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onFocus: onFocus,
    parseOptions: {
      preserveWhitespace: 'full',
    },
  })

  const setLink = () => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  const toggleLink = () => {
    if (editor?.isActive('link')) {
      editor.chain().focus().unsetLink().run()
    } else {
      setShowLinkInput(true)
    }
  }

  const insertBlock = (type: string) => {
    if (!editor) return
    
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
      case 'taskList':
        editor.chain().focus().toggleTaskList().run()
        break
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run()
        break
      case 'codeBlock':
        editor.chain().focus().toggleCodeBlock().run()
        break
    }
    setShowFloatingMenu(false)
  }

  if (!editor) {
    return null
  }

  return (
    <div className="relative">
      {/* Bubble Menu - appears when text is selected */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100 }}
        className="tiptap-menu"
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${editor.isActive('bold') ? 'is-active' : ''}`}
          title="Bold (Cmd+B)"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${editor.isActive('italic') ? 'is-active' : ''}`}
          title="Italic (Cmd+I)"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${editor.isActive('underline') ? 'is-active' : ''}`}
          title="Underline (Cmd+U)"
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`${editor.isActive('strike') ? 'is-active' : ''}`}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`${editor.isActive('code') ? 'is-active' : ''}`}
          title="Inline Code"
        >
          <Code size={16} />
        </button>
        <div className="relative">
          <button
            onClick={toggleLink}
            className={`${editor.isActive('link') ? 'is-active' : ''}`}
            title="Link"
          >
            <LinkIcon size={16} />
          </button>
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center gap-2 w-64 z-50">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Enter URL"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    setLink()
                  }
                  if (e.key === 'Escape') {
                    setShowLinkInput(false)
                    setLinkUrl('')
                  }
                }}
              />
              <button
                onClick={setLink}
                className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
              >
                Set
              </button>
            </div>
          )}
        </div>
      </BubbleMenu>

      {/* Floating Menu - appears on empty lines */}
      <FloatingMenu
        editor={editor}
        tippyOptions={{ duration: 100 }}
        className="tiptap-floating-menu"
      >
        <button
          onClick={() => setShowFloatingMenu(!showFloatingMenu)}
          className="flex items-center gap-2 font-medium"
        >
          <Plus size={16} />
          <span className="text-sm text-gray-600">Add block</span>
        </button>
        {showFloatingMenu && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48 z-50">
            <div className="grid grid-cols-1 gap-1">
              <button
                onClick={() => insertBlock('paragraph')}
                className="tiptap-floating-menu button flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm"
              >
                <Type size={16} />
                Paragraph
              </button>
              <button
                onClick={() => insertBlock('heading1')}
                className="tiptap-floating-menu button flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm"
              >
                <Heading1 size={16} />
                Heading 1
              </button>
              <button
                onClick={() => insertBlock('heading2')}
                className="tiptap-floating-menu button flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm"
              >
                <Heading2 size={16} />
                Heading 2
              </button>
              <button
                onClick={() => insertBlock('heading3')}
                className="tiptap-floating-menu button flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm"
              >
                <Heading3 size={16} />
                Heading 3
              </button>
              <button
                onClick={() => insertBlock('bulletList')}
                className="tiptap-floating-menu button flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm"
              >
                <List size={16} />
                Bulleted List
              </button>
              <button
                onClick={() => insertBlock('orderedList')}
                className="tiptap-floating-menu button flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm"
              >
                <ListOrdered size={16} />
                Numbered List
              </button>
              <button
                onClick={() => insertBlock('taskList')}
                className="tiptap-floating-menu button flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm"
              >
                <CheckSquare size={16} />
                To-do List
              </button>
              <button
                onClick={() => insertBlock('blockquote')}
                className="tiptap-floating-menu button flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm"
              >
                <Quote size={16} />
                Quote
              </button>
              <button
                onClick={() => insertBlock('codeBlock')}
                className="tiptap-floating-menu button flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm"
              >
                <Code size={16} />
                Code Block
              </button>
            </div>
          </div>
        )}
      </FloatingMenu>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}

export default NotionEditor
