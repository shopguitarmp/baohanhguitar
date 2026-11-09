/**
 * PRD 01 - Single Store ERP Mini: Musical Instruments & Electronic Warranty
 * Core Types & Domain Enums
 */

export type TrackingType = 'SERIAL' | 'QUANTITY' | 'BATCH';

export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export type SerialStatus =
  | 'IN_STOCK'
  | 'RESERVED'
  | 'SOLD'
  | 'RETURN_PENDING'
  | 'QUARANTINE'
  | 'IN_REPAIR'
  | 'RETURNED_TO_SUPPLIER'
  | 'DISPOSED';

export type StockStatusType =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'QUARANTINE'
  | 'IN_TRANSIT'
  | 'REPAIR'
  | 'RETURN_PENDING';

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'REJECTED'
  | 'CANCELLED';

export type SalesOrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'MOMO_ZALOPAY';

export type WarrantyStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED' | 'VOID';

export type WarrantyClaimStatus =
  | 'SUBMITTED'
  | 'RECEIVED'
  | 'INSPECTING'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'REPAIRING'
  | 'WAITING_PARTS'
  | 'WAITING_CUSTOMER'
  | 'QUALITY_CHECK'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export type RepairStatus =
  | 'PENDING'
  | 'DIAGNOSING'
  | 'WAITING_PARTS'
  | 'REPAIRING'
  | 'TESTING'
  | 'COMPLETED'
  | 'HANDED_OVER';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'STORE_MANAGER'
  | 'WAREHOUSE_MANAGER'
  | 'WAREHOUSE_STAFF'
  | 'SALES_MANAGER'
  | 'SALES_STAFF'
  | 'ACCOUNTANT'
  | 'WARRANTY_STAFF'
  | 'TECHNICIAN';

export type LedgerTransactionType =
  | 'IMPORT_PURCHASE'
  | 'EXPORT_SALE'
  | 'EXPORT_REPAIR_PART'
  | 'RETURN_CUSTOMER'
  | 'RETURN_SUPPLIER'
  | 'ADJUST_INCREASE'
  | 'ADJUST_DECREASE'
  | 'INTERNAL_USE';

// Master Data Models
export interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface Brand {
  id: string;
  name: string;
  country: string;
  description?: string;
}

export interface Unit {
  id: string;
  name: string; // Cây, Chiếc, Bộ, Cái, Hộp
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  brandId: string;
  unitId: string;
  trackingType?: TrackingType;
  costPrice?: number;
  sellingPrice: number;
  promoPrice?: number;
  minStock: number;
  warrantyPolicyId?: string;
  description: string;
  specifications?: string;
  images: string[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSerial {
  id: string;
  productId: string;
  serialNumber: string;
  status: SerialStatus;
  warehouseId: string;
  purchaseOrderId?: string;
  goodsReceiptId?: string;
  salesOrderId?: string;
  warrantyId?: string;
  notes?: string;
  receivedDate: string;
  soldDate?: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  taxCode?: string;
  debtAmount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PurchaseOrderItem {
  productId: string;
  quantity: number;
  unitCost: number;
  receivedQuantity: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  code: string; // PO-YYYY-XXXX
  supplierId: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoodsReceiptItem {
  productId: string;
  quantity: number;
  unitCost: number;
  serials?: string[]; // Serials entered upon receipt
}

export interface GoodsReceipt {
  id: string;
  code: string; // GR-YYYY-XXXX
  purchaseOrderId: string;
  supplierId: string;
  receivedBy: string;
  receivedDate: string;
  items: GoodsReceiptItem[];
  notes?: string;
}

export interface Customer {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  dateOfBirth?: string;
  notes?: string;
  totalSpent: number;
  ordersCount: number;
  createdAt: string;
}

export interface SalesOrderItem {
  productId: string;
  productName: string;
  sku: string;
  trackingType: TrackingType;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  serialNumbers?: string[]; // Selected serials
}

export interface SalesOrder {
  id: string;
  code: string; // HD-YYYY-XXXX
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: SalesOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  status: SalesOrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

export interface InventoryLedgerEntry {
  id: string;
  transactionCode: string;
  transactionType: LedgerTransactionType;
  sourceDocument: string; // e.g., PO-2024-001, HD-2024-002
  productId: string;
  productName: string;
  serialNumber?: string;
  warehouseId: string;
  quantityIn: number;
  quantityOut: number;
  unitCost: number;
  transactionDate: string;
  createdBy: string;
  postedAt: string;
  notes?: string;
}

export interface StockBalance {
  productId: string;
  available: number;
  reserved: number;
  quarantine: number;
  inRepair: number;
  totalStock: number;
}

export interface StockAdjustment {
  id: string;
  code: string;
  productId: string;
  type: 'INCREASE' | 'DECREASE';
  quantity: number;
  reason: string;
  approvedBy: string;
  createdAt: string;
  notes?: string;
}

export interface StockCountItem {
  productId: string;
  systemQty: number;
  physicalQty: number;
  variance: number;
}

export interface StockCount {
  id: string;
  code: string;
  countedBy: string;
  date: string;
  status: 'DRAFT' | 'CONFIRMED';
  items: StockCountItem[];
  notes?: string;
}

// Warranty Domain
export interface WarrantyPolicy {
  id: string;
  code: string;
  name: string;
  durationMonths: number;
  applicableCategories: string[];
  terms: string;
  exclusions: string;
  replacementTerms: string;
  version: string;
  effectiveFrom: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface WarrantyRegistration {
  id: string;
  warrantyCode: string; // BH-YYYY-XXXX
  qrToken: string; // Unique cryptographically random token for portal lookup
  customerId: string;
  customerName: string;
  customerPhone: string;
  productId: string;
  productName: string;
  productSku: string;
  serialNumber: string;
  salesOrderId: string;
  purchaseDate: string;
  activationDate: string;
  startDate: string;
  endDate: string;
  policySnapshot: {
    policyName: string;
    durationMonths: number;
    terms: string;
    exclusions: string;
    version: string;
  };
  status: WarrantyStatus;
  notes?: string;
}

export interface WarrantyEvent {
  id: string;
  claimId: string;
  status: WarrantyClaimStatus;
  note: string;
  performedBy: string;
  timestamp: string;
}

export interface WarrantyClaim {
  id: string;
  claimCode: string; // YCBH-YYYY-XXXX
  trackingToken: string; // Token for customer tracking link
  warrantyId: string;
  warrantyCode: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  productId: string;
  productName: string;
  serialNumber: string;
  status: WarrantyClaimStatus;
  submittedDate: string;
  issueDescription: string;
  photos: string[];
  intakeCondition?: string;
  technicianId?: string;
  technicianName?: string;
  diagnosticResult?: string;
  resolution?: string;
  events: WarrantyEvent[];
  repairOrderId?: string;
  handoverRecord?: HandoverRecord;
  updatedAt: string;
}

export interface RepairPart {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  isCoveredByWarranty: boolean;
}

export interface HandoverRecord {
  handoverDate: string;
  deliveredBy: string;
  receivedBy: string;
  customerConfirmed: boolean;
  notes?: string;
  productConditionCheck: string;
}

export interface RepairOrder {
  id: string;
  code: string; // SC-YYYY-XXXX
  claimId: string;
  claimCode: string;
  productName: string;
  serialNumber: string;
  technicianId: string;
  technicianName: string;
  status: RepairStatus;
  faultCategory: string;
  diagnosticNotes: string;
  repairAction: string;
  partsUsed: RepairPart[];
  laborFee: number;
  qualityCheckPassed: boolean;
  qualityCheckNotes?: string;
  handoverRecord?: HandoverRecord;
  createdAt: string;
  completedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress: string;
}

export interface User {
  id: string;
  username?: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'ACTIVE' | 'LOCKED';
  avatar?: string;
}
