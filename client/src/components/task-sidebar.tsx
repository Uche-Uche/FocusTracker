import { useState, useEffect } from "react";
import type { Category } from "@shared/schema";

interface TaskSidebarProps {
  completedDailyTasks: number;
  totalDailyTasks: number;
  completedWeeklyTasks: number;
  totalWeeklyTasks: number;
  completedToday: number;
  categoryTaskCounts: Record<string, number>;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function TaskSidebar({
  completedDailyTasks,
  totalDailyTasks,
  completedWeeklyTasks,
  totalWeeklyTasks,
  completedToday,
  categoryTaskCounts,
  selectedCategory,
  onSelectCategory
}: TaskSidebarProps) {
  const dailyProgress = totalDailyTasks ? (completedDailyTasks / totalDailyTasks) * 100 : 0;
  const weeklyProgress = totalWeeklyTasks ? (completedWeeklyTasks / totalWeeklyTasks) * 100 : 0;
  
  // Default categories in case the API fails
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, slug: "work", name: "Work Projects", color: "#5E81AC" },
    { id: 2, slug: "learning", name: "Learning", color: "#88C0D0" },
    { id: 3, slug: "health", name: "Health & Fitness", color: "#A3BE8C" },
    { id: 4, slug: "personal", name: "Personal Projects", color: "#BF616A" },
    { id: 5, slug: "reading", name: "Reading", color: "#3B4252" },
    { id: 6, slug: "reflection", name: "Reflection", color: "#2E3440" }
  ]);
  
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <>
      {/* Progress Stats */}
      <div className="bg-white rounded-lg shadow-[0_2px_10px_rgba(46,52,64,0.1)] p-4 mb-6">
        <h2 className="font-semibold text-lg mb-3">Progress</h2>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">Today's Tasks</span>
          <span className="text-sm font-medium">{completedDailyTasks}/{totalDailyTasks}</span>
        </div>
        <div className="w-full bg-[#D8DEE9] rounded-full h-2">
          <div 
            className="bg-[#5E81AC] h-2 rounded-full" 
            style={{ width: `${dailyProgress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center mt-4 mb-2">
          <span className="text-sm">Weekly Tasks</span>
          <span className="text-sm font-medium">{completedWeeklyTasks}/{totalWeeklyTasks}</span>
        </div>
        <div className="w-full bg-[#D8DEE9] rounded-full h-2">
          <div 
            className="bg-[#88C0D0] h-2 rounded-full" 
            style={{ width: `${weeklyProgress}%` }}
          ></div>
        </div>

        <div className="border-t border-[#D8DEE9] mt-4 pt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#A3BE8C] mr-2"></div>
            <span className="text-sm">{completedToday} tasks completed today</span>
          </div>
        </div>
      </div>
      
      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-[0_2px_10px_rgba(46,52,64,0.1)] p-4 mb-6">
        <h2 className="font-semibold text-lg mb-3">Key Activities</h2>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading categories...</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li 
                key={category.id}
                className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer ${
                  selectedCategory === category.slug ? 'bg-[#ECEFF4]' : 'hover:bg-[#ECEFF4]'
                }`}
                onClick={() => {
                  if (selectedCategory === category.slug) {
                    onSelectCategory(null);
                  } else {
                    onSelectCategory(category.slug);
                  }
                }}
              >
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span>{category.name}</span>
                </div>
                <span className="text-xs bg-[#D8DEE9] px-2 py-1 rounded-full">
                  {categoryTaskCounts[category.slug] || 0}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}