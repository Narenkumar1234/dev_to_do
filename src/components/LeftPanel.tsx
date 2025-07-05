import React, { useState, useRef, useEffect } from "react";
import { Tab } from "../types";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [creatingNewTab, setCreatingNewTab] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabName, setEditingTabName] = useState("");
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
    <div className="w-1/5 bg-gray-100 p-4 border-r h-full flex flex-col">
      <div className="mb-4">
        {/* Search and New Note button in the same row */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Search tabs..."
            className="flex-1 p-2 border rounded text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={handleCreateNewTab}
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm whitespace-nowrap"
            title="New Note"
          >
            + New
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {creatingNewTab && (
          <div className="p-2 rounded mb-1 bg-yellow-100 flex items-center">
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
              className="w-full p-1 rounded border focus:outline-none"
              placeholder="New note name..."
            />
          </div>
        )}

        {filteredTabs.map((tab) => (
          <div
            key={tab.id}
            className={`p-2 rounded mb-1 cursor-pointer flex justify-between items-center ${
              tab.id === activeTabId ? "bg-blue-100 font-semibold" : "hover:bg-gray-200"
            }`}
            onClick={() => editingTabId !== tab.id && onTabClick(tab.id)}
          >
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
                className="flex-1 p-1 rounded border focus:outline-none mr-2"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate">{tab.name}</span>
            )}
            <div>
              <button
                className="text-sm text-blue-500 hover:underline ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRename(tab);
                }}
              >
                ✎
              </button>
              <button
                className="text-sm text-red-500 hover:underline ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete "${tab.name}"?`)) {
                    onDeleteTab(tab.id);
                  }
                }}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftPanel;
