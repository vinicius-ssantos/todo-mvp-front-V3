import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskRow } from "../TaskRow";
import type { Task } from "../../model/types";

// Mock EditTaskDialog to avoid nested component complexity
vi.mock("@/features/update-task/ui/EditTaskDialog", () => ({
  EditTaskDialog: () => <button>Edit</button>,
}));

const mockTask: Task = {
  id: "task-1",
  title: "Test Task",
  description: "Test description",
  completed: false,
  status: "OPEN",
  listId: "list-1",
  priority: "medium",
  dueDate: "2024-12-31",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("TaskRow", () => {
  it("should render task title and description", () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TaskRow listId="list-1" task={mockTask} onToggle={onToggle} onDelete={onDelete} />);

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("should render checkbox in unchecked state for incomplete task", () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TaskRow listId="list-1" task={mockTask} onToggle={onToggle} onDelete={onDelete} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("should render checkbox in checked state for completed task", () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    const completedTask = { ...mockTask, completed: true, status: "DONE" as const };

    render(
      <TaskRow listId="list-1" task={completedTask} onToggle={onToggle} onDelete={onDelete} />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("should call onToggle when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TaskRow listId="list-1" task={mockTask} onToggle={onToggle} onDelete={onDelete} />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith("task-1", true);
  });

  it("should call onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TaskRow listId="list-1" task={mockTask} onToggle={onToggle} onDelete={onDelete} />);

    const deleteButton = screen.getByLabelText(/excluir tarefa/i);
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith("task-1");
  });

  it("should show priority badge when task has priority", () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TaskRow listId="list-1" task={mockTask} onToggle={onToggle} onDelete={onDelete} />);

    expect(screen.getByText("Média")).toBeInTheDocument();
  });

  it("should show status badge", () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TaskRow listId="list-1" task={mockTask} onToggle={onToggle} onDelete={onDelete} />);

    expect(screen.getByText("Aberta")).toBeInTheDocument();
  });

  it("should show due date badge when task has due date", () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TaskRow listId="list-1" task={mockTask} onToggle={onToggle} onDelete={onDelete} />);

    expect(screen.getByText("31/12/2024")).toBeInTheDocument();
  });

  it("should apply strikethrough style to completed task title", () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    const completedTask = { ...mockTask, completed: true, status: "DONE" as const };

    render(
      <TaskRow listId="list-1" task={completedTask} onToggle={onToggle} onDelete={onDelete} />
    );

    const title = screen.getByText("Test Task");
    expect(title).toHaveClass("line-through");
  });

  it("should handle keyboard navigation with Space key", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TaskRow listId="list-1" task={mockTask} onToggle={onToggle} onDelete={onDelete} />);

    const taskRow = screen.getByRole("article");
    taskRow.focus();
    await user.keyboard(" ");

    expect(onToggle).toHaveBeenCalledWith("task-1", true);
  });

  it("should handle keyboard navigation with Enter key", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TaskRow listId="list-1" task={mockTask} onToggle={onToggle} onDelete={onDelete} />);

    const taskRow = screen.getByRole("article");
    taskRow.focus();
    await user.keyboard("{Enter}");

    expect(onToggle).toHaveBeenCalledWith("task-1", true);
  });

  it("should have proper ARIA labels for accessibility", () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TaskRow listId="list-1" task={mockTask} onToggle={onToggle} onDelete={onDelete} />);

    expect(screen.getByRole("article")).toHaveAttribute(
      "aria-label",
      "Tarefa: Test Task, pendente"
    );
    expect(screen.getByLabelText(/marcar.*como concluída/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/excluir tarefa test task/i)).toBeInTheDocument();
  });

  it("should be focusable with tabIndex", () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TaskRow listId="list-1" task={mockTask} onToggle={onToggle} onDelete={onDelete} />);

    const taskRow = screen.getByRole("article");
    expect(taskRow).toHaveAttribute("tabIndex", "0");
  });
});
