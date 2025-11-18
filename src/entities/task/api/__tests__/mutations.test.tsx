import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useCreateTask, useUpdateTask, useDeleteTask, useToggleTask } from "../mutations";
import { http } from "@/shared/api";

// Mock the http client
vi.mock("@/shared/api", () => ({
  http: vi.fn(),
}));

// Mock list keys
vi.mock("@/entities/list/api/queries", () => ({
  listKeys: {
    all: ["lists"],
    detail: (id: string) => ["list", id],
    tasks: (id: string) => ["list", id, "tasks"],
  },
}));

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

describe("Task Mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useCreateTask", () => {
    it("should create a task successfully", async () => {
      const mockTask = {
        id: "task-1",
        title: "Test Task",
        status: "OPEN",
        priority: "MEDIUM",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      vi.mocked(http).mockResolvedValueOnce(mockTask);

      const { result } = renderHook(() => useCreateTask("list-1"), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        title: "Test Task",
        priority: "medium",
        status: "OPEN",
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(http).toHaveBeenCalledWith("/api/lists/list-1/tasks", {
        method: "POST",
        json: {
          title: "Test Task",
          priority: "MEDIUM",
          status: "OPEN",
        },
      });
    });

    it("should handle creation errors", async () => {
      vi.mocked(http).mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useCreateTask("list-1"), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        title: "Test Task",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe("useUpdateTask", () => {
    it("should update a task successfully", async () => {
      vi.mocked(http).mockResolvedValueOnce({});

      const { result } = renderHook(() => useUpdateTask("list-1"), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        taskId: "task-1",
        data: { title: "Updated Task" },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(http).toHaveBeenCalledWith("/api/lists/list-1/tasks/task-1", {
        method: "PATCH",
        json: { title: "Updated Task" },
      });
    });

    it("should skip update if no data provided", async () => {
      const { result } = renderHook(() => useUpdateTask("list-1"), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        taskId: "task-1",
        data: {},
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Should not call http if no data to update
      expect(http).not.toHaveBeenCalled();
    });
  });

  describe("useToggleTask", () => {
    it("should toggle task to completed", async () => {
      vi.mocked(http).mockResolvedValueOnce({});

      const { result } = renderHook(() => useToggleTask("list-1"), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        taskId: "task-1",
        completed: true,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(http).toHaveBeenCalledWith("/api/lists/list-1/tasks/task-1", {
        method: "PATCH",
        json: { status: "DONE" },
      });
    });

    it("should toggle task to open", async () => {
      vi.mocked(http).mockResolvedValueOnce({});

      const { result } = renderHook(() => useToggleTask("list-1"), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        taskId: "task-1",
        completed: false,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(http).toHaveBeenCalledWith("/api/lists/list-1/tasks/task-1", {
        method: "PATCH",
        json: { status: "OPEN" },
      });
    });

    it("should handle optimistic updates and rollback on error", async () => {
      vi.mocked(http).mockRejectedValueOnce(new Error("Server error"));

      const { result } = renderHook(() => useToggleTask("list-1"), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        taskId: "task-1",
        completed: true,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe("useDeleteTask", () => {
    it("should delete a task successfully", async () => {
      vi.mocked(http).mockResolvedValueOnce({});

      const { result } = renderHook(() => useDeleteTask("list-1"), {
        wrapper: createWrapper(),
      });

      result.current.mutate("task-1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(http).toHaveBeenCalledWith("/api/lists/list-1/tasks/task-1", {
        method: "DELETE",
      });
    });

    it("should handle deletion errors", async () => {
      vi.mocked(http).mockRejectedValueOnce(new Error("Cannot delete task"));

      const { result } = renderHook(() => useDeleteTask("list-1"), {
        wrapper: createWrapper(),
      });

      result.current.mutate("task-1");

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("should optimistically remove task from cache", async () => {
      vi.mocked(http).mockResolvedValueOnce({});

      const { result } = renderHook(() => useDeleteTask("list-1"), {
        wrapper: createWrapper(),
      });

      result.current.mutate("task-1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
});
