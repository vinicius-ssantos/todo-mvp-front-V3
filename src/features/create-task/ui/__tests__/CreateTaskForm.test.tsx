import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateTaskForm } from "../CreateTaskForm";
import * as mutations from "@/entities/task/api/mutations";

// Mock the toast
vi.mock("@/shared/ui", async () => {
  const actual = await vi.importActual("@/shared/ui");
  return {
    ...actual,
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
};

describe("CreateTaskForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render title input field", () => {
    render(<CreateTaskForm listId="list-1" />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText("Nova tarefa...")).toBeInTheDocument();
  });

  it("should render add button", () => {
    render(<CreateTaskForm listId="list-1" />, { wrapper: createWrapper() });

    expect(screen.getByRole("button", { name: /adicionar/i })).toBeInTheDocument();
  });

  it("should have expand/collapse button for advanced options", () => {
    render(<CreateTaskForm listId="list-1" />, { wrapper: createWrapper() });

    expect(screen.getByRole("button", { name: /mais opções/i })).toBeInTheDocument();
  });

  it("should show advanced options when expand button is clicked", async () => {
    const user = userEvent.setup();
    render(<CreateTaskForm listId="list-1" />, { wrapper: createWrapper() });

    const expandButton = screen.getByRole("button", { name: /mais opções/i });
    await user.click(expandButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Notas")).toBeInTheDocument();
      expect(screen.getByLabelText("Prioridade")).toBeInTheDocument();
      expect(screen.getByLabelText("Status inicial")).toBeInTheDocument();
    });
  });

  it("should hide advanced options when collapse button is clicked", async () => {
    const user = userEvent.setup();
    render(<CreateTaskForm listId="list-1" />, { wrapper: createWrapper() });

    // Expand first
    const expandButton = screen.getByRole("button", { name: /mais opções/i });
    await user.click(expandButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Notas")).toBeInTheDocument();
    });

    // Then collapse
    const collapseButton = screen.getByRole("button", { name: /ocultar opções/i });
    await user.click(collapseButton);

    await waitFor(() => {
      expect(screen.queryByLabelText("Notas")).not.toBeInTheDocument();
    });
  });

  it("should submit task with title only", async () => {
    const user = userEvent.setup();
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    const mockCreateTask = {
      mutateAsync: mockMutateAsync,
      isPending: false,
    };

    vi.spyOn(mutations, "useCreateTask").mockReturnValue(mockCreateTask as any);

    render(<CreateTaskForm listId="list-1" />, { wrapper: createWrapper() });

    const titleInput = screen.getByPlaceholderText("Nova tarefa...");
    await user.type(titleInput, "New Task");

    const submitButton = screen.getByRole("button", { name: /adicionar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Task",
        })
      );
    });
  });

  it("should validate required title field", async () => {
    const user = userEvent.setup();
    render(<CreateTaskForm listId="list-1" />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole("button", { name: /adicionar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument();
    });
  });

  it("should reset form after successful submission", async () => {
    const user = userEvent.setup();
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    const mockCreateTask = {
      mutateAsync: mockMutateAsync,
      isPending: false,
    };

    vi.spyOn(mutations, "useCreateTask").mockReturnValue(mockCreateTask as any);

    render(<CreateTaskForm listId="list-1" />, { wrapper: createWrapper() });

    const titleInput = screen.getByPlaceholderText("Nova tarefa...") as HTMLInputElement;
    await user.type(titleInput, "New Task");
    await user.click(screen.getByRole("button", { name: /adicionar/i }));

    await waitFor(() => {
      expect(titleInput.value).toBe("");
    });
  });

  it("should have proper ARIA labels for accessibility", () => {
    render(<CreateTaskForm listId="list-1" />, { wrapper: createWrapper() });

    const form = screen.getByRole("form", { name: /formulário para criar nova tarefa/i });
    expect(form).toBeInTheDocument();
  });

  it("should support Ctrl+Enter keyboard shortcut to submit", async () => {
    const user = userEvent.setup();
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    const mockCreateTask = {
      mutateAsync: mockMutateAsync,
      isPending: false,
    };

    vi.spyOn(mutations, "useCreateTask").mockReturnValue(mockCreateTask as any);

    render(<CreateTaskForm listId="list-1" />, { wrapper: createWrapper() });

    const titleInput = screen.getByPlaceholderText("Nova tarefa...");
    await user.type(titleInput, "New Task");
    await user.keyboard("{Control>}{Enter}{/Control}");

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  it("should disable submit button while pending", () => {
    const mockCreateTask = {
      mutateAsync: vi.fn(),
      isPending: true,
    };

    vi.spyOn(mutations, "useCreateTask").mockReturnValue(mockCreateTask as any);

    render(<CreateTaskForm listId="list-1" />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole("button", { name: /criando/i });
    expect(submitButton).toBeDisabled();
  });
});
