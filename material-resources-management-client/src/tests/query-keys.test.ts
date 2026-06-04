import { describe, expect, test } from "vitest";

import { needQueryKeys } from "@/features/needs/queries";
import { offerQueryKeys } from "@/features/offers/queries";
import { tenderQueryKeys } from "@/features/tenders/queries";

describe("query key factories", () => {
  test("needs lists/detail are stable structurally", () => {
    expect(needQueryKeys.all).toEqual(["needs"]);
    expect(needQueryKeys.lists()).toEqual(["needs", "list"]);
    expect(needQueryKeys.detail("abc")).toEqual(["needs", "detail", "abc"]);
  });

  test("offer keys partition by tender id for invalidation scope", () => {
    expect(offerQueryKeys.byTender("t1")).toEqual(["offers", "by-tender", "t1"]);
    expect(offerQueryKeys.byTender("t2")).not.toEqual(offerQueryKeys.byTender("t1"));
  });

  test("tender keys distinguish all from active", () => {
    expect(tenderQueryKeys.lists()).toEqual(["tenders", "list"]);
    expect(tenderQueryKeys.active()).toEqual(["tenders", "active"]);
    expect(tenderQueryKeys.lists()).not.toEqual(tenderQueryKeys.active());
  });
});
