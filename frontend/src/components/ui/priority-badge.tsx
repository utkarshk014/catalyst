import { Badge } from "@/components/ui/badge";
import { calculatePriority } from "@/types";

interface PriorityBadgeProps {
  dueDate: string;
  status: string;
}

export function PriorityBadge({ dueDate, status }: PriorityBadgeProps) {
  // Don't show priority for completed tasks
  if (status === "DONE") {
    return null;
  }

  const priority = calculatePriority(dueDate);

  const getPriorityStyles = (priority: "LOW" | "MEDIUM" | "HIGH") => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200";
      case "LOW":
        return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: "LOW" | "MEDIUM" | "HIGH") => {
    switch (priority) {
      case "HIGH":
        return "🔥";
      case "MEDIUM":
        return "⚡";
      case "LOW":
        return "💡";
      default:
        return "";
    }
  };

  return (
    <Badge
      variant="outline"
      className={`${getPriorityStyles(priority)} font-medium text-xs px-2 py-1`}
    >
      {getPriorityIcon(priority)} {priority}
    </Badge>
  );
}
