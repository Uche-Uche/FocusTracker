interface HeaderProps {
  completedDays: number;
  totalDays: number;
}

export default function Header({ completedDays, totalDays }: HeaderProps) {
  return (
    <header className="bg-[#2E3440] text-white px-4 sm:px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center">
          <i className="ri-focus-2-line mr-2"></i>
          <span>30-Day Focus</span>
        </h1>
        <div className="flex items-center space-x-2">
          <span className="hidden sm:inline text-sm text-[#88C0D0]">
            Day {completedDays} of {totalDays}
          </span>
          <div className="w-8 h-8 bg-[#5E81AC] rounded-full flex items-center justify-center">
            <i className="ri-user-line"></i>
          </div>
        </div>
      </div>
    </header>
  );
}
