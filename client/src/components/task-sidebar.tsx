import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CategoryManagement from "./category-management";
import { Category } from "@shared/schema";

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
  const queryClient = useQueryClient();
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const dailyProgress = totalDailyTasks ? (completedDailyTasks / totalDailyTasks) * 100 : 0;
  const weeklyProgress = totalWeeklyTasks ? (completedWeeklyTasks / totalWeeklyTasks) * 100 : 0;
  
  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: true,
  });

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
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-lg">Key Activities</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsManageCategoriesOpen(true)}
            className="flex items-center gap-1"
          >
            <Settings size={16} />
            <span className="text-xs">Manage</span>
          </Button>
        </div>
        
        {isLoadingCategories ? (
          <div className="py-4 text-center text-sm text-gray-500">Loading categories...</div>
        ) : (
          <ul className="space-y-2">
            {categories.map((category: Category) => (
              <li 
                key={category.id}
                className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer ${
                  selectedCategory === category.id ? 'bg-[#ECEFF4]' : 'hover:bg-[#ECEFF4]'
                }`}
                onClick={() => {
                  if (selectedCategory === category.id) {
                    onSelectCategory(null);
                  } else {
                    onSelectCategory(category.id);
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
                  {categoryTaskCounts[category.id] || 0}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Category Management Dialog */}
      <Dialog open={isManageCategoriesOpen} onOpenChange={setIsManageCategoriesOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Key Activities</DialogTitle>
            <DialogDescription>
              Create, edit, or delete categories to organize your 30-day focused tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <CategoryManagement 
              onCategoryChange={() => {
                // Refresh the categories when changes are made
                queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
