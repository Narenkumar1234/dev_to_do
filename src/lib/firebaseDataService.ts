import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Task, TaskMap, Tab, TabsMap } from '../types';

export class FirebaseDataService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Collections
  private get tasksCollection() {
    return collection(db, 'users', this.userId, 'tasks');
  }

  private get tabsCollection() {
    return collection(db, 'users', this.userId, 'tabs');
  }

  // Tasks
  async saveTasks(tabId: string, tasks: Task[]) {
    try {
      const taskDoc = doc(this.tasksCollection, tabId);
      await setDoc(taskDoc, {
        tabId,
        tasks,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  }

  async getTasks(tabId: string): Promise<Task[]> {
    try {
      const taskDoc = doc(this.tasksCollection, tabId);
      const docSnap = await getDoc(taskDoc);
      
      if (docSnap.exists()) {
        return docSnap.data().tasks || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }

  async getAllTasks(): Promise<TaskMap> {
    try {
      const querySnapshot = await getDocs(this.tasksCollection);
      const taskMap: TaskMap = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        taskMap[data.tabId] = data.tasks || [];
      });
      
      return taskMap;
    } catch (error) {
      console.error('Error getting all tasks:', error);
      throw error;
    }
  }

  async deleteTasksForTab(tabId: string) {
    try {
      const taskDoc = doc(this.tasksCollection, tabId);
      await deleteDoc(taskDoc);
    } catch (error) {
      console.error('Error deleting tasks:', error);
      throw error;
    }
  }

  // Tabs
  async saveTab(tab: Tab) {
    try {
      const tabDoc = doc(this.tabsCollection, tab.id);
      await setDoc(tabDoc, {
        ...tab,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error saving tab:', error);
      throw error;
    }
  }

  async getAllTabs(): Promise<TabsMap> {
    try {
      const querySnapshot = await getDocs(
        query(this.tabsCollection, orderBy('createdAt', 'asc'))
      );
      const tabsMap: TabsMap = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tabsMap[data.id] = {
          id: data.id,
          name: data.name,
          createdAt: data.createdAt
        };
      });
      
      return tabsMap;
    } catch (error) {
      console.error('Error getting tabs:', error);
      throw error;
    }
  }

  async deleteTab(tabId: string) {
    try {
      // Delete tab document
      const tabDoc = doc(this.tabsCollection, tabId);
      await deleteDoc(tabDoc);
      
      // Delete associated tasks
      await this.deleteTasksForTab(tabId);
    } catch (error) {
      console.error('Error deleting tab:', error);
      throw error;
    }
  }

  // User settings
  async saveUserSettings(settings: any) {
    try {
      const userDoc = doc(db, 'users', this.userId);
      await setDoc(userDoc, {
        ...settings,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  }

  async getUserSettings(): Promise<any> {
    try {
      const userDoc = doc(db, 'users', this.userId);
      const docSnap = await getDoc(userDoc);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return {};
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  }

  // Real-time listeners
  subscribeToTasks(tabId: string, callback: (tasks: Task[]) => void) {
    const taskDoc = doc(this.tasksCollection, tabId);
    return onSnapshot(taskDoc, (doc) => {
      if (doc.exists()) {
        callback(doc.data().tasks || []);
      } else {
        callback([]);
      }
    });
  }

  subscribeToTabs(callback: (tabs: TabsMap) => void) {
    const q = query(this.tabsCollection, orderBy('createdAt', 'asc'));
    return onSnapshot(q, (querySnapshot) => {
      const tabsMap: TabsMap = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tabsMap[data.id] = {
          id: data.id,
          name: data.name,
          createdAt: data.createdAt
        };
      });
      callback(tabsMap);
    });
  }

  // Sync local data to cloud
  async syncLocalToCloud(localTasks: TaskMap, localTabs: TabsMap) {
    try {
      // Sync tabs
      for (const tab of Object.values(localTabs)) {
        await this.saveTab(tab);
      }

      // Sync tasks
      for (const [tabId, tasks] of Object.entries(localTasks)) {
        await this.saveTasks(tabId, tasks);
      }
    } catch (error) {
      console.error('Error syncing local data to cloud:', error);
      throw error;
    }
  }

  // Batch operations - MUCH MORE EFFICIENT
  async batchSaveAll(tabId: string, tasks: Task[], allTabs: TabsMap) {
    try {
      const batch = writeBatch(db);
      
      // Save current tab tasks
      if (tasks.length > 0) {
        const taskDoc = doc(this.tasksCollection, tabId);
        batch.set(taskDoc, {
          tabId,
          tasks,
          updatedAt: Timestamp.now()
        });
      }
      
      // Save all tabs in one batch
      const tabsArray = Object.values(allTabs);
      for (const tab of tabsArray) {
        const tabDoc = doc(this.tabsCollection, tab.id);
        batch.set(tabDoc, {
          ...tab,
          updatedAt: Timestamp.now()
        });
      }
      
      // Execute all operations in a single batch (1 API call instead of 13!)
      await batch.commit();
      
      console.log(`Batch saved 1 task collection + ${tabsArray.length} tabs in 1 API call`);
    } catch (error) {
      console.error('Error in batch save:', error);
      throw error;
    }
  }

  // Efficient save - only save what changed
  async saveCurrentTabOnly(tabId: string, tasks: Task[]) {
    try {
      const taskDoc = doc(this.tasksCollection, tabId);
      await setDoc(taskDoc, {
        tabId,
        tasks,
        updatedAt: Timestamp.now()
      });
      console.log(`Saved only current tab: ${tabId}`);
    } catch (error) {
      console.error('Error saving current tab:', error);
      throw error;
    }
  }

  // Smart save - only save what actually changed
  async smartSave(
    tasksChanged: Set<string>,
    tabsChanged: Set<string>, 
    allTasks: TaskMap,
    allTabs: TabsMap
  ) {
    try {
      const batch = writeBatch(db);
      let operationCount = 0;

      // Save only changed tasks
      for (const tabId of tasksChanged) {
        if (allTasks[tabId]) {
          const taskDoc = doc(this.tasksCollection, tabId);
          batch.set(taskDoc, {
            tabId,
            tasks: allTasks[tabId],
            updatedAt: Timestamp.now()
          });
          operationCount++;
        }
      }

      // Save only changed tabs
      for (const tabId of tabsChanged) {
        if (allTabs[tabId]) {
          const tabDoc = doc(this.tabsCollection, tabId);
          batch.set(tabDoc, {
            ...allTabs[tabId],
            updatedAt: Timestamp.now()
          });
          operationCount++;
        }
      }

      if (operationCount > 0) {
        await batch.commit();
        console.log(`Smart save: ${operationCount} operations in 1 batch`);
      } else {
        console.log('Smart save: No changes detected');
      }
    } catch (error) {
      console.error('Error in smart save:', error);
      throw error;
    }
  }
}
