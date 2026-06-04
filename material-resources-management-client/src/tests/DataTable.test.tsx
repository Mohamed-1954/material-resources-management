import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";

import { DataTable, type Column } from "@/components/data-display/DataTable";

interface Row {
  id: string;
  name: string;
}

const cols: Column<Row>[] = [
  { key: "name", header: "Name", render: (r) => r.name },
];

describe("DataTable", () => {
  test("renders rows with values", () => {
    render(
      <DataTable
        columns={cols}
        rows={[{ id: "1", name: "Alice" }]}
        rowKey={(r) => r.id}
      />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  test("shows empty state when no rows", () => {
    render(
      <DataTable
        columns={cols}
        rows={[]}
        rowKey={(r) => r.id}
        emptyMessage="Nothing here"
      />,
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  test("shows loading state", () => {
    render(
      <DataTable
        columns={cols}
        rows={[]}
        isLoading
        rowKey={(r) => r.id}
        emptyMessage="Empty"
      />,
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
