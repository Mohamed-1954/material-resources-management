import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

const id = (name = 'id') => text(name).primaryKey()
const fk = (name: string) => text(name)
const ts = (name: string) =>
  timestamp(name, { withTimezone: true, mode: 'date' })

const baseTimestamps = {
  createdAt: ts('created_at').notNull().defaultNow(),
  updatedAt: ts('updated_at').notNull().defaultNow(),
}

// ---- Better Auth tables ----
export const user = pgTable(
  'user',
  {
    id: id(),
    email: text('email').notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    name: text('name'),
    image: text('image'),
    role: text('role').notNull().default('TEACHER'),
    status: text('status').notNull().default('ACTIVE'),
    departmentId: fk('department_id'),
    supplierId: fk('supplier_id'),
    ...baseTimestamps,
  },
  (t) => [
    uniqueIndex('user_email_idx').on(t.email),
    index('user_role_idx').on(t.role),
    index('user_department_idx').on(t.departmentId),
  ],
)

export const session = pgTable(
  'session',
  {
    id: id(),
    userId: fk('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    token: text('token').notNull(),
    expiresAt: ts('expires_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    ...baseTimestamps,
  },
  (t) => [
    uniqueIndex('session_token_idx').on(t.token),
    index('session_user_idx').on(t.userId),
    index('session_expires_idx').on(t.expiresAt),
  ],
)

export const account = pgTable(
  'account',
  {
    id: id(),
    userId: fk('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    password: text('password'),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: ts('access_token_expires_at'),
    refreshTokenExpiresAt: ts('refresh_token_expires_at'),
    scope: text('scope'),
    idToken: text('id_token'),
    ...baseTimestamps,
  },
  (t) => [
    index('account_user_idx').on(t.userId),
    uniqueIndex('account_provider_account_idx').on(t.providerId, t.accountId),
  ],
)

export const verification = pgTable(
  'verification',
  {
    id: id(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: ts('expires_at').notNull(),
    ...baseTimestamps,
  },
  (t) => [
    index('verification_identifier_idx').on(t.identifier),
    index('verification_expires_idx').on(t.expiresAt),
  ],
)

// ---- Domain tables ----
export const departments = pgTable(
  'departments',
  {
    id: id(),
    name: text('name').notNull(),
    code: text('code').notNull(),
    headUserId: fk('head_user_id'),
    ...baseTimestamps,
  },
  (t) => [
    uniqueIndex('departments_code_idx').on(t.code),
    index('departments_name_idx').on(t.name),
  ],
)

export const departmentMembers = pgTable(
  'department_members',
  {
    departmentId: fk('department_id')
      .notNull()
      .references(() => departments.id, { onDelete: 'cascade' }),
    userId: fk('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('MEMBER'),
    addedAt: ts('added_at').notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.departmentId, t.userId] }),
  ],
)

export const suppliers = pgTable(
  'suppliers',
  {
    id: id(),
    companyName: text('company_name').notNull(),
    location: text('location'),
    address: text('address'),
    website: text('website'),
    managerName: text('manager_name'),
    status: text('status').notNull().default('ACTIVE'),
    blacklistedAt: ts('blacklisted_at'),
    blacklistReason: text('blacklist_reason'),
    ownerUserId: fk('owner_user_id'),
    ...baseTimestamps,
  },
  (t) => [
    index('suppliers_name_idx').on(t.companyName),
    index('suppliers_status_idx').on(t.status),
  ],
)

export const needRequests = pgTable(
  'need_requests',
  {
    id: id(),
    departmentId: fk('department_id')
      .notNull()
      .references(() => departments.id, { onDelete: 'restrict' }),
    requestedByUserId: fk('requested_by_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    status: text('status').notNull().default('DRAFT'),
    notes: text('notes'),
    submittedAt: ts('submitted_at'),
    finalizedAt: ts('finalized_at'),
    sentToManagerAt: ts('sent_to_manager_at'),
    rejectedAt: ts('rejected_at'),
    rejectionReason: text('rejection_reason'),
    ...baseTimestamps,
  },
  (t) => [
    index('need_requests_dept_idx').on(t.departmentId),
    index('need_requests_status_idx').on(t.status),
  ],
)

export const needItems = pgTable(
  'need_items',
  {
    id: id(),
    needRequestId: fk('need_request_id')
      .notNull()
      .references(() => needRequests.id, { onDelete: 'cascade' }),
    resourceType: text('resource_type').notNull(),
    brand: text('brand'),
    cpu: text('cpu'),
    ram: text('ram'),
    disk: text('disk'),
    screen: text('screen'),
    printSpeed: text('print_speed'),
    resolution: text('resolution'),
    quantity: integer('quantity').notNull().default(1),
    justification: text('justification'),
    ...baseTimestamps,
  },
  (t) => [
    index('need_items_request_idx').on(t.needRequestId),
  ],
)

export const tenders = pgTable(
  'tenders',
  {
    id: id(),
    reference: text('reference').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').notNull().default('DRAFT'),
    startDate: text('start_date').notNull(),
    endDate: text('end_date').notNull(),
    publishedAt: ts('published_at'),
    closedAt: ts('closed_at'),
    awardedAt: ts('awarded_at'),
    cancelledAt: ts('cancelled_at'),
    awardedOfferId: fk('awarded_offer_id'),
    createdByUserId: fk('created_by_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    ...baseTimestamps,
  },
  (t) => [
    uniqueIndex('tenders_reference_idx').on(t.reference),
    index('tenders_status_idx').on(t.status),
    index('tenders_start_idx').on(t.startDate),
    index('tenders_end_idx').on(t.endDate),
  ],
)

export const tenderItems = pgTable(
  'tender_items',
  {
    id: id(),
    tenderId: fk('tender_id')
      .notNull()
      .references(() => tenders.id, { onDelete: 'cascade' }),
    resourceType: text('resource_type').notNull(),
    brand: text('brand'),
    specs: text('specs'),
    quantity: integer('quantity').notNull().default(1),
    sourceNeedItemId: fk('source_need_item_id'),
    ...baseTimestamps,
  },
  (t) => [
    index('tender_items_tender_idx').on(t.tenderId),
  ],
)

export const supplierOffers = pgTable(
  'supplier_offers',
  {
    id: id(),
    tenderId: fk('tender_id')
      .notNull()
      .references(() => tenders.id, { onDelete: 'restrict' }),
    supplierId: fk('supplier_id')
      .notNull()
      .references(() => suppliers.id, { onDelete: 'restrict' }),
    status: text('status').notNull().default('DRAFT'),
    totalPrice: numeric('total_price', { precision: 14, scale: 2 })
      .notNull()
      .default('0'),
    eliminationReason: text('elimination_reason'),
    rejectionReason: text('rejection_reason'),
    submittedAt: ts('submitted_at'),
    decidedAt: ts('decided_at'),
    decidedByUserId: fk('decided_by_user_id'),
    ...baseTimestamps,
  },
  (t) => [
    index('supplier_offers_tender_idx').on(t.tenderId),
    index('supplier_offers_supplier_idx').on(t.supplierId),
    index('supplier_offers_status_idx').on(t.status),
  ],
)

export const supplierOfferItems = pgTable(
  'supplier_offer_items',
  {
    id: id(),
    offerId: fk('offer_id')
      .notNull()
      .references(() => supplierOffers.id, { onDelete: 'cascade' }),
    tenderItemId: fk('tender_item_id'),
    resourceType: text('resource_type').notNull(),
    brand: text('brand').notNull(),
    unitPrice: numeric('unit_price', { precision: 14, scale: 2 }).notNull(),
    quantity: integer('quantity').notNull(),
    warrantyDurationMonths: integer('warranty_duration_months').notNull(),
    futureDeliveryDate: text('future_delivery_date').notNull(),
    technicalDetails: text('technical_details'),
    ...baseTimestamps,
  },
  (t) => [
    index('supplier_offer_items_offer_idx').on(t.offerId),
  ],
)

export const resources = pgTable(
  'resources',
  {
    id: id(),
    inventoryCode: text('inventory_code').notNull(),
    resourceType: text('resource_type').notNull(),
    brand: text('brand'),
    status: text('status').notNull().default('AVAILABLE'),
    supplierId: fk('supplier_id'),
    tenderId: fk('tender_id'),
    offerId: fk('offer_id'),
    deliveryDate: text('delivery_date'),
    warrantyEndDate: text('warranty_end_date'),
    ...baseTimestamps,
  },
  (t) => [
    uniqueIndex('resources_inventory_idx').on(t.inventoryCode),
    index('resources_status_idx').on(t.status),
    index('resources_type_idx').on(t.resourceType),
  ],
)

export const computerSpecs = pgTable('computer_specs', {
  resourceId: fk('resource_id')
    .primaryKey()
    .references(() => resources.id, { onDelete: 'cascade' }),
  cpu: text('cpu'),
  ram: text('ram'),
  disk: text('disk'),
  screen: text('screen'),
})

export const printerSpecs = pgTable('printer_specs', {
  resourceId: fk('resource_id')
    .primaryKey()
    .references(() => resources.id, { onDelete: 'cascade' }),
  printSpeed: text('print_speed'),
  resolution: text('resolution'),
})

export const resourceAssignments = pgTable(
  'resource_assignments',
  {
    id: id(),
    resourceId: fk('resource_id')
      .notNull()
      .references(() => resources.id, { onDelete: 'cascade' }),
    targetType: text('target_type').notNull(),
    assignedToUserId: fk('assigned_to_user_id'),
    assignedToDepartmentId: fk('assigned_to_department_id'),
    assignedByUserId: fk('assigned_by_user_id'),
    assignedAt: ts('assigned_at').notNull().defaultNow(),
    unassignedAt: ts('unassigned_at'),
    notes: text('notes'),
    active: boolean('active').notNull().default(true),
    ...baseTimestamps,
  },
  (t) => [
    index('resource_assignments_resource_idx').on(t.resourceId),
    index('resource_assignments_user_idx').on(t.assignedToUserId),
    index('resource_assignments_dept_idx').on(t.assignedToDepartmentId),
    index('resource_assignments_active_idx').on(t.active),
  ],
)

export const failureReports = pgTable(
  'failure_reports',
  {
    id: id(),
    resourceId: fk('resource_id')
      .notNull()
      .references(() => resources.id, { onDelete: 'restrict' }),
    reportedByUserId: fk('reported_by_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    technicianUserId: fk('technician_user_id'),
    status: text('status').notNull().default('REPORTED'),
    type: text('type'),
    frequency: text('frequency'),
    description: text('description').notNull(),
    reportedAt: ts('reported_at').notNull().defaultNow(),
    resolvedAt: ts('resolved_at'),
    severity: text('severity').notNull().default('NORMAL'),
    ...baseTimestamps,
  },
  (t) => [
    index('failures_resource_idx').on(t.resourceId),
    index('failures_status_idx').on(t.status),
    index('failures_technician_idx').on(t.technicianUserId),
  ],
)

export const technicalReports = pgTable('technical_reports', {
  id: id(),
  failureReportId: fk('failure_report_id')
    .notNull()
    .references(() => failureReports.id, { onDelete: 'cascade' }),
  technicianUserId: fk('technician_user_id').notNull(),
  explanation: text('explanation').notNull(),
  appearedAt: text('appeared_at').notNull(),
  frequency: text('frequency').notNull(),
  type: text('type').notNull(),
  ...baseTimestamps,
})

export const warrantyActions = pgTable('warranty_actions', {
  id: id(),
  failureReportId: fk('failure_report_id')
    .notNull()
    .references(() => failureReports.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  reason: text('reason'),
  decidedByUserId: fk('decided_by_user_id').notNull(),
  decidedAt: ts('decided_at').notNull().defaultNow(),
})

export const notifications = pgTable(
  'notifications',
  {
    id: id(),
    userId: fk('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    event: text('event').notNull(),
    message: text('message').notNull(),
    link: text('link'),
    read: boolean('read').notNull().default(false),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('notifications_user_idx').on(t.userId),
    index('notifications_read_idx').on(t.read),
  ],
)

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: id(),
    userId: fk('user_id'),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    oldValues: jsonb('old_values'),
    newValues: jsonb('new_values'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('audit_entity_idx').on(t.entityType, t.entityId),
    index('audit_user_idx').on(t.userId),
    index('audit_created_idx').on(t.createdAt),
  ],
)

// Re-export sql in case migrations need it
export { sql }
