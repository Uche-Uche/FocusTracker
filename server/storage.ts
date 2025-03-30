import { 
  tasks, 
  subtasks, 
  users, 
  type Task, 
  type InsertTask,
  type Subtask,
  type InsertSubtask,
  type User,
  type InsertUser,
  type TaskWithSubtasks
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getTasks(): Promise<TaskWithSubtasks[]>;
  getTasksByFrequency(frequency: string): Promise<TaskWithSubtasks[]>;
  getTask(id: number): Promise<TaskWithSubtasks | undefined>;
  createTask(task: InsertTask, subtasks: string[]): Promise<TaskWithSubtasks>;
  updateTask(id: number, task: Partial<Task>): Promise<TaskWithSubtasks | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Subtask methods
  getSubtasks(taskId: number): Promise<Subtask[]>;
  createSubtask(subtask: InsertSubtask): Promise<Subtask>;
  updateSubtask(id: number, completed: boolean): Promise<Subtask | undefined>;
  deleteSubtask(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private subtasks: Map<number, Subtask>;
  private userCurrentId: number;
  private taskCurrentId: number;
  private subtaskCurrentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.subtasks = new Map();
    this.userCurrentId = 1;
    this.taskCurrentId = 1;
    this.subtaskCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Task methods
  async getTasks(): Promise<TaskWithSubtasks[]> {
    const tasksList = Array.from(this.tasks.values());
    
    return Promise.all(
      tasksList.map(async (task) => {
        const taskSubtasks = await this.getSubtasks(task.id);
        return { ...task, subtasks: taskSubtasks };
      })
    );
  }

  async getTasksByFrequency(frequency: string): Promise<TaskWithSubtasks[]> {
    const tasksList = Array.from(this.tasks.values())
      .filter(task => task.frequency === frequency);
    
    return Promise.all(
      tasksList.map(async (task) => {
        const taskSubtasks = await this.getSubtasks(task.id);
        return { ...task, subtasks: taskSubtasks };
      })
    );
  }

  async getTask(id: number): Promise<TaskWithSubtasks | undefined> {
    const task = this.tasks.get(id);
    
    if (!task) {
      return undefined;
    }
    
    const taskSubtasks = await this.getSubtasks(id);
    return { ...task, subtasks: taskSubtasks };
  }

  async createTask(insertTask: InsertTask, subtaskDescriptions: string[]): Promise<TaskWithSubtasks> {
    const id = this.taskCurrentId++;
    const createdAt = new Date();
    
    // Ensure all required fields are properly set with correct types
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt,
      detailedDescription: insertTask.detailedDescription || null,
      priority: insertTask.priority || "medium",
      completed: insertTask.completed || false
    };
    this.tasks.set(id, task);
    
    // Create subtasks
    const createdSubtasks: Subtask[] = [];
    
    for (const description of subtaskDescriptions) {
      if (description.trim()) {
        const subtask = await this.createSubtask({
          taskId: id,
          description,
          completed: false
        });
        createdSubtasks.push(subtask);
      }
    }
    
    return { ...task, subtasks: createdSubtasks };
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<TaskWithSubtasks | undefined> {
    const existingTask = this.tasks.get(id);
    
    if (!existingTask) {
      return undefined;
    }
    
    const updatedTask: Task = { ...existingTask, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    
    const taskSubtasks = await this.getSubtasks(id);
    return { ...updatedTask, subtasks: taskSubtasks };
  }

  async deleteTask(id: number): Promise<boolean> {
    const exists = this.tasks.has(id);
    
    if (exists) {
      // Delete all associated subtasks first
      const subtasksList = Array.from(this.subtasks.values());
      for (const subtask of subtasksList) {
        if (subtask.taskId === id) {
          this.subtasks.delete(subtask.id);
        }
      }
      
      this.tasks.delete(id);
      return true;
    }
    
    return false;
  }

  // Subtask methods
  async getSubtasks(taskId: number): Promise<Subtask[]> {
    return Array.from(this.subtasks.values())
      .filter(subtask => subtask.taskId === taskId);
  }

  async createSubtask(insertSubtask: InsertSubtask): Promise<Subtask> {
    const id = this.subtaskCurrentId++;
    // Ensure completed has the right type (boolean | null)
    const subtask: Subtask = { 
      ...insertSubtask, 
      id,
      completed: insertSubtask.completed || false
    };
    this.subtasks.set(id, subtask);
    return subtask;
  }

  async updateSubtask(id: number, completed: boolean): Promise<Subtask | undefined> {
    const existingSubtask = this.subtasks.get(id);
    
    if (!existingSubtask) {
      return undefined;
    }
    
    const updatedSubtask: Subtask = { ...existingSubtask, completed };
    this.subtasks.set(id, updatedSubtask);
    
    return updatedSubtask;
  }

  async deleteSubtask(id: number): Promise<boolean> {
    const exists = this.subtasks.has(id);
    
    if (exists) {
      this.subtasks.delete(id);
      return true;
    }
    
    return false;
  }
}

export const storage = new MemStorage();
