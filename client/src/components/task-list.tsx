import { useState } from "react";
import { TaskWithSubtasks } from "@shared/schema";
import TaskCard from "./task-card";
import TaskFilter from "./task-filter";

interface TaskListProps {
  tasks: TaskWithSubtasks[];
  isLoading: boolean;
  onTaskUpdate: () => void;
}

export default function TaskList({ tasks, isLoading, onTaskUpdate }: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [frequencyFilter, setFrequencyFilter] = useState<"all" | "daily" | "weekly">("all");
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-md animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter tasks based on search query and frequency filter
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.briefDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFrequency = frequencyFilter === "all" || task.frequency === frequencyFilter;
    
    return matchesSearch && matchesFrequency;
  });
  
  // Split filtered tasks by frequency
  const dailyTasks = filteredTasks.filter(task => task.frequency === "daily");
  const weeklyTasks = filteredTasks.filter(task => task.frequency === "weekly");

  return (
    <>
      <TaskFilter 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        frequencyFilter={frequencyFilter}
        onFrequencyChange={setFrequencyFilter}
      />
      
      {/* Show daily tasks section if there are daily tasks or if showing all tasks */}
      {(frequencyFilter === "all" || frequencyFilter === "daily") && (
        <div className="mb-8">
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <i className="ri-calendar-check-line mr-2 text-[#5E81AC]"></i>
            Today's Tasks
          </h2>
          {dailyTasks.length > 0 ? (
            <div className="space-y-4">
              {dailyTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onTaskUpdate={onTaskUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg">
              <p className="text-gray-500">No daily tasks found</p>
            </div>
          )}
        </div>
      )}
      
      {/* Show weekly tasks section if there are weekly tasks or if showing all tasks */}
      {(frequencyFilter === "all" || frequencyFilter === "weekly") && (
        <div>
          <h2 className="font-semibold text-lg mb-4 flex items-center">
            <i className="ri-calendar-line mr-2 text-[#88C0D0]"></i>
            Weekly Tasks
          </h2>
          {weeklyTasks.length > 0 ? (
            <div className="space-y-4">
              {weeklyTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onTaskUpdate={onTaskUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg">
              <p className="text-gray-500">No weekly tasks found</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
