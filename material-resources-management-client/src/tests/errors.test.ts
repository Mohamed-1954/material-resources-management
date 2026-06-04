import { describe, expect, test } from "vitest";

import { ApiHttpError } from "@/lib/api-client";
import {
  getErrorMessage,
  isForbidden,
  isNotFound,
  isUnauthorized,
} from "@/lib/errors";

describe("getErrorMessage", () => {
  test("returns ApiHttpError message", () => {
    const err = new ApiHttpError(422, "BUSINESS_RULE_VIOLATION", "Invalid printer field");
    expect(getErrorMessage(err)).toBe("Invalid printer field");
  });

  test("falls back when error has no message", () => {
    expect(getErrorMessage(new Error(""), "Default")).toBe("Default");
  });

  test("uses fallback for non-error values", () => {
    expect(getErrorMessage(undefined, "Boom")).toBe("Boom");
    expect(getErrorMessage("x", "Boom")).toBe("Boom");
  });
});

describe("status helpers", () => {
  test("isForbidden recognises 403", () => {
    expect(isForbidden(new ApiHttpError(403, "FORBIDDEN", "Nope"))).toBe(true);
    expect(isForbidden(new ApiHttpError(401, "UNAUTHORIZED", "Nope"))).toBe(false);
  });

  test("isUnauthorized recognises 401", () => {
    expect(isUnauthorized(new ApiHttpError(401, "UNAUTHORIZED", "x"))).toBe(true);
  });

  test("isNotFound recognises 404", () => {
    expect(isNotFound(new ApiHttpError(404, "NOT_FOUND", "x"))).toBe(true);
  });
});
