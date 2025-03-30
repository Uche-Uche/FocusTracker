import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTaskSchema, insertSubtaskSchema, insertCategorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Task Routes
  
  // Get all tasks
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  
  // Get tasks by frequency
  app.get("/api/tasks/frequency/:frequency", async (req: Request, res: Response) => {
    try {
      const frequency = req.params.frequency;
      if (frequency !== "daily" && frequency !== "weekly") {
        return res.status(400).json({ message: "Invalid frequency. Must be 'daily' or 'weekly'" });
      }
      
      const tasks = await storage.getTasksByFrequency(frequency);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks by frequency" });
    }
  });
  
  // Get a specific task
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });
  
  // Create a new task
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const taskValidation = insertTaskSchema.safeParse(req.body.task);
      
      if (!taskValidation.success) {
        return res.status(400).json({ 
          message: "Invalid task data", 
          errors: taskValidation.error.errors 
        });
      }
      
      // Validate subtasks (they should be an array of strings)
      const subtasksSchema = z.array(z.string());
      const subtasksValidation = subtasksSchema.safeParse(req.body.subtasks);
      
      if (!subtasksValidation.success) {
        return res.status(400).json({ 
          message: "Invalid subtasks data", 
          errors: subtasksValidation.error.errors 
        });
      }
      
      const task = await storage.createTask(taskValidation.data, subtasksValidation.data);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  
  // Update a task
  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const partialTask = req.body;
      const updatedTask = await storage.updateTask(id, partialTask);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  
  // Delete a task
  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });
  
  // Category Routes
  
  // Get all categories
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  // Get a specific category by slug
  app.get("/api/categories/:slug", async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      const category = await storage.getCategory(slug);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  
  // Create a new category
  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const categoryValidation = insertCategorySchema.safeParse(req.body);
      
      if (!categoryValidation.success) {
        return res.status(400).json({ 
          message: "Invalid category data", 
          errors: categoryValidation.error.errors 
        });
      }
      
      const category = await storage.createCategory(categoryValidation.data);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  // Update a category
  app.patch("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const partialCategory = req.body;
      const updatedCategory = await storage.updateCategory(id, partialCategory);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  
  // Delete a category
  app.delete("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  
  // Subtask Routes
  
  // Update a subtask's completion status
  app.patch("/api/subtasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subtask ID" });
      }
      
      const { completed } = req.body;
      
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ message: "Invalid completion status" });
      }
      
      const updatedSubtask = await storage.updateSubtask(id, completed);
      
      if (!updatedSubtask) {
        return res.status(404).json({ message: "Subtask not found" });
      }
      
      res.json(updatedSubtask);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subtask" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
