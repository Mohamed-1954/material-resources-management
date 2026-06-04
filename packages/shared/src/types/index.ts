import type {
  AssignmentTarget,
  ErrorCode,
  FailureFrequency,
  FailureStatus,
  FailureType,
  NeedStatus,
  NotificationEvent,
  OfferStatus,
  ResourceStatus,
  ResourceType,
  Role,
  SupplierStatus,
  TenderStatus,
} from '../constants/index.ts'

export interface ApiSuccess<T> {
  data: T
  meta?: {
    page?: number
    pageSize?: number
    total?: number
  }
}

export interface ApiError {
  error: {
    code: ErrorCode
    message: string
    details?: unknown
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: Role
  departmentId: string | null
  supplierId: string | null
}

export interface DepartmentDto {
  id: string
  name: string
  code: string
  headUserId: string | null
  /** Resolved on the server for display in list views. */
  headName: string | null
  headEmail: string | null
  memberCount: number
  createdAt: string
  updatedAt: string
}

export interface UserDto {
  id: string
  email: string
  name: string | null
  role: Role
  status: 'ACTIVE' | 'INACTIVE'
  departmentId: string | null
  supplierId: string | null
  createdAt: string
}

export interface SupplierDto {
  id: string
  companyName: string
  location: string | null
  address: string | null
  website: string | null
  managerName: string | null
  status: SupplierStatus
  blacklistedAt: string | null
  blacklistReason: string | null
  createdAt: string
}

export interface NeedRequestDto {
  id: string
  departmentId: string
  requestedByUserId: string
  status: NeedStatus
  notes: string | null
  createdAt: string
  updatedAt: string
  items: NeedItemDto[]
}

export interface NeedItemDto {
  id: string
  needRequestId: string
  resourceType: ResourceType
  brand: string | null
  cpu: string | null
  ram: string | null
  disk: string | null
  screen: string | null
  printSpeed: string | null
  resolution: string | null
  quantity: number
  justification: string | null
}

export interface TenderDto {
  id: string
  reference: string
  title: string
  description: string | null
  status: TenderStatus
  startDate: string
  endDate: string
  publishedAt: string | null
  closedAt: string | null
  awardedAt: string | null
  createdAt: string
  items: TenderItemDto[]
}

export interface TenderItemDto {
  id: string
  tenderId: string
  resourceType: ResourceType
  brand: string | null
  specs: string | null
  quantity: number
}

export interface SupplierOfferDto {
  id: string
  tenderId: string
  supplierId: string
  status: OfferStatus
  totalPrice: number
  eliminationReason: string | null
  rejectionReason: string | null
  submittedAt: string | null
  createdAt: string
  items: SupplierOfferItemDto[]
}

export interface SupplierOfferItemDto {
  id: string
  offerId: string
  tenderItemId: string | null
  resourceType: ResourceType
  brand: string
  unitPrice: number
  quantity: number
  warrantyDurationMonths: number
  futureDeliveryDate: string
  technicalDetails: string | null
}

export interface ResourceDto {
  id: string
  inventoryCode: string
  resourceType: ResourceType
  brand: string | null
  status: ResourceStatus
  supplierId: string | null
  tenderId: string | null
  offerId: string | null
  deliveryDate: string | null
  warrantyEndDate: string | null
  computerSpecs: ComputerSpecsDto | null
  printerSpecs: PrinterSpecsDto | null
  createdAt: string
}

export interface ComputerSpecsDto {
  cpu: string | null
  ram: string | null
  disk: string | null
  screen: string | null
}

export interface PrinterSpecsDto {
  printSpeed: string | null
  resolution: string | null
}

export interface ResourceAssignmentDto {
  id: string
  resourceId: string
  targetType: AssignmentTarget
  assignedToUserId: string | null
  assignedToDepartmentId: string | null
  assignedAt: string
  unassignedAt: string | null
  notes: string | null
}

export interface FailureReportDto {
  id: string
  resourceId: string
  reportedByUserId: string
  status: FailureStatus
  type: FailureType | null
  frequency: FailureFrequency | null
  description: string
  reportedAt: string
  technicianUserId: string | null
  resolvedAt: string | null
}

export interface TechnicalReportDto {
  id: string
  failureReportId: string
  technicianUserId: string
  explanation: string
  appearedAt: string
  frequency: FailureFrequency
  type: FailureType
  createdAt: string
}

export interface NotificationDto {
  id: string
  userId: string
  event: NotificationEvent
  message: string
  read: boolean
  createdAt: string
  link: string | null
}

export interface AuditLogDto {
  id: string
  userId: string | null
  /** Resolved on the server for display. Falls back to email if name is missing. */
  userName: string | null
  userEmail: string | null
  action: string
  entityType: string
  entityId: string | null
  /**
   * Server-resolved human label for the entity, e.g. a tender reference or a
   * department code. Falls back to entityId when no resolver matched.
   */
  entityLabel: string | null
  oldValues: unknown
  newValues: unknown
  createdAt: string
}
