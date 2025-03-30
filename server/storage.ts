import { 
  tasks, 
  subtasks, 
  users,
  categories, 
  type Task, 
  type InsertTask,
  type Subtask,
  type InsertSubtask,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type TaskWithSubtasks,
  defaultCategories
} from "@shared/schema";

export interface IStorage {
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
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
  private categories: Map<number, Category>;
  private categorySlugToIdMap: Map<string, number>;
  private userCurrentId: number;
  private taskCurrentId: number;
  private subtaskCurrentId: number;
  private categoryCurrentId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.subtasks = new Map();
    this.categories = new Map();
    this.categorySlugToIdMap = new Map();
    this.userCurrentId = 1;
    this.taskCurrentId = 1;
    this.subtaskCurrentId = 1;
    this.categoryCurrentId = 1;
    
    // Initialize with default categories
    this.initializeDefaultCategories();
  }
  
  private async initializeDefaultCategories() {
    for (const category of defaultCategories) {
      await this.createCategory(category);
    }
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(slug: string): Promise<Category | undefined> {
    const id = this.categorySlugToIdMap.get(slug);
    if (!id) return undefined;
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    this.categorySlugToIdMap.set(category.slug, id);
    return newCategory;
  }
  
  async updateCategory(id: number, categoryUpdate: Partial<Category>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) {
      return undefined;
    }
    
    // If slug is being changed, update the mapping
    if (categoryUpdate.slug && categoryUpdate.slug !== existingCategory.slug) {
      this.categorySlugToIdMap.delete(existingCategory.slug);
      this.categorySlugToIdMap.set(categoryUpdate.slug, id);
    }
    
    const updatedCategory: Category = { ...existingCategory, ...categoryUpdate };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    const category = this.categories.get(id);
    if (!category) {
      return false;
    }
    
    this.categorySlugToIdMap.delete(category.slug);
    this.categories.delete(id);
    return true;
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
        const category = await this.getCategory(task.categorySlug);
        return { ...task, subtasks: taskSubtasks, category };
      })
    );
  }

  async getTasksByFrequency(frequency: string): Promise<TaskWithSubtasks[]> {
    const tasksList = Array.from(this.tasks.values())
      .filter(task => task.frequency === frequency);
    
    return Promise.all(
      tasksList.map(async (task) => {
        const taskSubtasks = await this.getSubtasks(task.id);
        const category = await this.getCategory(task.categorySlug);
        return { ...task, subtasks: taskSubtasks, category };
      })
    );
  }

  async getTask(id: number): Promise<TaskWithSubtasks | undefined> {
    const task = this.tasks.get(id);
    
    if (!task) {
      return undefined;
    }
    
    const taskSubtasks = await this.getSubtasks(id);
    const category = await this.getCategory(task.categorySlug);
    return { ...task, subtasks: taskSubtasks, category };
  }

  async createTask(insertTask: InsertTask, subtaskDescriptions: string[]): Promise<TaskWithSubtasks> {
    const id = this.taskCurrentId++;
    const createdAt = new Date();
    
    // Create properly typed task with all properties explicitly assigned
    const task: Task = {
      id,
      name: insertTask.name,
      briefDescription: insertTask.briefDescription,
      detailedDescription: insertTask.detailedDescription || null,
      categorySlug: insertTask.categorySlug,
      frequency: insertTask.frequency,
      dueDate: insertTask.dueDate,
      priority: insertTask.priority || "medium",
      completed: insertTask.completed || false,
      createdAt
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
    
    // Get the category
    const category = await this.getCategory(task.categorySlug);
    
    return { ...task, subtasks: createdSubtasks, category };
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<TaskWithSubtasks | undefined> {
    const existingTask = this.tasks.get(id);
    
    if (!existingTask) {
      return undefined;
    }
    
    const updatedTask: Task = { ...existingTask, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    
    const taskSubtasks = await this.getSubtasks(id);
    const category = await this.getCategory(updatedTask.categorySlug);
    
    return { ...updatedTask, subtasks: taskSubtasks, category };
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
    // Create proper subtask object with correct typing
    const subtask: Subtask = {
      id, 
      taskId: insertSubtask.taskId,
      description: insertSubtask.description,
      completed: insertSubtask.completed !== undefined ? insertSubtask.completed : false
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

// Import the PostgreSQL storage implementation
import { dbStorage } from "./dbStorage";

// Use PostgreSQL storage if the DATABASE_URL environment variable is set
// Otherwise fall back to in-memory storage for development
export const storage = process.env.DATABASE_URL ? dbStorage : new MemStorage();
