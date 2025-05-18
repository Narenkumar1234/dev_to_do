import React, { useState } from "react";

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
  const handleNewTab = () => {
    const name = prompt("Enter tab name:");
    if (name && name.trim() !== "") {
      onNewTab(name.trim());
    }
  };

  const handleRename = (tab: string) => {
    const name = prompt("Enter new tab name:", tab);
    if (name && name.trim() !== "" && name !== tab) {
      onRenameTab(tab, name.trim());
    }
  };

  const filteredTabs = tabs.filter((tab) =>
    tab.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          onClick={handleNewTab}
          className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          + New Note
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
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