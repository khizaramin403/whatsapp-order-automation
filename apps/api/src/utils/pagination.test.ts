import { describe, it, expect } from "vitest";
import { parsePagination, buildPaginationMeta } from "./pagination";

describe("Pagination Helper", () => {
  describe("parsePagination", () => {
    it("uses default values when query is empty or undefined", () => {
      const result = parsePagination({});
      expect(result).toEqual({
        page: 1,
        pageSize: 20,
        skip: 0,
        take: 20,
      });
    });

    it("parses valid page and pageSize numbers", () => {
      const result = parsePagination({ page: "3", pageSize: "15" });
      expect(result).toEqual({
        page: 3,
        pageSize: 15,
        skip: 30, // (3 - 1) * 15
        take: 15,
      });
    });

    it("caps pageSize to maximum 100", () => {
      const result = parsePagination({ page: "1", pageSize: "250" });
      expect(result.pageSize).toBe(100);
      expect(result.take).toBe(100);
    });

    it("handles zero, negative and non-numeric inputs gracefully", () => {
      const result = parsePagination({ page: "-5", pageSize: "abc" });
      expect(result).toEqual({
        page: 1,
        pageSize: 20,
        skip: 0,
        take: 20,
      });
    });
  });

  describe("buildPaginationMeta", () => {
    it("builds correct metadata for multi-page results", () => {
      const meta = buildPaginationMeta(2, 20, 55);
      expect(meta).toEqual({
        page: 2,
        pageSize: 20,
        total: 55,
        totalPages: 3,
      });
    });

    it("handles zero total count gracefully", () => {
      const meta = buildPaginationMeta(1, 20, 0);
      expect(meta).toEqual({
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      });
    });

    it("handles negative total count gracefully", () => {
      const meta = buildPaginationMeta(1, 20, -10);
      expect(meta.total).toBe(0);
      expect(meta.totalPages).toBe(0);
    });
  });
});
