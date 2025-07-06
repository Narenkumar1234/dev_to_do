import React from 'react'
import { Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Code, 
  List,
  ListOrdered,
  Link,
  Strikethrough,
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

interface EditorToolbarProps {
  editor: Editor | null
  onLinkClick?: () => void
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, onLinkClick }) => {
  const { currentTheme } = useTheme()

  if (!editor) {
    return null
  }

  return (
    <div className="px-4 py-3">
      {/* Toolbar Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Primary Text Formatting */}
            <div className={`flex items-center ${currentTheme.colors.background.card} backdrop-blur-sm rounded-xl shadow-sm border ${currentTheme.colors.border.light} p-1`}>
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  editor.isActive('bold') 
                    ? `${currentTheme.colors.primary.dark} text-white shadow-sm` 
                    : `${currentTheme.colors.background.hover} ${currentTheme.colors.text.secondary} hover:${currentTheme.colors.text.primary}`
                }`}
                title="Bold (⌘B)"
              >
                <Bold size={14} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  editor.isActive('italic') 
                    ? `${currentTheme.colors.primary.dark} text-white shadow-sm` 
                    : `${currentTheme.colors.background.hover} ${currentTheme.colors.text.secondary} hover:${currentTheme.colors.text.primary}`
                }`}
                title="Italic (⌘I)"
              >
                <Italic size={14} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  editor.isActive('strike') 
                    ? `${currentTheme.colors.primary.dark} text-white shadow-sm` 
                    : `${currentTheme.colors.background.hover} ${currentTheme.colors.text.secondary} hover:${currentTheme.colors.text.primary}`
                }`}
                title="Strikethrough"
              >
                <Strikethrough size={14} />
              </button>
            </div>

            {/* Link & Media */}
            <div className={`flex items-center ${currentTheme.colors.background.card} backdrop-blur-sm rounded-xl shadow-sm border ${currentTheme.colors.border.light} p-1`}>
              <button
                onClick={onLinkClick}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  editor.isActive('link') 
                    ? `${currentTheme.colors.secondary.dark} text-white shadow-sm` 
                    : `${currentTheme.colors.background.hover} ${currentTheme.colors.text.secondary} hover:${currentTheme.colors.text.primary}`
                }`}
                title="Link (⌘K)"
              >
                <Link size={14} />
              </button>
            </div>
            
            {/* Heading Controls */}
            <div className={`flex items-center ${currentTheme.colors.background.card} backdrop-blur-sm rounded-xl shadow-sm border ${currentTheme.colors.border.light} p-1`}>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-2.5 py-2 rounded-lg transition-all duration-200 text-xs font-bold ${
                  editor.isActive('heading', { level: 1 }) 
                    ? `${currentTheme.colors.primary.dark} text-white shadow-sm` 
                    : `${currentTheme.colors.background.hover} ${currentTheme.colors.text.secondary} hover:${currentTheme.colors.text.primary}`
                }`}
                title="Heading 1"
              >
                H1
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2.5 py-2 rounded-lg transition-all duration-200 text-xs font-semibold ${
                  editor.isActive('heading', { level: 2 }) 
                    ? `${currentTheme.colors.primary.dark} text-white shadow-sm` 
                    : `${currentTheme.colors.background.hover} ${currentTheme.colors.text.secondary} hover:${currentTheme.colors.text.primary}`
                }`}
                title="Heading 2"
              >
                H2
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-2.5 py-2 rounded-lg transition-all duration-200 text-xs font-medium ${
                  editor.isActive('heading', { level: 3 }) 
                    ? `${currentTheme.colors.primary.dark} text-white shadow-sm` 
                    : `${currentTheme.colors.background.hover} ${currentTheme.colors.text.secondary} hover:${currentTheme.colors.text.primary}`
                }`}
                title="Heading 3"
              >
                H3
              </button>
            </div>
            
            {/* Lists & Blocks */}
            <div className={`flex items-center ${currentTheme.colors.background.card} backdrop-blur-sm rounded-xl shadow-sm border ${currentTheme.colors.border.light} p-1`}>
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  editor.isActive('bulletList') 
                    ? `${currentTheme.colors.secondary.dark} text-white shadow-sm` 
                    : `${currentTheme.colors.background.hover} ${currentTheme.colors.text.secondary} hover:${currentTheme.colors.text.primary}`
                }`}
                title="Bullet List"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  editor.isActive('orderedList') 
                    ? `${currentTheme.colors.secondary.dark} text-white shadow-sm` 
                    : `${currentTheme.colors.background.hover} ${currentTheme.colors.text.secondary} hover:${currentTheme.colors.text.primary}`
                }`}
                title="Ordered List"
              >
                <ListOrdered size={14} />
              </button>
            </div>
          </div>
    </div>
  )
}

export default EditorToolbar
