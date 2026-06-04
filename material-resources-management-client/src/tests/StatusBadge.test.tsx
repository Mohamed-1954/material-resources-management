import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";

import { StatusBadge } from "@/components/data-display/StatusBadge";

describe("StatusBadge", () => {
  test("renders status with underscores replaced by spaces", () => {
    render(<StatusBadge status="UNDER_DEPARTMENT_REVIEW" />);
    expect(screen.getByText("UNDER DEPARTMENT REVIEW")).toBeInTheDocument();
  });

  test("renders any unknown status as default neutral", () => {
    render(<StatusBadge status="WHATEVER" />);
    expect(screen.getByText("WHATEVER")).toBeInTheDocument();
  });

  test("status text is the full label", () => {
    const { container } = render(<StatusBadge status="ACCEPTED" />);
    expect(container.textContent).toBe("ACCEPTED");
  });
});
