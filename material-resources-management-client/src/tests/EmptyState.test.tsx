import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorCard } from "@/components/feedback/ErrorCard";

describe("EmptyState", () => {
  test("renders title and description", () => {
    render(
      <EmptyState
        title="No tenders"
        description="Try again later or check filters."
      />,
    );
    expect(screen.getByText("No tenders")).toBeInTheDocument();
    expect(
      screen.getByText("Try again later or check filters."),
    ).toBeInTheDocument();
  });
});

describe("ErrorCard", () => {
  test("uses role=alert for assistive tech", () => {
    render(<ErrorCard message="Network error" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Network error");
  });
});
