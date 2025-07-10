// Smart Save Strategy - Track what actually changed

export interface SaveChanges {
  tasksChanged: Set<string>; // tab IDs with task changes
  tabsChanged: Set<string>; // tab IDs with tab info changes
  newTabs: Set<string>; // newly created tabs
}

export class SmartSaveTracker {
  private changes: SaveChanges = {
    tasksChanged: new Set(),
    tabsChanged: new Set(), 
    newTabs: new Set()
  };

  markTasksChanged(tabId: string) {
    this.changes.tasksChanged.add(tabId);
  }

  markTabChanged(tabId: string) {
    this.changes.tabsChanged.add(tabId);
  }

  markNewTab(tabId: string) {
    this.changes.newTabs.add(tabId);
    this.changes.tabsChanged.add(tabId);
  }

  getChanges(): SaveChanges {
    return this.changes;
  }

  clearChanges() {
    this.changes = {
      tasksChanged: new Set(),
      tabsChanged: new Set(),
      newTabs: new Set()
    };
  }

  hasChanges(): boolean {
    return this.changes.tasksChanged.size > 0 || 
           this.changes.tabsChanged.size > 0 || 
           this.changes.newTabs.size > 0;
  }

  getChangesSummary(): string {
    const taskChanges = this.changes.tasksChanged.size;
    const tabChanges = this.changes.tabsChanged.size;
    const newTabs = this.changes.newTabs.size;
    
    return `${taskChanges} task collections, ${tabChanges} tabs, ${newTabs} new tabs`;
  }
}

export const saveTracker = new SmartSaveTracker();
