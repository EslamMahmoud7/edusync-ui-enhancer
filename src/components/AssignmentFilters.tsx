
import { Search } from "lucide-react";

interface StatusCounts {
  All: number;
  Pending: number;
  Submitted: number;
  Graded: number;
}

interface AssignmentFiltersProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusCounts: StatusCounts;
  filteredCount: number;
}

export default function AssignmentFilters({
  filterStatus,
  setFilterStatus,
  searchTerm,
  setSearchTerm,
  statusCounts,
  filteredCount
}: AssignmentFiltersProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-edusync-primary to-edusync-accent bg-clip-text text-transparent">
          Assignments
        </h1>
        <div className="text-sm text-gray-500">
          {filteredCount} assignment{filteredCount !== 1 ? "s" : ""} found
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {(["All", "Pending", "Submitted", "Graded"] as const).map((status, index) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                filterStatus === status
                  ? "bg-gradient-to-r from-edusync-primary to-edusync-secondary text-white shadow-lg"
                  : "bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200/50 hover:bg-edusync-primary/5 hover:border-edusync-primary/20"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {status}
              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white/20">
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-edusync-primary/20 focus:border-edusync-primary transition-all duration-200"
          />
        </div>
      </div>
    </>
  );
}
