import React, { useState, useRef, useEffect } from "react";

interface LeftPanelProps {
  tabs: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
  onRenameTab: (oldName: string, newName: string) => void;
  onNewTab: (name: string) => void;
  onDeleteTab: (tab: string) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  tabs,
  activeTab,
  onTabClick,
  onRenameTab,
  onNewTab,
  onDeleteTab,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [creatingNewTab, setCreatingNewTab] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creatingNewTab && inputRef.current) {
      inputRef.current.focus();
    }
  }, [creatingNewTab]);

  const filteredTabs = tabs.filter((tab) =>
    tab.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNewTab = () => {
    setCreatingNewTab(true);
    setNewTabName("");
  };

  const commitNewTab = () => {
    const name = newTabName.trim();
    if (name !== "" && !tabs.includes(name)) {
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

  const handleRename = (tab: string) => {
    const name = prompt("Enter new tab name:", tab);
    if (name && name.trim() !== "" && name !== tab) {
      onRenameTab(tab, name.trim());
    }
  };

  return (
    <div className="w-1/5 bg-gray-100 p-4 border-r h-full flex flex-col">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tabs..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={handleCreateNewTab}
          className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          + New Note
        </button>
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
            key={tab}
            className={`p-2 rounded mb-1 cursor-pointer flex justify-between items-center ${
              tab === activeTab ? "bg-blue-100 font-semibold" : "hover:bg-gray-200"
            }`}
            onClick={() => onTabClick(tab)}
          >
            <span className="truncate">{tab}</span>
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
                  if (window.confirm(`Delete "${tab}"?`)) {
                    onDeleteTab(tab);
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
