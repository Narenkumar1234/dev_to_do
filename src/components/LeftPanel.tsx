import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, FolderOpen, Calendar } from "lucide-react";
import { Tab } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import ThemeSwitcher from "./ThemeSwitcher";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface LeftPanelProps {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onRenameTab: (tabId: string, newName: string) => void;
  onNewTab: (name: string) => void;
  onDeleteTab: (tabId: string) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onRenameTab,
  onNewTab,
  onDeleteTab,
}) => {
  const { currentTheme } = useTheme()
  const [searchTerm, setSearchTerm] = useState("");
  const [creatingNewTab, setCreatingNewTab] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabName, setEditingTabName] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tabToDelete, setTabToDelete] = useState<Tab | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creatingNewTab && inputRef.current) {
      inputRef.current.focus();
    }
  }, [creatingNewTab]);

  useEffect(() => {
    if (editingTabId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTabId]);

  const filteredTabs = tabs.filter((tab) =>
    tab.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNewTab = () => {
    setCreatingNewTab(true);
    setNewTabName("");
  };

  const commitNewTab = () => {
    const name = newTabName.trim();
    if (name !== "" && !tabs.some(tab => tab.name === name)) {
      onNewTab(name);
      setCreatingNewTab(false);
    } else {
      cancelNewTab(); // avoid duplicates or blank
    }
  };

  const cancelNewTab = () => {
    setCreatingNewTab(false);
    setNewTabName("");
  };

  const handleRename = (tab: Tab) => {
    setEditingTabId(tab.id);
    setEditingTabName(tab.name);
  };

  const commitRename = () => {
    if (editingTabId) {
      const name = editingTabName.trim();
      if (name !== "" && name !== tabs.find(t => t.id === editingTabId)?.name) {
        onRenameTab(editingTabId, name);
      }
      setEditingTabId(null);
      setEditingTabName("");
    }
  };

  const cancelRename = () => {
    setEditingTabId(null);
    setEditingTabName("");
  };

  return (
    <div className={`w-1/5 ${currentTheme.colors.background.panel} ${currentTheme.colors.border.light} border-r h-full flex flex-col`}>
      {/* Header */}
      <div className={`p-6 pb-4 border-b ${currentTheme.colors.border.light}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 bg-gradient-to-br ${currentTheme.colors.primary.from} ${currentTheme.colors.primary.to} rounded-xl flex items-center justify-center shadow-lg`}>
            <FolderOpen size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className={`text-xl font-bold ${currentTheme.colors.text.primary}`}>Notes</h1>
              <ThemeSwitcher />
            </div>
            <p className={`text-sm ${currentTheme.colors.text.muted}`}>{tabs.length} workspace{tabs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        {/* Search and New Note button */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${currentTheme.colors.text.muted}`} />
            <input
              type="text"
              placeholder="Search workspaces..."
              className={`w-full pl-4 pr-4 py-2.5 border ${currentTheme.colors.border.light} rounded-xl ${currentTheme.colors.background.card} backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-200`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleCreateNewTab}
            className={`bg-gradient-to-r ${currentTheme.colors.primary.from} ${currentTheme.colors.primary.to} text-white px-4 py-2.5 rounded-xl hover:opacity-90 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2`}
            title="New Workspace"
          >
            <Plus size={16} />
            New
          </button>
        </div>
      </div>

      {/* Workspaces List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {creatingNewTab && (
          <div className={`p-4 rounded-xl bg-gradient-to-r ${currentTheme.colors.secondary.light} border ${currentTheme.colors.border.light} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className={currentTheme.colors.secondary.text} />
              <span className={`text-sm font-medium ${currentTheme.colors.text.primary}`}>New Workspace</span>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              onBlur={commitNewTab}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitNewTab();
                if (e.key === "Escape") cancelNewTab();
              }}
              className={`w-full p-2.5 rounded-lg border ${currentTheme.colors.border.light} ${currentTheme.colors.background.card} focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 text-sm`}
              placeholder="Enter workspace name..."
            />
          </div>
        )}

        {filteredTabs.map((tab) => (
          <div
            key={tab.id}
            className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 ${
              tab.id === activeTabId 
                ? `bg-gradient-to-r ${currentTheme.colors.primary.light} border-2 ${currentTheme.colors.border.medium} shadow-md` 
                : `${currentTheme.colors.background.card} ${currentTheme.colors.background.hover} hover:shadow-md border ${currentTheme.colors.border.light} hover:${currentTheme.colors.border.medium}`
            }`}
            onClick={() => editingTabId !== tab.id && onTabClick(tab.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  tab.id === activeTabId 
                    ? `bg-gradient-to-r ${currentTheme.colors.primary.from} ${currentTheme.colors.primary.to} text-white shadow-lg` 
                    : `bg-gray-100 ${currentTheme.colors.text.muted} group-hover:bg-gray-200`
                }`}>
                  <Calendar size={14} />
                </div>
                
                {editingTabId === tab.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingTabName}
                    onChange={(e) => setEditingTabName(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename();
                      if (e.key === "Escape") cancelRename();
                    }}
                    className={`flex-1 p-2 rounded-lg border ${currentTheme.colors.border.light} ${currentTheme.colors.background.card} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm`}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="flex-1 min-w-0">
                    <span className={`block truncate text-sm font-medium ${
                      tab.id === activeTabId ? currentTheme.colors.primary.text : currentTheme.colors.text.primary
                    }`}>
                      {tab.name}
                    </span>
                    <span className={`text-xs ${currentTheme.colors.text.muted} block`}>
                      {tab.id === activeTabId ? "Active workspace" : "Click to open"}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  className={`p-1.5 rounded-lg ${currentTheme.colors.background.hover} ${currentTheme.colors.text.muted} hover:${currentTheme.colors.primary.text} transition-colors duration-200`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename(tab);
                  }}
                  title="Rename workspace"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  className={`p-1.5 rounded-lg hover:bg-red-100 ${currentTheme.colors.text.muted} hover:text-red-600 transition-colors duration-200`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTabToDelete(tab);
                    setDeleteModalOpen(true);
                  }}
                  title="Delete workspace"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredTabs.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <Search size={48} className={`${currentTheme.colors.text.muted} mx-auto mb-4`} />
            <p className={`${currentTheme.colors.text.muted} text-sm`}>No workspaces found</p>
            <p className={`${currentTheme.colors.text.muted} text-xs mt-1`}>Try adjusting your search terms</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTabToDelete(null);
        }}
        onConfirm={() => {
          if (tabToDelete) {
            onDeleteTab(tabToDelete.id);
          }
        }}
        title="Delete Workspace"
        message="Are you sure you want to delete this workspace? All tasks and notes within it will be permanently removed."
        itemName={tabToDelete?.name || ""}
        itemType="workspace"
      />
    </div>
  );
};

export default LeftPanel;
