import { drizzle } from "drizzle-orm/node-postgres";
import pkg from 'pg';
const { Pool } = pkg;
import { IStorage } from "./storage";
import { 
  categories, tasks, subtasks, 
  InsertTask, InsertSubtask, InsertCategory,
  User, Task, Subtask, Category,
  TaskWithSubtasks, defaultCategories
} from "../shared/schema";
import { eq, and, desc } from "drizzle-orm";

// Initialize the database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const db = drizzle(pool);

// PostgreSQL Storage Implementation
export class DBStorage implements IStorage {
  constructor() {
    // Initialize the database with default categories if they don't exist
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Create tables if they don't exist (this is handled by drizzle)
      
      // Check if categories table is empty
      const existingCategories = await db.select().from(categories);
      
      if (existingCategories.length === 0) {
        // Insert default categories
        for (const category of defaultCategories) {
          await this.createCategory(category);
        }
        console.log("Default categories created successfully");
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug));
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: number, category: Partial<Category>): Promise<Category | undefined> {
    const result = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
    return result.length > 0;
  }

  // User methods (kept for future development)
  async getUser(id: number): Promise<User | undefined> {
    // Not implemented for now
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Not implemented for now
    return undefined;
  }

  async createUser(user: any): Promise<User> {
    // Not implemented for now
    return { id: 1, username: "default", password: "default" };
  }

  // Task methods
  async getTasks(): Promise<TaskWithSubtasks[]> {
    // Get all tasks
    const tasksList = await db
      .select()
      .from(tasks)
      .orderBy(desc(tasks.createdAt));

    // Enrich tasks with subtasks and category information
    return this.enrichTasksWithSubtasksAndCategories(tasksList);
  }

  async getTasksByFrequency(frequency: string): Promise<TaskWithSubtasks[]> {
    // Get tasks by frequency
    const tasksList = await db
      .select()
      .from(tasks)
      .where(eq(tasks.frequency, frequency))
      .orderBy(desc(tasks.createdAt));

    // Enrich tasks with subtasks and category information
    return this.enrichTasksWithSubtasksAndCategories(tasksList);
  }

  async getTask(id: number): Promise<TaskWithSubtasks | undefined> {
    // Get the task
    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));

    if (result.length === 0) {
      return undefined;
    }

    const task = result[0];
    
    // Get the subtasks for this task
    const subtasksList = await this.getSubtasks(task.id);
    
    // Get the category
    const categoryResult = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, task.categorySlug));
    
    const category = categoryResult.length > 0 ? categoryResult[0] : undefined;
    
    // Return the task with subtasks and category
    return {
      ...task,
      subtasks: subtasksList,
      category
    };
  }

  async createTask(insertTask: InsertTask, subtaskDescriptions: string[]): Promise<TaskWithSubtasks> {
    // Create the task
    const taskResult = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    
    const task = taskResult[0];

    // Create the subtasks
    const subtasksList: Subtask[] = [];
    for (const description of subtaskDescriptions) {
      const subtask = await this.createSubtask({
        taskId: task.id,
        description,
        completed: false
      });
      subtasksList.push(subtask);
    }

    // Get the category
    const categoryResult = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, task.categorySlug));
    
    const category = categoryResult.length > 0 ? categoryResult[0] : undefined;
    
    // Return the task with subtasks and category
    return {
      ...task,
      subtasks: subtasksList,
      category
    };
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<TaskWithSubtasks | undefined> {
    // Update the task
    const result = await db
      .update(tasks)
      .set(taskUpdate)
      .where(eq(tasks.id, id))
      .returning();

    if (result.length === 0) {
      return undefined;
    }

    // Get the updated task with subtasks and category
    return this.getTask(id);
  }

  async deleteTask(id: number): Promise<boolean> {
    // Delete all subtasks of this task first
    await db
      .delete(subtasks)
      .where(eq(subtasks.taskId, id));

    // Delete the task
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
    
    return result.length > 0;
  }

  // Subtask methods
  async getSubtasks(taskId: number): Promise<Subtask[]> {
    return await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.taskId, taskId));
  }

  async createSubtask(subtask: InsertSubtask): Promise<Subtask> {
    const result = await db
      .insert(subtasks)
      .values(subtask)
      .returning();
    
    return result[0];
  }

  async updateSubtask(id: number, completed: boolean): Promise<Subtask | undefined> {
    const result = await db
      .update(subtasks)
      .set({ completed })
      .where(eq(subtasks.id, id))
      .returning();
    
    return result[0];
  }

  async deleteSubtask(id: number): Promise<boolean> {
    const result = await db
      .delete(subtasks)
      .where(eq(subtasks.id, id))
      .returning();
    
    return result.length > 0;
  }

  // Helper methods
  private async enrichTasksWithSubtasksAndCategories(tasksList: Task[]): Promise<TaskWithSubtasks[]> {
    const tasksWithSubtasks: TaskWithSubtasks[] = [];
    
    // Get all categories for efficiency
    const categoriesList = await db.select().from(categories);
    const categoriesMap = new Map<string, Category>();
    for (const category of categoriesList) {
      categoriesMap.set(category.slug, category);
    }
    
    for (const task of tasksList) {
      // Get the subtasks for this task
      const subtasksList = await this.getSubtasks(task.id);
      
      // Get the category from our map
      const category = categoriesMap.get(task.categorySlug);
      
      // Add the task with subtasks and category to our list
      tasksWithSubtasks.push({
        ...task,
        subtasks: subtasksList,
        category
      });
    }
    
    return tasksWithSubtasks;
  }
}

// Export a singleton instance
export const dbStorage = new DBStorage();