interface TaskFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  frequencyFilter: "all" | "daily" | "weekly";
  onFrequencyChange: (frequency: "all" | "daily" | "weekly") => void;
}

export default function TaskFilter({
  searchQuery,
  onSearchChange,
  frequencyFilter,
  onFrequencyChange
}: TaskFilterProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="relative w-full sm:w-72">
        <input 
          type="text" 
          placeholder="Search tasks..." 
          className="pl-10 pr-4 py-2 w-full border border-[#D8DEE9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E81AC]/25 focus:border-[#5E81AC]"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
      </div>
      <div className="flex gap-2">
        <select 
          className="border border-[#D8DEE9] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E81AC]/25 focus:border-[#5E81AC]"
          value={frequencyFilter}
          onChange={(e) => onFrequencyChange(e.target.value as "all" | "daily" | "weekly")}
        >
          <option value="all">All Tasks</option>
          <option value="daily">Daily Tasks</option>
          <option value="weekly">Weekly Tasks</option>
        </select>
        <button className="bg-white border border-[#D8DEE9] rounded-lg p-2 focus:outline-none hover:bg-[#ECEFF4]">
          <i className="ri-equalizer-line"></i>
        </button>
      </div>
    </div>
  );
}
