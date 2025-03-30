import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTaskSchema, type Category } from "@shared/schema";
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
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

  const onSubmit = async (data: TaskFormValues) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: data,
          subtasks: subtasks.filter(st => st.trim() !== '')
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task");
      }

      const createdTask = await response.json();
      console.log("Created task:", createdTask);

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      onTaskCreated();
    } catch (error) {
      console.error("Failed to create task:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create task. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-[0_2px_10px_rgba(46,52,64,0.1)] p-6">
      <h2 className="font-semibold text-xl mb-5">Create New Task</h2>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
              placeholder="Enter brief description"
            />
            {errors.briefDescription && (
              <p className="mt-1 text-sm text-red-500">{errors.briefDescription.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="detailedDescription" className="block text-sm font-medium mb-1">Detailed Description</label>
            <textarea
              id="detailedDescription"
              {...register("detailedDescription")}
              className="w-full px-3 py-2 border border-[#D8DEE9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E81AC]/25 focus:border-[#5E81AC]"
              placeholder="Enter detailed description"
              rows={4}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Category*</label>
            <select
              id="category"
              {...register("category")}
              className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-[#D8DEE9]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E81AC]/25 focus:border-[#5E81AC]`}
              disabled={isLoadingCategories}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
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
            <label htmlFor="dueDate" className="block text-sm font-medium mb-1">Due Date*</label>
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
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Subtasks</label>
          {subtasks.map((_, index) => (
            <input
              key={index}
              type="text"
              value={subtasks[index]}
              onChange={(e) => {
                const newSubtasks = [...subtasks];
                newSubtasks[index] = e.target.value;
                setSubtasks(newSubtasks);
              }}
              className="w-full px-3 py-2 border border-[#D8DEE9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E81AC]/25 focus:border-[#5E81AC]"
              placeholder="Enter subtask"
            />
          ))}
          <button
            type="button"
            onClick={addSubtask}
            className="flex items-center text-sm text-[#5E81AC] hover:text-[#5E81AC]/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus mr-1">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Subtask
          </button>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => onTaskCreated()} 
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