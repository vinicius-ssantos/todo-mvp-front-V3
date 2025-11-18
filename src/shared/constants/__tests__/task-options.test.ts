import { describe, it, expect } from "vitest";
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "../task-options";

describe("Task Options Constants", () => {
  describe("TASK_PRIORITY_OPTIONS", () => {
    it("should have 3 priority levels", () => {
      expect(TASK_PRIORITY_OPTIONS).toHaveLength(3);
    });

    it("should include low, medium, and high priorities", () => {
      const values = TASK_PRIORITY_OPTIONS.map((opt) => opt.value);
      expect(values).toEqual(["low", "medium", "high"]);
    });

    it("should have Portuguese labels", () => {
      const labels = TASK_PRIORITY_OPTIONS.map((opt) => opt.label);
      expect(labels).toEqual(["Baixa", "Média", "Alta"]);
    });
  });

  describe("TASK_STATUS_OPTIONS", () => {
    it("should have 5 lifecycle statuses", () => {
      expect(TASK_STATUS_OPTIONS).toHaveLength(5);
    });

    it("should include all lifecycle statuses", () => {
      const values = TASK_STATUS_OPTIONS.map((opt) => opt.value);
      expect(values).toEqual(["OPEN", "IN_PROGRESS", "DONE", "BLOCKED", "ARCHIVED"]);
    });

    it("should have Portuguese labels", () => {
      const labels = TASK_STATUS_OPTIONS.map((opt) => opt.label);
      expect(labels).toEqual(["Aberta", "Em progresso", "Concluída", "Bloqueada", "Arquivada"]);
    });

    it("each option should have value and label properties", () => {
      TASK_STATUS_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty("value");
        expect(option).toHaveProperty("label");
        expect(typeof option.value).toBe("string");
        expect(typeof option.label).toBe("string");
      });
    });
  });
});
