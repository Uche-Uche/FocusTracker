import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Categories table for tasks
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  color: text("color").notNull(),
});

// Users table (Keep from original schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  briefDescription: text("brief_description").notNull(),
  detailedDescription: text("detailed_description"),
  categorySlug: text("category_slug").notNull(),
  frequency: text("frequency").notNull(), // 'daily' or 'weekly'
  dueDate: timestamp("due_date").notNull(),
  priority: text("priority").default("medium"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Subtasks table
export const subtasks = pgTable("subtasks", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  description: text("description").notNull(),
  completed: boolean("completed").default(false),
});

// Zod schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Create the base insert schema
const baseInsertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

// Extended schema with transformations
export const insertTaskSchema = baseInsertTaskSchema.extend({
  dueDate: z.string().transform((str) => new Date(str)),
});

export const insertSubtaskSchema = createInsertSchema(subtasks).omit({
  id: true,
});

// Types
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertSubtask = z.infer<typeof insertSubtaskSchema>;
export type Subtask = typeof subtasks.$inferSelect;

// Extended task type with subtasks
export type TaskWithSubtasks = Task & {
  subtasks: Subtask[];
  category?: Category;  // Category details included when returning tasks
};

// Default categories - will be used to initially populate the categories table
export const defaultCategories = [
  { slug: "work", name: "Work Projects", color: "#5E81AC" },
  { slug: "learning", name: "Learning", color: "#88C0D0" },
  { slug: "health", name: "Health & Fitness", color: "#A3BE8C" },
  { slug: "personal", name: "Personal Projects", color: "#BF616A" },
  { slug: "reading", name: "Reading", color: "#3B4252" },
  { slug: "reflection", name: "Reflection", color: "#2E3440" }
];
