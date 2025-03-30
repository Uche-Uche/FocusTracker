import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define categories for tasks
export const categories = [
  { id: "work", name: "Work Projects", color: "#5E81AC" },
  { id: "learning", name: "Learning", color: "#88C0D0" },
  { id: "health", name: "Health & Fitness", color: "#A3BE8C" },
  { id: "personal", name: "Personal Projects", color: "#BF616A" },
  { id: "reading", name: "Reading", color: "#3B4252" },
  { id: "reflection", name: "Reflection", color: "#2E3440" }
];

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
  category: text("category").notNull(),
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
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertSubtask = z.infer<typeof insertSubtaskSchema>;
export type Subtask = typeof subtasks.$inferSelect;

// Extended task type with subtasks
export type TaskWithSubtasks = Task & {
  subtasks: Subtask[];
};
