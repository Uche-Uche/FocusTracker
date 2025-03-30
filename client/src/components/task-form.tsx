import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { insertTaskSchema, Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Extend the task schema with validation rules
const taskFormSchema = insertTaskSchema.extend({
  name: z.string().min(1, "Task name is required"),
  briefDescription: z.string().min(1, "Brief description is required"),
  category: z.string().min(1, "Category is required"),
  frequency: z.string().min(1, "Frequency is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onTaskCreated: () => void;
}

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [subtasks, setSubtasks] = useState<string[]>([""]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { toast } = useToast();
  
  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setCategories(data);
          }
        } else {
          throw new Error('Failed to fetch categories');
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Warning",
          description: "Failed to load categories. Some options may be unavailable.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, [toast]);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: "",
      briefDescription: "",
      detailedDescription: "",
      category: "",
      frequency: "",
      dueDate: "",
      priority: "medium"
    }
  });
  
  const addSubtask = () => {
    setSubtasks([...subtasks, ""]);
  };
  
  const removeSubtask = (index: number) => {
    const newSubtasks = [...subtasks];
    newSubtasks.splice(index, 1);
    setSubtasks(newSubtasks);
  };
  
  const updateSubtask = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;
    setSubtasks(newSubtasks);
  };
  
  const onSubmit = async (data: TaskFormValues) => {
    try {
      // Filter out empty subtasks
      const filteredSubtasks = subtasks.filter(st => st.trim() !== "");
      
      // Make sure to use categorySlug properly
      const selectedCategory = data.category;
      
      // Create the task with proper data
      await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: {
            ...data,
            categorySlug: selectedCategory, // Using the slug directly
          },
          subtasks: filteredSubtasks
        })
      });
      
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      
      onTaskCreated();
    } catch (error) {
      console.error("Failed to create task:", error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-[0_2px_10px_rgba(46,52,64,0.1)] p-6">
      <h2 className="font-semibold text-xl mb-5">Create New Task</h2>
      
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Details */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Task Name*</label>
            <input
              id="name"
              {...register("name")}
              className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-[#D8DEE9]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E81AC]/25 focus:border-[#5E81AC]`}
              placeholder="Enter task name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="briefDescription" className="block text-sm font-medium mb-1">Brief Description*</label>
            <input
              id="briefDescription"
              {...register("briefDescription")}
              className={`w-full px-3 py-2 border ${errors.briefDescription ? 'border-red-500' : 'border-[#D8DEE9]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E81AC]/25 focus:border-[#5E81AC]`}
              placeholder="Short summary of the task"
            />
            {errors.briefDescription && (
              <p className="mt-1 text-sm text-red-500">{errors.briefDescription.message}</p>
            )}
          </div>
        </div>
        
        {/* Task Details */}
        <div>
          <label htmlFor="detailedDescription" className="block text-sm font-medium mb-1">Detailed Description</label>
          <textarea
            id="detailedDescription"
            {...register("detailedDescription")}
            rows={4}
            className="w-full px-3 py-2 border border-[#D8DEE9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E81AC]/25 focus:border-[#5E81AC]"
            placeholder="Enter detailed information about this task"
          />
        </div>
        
        {/* Task Type & Scheduling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Category*</label>
            <select
              id="category"
              {...register("category")}
              disabled={isLoadingCategories}
              className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-[#D8DEE9]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E81AC]/25 focus:border-[#5E81AC] ${isLoadingCategories ? 'opacity-60' : ''}`}
            >
              <option value="">
                {isLoadingCategories ? 'Loading categories...' : 'Select a category'}
              </option>
              {!isLoadingCategories && categories.map((category) => (
                <option key={category.id} value={category.slug}>{category.name}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium mb-1">Frequency*</label>
            <select
              id="frequency"
              {...register("frequency")}
              className={`w-full px-3 py-2 border ${errors.frequency ? 'border-red-500' : 'border-[#D8DEE9]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E81AC]/25 focus:border-[#5E81AC]`}
            >
              <option value="">Select frequency</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            {errors.frequency && (
              <p className="mt-1 text-sm text-red-500">{errors.frequency.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium mb-1">Due Date/Time*</label>
            <input
              type="datetime-local"
              id="dueDate"
              {...register("dueDate")}
              className={`w-full px-3 py-2 border ${errors.dueDate ? 'border-red-500' : 'border-[#D8DEE9]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E81AC]/25 focus:border-[#5E81AC]`}
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-500">{errors.dueDate.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
            <select
              id="priority"
              {...register("priority")}
              className="w-full px-3 py-2 border border-[#D8DEE9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E81AC]/25 focus:border-[#5E81AC]"
            >
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        
        {/* Subtasks */}
        <div>
          <label className="block text-sm font-medium mb-2">Subtasks</label>
          
          <div className="space-y-2 mb-3">
            {subtasks.map((subtask, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={subtask}
                  onChange={(e) => updateSubtask(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-[#D8DEE9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E81AC]/25 focus:border-[#5E81AC] mr-2"
                  placeholder="Enter subtask"
                />
                <button
                  type="button"
                  onClick={() => removeSubtask(index)}
                  className="p-2 text-[#BF616A]"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addSubtask}
            className="text-sm flex items-center text-[#5E81AC]"
          >
            <i className="ri-add-line mr-1"></i> Add Subtask
          </button>
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => onTaskCreated()} // Just go back without creating
            className="px-4 py-2 border border-[#D8DEE9] text-[#4C566A] rounded-lg hover:bg-[#ECEFF4]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#5E81AC] text-white rounded-lg hover:bg-[#5E81AC]/90 disabled:opacity-70"
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
