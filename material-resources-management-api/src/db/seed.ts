import { and, eq } from 'drizzle-orm'

import { ROLES } from '@frms/shared'

import { auth } from '../auth/auth.ts'
import { newId } from '../shared/audit.ts'
import { db } from './client.ts'
import {
  computerSpecs,
  departments,
  failureReports,
  needItems,
  needRequests,
  notifications,
  printerSpecs,
  resourceAssignments,
  resources,
  supplierOfferItems,
  supplierOffers,
  suppliers,
  technicalReports,
  tenderItems,
  tenders,
  user as userTable,
} from './schema.ts'

interface SeedUser {
  email: string
  password: string
  name: string
  role: keyof typeof ROLES
  departmentCode?: string
  companyName?: string
}

const seedUsers: SeedUser[] = [
  { email: 'admin@faculty.local', password: 'changeme123', name: 'System Admin', role: 'ADMIN' },
  {
    email: 'manager@faculty.local',
    password: 'changeme123',
    name: 'Resource Manager',
    role: 'RESOURCE_MANAGER',
  },
  {
    email: 'cs.head@faculty.local',
    password: 'changeme123',
    name: 'Computer Science Head',
    role: 'DEPARTMENT_HEAD',
    departmentCode: 'CS',
  },
  {
    email: 'teacher@faculty.local',
    password: 'changeme123',
    name: 'Jane Teacher',
    role: 'TEACHER',
    departmentCode: 'CS',
  },
  {
    email: 'tech@faculty.local',
    password: 'changeme123',
    name: 'Maintenance Tech',
    role: 'MAINTENANCE_TECHNICIAN',
  },
  {
    email: 'supplier@faculty.local',
    password: 'changeme123',
    name: 'Acme Supplier Sales',
    role: 'SUPPLIER',
    companyName: 'Acme Hardware',
  },
  // --- extended cast: heads, additional teachers, second supplier, second technician
  {
    email: 'math.head@faculty.local',
    password: 'changeme123',
    name: 'Math Department Head',
    role: 'DEPARTMENT_HEAD',
    departmentCode: 'MATH',
  },
  {
    email: 'phys.head@faculty.local',
    password: 'changeme123',
    name: 'Physics Department Head',
    role: 'DEPARTMENT_HEAD',
    departmentCode: 'PHYS',
  },
  {
    email: 'teacher2@faculty.local',
    password: 'changeme123',
    name: 'Marc Robles',
    role: 'TEACHER',
    departmentCode: 'CS',
  },
  {
    email: 'teacher3@faculty.local',
    password: 'changeme123',
    name: 'Amina Chen',
    role: 'TEACHER',
    departmentCode: 'CS',
  },
  {
    email: 'math.teacher@faculty.local',
    password: 'changeme123',
    name: 'Sofia Bellini',
    role: 'TEACHER',
    departmentCode: 'MATH',
  },
  {
    email: 'phys.teacher@faculty.local',
    password: 'changeme123',
    name: 'Hugo Marchetti',
    role: 'TEACHER',
    departmentCode: 'PHYS',
  },
  {
    email: 'tech2@faculty.local',
    password: 'changeme123',
    name: 'Diego Martinez',
    role: 'MAINTENANCE_TECHNICIAN',
  },
  {
    email: 'supplier2@faculty.local',
    password: 'changeme123',
    name: 'Bluechip Sales',
    role: 'SUPPLIER',
    companyName: 'Bluechip Tech',
  },
]

async function ensureDepartments() {
  const data = [
    { code: 'CS', name: 'Computer Science' },
    { code: 'MATH', name: 'Mathematics' },
    { code: 'PHYS', name: 'Physics' },
    { code: 'ADMIN', name: 'Administration' },
    { code: 'ELEC', name: 'Electronics' },
    { code: 'MECH', name: 'Mechanical Engineering' },
  ]
  for (const d of data) {
    const existing = await db.select().from(departments).where(eq(departments.code, d.code)).limit(1)
    if (existing.length === 0) {
      await db.insert(departments).values({ id: newId(), code: d.code, name: d.name })
    }
  }
}

async function ensureUsers() {
  for (const su of seedUsers) {
    const existing = await db.select().from(userTable).where(eq(userTable.email, su.email)).limit(1)
    let userId: string
    if (existing.length > 0) {
      userId = existing[0]!.id
    } else {
      const created = await auth.api.signUpEmail({
        body: { email: su.email, password: su.password, name: su.name },
      })
      userId = created.user.id
    }
    let supplierId: string | null = null
    let departmentId: string | null = null
    if (su.companyName) {
      const sup = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.companyName, su.companyName))
        .limit(1)
      if (sup.length === 0) {
        supplierId = newId()
        await db.insert(suppliers).values({
          id: supplierId,
          companyName: su.companyName,
          status: 'ACTIVE',
          ownerUserId: userId,
          location: su.companyName === 'Acme Hardware' ? 'Casablanca, MA' : 'Lyon, FR',
          website:
            su.companyName === 'Acme Hardware'
              ? 'https://acme-hardware.example'
              : 'https://bluechip-tech.example',
          managerName:
            su.companyName === 'Acme Hardware' ? 'Acme Sales Lead' : 'Bluechip Sales Lead',
        })
      } else {
        supplierId = sup[0]!.id
      }
    }
    if (su.departmentCode) {
      const dept = await db
        .select()
        .from(departments)
        .where(eq(departments.code, su.departmentCode))
        .limit(1)
      departmentId = dept[0]?.id ?? null
    }
    await db
      .update(userTable)
      .set({
        role: ROLES[su.role],
        supplierId,
        departmentId,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userId))

    if (su.role === 'DEPARTMENT_HEAD' && departmentId) {
      await db.update(departments).set({ headUserId: userId }).where(eq(departments.id, departmentId))
    }
  }
}

async function getUserId(email: string): Promise<string> {
  const rows = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1)
  if (!rows[0]) throw new Error(`Seed user missing: ${email}`)
  return rows[0].id
}

async function getDepartmentId(code: string): Promise<string> {
  const rows = await db.select().from(departments).where(eq(departments.code, code)).limit(1)
  if (!rows[0]) throw new Error(`Seed department missing: ${code}`)
  return rows[0].id
}

async function getSupplierId(companyName: string): Promise<string> {
  const rows = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.companyName, companyName))
    .limit(1)
  if (!rows[0]) throw new Error(`Seed supplier missing: ${companyName}`)
  return rows[0].id
}

const inDays = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

interface ResourceSeed {
  inventoryCode: string
  resourceType: 'COMPUTER' | 'PRINTER'
  brand: string
  supplierCompany?: string
  status?:
    | 'AVAILABLE'
    | 'ASSIGNED'
    | 'UNDER_MAINTENANCE'
    | 'SENT_TO_SUPPLIER'
    | 'RETIRED'
  deliveryDaysAgo?: number
  warrantyDaysFromNow?: number
  specs:
    | { cpu: string; ram: string; disk: string; screen: string }
    | { printSpeed: string; resolution: string }
}

const RESOURCE_SEED: ResourceSeed[] = [
  // CS workstations
  {
    inventoryCode: 'CS-PC-0001',
    resourceType: 'COMPUTER',
    brand: 'Dell',
    specs: { cpu: 'Intel i7-13700', ram: '32 GB DDR5', disk: '1 TB NVMe', screen: '24" 1440p' },
  },
  {
    inventoryCode: 'CS-PC-0002',
    resourceType: 'COMPUTER',
    brand: 'HP',
    specs: { cpu: 'AMD Ryzen 7 7700', ram: '16 GB DDR5', disk: '512 GB NVMe', screen: '24" 1080p' },
  },
  {
    inventoryCode: 'CS-PC-0003',
    resourceType: 'COMPUTER',
    brand: 'Dell',
    specs: { cpu: 'Intel i7-13700', ram: '32 GB DDR5', disk: '1 TB NVMe', screen: '27" 1440p' },
  },
  {
    inventoryCode: 'CS-PC-0004',
    resourceType: 'COMPUTER',
    brand: 'Lenovo',
    specs: { cpu: 'Intel i5-13500', ram: '16 GB DDR4', disk: '512 GB NVMe', screen: '24" 1080p' },
  },
  {
    inventoryCode: 'CS-PC-0005',
    resourceType: 'COMPUTER',
    brand: 'HP',
    specs: { cpu: 'AMD Ryzen 5 7600', ram: '16 GB DDR5', disk: '512 GB NVMe', screen: '24" 1080p' },
  },
  // Older CS computer that is under maintenance
  {
    inventoryCode: 'CS-PC-0006',
    resourceType: 'COMPUTER',
    brand: 'Dell',
    status: 'UNDER_MAINTENANCE',
    deliveryDaysAgo: 720,
    warrantyDaysFromNow: 10,
    specs: { cpu: 'Intel i5-11500', ram: '16 GB DDR4', disk: '512 GB NVMe', screen: '24" 1080p' },
  },
  // CS printer
  {
    inventoryCode: 'CS-PR-0001',
    resourceType: 'PRINTER',
    brand: 'Brother',
    specs: { printSpeed: '35 ppm', resolution: '1200x1200 dpi' },
  },
  {
    inventoryCode: 'CS-PR-0002',
    resourceType: 'PRINTER',
    brand: 'HP',
    specs: { printSpeed: '28 ppm', resolution: '1200x1200 dpi' },
  },
  // Math
  {
    inventoryCode: 'MATH-PC-0001',
    resourceType: 'COMPUTER',
    brand: 'Lenovo',
    specs: { cpu: 'Intel i5-13500', ram: '16 GB DDR4', disk: '512 GB NVMe', screen: '23" 1080p' },
  },
  {
    inventoryCode: 'MATH-PC-0002',
    resourceType: 'COMPUTER',
    brand: 'Lenovo',
    specs: { cpu: 'Intel i5-13500', ram: '16 GB DDR4', disk: '512 GB NVMe', screen: '23" 1080p' },
  },
  {
    inventoryCode: 'MATH-PR-0001',
    resourceType: 'PRINTER',
    brand: 'Brother',
    specs: { printSpeed: '35 ppm', resolution: '1200x1200 dpi' },
  },
  // Physics
  {
    inventoryCode: 'PHYS-PC-0001',
    resourceType: 'COMPUTER',
    brand: 'Lenovo',
    specs: { cpu: 'Intel i5-13500', ram: '16 GB DDR4', disk: '512 GB NVMe', screen: '23" 1080p' },
  },
  {
    inventoryCode: 'PHYS-PC-0002',
    resourceType: 'COMPUTER',
    brand: 'Lenovo',
    specs: { cpu: 'Intel i5-13500', ram: '16 GB DDR4', disk: '512 GB NVMe', screen: '23" 1080p' },
  },
  {
    inventoryCode: 'PHYS-PC-0003',
    resourceType: 'COMPUTER',
    brand: 'Lenovo',
    deliveryDaysAgo: 600,
    warrantyDaysFromNow: 130,
    specs: { cpu: 'Intel i5-13500', ram: '16 GB DDR4', disk: '512 GB NVMe', screen: '23" 1080p' },
  },
  {
    inventoryCode: 'PHYS-PR-0001',
    resourceType: 'PRINTER',
    brand: 'HP',
    specs: { printSpeed: '28 ppm', resolution: '1200x1200 dpi' },
  },
  // Electronics
  {
    inventoryCode: 'ELEC-PC-0001',
    resourceType: 'COMPUTER',
    brand: 'HP',
    specs: { cpu: 'AMD Ryzen 7 7700', ram: '32 GB DDR5', disk: '1 TB NVMe', screen: '27" 1440p' },
  },
  {
    inventoryCode: 'ELEC-PC-0002',
    resourceType: 'COMPUTER',
    brand: 'HP',
    specs: { cpu: 'AMD Ryzen 5 7600', ram: '16 GB DDR5', disk: '512 GB NVMe', screen: '24" 1080p' },
  },
  // Mechanical
  {
    inventoryCode: 'MECH-PC-0001',
    resourceType: 'COMPUTER',
    brand: 'Dell',
    specs: { cpu: 'Intel i7-13700', ram: '32 GB DDR5', disk: '1 TB NVMe', screen: '27" 1440p' },
  },
]

async function ensureResources(defaultSupplierId: string) {
  const created: Array<{ id: string; inventoryCode: string }> = []
  for (const r of RESOURCE_SEED) {
    const existing = await db
      .select()
      .from(resources)
      .where(eq(resources.inventoryCode, r.inventoryCode))
      .limit(1)
    if (existing[0]) {
      created.push({ id: existing[0].id, inventoryCode: r.inventoryCode })
      continue
    }
    const id = newId()
    await db.insert(resources).values({
      id,
      inventoryCode: r.inventoryCode,
      resourceType: r.resourceType,
      brand: r.brand,
      status: r.status ?? 'AVAILABLE',
      supplierId: defaultSupplierId,
      deliveryDate: inDays(-(r.deliveryDaysAgo ?? 90)),
      warrantyEndDate: inDays(r.warrantyDaysFromNow ?? 640),
    })
    if (r.resourceType === 'COMPUTER') {
      const s = r.specs as { cpu: string; ram: string; disk: string; screen: string }
      await db.insert(computerSpecs).values({
        resourceId: id,
        cpu: s.cpu,
        ram: s.ram,
        disk: s.disk,
        screen: s.screen,
      })
    } else {
      const s = r.specs as { printSpeed: string; resolution: string }
      await db.insert(printerSpecs).values({
        resourceId: id,
        printSpeed: s.printSpeed,
        resolution: s.resolution,
      })
    }
    created.push({ id, inventoryCode: r.inventoryCode })
  }
  return created
}

interface AssignmentSeed {
  inventoryCode: string
  to: { kind: 'user'; email: string } | { kind: 'department'; code: string }
  notes: string
  assignedByEmail: string
}

async function ensureAssignments(
  inventory: Array<{ id: string; inventoryCode: string }>,
  assignments: AssignmentSeed[],
) {
  const byCode = new Map(inventory.map((r) => [r.inventoryCode, r.id]))
  for (const a of assignments) {
    const resourceId = byCode.get(a.inventoryCode)
    if (!resourceId) continue
    const assignedById = await getUserId(a.assignedByEmail)
    if (a.to.kind === 'user') {
      const userId = await getUserId(a.to.email)
      const existing = await db
        .select()
        .from(resourceAssignments)
        .where(
          and(
            eq(resourceAssignments.resourceId, resourceId),
            eq(resourceAssignments.assignedToUserId, userId),
            eq(resourceAssignments.active, true),
          ),
        )
        .limit(1)
      if (existing[0]) continue
      await db.insert(resourceAssignments).values({
        id: newId(),
        resourceId,
        targetType: 'USER',
        assignedToUserId: userId,
        assignedByUserId: assignedById,
        notes: a.notes,
        active: true,
      })
    } else {
      const departmentId = await getDepartmentId(a.to.code)
      const existing = await db
        .select()
        .from(resourceAssignments)
        .where(
          and(
            eq(resourceAssignments.resourceId, resourceId),
            eq(resourceAssignments.assignedToDepartmentId, departmentId),
            eq(resourceAssignments.active, true),
          ),
        )
        .limit(1)
      if (existing[0]) continue
      await db.insert(resourceAssignments).values({
        id: newId(),
        resourceId,
        targetType: 'DEPARTMENT',
        assignedToDepartmentId: departmentId,
        assignedByUserId: assignedById,
        notes: a.notes,
        active: true,
      })
    }
    await db.update(resources).set({ status: 'ASSIGNED' }).where(eq(resources.id, resourceId))
  }
}

interface TenderSeed {
  reference: string
  title: string
  description: string
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'EVALUATION' | 'AWARDED'
  startDaysFromNow: number
  endDaysFromNow: number
  items: Array<{
    resourceType: 'COMPUTER' | 'PRINTER'
    brand: string
    specs: string
    quantity: number
  }>
}

const TENDER_SEED: TenderSeed[] = [
  {
    reference: 'TND-2026-001',
    title: 'Spring intake — lab computers',
    description: 'Replace ageing CS lab workstations with i7 / 32 GB / NVMe machines.',
    status: 'PUBLISHED',
    startDaysFromNow: -7,
    endDaysFromNow: 14,
    items: [
      { resourceType: 'COMPUTER', brand: 'Dell', specs: 'i7 / 32 GB / 1 TB NVMe', quantity: 20 },
      { resourceType: 'COMPUTER', brand: 'HP', specs: 'Ryzen 7 / 32 GB / 1 TB NVMe', quantity: 10 },
    ],
  },
  {
    reference: 'TND-2026-002',
    title: 'Department printers refresh',
    description: 'High-volume monochrome printers for CS and Maths.',
    status: 'PUBLISHED',
    startDaysFromNow: -3,
    endDaysFromNow: 21,
    items: [
      { resourceType: 'PRINTER', brand: 'Brother', specs: '35 ppm / 1200 dpi', quantity: 4 },
    ],
  },
  {
    reference: 'TND-2026-003',
    title: 'Mathematics lab workstations',
    description: 'Mid-range computers for the new mathematics computing lab.',
    status: 'DRAFT',
    startDaysFromNow: 7,
    endDaysFromNow: 35,
    items: [
      { resourceType: 'COMPUTER', brand: 'Lenovo', specs: 'i5 / 16 GB / 512 GB', quantity: 12 },
    ],
  },
  {
    reference: 'TND-2025-018',
    title: 'Physics lab — measurement workstations',
    description: 'Mid-range workstations for the physics measurement lab.',
    status: 'AWARDED',
    startDaysFromNow: -120,
    endDaysFromNow: -30,
    items: [
      { resourceType: 'COMPUTER', brand: 'Lenovo', specs: 'i5 / 16 GB / 512 GB', quantity: 6 },
    ],
  },
  {
    reference: 'TND-2025-019',
    title: 'Faculty printers — high-volume',
    description: 'Closed call for high-volume monochrome printers, awarded last term.',
    status: 'CLOSED',
    startDaysFromNow: -80,
    endDaysFromNow: -20,
    items: [
      { resourceType: 'PRINTER', brand: 'Brother', specs: '40 ppm / 1200 dpi', quantity: 2 },
    ],
  },
]

async function ensureTenders(managerId: string) {
  for (const t of TENDER_SEED) {
    const existing = await db.select().from(tenders).where(eq(tenders.reference, t.reference)).limit(1)
    if (existing[0]) continue
    const tenderId = newId()
    await db.insert(tenders).values({
      id: tenderId,
      reference: t.reference,
      title: t.title,
      description: t.description,
      status: t.status,
      startDate: inDays(t.startDaysFromNow),
      endDate: inDays(t.endDaysFromNow),
      publishedAt:
        t.status === 'PUBLISHED' || t.status === 'AWARDED' || t.status === 'CLOSED'
          ? new Date()
          : null,
      awardedAt: t.status === 'AWARDED' ? new Date() : null,
      closedAt: t.status === 'CLOSED' || t.status === 'AWARDED' ? new Date() : null,
      createdByUserId: managerId,
    })
    for (const it of t.items) {
      await db.insert(tenderItems).values({
        id: newId(),
        tenderId,
        resourceType: it.resourceType,
        brand: it.brand,
        specs: it.specs,
        quantity: it.quantity,
      })
    }
  }
}

interface OfferSeed {
  tenderReference: string
  supplierCompany: string
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'ELIMINATED'
  totalPrice: string
  rejectionReason?: string
  eliminationReason?: string
  items: Array<{
    resourceType: 'COMPUTER' | 'PRINTER'
    brand: string
    unitPrice: string
    quantity: number
    warrantyMonths: number
    deliveryDaysFromNow: number
  }>
}

const OFFER_SEED: OfferSeed[] = [
  {
    tenderReference: 'TND-2026-001',
    supplierCompany: 'Acme Hardware',
    status: 'SUBMITTED',
    totalPrice: '34800.00',
    items: [
      {
        resourceType: 'COMPUTER',
        brand: 'Dell',
        unitPrice: '1190.00',
        quantity: 20,
        warrantyMonths: 36,
        deliveryDaysFromNow: 45,
      },
      {
        resourceType: 'COMPUTER',
        brand: 'HP',
        unitPrice: '1120.00',
        quantity: 10,
        warrantyMonths: 36,
        deliveryDaysFromNow: 60,
      },
    ],
  },
  {
    tenderReference: 'TND-2026-001',
    supplierCompany: 'Bluechip Tech',
    status: 'UNDER_REVIEW',
    totalPrice: '34050.00',
    items: [
      {
        resourceType: 'COMPUTER',
        brand: 'Dell',
        unitPrice: '1175.00',
        quantity: 20,
        warrantyMonths: 24,
        deliveryDaysFromNow: 30,
      },
      {
        resourceType: 'COMPUTER',
        brand: 'HP',
        unitPrice: '1055.00',
        quantity: 10,
        warrantyMonths: 24,
        deliveryDaysFromNow: 40,
      },
    ],
  },
  {
    tenderReference: 'TND-2026-002',
    supplierCompany: 'Acme Hardware',
    status: 'SUBMITTED',
    totalPrice: '3120.00',
    items: [
      {
        resourceType: 'PRINTER',
        brand: 'Brother',
        unitPrice: '780.00',
        quantity: 4,
        warrantyMonths: 24,
        deliveryDaysFromNow: 30,
      },
    ],
  },
  {
    tenderReference: 'TND-2025-018',
    supplierCompany: 'Acme Hardware',
    status: 'ACCEPTED',
    totalPrice: '6600.00',
    items: [
      {
        resourceType: 'COMPUTER',
        brand: 'Lenovo',
        unitPrice: '1100.00',
        quantity: 6,
        warrantyMonths: 36,
        deliveryDaysFromNow: -30,
      },
    ],
  },
  {
    tenderReference: 'TND-2025-018',
    supplierCompany: 'Bluechip Tech',
    status: 'REJECTED',
    totalPrice: '6900.00',
    rejectionReason: 'Higher total price than the awarded offer.',
    items: [
      {
        resourceType: 'COMPUTER',
        brand: 'Lenovo',
        unitPrice: '1150.00',
        quantity: 6,
        warrantyMonths: 24,
        deliveryDaysFromNow: -25,
      },
    ],
  },
  {
    tenderReference: 'TND-2025-019',
    supplierCompany: 'Acme Hardware',
    status: 'ELIMINATED',
    totalPrice: '2200.00',
    eliminationReason: 'Delivery window exceeded the required deadline.',
    items: [
      {
        resourceType: 'PRINTER',
        brand: 'Brother',
        unitPrice: '1100.00',
        quantity: 2,
        warrantyMonths: 12,
        deliveryDaysFromNow: -10,
      },
    ],
  },
]

async function ensureOffers() {
  for (const o of OFFER_SEED) {
    const [tender] = await db
      .select()
      .from(tenders)
      .where(eq(tenders.reference, o.tenderReference))
      .limit(1)
    if (!tender) continue
    const supplierId = await getSupplierId(o.supplierCompany)
    const existing = await db
      .select()
      .from(supplierOffers)
      .where(and(eq(supplierOffers.tenderId, tender.id), eq(supplierOffers.supplierId, supplierId)))
      .limit(1)
    if (existing[0]) continue
    const offerId = newId()
    await db.insert(supplierOffers).values({
      id: offerId,
      tenderId: tender.id,
      supplierId,
      status: o.status,
      totalPrice: o.totalPrice,
      rejectionReason: o.rejectionReason ?? null,
      eliminationReason: o.eliminationReason ?? null,
      submittedAt: new Date(),
      decidedAt: o.status === 'ACCEPTED' || o.status === 'REJECTED' || o.status === 'ELIMINATED'
        ? new Date()
        : null,
    })
    for (const it of o.items) {
      await db.insert(supplierOfferItems).values({
        id: newId(),
        offerId,
        resourceType: it.resourceType,
        brand: it.brand,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        warrantyDurationMonths: it.warrantyMonths,
        futureDeliveryDate: inDays(it.deliveryDaysFromNow),
      })
    }
    if (o.status === 'ACCEPTED') {
      await db.update(tenders).set({ awardedOfferId: offerId }).where(eq(tenders.id, tender.id))
    }
  }
}

interface NeedSeed {
  // Stable natural key — composite of department + status + notesPrefix used
  // by the idempotency check.
  key: string
  departmentCode: string
  requesterEmail: string
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'UNDER_DEPARTMENT_REVIEW'
    | 'APPROVED_BY_DEPARTMENT'
    | 'SENT_TO_RESOURCE_MANAGER'
    | 'INCLUDED_IN_TENDER'
    | 'REJECTED'
  notes: string
  rejectionReason?: string
  items: Array<{
    resourceType: 'COMPUTER' | 'PRINTER'
    brand?: string
    cpu?: string
    ram?: string
    disk?: string
    screen?: string
    printSpeed?: string
    resolution?: string
    quantity: number
    justification: string
  }>
}

const NEED_SEED: NeedSeed[] = [
  {
    key: 'cs-draft-algorithms',
    departmentCode: 'CS',
    requesterEmail: 'teacher@faculty.local',
    status: 'DRAFT',
    notes: 'For the new algorithms course next semester.',
    items: [
      {
        resourceType: 'COMPUTER',
        brand: 'Dell',
        cpu: 'Intel i7-13700',
        ram: '32 GB DDR5',
        disk: '1 TB NVMe',
        screen: '24" 1440p',
        quantity: 4,
        justification: 'Compilation-heavy workloads',
      },
    ],
  },
  {
    key: 'cs-submitted-printers',
    departmentCode: 'CS',
    requesterEmail: 'teacher@faculty.local',
    status: 'SUBMITTED',
    notes: 'Backlog from last term, please prioritise.',
    items: [
      {
        resourceType: 'PRINTER',
        brand: 'Brother',
        printSpeed: '35 ppm',
        resolution: '1200x1200 dpi',
        quantity: 2,
        justification: 'Shared printing for two labs',
      },
    ],
  },
  {
    key: 'cs-under-review-mlworkstations',
    departmentCode: 'CS',
    requesterEmail: 'teacher2@faculty.local',
    status: 'UNDER_DEPARTMENT_REVIEW',
    notes: 'Machine learning course needs CUDA-capable rigs.',
    items: [
      {
        resourceType: 'COMPUTER',
        brand: 'HP',
        cpu: 'AMD Ryzen 7 7700',
        ram: '32 GB DDR5',
        disk: '1 TB NVMe',
        screen: '27" 1440p',
        quantity: 6,
        justification: 'GPU-accelerated training sessions',
      },
    ],
  },
  {
    key: 'math-approved-printers',
    departmentCode: 'MATH',
    requesterEmail: 'math.teacher@faculty.local',
    status: 'APPROVED_BY_DEPARTMENT',
    notes: 'Approved — please forward to procurement.',
    items: [
      {
        resourceType: 'PRINTER',
        brand: 'HP',
        printSpeed: '28 ppm',
        resolution: '1200x1200 dpi',
        quantity: 1,
        justification: 'Replaces broken department printer',
      },
    ],
  },
  {
    key: 'phys-sent-workstations',
    departmentCode: 'PHYS',
    requesterEmail: 'phys.teacher@faculty.local',
    status: 'SENT_TO_RESOURCE_MANAGER',
    notes: 'Sent for inclusion in next tender batch.',
    items: [
      {
        resourceType: 'COMPUTER',
        brand: 'Lenovo',
        cpu: 'Intel i5-13500',
        ram: '16 GB DDR4',
        disk: '512 GB NVMe',
        screen: '23" 1080p',
        quantity: 3,
        justification: 'Replacement workstations for first-year labs',
      },
    ],
  },
  {
    key: 'cs-rejected-gaming',
    departmentCode: 'CS',
    requesterEmail: 'teacher3@faculty.local',
    status: 'REJECTED',
    notes: 'Need rejected after departmental review.',
    rejectionReason: 'Out of scope: gaming-class hardware not justified.',
    items: [
      {
        resourceType: 'COMPUTER',
        brand: 'Dell',
        cpu: 'Intel i9-14900',
        ram: '64 GB DDR5',
        disk: '2 TB NVMe',
        screen: '32" 4K',
        quantity: 2,
        justification: 'High-end rendering — declined as gaming-class.',
      },
    ],
  },
]

async function ensureNeedRequests() {
  for (const need of NEED_SEED) {
    const deptId = await getDepartmentId(need.departmentCode)
    const requesterId = await getUserId(need.requesterEmail)
    // Idempotency: one need per (departmentId, requesterId, status, notes-prefix).
    const existing = await db
      .select()
      .from(needRequests)
      .where(
        and(
          eq(needRequests.departmentId, deptId),
          eq(needRequests.requestedByUserId, requesterId),
          eq(needRequests.status, need.status),
        ),
      )
      .limit(1)
    if (existing[0]) continue
    const id = newId()
    await db.insert(needRequests).values({
      id,
      departmentId: deptId,
      requestedByUserId: requesterId,
      status: need.status,
      notes: need.notes,
      submittedAt: need.status === 'DRAFT' ? null : new Date(),
      sentToManagerAt:
        need.status === 'SENT_TO_RESOURCE_MANAGER' || need.status === 'INCLUDED_IN_TENDER'
          ? new Date()
          : null,
      rejectedAt: need.status === 'REJECTED' ? new Date() : null,
      rejectionReason: need.rejectionReason ?? null,
    })
    for (const it of need.items) {
      await db.insert(needItems).values({
        id: newId(),
        needRequestId: id,
        resourceType: it.resourceType,
        brand: it.brand ?? null,
        cpu: it.cpu ?? null,
        ram: it.ram ?? null,
        disk: it.disk ?? null,
        screen: it.screen ?? null,
        printSpeed: it.printSpeed ?? null,
        resolution: it.resolution ?? null,
        quantity: it.quantity,
        justification: it.justification,
      })
    }
  }
}

interface FailureSeed {
  inventoryCode: string
  reporterEmail: string
  technicianEmail?: string
  status: 'REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'TECHNICAL_REPORT_CREATED'
  severity: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
  type: 'HARDWARE' | 'SOFTWARE_SYSTEM' | 'SOFTWARE_UTILITY'
  frequency: 'RARE' | 'FREQUENT' | 'PERMANENT'
  description: string
  technicalReport?: {
    explanation: string
    appearedDaysAgo: number
  }
}

const FAILURE_SEED: FailureSeed[] = [
  {
    inventoryCode: 'CS-PC-0001',
    reporterEmail: 'teacher@faculty.local',
    status: 'REPORTED',
    severity: 'HIGH',
    type: 'HARDWARE',
    frequency: 'FREQUENT',
    description: 'Random shutdowns during builds — sometimes within minutes of boot.',
  },
  {
    inventoryCode: 'CS-PC-0002',
    reporterEmail: 'teacher2@faculty.local',
    technicianEmail: 'tech@faculty.local',
    status: 'ASSIGNED',
    severity: 'NORMAL',
    type: 'SOFTWARE_UTILITY',
    frequency: 'RARE',
    description: 'IDE fails to launch after the latest OS update.',
  },
  {
    inventoryCode: 'CS-PC-0006',
    reporterEmail: 'teacher3@faculty.local',
    technicianEmail: 'tech2@faculty.local',
    status: 'TECHNICAL_REPORT_CREATED',
    severity: 'CRITICAL',
    type: 'HARDWARE',
    frequency: 'PERMANENT',
    description: 'Machine refuses to power on. No signs of life on the motherboard LED.',
    technicalReport: {
      explanation:
        'Failed power supply unit, replaced under warranty. Tested with new PSU, system stable for 24h burn-in.',
      appearedDaysAgo: 3,
    },
  },
  {
    inventoryCode: 'PHYS-PC-0001',
    reporterEmail: 'phys.teacher@faculty.local',
    technicianEmail: 'tech@faculty.local',
    status: 'RESOLVED',
    severity: 'LOW',
    type: 'SOFTWARE_SYSTEM',
    frequency: 'RARE',
    description: 'Occasional kernel panic resolved after firmware update.',
  },
  {
    inventoryCode: 'MATH-PC-0001',
    reporterEmail: 'math.teacher@faculty.local',
    status: 'REPORTED',
    severity: 'NORMAL',
    type: 'HARDWARE',
    frequency: 'FREQUENT',
    description: 'Keyboard input drops every few minutes — suspecting USB controller issue.',
  },
]

async function ensureFailureReports(inventory: Array<{ id: string; inventoryCode: string }>) {
  const byCode = new Map(inventory.map((r) => [r.inventoryCode, r.id]))
  for (const f of FAILURE_SEED) {
    const resourceId = byCode.get(f.inventoryCode)
    if (!resourceId) continue
    const reporterId = await getUserId(f.reporterEmail)
    const technicianId = f.technicianEmail ? await getUserId(f.technicianEmail) : null
    const existing = await db
      .select()
      .from(failureReports)
      .where(
        and(
          eq(failureReports.resourceId, resourceId),
          eq(failureReports.reportedByUserId, reporterId),
        ),
      )
      .limit(1)
    if (existing[0]) continue
    const id = newId()
    await db.insert(failureReports).values({
      id,
      resourceId,
      reportedByUserId: reporterId,
      technicianUserId: technicianId,
      status: f.status,
      type: f.type,
      frequency: f.frequency,
      description: f.description,
      severity: f.severity,
      resolvedAt: f.status === 'RESOLVED' ? new Date() : null,
    })
    if (f.technicalReport && technicianId) {
      await db.insert(technicalReports).values({
        id: newId(),
        failureReportId: id,
        technicianUserId: technicianId,
        explanation: f.technicalReport.explanation,
        appearedAt: inDays(-f.technicalReport.appearedDaysAgo),
        frequency: f.frequency,
        type: f.type,
      })
    }
  }
}

interface NotifSeed {
  email: string
  event:
    | 'NEED_SUBMITTED'
    | 'NEED_APPROVED'
    | 'TENDER_PUBLISHED'
    | 'OFFER_SUBMITTED'
    | 'OFFER_ACCEPTED'
    | 'OFFER_REJECTED'
    | 'RESOURCE_ASSIGNED'
    | 'FAILURE_REPORTED'
    | 'TECHNICAL_REPORT_CREATED'
  message: string
  link: string
  read?: boolean
}

const NOTIF_SEED: NotifSeed[] = [
  {
    email: 'teacher@faculty.local',
    event: 'RESOURCE_ASSIGNED',
    message: 'Workstation CS-PC-0001 was assigned to you.',
    link: '/teacher/resources',
  },
  {
    email: 'teacher@faculty.local',
    event: 'NEED_APPROVED',
    message: 'Your need request for shared printers was approved.',
    link: '/teacher/needs',
  },
  {
    email: 'teacher2@faculty.local',
    event: 'RESOURCE_ASSIGNED',
    message: 'Workstation CS-PC-0003 was assigned to you.',
    link: '/teacher/resources',
  },
  {
    email: 'cs.head@faculty.local',
    event: 'NEED_SUBMITTED',
    message: 'A new need request is awaiting your review.',
    link: '/department/needs',
  },
  {
    email: 'manager@faculty.local',
    event: 'NEED_SUBMITTED',
    message: 'A new need request was forwarded by Computer Science.',
    link: '/manager/needs',
  },
  {
    email: 'manager@faculty.local',
    event: 'OFFER_SUBMITTED',
    message: 'Bluechip Tech submitted an offer for TND-2026-001.',
    link: '/manager/tenders',
  },
  {
    email: 'supplier@faculty.local',
    event: 'TENDER_PUBLISHED',
    message: 'Tender TND-2026-002 is open for offers.',
    link: '/supplier/tenders',
  },
  {
    email: 'supplier@faculty.local',
    event: 'OFFER_ACCEPTED',
    message: 'Your offer on TND-2025-018 was accepted.',
    link: '/supplier/offers',
    read: true,
  },
  {
    email: 'supplier2@faculty.local',
    event: 'OFFER_REJECTED',
    message: 'Your offer on TND-2025-018 was not selected.',
    link: '/supplier/offers',
  },
  {
    email: 'tech@faculty.local',
    event: 'FAILURE_REPORTED',
    message: 'New failure reported on CS-PC-0001 (HIGH severity).',
    link: '/maintenance/failures',
  },
  {
    email: 'tech@faculty.local',
    event: 'FAILURE_REPORTED',
    message: 'IDE startup failure on CS-PC-0002 assigned to you.',
    link: '/maintenance/failures',
  },
  {
    email: 'tech2@faculty.local',
    event: 'TECHNICAL_REPORT_CREATED',
    message: 'Technical report filed for CS-PC-0006.',
    link: '/maintenance/reports',
    read: true,
  },
]

async function ensureNotifications() {
  for (const n of NOTIF_SEED) {
    const userId = await getUserId(n.email)
    const existing = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.event, n.event),
          eq(notifications.message, n.message),
        ),
      )
      .limit(1)
    if (existing[0]) continue
    await db.insert(notifications).values({
      id: newId(),
      userId,
      event: n.event,
      message: n.message,
      link: n.link,
      read: n.read ?? false,
    })
  }
}

async function main() {
  console.log('Seeding departments…')
  await ensureDepartments()
  console.log('Seeding users…')
  await ensureUsers()

  console.log('Seeding domain data…')
  const adminId = await getUserId('admin@faculty.local')
  const managerId = await getUserId('manager@faculty.local')
  const supplierId = await getSupplierId('Acme Hardware')

  const inventory = await ensureResources(supplierId)
  await ensureAssignments(inventory, [
    {
      inventoryCode: 'CS-PC-0001',
      to: { kind: 'user', email: 'teacher@faculty.local' },
      notes: 'Personal workstation',
      assignedByEmail: 'admin@faculty.local',
    },
    {
      inventoryCode: 'CS-PC-0003',
      to: { kind: 'user', email: 'teacher2@faculty.local' },
      notes: 'Personal workstation',
      assignedByEmail: 'admin@faculty.local',
    },
    {
      inventoryCode: 'CS-PC-0004',
      to: { kind: 'user', email: 'teacher3@faculty.local' },
      notes: 'Personal workstation',
      assignedByEmail: 'admin@faculty.local',
    },
    {
      inventoryCode: 'CS-PR-0001',
      to: { kind: 'department', code: 'CS' },
      notes: 'Shared department printer',
      assignedByEmail: 'admin@faculty.local',
    },
    {
      inventoryCode: 'MATH-PC-0001',
      to: { kind: 'user', email: 'math.teacher@faculty.local' },
      notes: 'Personal workstation',
      assignedByEmail: 'admin@faculty.local',
    },
    {
      inventoryCode: 'PHYS-PC-0001',
      to: { kind: 'user', email: 'phys.teacher@faculty.local' },
      notes: 'Personal workstation',
      assignedByEmail: 'admin@faculty.local',
    },
  ])
  await ensureTenders(managerId)
  await ensureOffers()
  await ensureNeedRequests()
  await ensureFailureReports(inventory)
  await ensureNotifications()

  // Silence unused warnings for IDs only consumed conditionally.
  void adminId

  console.log('Seed complete. Default password: changeme123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => process.exit(0))
