import { describe, expect, test } from "vitest";

import { PERMISSIONS, ROLES } from "@frms/shared";

import { userHasPermission, userHasRole } from "../lib/permissions";

const teacher = {
  id: "u1",
  email: "t@x.com",
  name: null,
  role: ROLES.TEACHER,
  departmentId: "d1",
  supplierId: null,
};

const supplier = {
  id: "u2",
  email: "s@x.com",
  name: null,
  role: ROLES.SUPPLIER,
  departmentId: null,
  supplierId: "sup1",
};

describe("client permission helpers", () => {
  test("teacher can create own needs", () => {
    expect(userHasPermission(teacher, PERMISSIONS.NEED_CREATE_OWN)).toBe(true);
  });

  test("teacher cannot manage tenders", () => {
    expect(userHasPermission(teacher, PERMISSIONS.TENDER_MANAGE)).toBe(false);
  });

  test("supplier can submit own offer", () => {
    expect(userHasPermission(supplier, PERMISSIONS.OFFER_CREATE_OWN)).toBe(true);
  });

  test("anonymous user has no permissions", () => {
    expect(userHasPermission(null, PERMISSIONS.NEED_CREATE_OWN)).toBe(false);
  });

  test("userHasRole respects allowed list", () => {
    expect(userHasRole(teacher, [ROLES.TEACHER, ROLES.ADMIN])).toBe(true);
    expect(userHasRole(supplier, [ROLES.TEACHER, ROLES.ADMIN])).toBe(false);
  });
});
