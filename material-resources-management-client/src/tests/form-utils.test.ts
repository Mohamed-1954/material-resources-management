import { describe, expect, test } from "vitest";

import { firstFieldError } from "@/lib/form-utils";

describe("firstFieldError", () => {
  test("returns null for an empty error array", () => {
    expect(firstFieldError([])).toBeNull();
  });

  test("returns the first string error", () => {
    expect(firstFieldError(["bad", "still bad"])).toBe("bad");
  });

  test("ignores empty strings and falls through to the next error", () => {
    expect(firstFieldError(["", { message: "actual error" }])).toBe("actual error");
  });

  test("extracts message from Valibot-shaped issue objects", () => {
    expect(firstFieldError([{ message: "must be a valid email", path: [] }])).toBe(
      "must be a valid email",
    );
  });

  test("returns null when errors have no usable shape", () => {
    expect(firstFieldError([null, undefined, 42, {}])).toBeNull();
  });
});
