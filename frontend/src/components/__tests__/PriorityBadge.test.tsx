import { render, screen } from "@testing-library/react";
import { PriorityBadge } from "../ui/priority-badge";

describe("PriorityBadge", () => {
  const mockProps = {
    dueDate: "2025-01-15",
    status: "TODO",
  };

  it("renders without crashing", () => {
    render(<PriorityBadge {...mockProps} />);
    expect(screen.getByText(/HIGH|MEDIUM|LOW/)).toBeInTheDocument();
  });

  it("shows HIGH priority for tasks due within 2 days", () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    render(
      <PriorityBadge
        dueDate={tomorrow.toISOString().split("T")[0]}
        status="TODO"
      />
    );

    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("shows MEDIUM priority for tasks due in 3-8 days", () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 5);

    render(
      <PriorityBadge
        dueDate={nextWeek.toISOString().split("T")[0]}
        status="TODO"
      />
    );

    expect(screen.getByText("MEDIUM")).toBeInTheDocument();
  });

  it("shows LOW priority for tasks due in more than 8 days", () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(nextMonth.getDate() + 15);

    render(
      <PriorityBadge
        dueDate={nextMonth.toISOString().split("T")[0]}
        status="TODO"
      />
    );

    expect(screen.getByText("LOW")).toBeInTheDocument();
  });

  it("does not render for completed tasks", () => {
    const { container } = render(
      <PriorityBadge dueDate="2025-01-15" status="DONE" />
    );

    expect(container.firstChild).toBeNull();
  });

  it("includes priority emoji", () => {
    render(<PriorityBadge {...mockProps} />);

    // Check for emoji presence (🔥 for HIGH, ⚡ for MEDIUM, 💡 for LOW)
    const badge = screen.getByText(/🔥|⚡|💡/);
    expect(badge).toBeInTheDocument();
  });
});
