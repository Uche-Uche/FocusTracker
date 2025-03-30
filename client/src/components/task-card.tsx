import { useState } from "react";
import { TaskWithSubtasks } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface TaskCardProps {
  task: TaskWithSubtasks;
  onTaskUpdate: () => void;
}

export default function TaskCard({ task, onTaskUpdate }: TaskCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };
  
  const toggleTaskCompletion = async () => {
    try {
      await apiRequest("PATCH", `/api/tasks/${task.id}`, {
        completed: !task.completed
      });
      onTaskUpdate();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };
  
  const toggleSubtaskCompletion = async (subtaskId: number, currentStatus: boolean) => {
    try {
      await apiRequest("PATCH", `/api/subtasks/${subtaskId}`, {
        completed: !currentStatus
      });
      onTaskUpdate();
    } catch (error) {
      console.error("Failed to update subtask:", error);
    }
  };
  
  const deleteTask = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await apiRequest("DELETE", `/api/tasks/${task.id}`, undefined);
        onTaskUpdate();
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };
  
  // Format date for display
  const formatDueDate = (date: Date | string) => {
    if (task.frequency === 'daily') {
      return format(new Date(date), 'h:mm a');
    } else {
      return `Due ${format(new Date(date), 'EEEE')}`;
    }
  };
  
  // Get color class based on frequency
  const getFrequencyColorClass = (frequency: string) => {
    return frequency === 'daily' 
      ? 'bg-[#A3BE8C]/10 text-[#A3BE8C]' 
      : 'bg-[#88C0D0]/10 text-[#88C0D0]';
  };
  
  // Format created date
  const createdDate = format(new Date(task.createdAt), 'MMM d');
  
  return (
    <div className="bg-white rounded-lg shadow-[0_2px_10px_rgba(46,52,64,0.1)] overflow-hidden">
      <div className="px-4 py-3 flex items-start">
        <input 
          type="checkbox" 
          id={`task-${task.id}`} 
          checked={task.completed}
          onChange={toggleTaskCompletion}
          className="w-5 h-5 rounded border-[#D8DEE9] mt-1 mr-3 accent-[#5E81AC]"
        />
        <div className="flex-1">
          <label 
            htmlFor={`task-${task.id}`} 
            className={`font-medium flex items-center ${task.completed ? 'line-through text-[#88C0D0]' : ''}`}
          >
            {task.name}
            <span 
              className={`ml-2 px-2 py-0.5 text-xs font-normal rounded-full ${getFrequencyColorClass(task.frequency)}`}
            >
              {task.frequency === 'daily' ? 'Daily' : 'Weekly'}
            </span>
          </label>
          <p className="text-sm mt-1">{task.briefDescription}</p>
          <div className="flex items-center mt-2">
            <span 
              className={`${getFrequencyColorClass(task.frequency)} text-xs px-2 py-0.5 rounded flex items-center`}
            >
              <i className={`${task.frequency === 'daily' ? 'ri-time-line' : 'ri-calendar-check-line'} mr-1`}></i>
              {formatDueDate(task.dueDate)}
            </span>
            <button 
              className="ml-3 text-sm text-[#5E81AC]"
              onClick={toggleDetails}
            >
              {isDetailsOpen ? 'Hide details' : 'Show details'}
            </button>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="p-1.5 text-[#4C566A] hover:text-[#5E81AC]">
            <i className="ri-edit-line"></i>
          </button>
          <button 
            className="p-1.5 text-[#4C566A] hover:text-[#BF616A]"
            onClick={deleteTask}
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
      
      {isDetailsOpen && (
        <div className="px-4 py-3 bg-[#ECEFF4]/50 border-t border-[#D8DEE9]">
          <div className="text-sm">
            {task.detailedDescription && (
              <div className="mb-3">
                <h4 className="font-medium mb-1">Detailed Description</h4>
                <p>{task.detailedDescription}</p>
              </div>
            )}
            
            {task.subtasks.length > 0 && (
              <>
                <h4 className="font-medium mb-2">Subtasks:</h4>
                <ul className="space-y-2 mb-3">
                  {task.subtasks.map(subtask => (
                    <li key={subtask.id} className="flex items-start">
                      <input 
                        type="checkbox" 
                        id={`subtask-${subtask.id}`} 
                        checked={subtask.completed}
                        onChange={() => toggleSubtaskCompletion(subtask.id, subtask.completed)}
                        className="w-4 h-4 mt-0.5 mr-2 accent-[#5E81AC]"
                      />
                      <label 
                        htmlFor={`subtask-${subtask.id}`} 
                        className={`flex-1 ${subtask.completed ? 'line-through text-[#88C0D0]' : ''}`}
                      >
                        {subtask.description}
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}
            
            <div className="flex items-center text-xs text-[#4C566A]">
              <span className="flex items-center mr-3">
                <i className="ri-calendar-line mr-1"></i>
                Added on {createdDate}
              </span>
              <span className="flex items-center">
                <i className="ri-repeat-line mr-1"></i>
                Repeats {task.frequency}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
