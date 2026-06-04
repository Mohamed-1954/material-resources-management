import * as v from 'valibot'

import {
  ALL_ROLES,
  FAILURE_FREQUENCY,
  FAILURE_TYPE,
  RESOURCE_TYPES,
} from '../constants/index.ts'

const nonEmpty = (label: string) =>
  v.pipe(v.string(), v.trim(), v.minLength(1, `${label} is required`))

const optionalNullable = <S extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
  schema: S,
) => v.optional(v.nullable(schema))

// --- Auth ---
export const SignInSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email('Invalid email')),
  password: v.pipe(v.string(), v.minLength(8, 'At least 8 characters')),
})
export type SignInInput = v.InferOutput<typeof SignInSchema>

export const SignUpSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email('Invalid email')),
  password: v.pipe(v.string(), v.minLength(8, 'At least 8 characters')),
  name: nonEmpty('Name'),
})
export type SignUpInput = v.InferOutput<typeof SignUpSchema>

export const SupplierRegisterSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email('Invalid email')),
  password: v.pipe(v.string(), v.minLength(8, 'At least 8 characters')),
  name: nonEmpty('Contact name'),
  companyName: nonEmpty('Company name'),
  location: optionalNullable(v.string()),
  address: optionalNullable(v.string()),
  website: optionalNullable(v.string()),
  managerName: optionalNullable(v.string()),
})
export type SupplierRegisterInput = v.InferOutput<typeof SupplierRegisterSchema>

// --- Departments ---
export const DepartmentCreateSchema = v.object({
  name: nonEmpty('Department name'),
  code: v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(16)),
})
export type DepartmentCreateInput = v.InferOutput<typeof DepartmentCreateSchema>

export const DepartmentUpdateSchema = v.partial(DepartmentCreateSchema)

export const DepartmentUserSchema = v.object({
  userId: nonEmpty('User'),
})
export type DepartmentUserInput = v.InferOutput<typeof DepartmentUserSchema>

// --- Users ---
export const UserCreateSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email()),
  name: nonEmpty('Name'),
  role: v.picklist(ALL_ROLES),
  departmentId: optionalNullable(v.string()),
  password: v.pipe(v.string(), v.minLength(8)),
})
export type UserCreateInput = v.InferOutput<typeof UserCreateSchema>

export const UserUpdateSchema = v.object({
  name: v.optional(nonEmpty('Name')),
  role: v.optional(v.picklist(ALL_ROLES)),
  status: v.optional(v.picklist(['ACTIVE', 'INACTIVE'])),
  departmentId: optionalNullable(v.string()),
})

export const UserRoleUpdateSchema = v.object({
  role: v.picklist(ALL_ROLES),
})
export type UserRoleUpdateInput = v.InferOutput<typeof UserRoleUpdateSchema>

export const UserStatusUpdateSchema = v.object({
  status: v.picklist(['ACTIVE', 'INACTIVE']),
})
export type UserStatusUpdateInput = v.InferOutput<typeof UserStatusUpdateSchema>

// --- Needs ---
const ComputerNeedItemSchema = v.object({
  resourceType: v.literal(RESOURCE_TYPES.COMPUTER),
  brand: optionalNullable(v.string()),
  cpu: optionalNullable(v.string()),
  ram: optionalNullable(v.string()),
  disk: optionalNullable(v.string()),
  screen: optionalNullable(v.string()),
  quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
  justification: optionalNullable(v.string()),
})

const PrinterNeedItemSchema = v.object({
  resourceType: v.literal(RESOURCE_TYPES.PRINTER),
  brand: optionalNullable(v.string()),
  printSpeed: optionalNullable(v.string()),
  resolution: optionalNullable(v.string()),
  quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
  justification: optionalNullable(v.string()),
})

export const NeedItemSchema = v.variant('resourceType', [
  ComputerNeedItemSchema,
  PrinterNeedItemSchema,
])
export type NeedItemInput = v.InferOutput<typeof NeedItemSchema>

export const NeedCreateSchema = v.object({
  notes: optionalNullable(v.string()),
  items: v.pipe(v.array(NeedItemSchema), v.minLength(1, 'At least one item required')),
})
export type NeedCreateInput = v.InferOutput<typeof NeedCreateSchema>

// --- Tenders ---
export const TenderCreateSchema = v.object({
  reference: nonEmpty('Reference'),
  title: nonEmpty('Title'),
  description: optionalNullable(v.string()),
  startDate: v.pipe(v.string(), v.isoDate()),
  endDate: v.pipe(v.string(), v.isoDate()),
})
export type TenderCreateInput = v.InferOutput<typeof TenderCreateSchema>

export const TenderUpdateSchema = v.partial(
  v.object({
    title: nonEmpty('Title'),
    description: optionalNullable(v.string()),
    startDate: v.pipe(v.string(), v.isoDate()),
    endDate: v.pipe(v.string(), v.isoDate()),
  }),
)
export type TenderUpdateInput = v.InferOutput<typeof TenderUpdateSchema>

export const TenderItemSchema = v.object({
  resourceType: v.picklist(Object.values(RESOURCE_TYPES)),
  brand: optionalNullable(v.string()),
  specs: optionalNullable(v.string()),
  quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
})
export type TenderItemInput = v.InferOutput<typeof TenderItemSchema>

export const TenderIncludeNeedsSchema = v.object({
  needRequestIds: v.pipe(
    v.array(nonEmpty('Need request')),
    v.minLength(1, 'At least one need request is required'),
  ),
})
export type TenderIncludeNeedsInput = v.InferOutput<typeof TenderIncludeNeedsSchema>

// --- Suppliers ---
export const SupplierUpdateSchema = v.object({
  companyName: v.optional(nonEmpty('Company')),
  location: optionalNullable(v.string()),
  address: optionalNullable(v.string()),
  website: optionalNullable(v.string()),
  managerName: optionalNullable(v.string()),
})

export const SupplierBlacklistSchema = v.object({
  reason: nonEmpty('Reason'),
})

export const SupplierLinkSchema = v.object({
  supplierId: nonEmpty('Supplier'),
})
export type SupplierLinkInput = v.InferOutput<typeof SupplierLinkSchema>

// --- Offers ---
export const OfferItemSchema = v.object({
  tenderItemId: optionalNullable(v.string()),
  resourceType: v.picklist(Object.values(RESOURCE_TYPES)),
  brand: nonEmpty('Brand'),
  unitPrice: v.pipe(v.number(), v.minValue(0)),
  quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
  warrantyDurationMonths: v.pipe(v.number(), v.integer(), v.minValue(1)),
  futureDeliveryDate: v.pipe(v.string(), v.isoDate()),
  technicalDetails: optionalNullable(v.string()),
})
export type OfferItemInput = v.InferOutput<typeof OfferItemSchema>

export const OfferCreateSchema = v.object({
  items: v.pipe(v.array(OfferItemSchema), v.minLength(1)),
})
export type OfferCreateInput = v.InferOutput<typeof OfferCreateSchema>

export const OfferEliminateSchema = v.object({
  reason: nonEmpty('Reason'),
})

export const OfferRejectSchema = v.object({
  reason: nonEmpty('Reason'),
})

// --- Resources / delivery ---
export const ResourceDeliverySchema = v.object({
  offerId: nonEmpty('Offer'),
  deliveryDate: v.pipe(v.string(), v.isoDate()),
  resources: v.pipe(
    v.array(
      v.object({
        resourceType: v.picklist(Object.values(RESOURCE_TYPES)),
        brand: optionalNullable(v.string()),
        cpu: optionalNullable(v.string()),
        ram: optionalNullable(v.string()),
        disk: optionalNullable(v.string()),
        screen: optionalNullable(v.string()),
        printSpeed: optionalNullable(v.string()),
        resolution: optionalNullable(v.string()),
        warrantyEndDate: v.pipe(v.string(), v.isoDate()),
      }),
    ),
    v.minLength(1),
  ),
})
export type ResourceDeliveryInput = v.InferOutput<typeof ResourceDeliverySchema>

// --- Assignments ---
export const ResourceAssignSchema = v.union([
  v.object({
    targetType: v.literal('USER'),
    userId: nonEmpty('User'),
    notes: optionalNullable(v.string()),
  }),
  v.object({
    targetType: v.literal('DEPARTMENT'),
    departmentId: nonEmpty('Department'),
    notes: optionalNullable(v.string()),
  }),
])
export type ResourceAssignInput = v.InferOutput<typeof ResourceAssignSchema>

// --- Failures / maintenance ---
export const FailureCreateSchema = v.object({
  resourceId: nonEmpty('Resource'),
  description: nonEmpty('Description'),
  type: v.optional(v.picklist(Object.values(FAILURE_TYPE))),
  frequency: v.optional(v.picklist(Object.values(FAILURE_FREQUENCY))),
})
export type FailureCreateInput = v.InferOutput<typeof FailureCreateSchema>

export const TechnicalReportSchema = v.object({
  explanation: nonEmpty('Explanation'),
  appearedAt: v.pipe(v.string(), v.isoDate()),
  frequency: v.picklist(Object.values(FAILURE_FREQUENCY)),
  type: v.picklist(Object.values(FAILURE_TYPE)),
})
export type TechnicalReportInput = v.InferOutput<typeof TechnicalReportSchema>

export const AssignTechnicianSchema = v.object({
  technicianUserId: v.optional(nonEmpty('Technician')),
})
export type AssignTechnicianInput = v.InferOutput<typeof AssignTechnicianSchema>
