import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import TaskSidebar from "@/components/task-sidebar";
import TaskList from "@/components/task-list";
import TaskForm from "@/components/task-form";
import { Task, TaskWithSubtasks } from "@shared/schema";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"tasks" | "add">("tasks");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch all tasks
  const { data: tasks, isLoading } = useQuery<TaskWithSubtasks[]>({
    queryKey: ["/api/tasks"],
  });
  
  // Calculate completed task counts for daily and weekly tasks
  const dailyTasks = tasks?.filter(task => task.frequency === "daily") || [];
  const weeklyTasks = tasks?.filter(task => task.frequency === "weekly") || [];
  
  const completedDailyTasks = dailyTasks.filter(task => task.completed).length;
  const completedWeeklyTasks = weeklyTasks.filter(task => task.completed).length;
  
  // Calculate completed tasks today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const completedToday = tasks?.filter(task => {
    if (!task.completed) return false;
    
    const completedDate = new Date(task.dueDate);
    completedDate.setHours(0, 0, 0, 0);
    
    return completedDate.getTime() === today.getTime();
  }).length || 0;
  
  // Handle task category filtering
  const filteredTasks = selectedCategory 
    ? tasks?.filter(task => task.category === selectedCategory)
    : tasks;
  
  // Get category task counts
  const categoryTaskCounts = (tasks || []).reduce((acc: Record<string, number>, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <div className="bg-[#ECEFF4] text-[#4C566A] min-h-screen">
      <Header 
        completedDays={8} 
        totalDays={30} 
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Task Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <TaskSidebar
              completedDailyTasks={completedDailyTasks}
              totalDailyTasks={dailyTasks.length}
              completedWeeklyTasks={completedWeeklyTasks}
              totalWeeklyTasks={weeklyTasks.length}
              completedToday={completedToday}
              categoryTaskCounts={categoryTaskCounts}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Right Column - Main Content */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            {/* Tab Navigation */}
            <div className="mb-6">
              <div className="flex border-b border-[#D8DEE9]">
                <button 
                  className={`px-4 py-3 font-medium ${activeTab === "tasks" ? "text-[#5E81AC] border-b-2 border-[#5E81AC]" : "text-[#4C566A]"}`}
                  onClick={() => setActiveTab("tasks")}
                >
                  View Tasks
                </button>
                <button 
                  className={`px-4 py-3 font-medium ${activeTab === "add" ? "text-[#5E81AC] border-b-2 border-[#5E81AC]" : "text-[#4C566A]"}`}
                  onClick={() => setActiveTab("add")}
                >
                  Add Task
                </button>
              </div>
            </div>

            {activeTab === "tasks" ? (
              <TaskList 
                tasks={filteredTasks || []}
                isLoading={isLoading}
                onTaskUpdate={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
                }}
              />
            ) : (
              <TaskForm 
                onTaskCreated={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
                  setActiveTab("tasks");
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
