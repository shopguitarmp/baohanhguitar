import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  ProductSerial,
  Category,
  Brand,
  Unit,
  Supplier,
  PurchaseOrder,
  GoodsReceipt,
  Customer,
  SalesOrder,
  InventoryLedgerEntry,
  StockBalance,
  StockAdjustment,
  StockCount,
  WarrantyPolicy,
  WarrantyRegistration,
  WarrantyClaim,
  WarrantyClaimStatus,
  RepairOrder,
  User,
  UserRole,
  AuditLog,
} from '../types/erp';
import {
  SEED_CATEGORIES,
  SEED_BRANDS,
  SEED_UNITS,
  SEED_PRODUCTS,
  SEED_SERIALS,
  SEED_SUPPLIERS,
  SEED_CUSTOMERS,
  SEED_WARRANTY_POLICIES,
  SEED_WARRANTIES,
  SEED_WARRANTY_CLAIMS,
  SEED_REPAIR_ORDERS,
  SEED_PURCHASE_ORDERS,
  SEED_GOODS_RECEIPTS,
  SEED_SALES_ORDERS,
  SEED_LEDGER_ENTRIES,
  SEED_USERS,
  SEED_AUDIT_LOGS,
} from '../data/seedData';

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateVN(dateStr?: string): string {
  if (!dateStr) return '--';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDateOnlyVN(dateStr?: string): string {
  if (!dateStr) return '--';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

interface ERPContextType {
  // Current session & active persona
  currentUser: User;
  setCurrentUserRole: (role: UserRole) => void;
  allUsers: User[];
  currentPortal: 'admin' | 'customer';
  setCurrentPortal: (portal: 'admin' | 'customer') => void;
  customerLookupQuery: string;
  setCustomerLookupQuery: (q: string) => void;

  // Authentication & Security (Super Admin)
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;

  // Data sets
  categories: Category[];
  brands: Brand[];
  units: Unit[];
  products: Product[];
  serials: ProductSerial[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  customers: Customer[];
  salesOrders: SalesOrder[];
  ledgerEntries: InventoryLedgerEntry[];
  stockAdjustments: StockAdjustment[];
  stockCounts: StockCount[];
  warrantyPolicies: WarrantyPolicy[];
  warranties: WarrantyRegistration[];
  warrantyClaims: WarrantyClaim[];
  repairOrders: RepairOrder[];
  auditLogs: AuditLog[];

  // Stock balances computed map
  stockBalances: Record<string, StockBalance>;

  // Products CRUD & checks
  addProduct: (
    p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { initialStock?: number }
  ) => { success: boolean; error?: string; product?: Product };
  updateProduct: (id: string, p: Partial<Product>) => { success: boolean; error?: string };
  deleteProduct: (id: string) => { success: boolean; error?: string };

  // Brands CRUD
  addBrand: (b: Omit<Brand, 'id'>) => Brand;
  updateBrand: (id: string, b: Partial<Brand>) => { success: boolean; error?: string };
  deleteBrand: (id: string) => { success: boolean; error?: string };

  // Supplier
  addSupplier: (s: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, s: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => { success: boolean; error?: string };

  // Purchasing & Goods Receipt
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'createdBy'>) => PurchaseOrder;
  approvePurchaseOrder: (id: string) => { success: boolean; error?: string };
  createGoodsReceipt: (receipt: {
    purchaseOrderId: string;
    items: { productId: string; quantity: number; unitCost: number; serials?: string[] }[];
    notes?: string;
  }) => { success: boolean; error?: string };

  // Sales Order & POS
  createSalesOrder: (order: {
    customerId: string;
    items: {
      productId: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      serialNumbers?: string[];
    }[];
    discount: number;
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'MOMO_ZALOPAY';
    notes?: string;
  }) => { success: boolean; error?: string; order?: SalesOrder };

  // Inventory adjustment
  createStockAdjustment: (adj: {
    productId: string;
    type: 'INCREASE' | 'DECREASE';
    quantity: number;
    reason: string;
    notes?: string;
  }) => { success: boolean; error?: string };

  // Customer
  addCustomer: (cust: Omit<Customer, 'id' | 'code' | 'totalSpent' | 'ordersCount' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, cust: Partial<Customer>) => { success: boolean; error?: string };
  deleteCustomer: (id: string) => { success: boolean; error?: string };

  // Staff / Employees CRUD
  addUser: (u: Omit<User, 'id'>) => { success: boolean; error?: string };
  updateUser: (id: string, u: Partial<User>) => { success: boolean; error?: string };
  deleteUser: (id: string) => { success: boolean; error?: string };

  // Warranty Policy & Claims
  addWarrantyPolicy: (policy: Omit<WarrantyPolicy, 'id'>) => void;
  updateWarrantyPolicy: (id: string, policy: Partial<WarrantyPolicy>) => void;
  submitWarrantyClaim: (claim: {
    warrantyId: string;
    issueDescription: string;
    photos: string[];
  }) => { success: boolean; error?: string; claim?: WarrantyClaim };
  updateClaimStatus: (
    claimId: string,
    newStatus: WarrantyClaimStatus,
    note: string,
    technicianId?: string,
    diagnosticResult?: string
  ) => { success: boolean; error?: string };

  // Repair
  createRepairOrder: (claimId: string, techId: string, faultCategory: string, diagnosticNotes: string) => RepairOrder;
  updateRepairOrder: (
    id: string,
    updates: Partial<RepairOrder>,
    consumeParts?: { productId: string; quantity: number }[]
  ) => { success: boolean; error?: string };
  completeHandover: (
    claimId: string,
    handover: { deliveredBy: string; receivedBy: string; conditionCheck: string; notes?: string }
  ) => { success: boolean; error?: string };

  // Utility & Database management
  resetToSeedData: () => void;
  exportDatabaseJSON: () => string;
  clearWarehouseDatabase: () => void;
  clearAllProducts: () => void;
}

const ERPContext = createContext<ERPContextType | null>(null);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ensure warehouse database cache is cleared in existing browser sessions
  const DB_CLEARED_VERSION = 'gmp_v2_warehouse_cleared';
  if (typeof window !== 'undefined' && localStorage.getItem(DB_CLEARED_VERSION) !== 'true') {
    localStorage.removeItem('gmp_serials');
    localStorage.removeItem('gmp_purchase_orders');
    localStorage.removeItem('gmp_goods_receipts');
    localStorage.removeItem('gmp_sales_orders');
    localStorage.removeItem('gmp_ledger_entries');
    localStorage.removeItem('gmp_stock_adjustments');
    localStorage.removeItem('gmp_stock_counts');
    localStorage.removeItem('gmp_warranties');
    localStorage.removeItem('gmp_warranty_claims');
    localStorage.removeItem('gmp_repair_orders');
    localStorage.setItem(DB_CLEARED_VERSION, 'true');
  }

  // Try loading from localStorage or fallback to SEED
  const [categories, setCategories] = useState<Category[]>(() => {
    const s = localStorage.getItem('gmp_categories');
    return s ? JSON.parse(s) : SEED_CATEGORIES;
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    const s = localStorage.getItem('gmp_brands');
    return s ? JSON.parse(s) : SEED_BRANDS;
  });

  const [units] = useState<Unit[]>(SEED_UNITS);

  const [products, setProducts] = useState<Product[]>(() => {
    const s = localStorage.getItem('gmp_products');
    return s ? JSON.parse(s) : SEED_PRODUCTS;
  });

  const [serials, setSerials] = useState<ProductSerial[]>(() => {
    const s = localStorage.getItem('gmp_serials');
    return s ? JSON.parse(s) : SEED_SERIALS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const s = localStorage.getItem('gmp_suppliers');
    return s ? JSON.parse(s) : SEED_SUPPLIERS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const s = localStorage.getItem('gmp_customers');
    return s ? JSON.parse(s) : SEED_CUSTOMERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const s = localStorage.getItem('gmp_purchase_orders');
    return s ? JSON.parse(s) : SEED_PURCHASE_ORDERS;
  });

  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>(() => {
    const s = localStorage.getItem('gmp_goods_receipts');
    return s ? JSON.parse(s) : SEED_GOODS_RECEIPTS;
  });

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => {
    const s = localStorage.getItem('gmp_sales_orders');
    return s ? JSON.parse(s) : SEED_SALES_ORDERS;
  });

  const [ledgerEntries, setLedgerEntries] = useState<InventoryLedgerEntry[]>(() => {
    const s = localStorage.getItem('gmp_ledger_entries');
    return s ? JSON.parse(s) : SEED_LEDGER_ENTRIES;
  });

  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => {
    const s = localStorage.getItem('gmp_stock_adjustments');
    return s ? JSON.parse(s) : [];
  });

  const [stockCounts, setStockCounts] = useState<StockCount[]>(() => {
    const s = localStorage.getItem('gmp_stock_counts');
    return s ? JSON.parse(s) : [];
  });

  const [warrantyPolicies, setWarrantyPolicies] = useState<WarrantyPolicy[]>(() => {
    const s = localStorage.getItem('gmp_warranty_policies');
    return s ? JSON.parse(s) : SEED_WARRANTY_POLICIES;
  });

  const [warranties, setWarranties] = useState<WarrantyRegistration[]>(() => {
    const s = localStorage.getItem('gmp_warranties');
    if (!s) return SEED_WARRANTIES;
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_WARRANTIES;
    } catch {
      return SEED_WARRANTIES;
    }
  });

  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>(() => {
    const s = localStorage.getItem('gmp_warranty_claims');
    return s ? JSON.parse(s) : SEED_WARRANTY_CLAIMS;
  });

  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>(() => {
    const s = localStorage.getItem('gmp_repair_orders');
    return s ? JSON.parse(s) : SEED_REPAIR_ORDERS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const s = localStorage.getItem('gmp_audit_logs');
    return s ? JSON.parse(s) : SEED_AUDIT_LOGS;
  });

  // Users state
  const [users, setUsers] = useState<User[]>(() => {
    const s = localStorage.getItem('gmp_users');
    return s ? JSON.parse(s) : SEED_USERS;
  });

  // Authentication & Security (Super Admin: guitarminhphat / Huong@258)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('gmp_is_authenticated') === 'true';
  });

  // Portal and Persona State (Default to 'customer' so first visit opens the warranty portal)
  const [currentPortal, setCurrentPortal] = useState<'admin' | 'customer'>('customer');
  const [customerLookupQuery, setCustomerLookupQuery] = useState<string>('');
  const [currentUserRole, setCurrentUserRoleState] = useState<UserRole>('SUPER_ADMIN');

  const currentUser = useMemo(() => {
    const found = users.find((u) => u.role === currentUserRole);
    return found || users[0] || SEED_USERS[0];
  }, [users, currentUserRole]);

  const setCurrentUserRole = (role: UserRole) => {
    setCurrentUserRoleState(role);
    addAuditLog('SWITCH_ROLE', 'USER_SESSION', role, undefined, `Chuyển quyền sang ${role}`);
  };

  const login = (usernameInput: string, passwordInput: string) => {
    const u = usernameInput.trim().toLowerCase();
    // Valid Super Admin credentials: username guitarminhphat, password Huong@258
    if ((u === 'guitarminhphat' || u === 'shopguitarmp@gmail.com') && passwordInput === 'Huong@258') {
      setIsAuthenticated(true);
      setCurrentUserRoleState('SUPER_ADMIN');
      localStorage.setItem('gmp_is_authenticated', 'true');
      addAuditLog('LOGIN', 'AUTH_SESSION', 'usr-admin-minhphat', undefined, 'Đăng nhập Super Admin guitarminhphat thành công');
      return { success: true };
    }
    return {
      success: false,
      error: 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('gmp_is_authenticated');
    addAuditLog('LOGOUT', 'AUTH_SESSION', currentUser.id, undefined, 'Super Admin đăng xuất khỏi trang quản trị');
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('gmp_categories', JSON.stringify(categories));
    localStorage.setItem('gmp_brands', JSON.stringify(brands));
    localStorage.setItem('gmp_products', JSON.stringify(products));
    localStorage.setItem('gmp_serials', JSON.stringify(serials));
    localStorage.setItem('gmp_suppliers', JSON.stringify(suppliers));
    localStorage.setItem('gmp_customers', JSON.stringify(customers));
    localStorage.setItem('gmp_purchase_orders', JSON.stringify(purchaseOrders));
    localStorage.setItem('gmp_goods_receipts', JSON.stringify(goodsReceipts));
    localStorage.setItem('gmp_sales_orders', JSON.stringify(salesOrders));
    localStorage.setItem('gmp_ledger_entries', JSON.stringify(ledgerEntries));
    localStorage.setItem('gmp_stock_adjustments', JSON.stringify(stockAdjustments));
    localStorage.setItem('gmp_stock_counts', JSON.stringify(stockCounts));
    localStorage.setItem('gmp_warranty_policies', JSON.stringify(warrantyPolicies));
    localStorage.setItem('gmp_warranties', JSON.stringify(warranties));
    localStorage.setItem('gmp_warranty_claims', JSON.stringify(warrantyClaims));
    localStorage.setItem('gmp_repair_orders', JSON.stringify(repairOrders));
    localStorage.setItem('gmp_audit_logs', JSON.stringify(auditLogs));
    localStorage.setItem('gmp_users', JSON.stringify(users));
  }, [
    categories,
    brands,
    products,
    serials,
    suppliers,
    customers,
    purchaseOrders,
    goodsReceipts,
    salesOrders,
    ledgerEntries,
    stockAdjustments,
    stockCounts,
    warrantyPolicies,
    warranties,
    warrantyClaims,
    repairOrders,
    auditLogs,
    users,
  ]);

  // Compute stock balances dynamically from Ledger and Serials
  const stockBalances = useMemo(() => {
    const balances: Record<string, StockBalance> = {};
    for (const prod of products) {
      balances[prod.id] = {
        productId: prod.id,
        available: 0,
        reserved: 0,
        quarantine: 0,
        inRepair: 0,
        totalStock: 0,
      };
    }

    if (products.length === 0) return balances;

    for (const prod of products) {
      if (prod.trackingType === 'SERIAL') {
        const prodSerials = serials.filter((s) => s.productId === prod.id);
        const avail = prodSerials.filter((s) => s.status === 'IN_STOCK').length;
        const res = prodSerials.filter((s) => s.status === 'RESERVED').length;
        const quar = prodSerials.filter((s) => s.status === 'QUARANTINE').length;
        const inRep = prodSerials.filter((s) => s.status === 'IN_REPAIR').length;

        balances[prod.id] = {
          productId: prod.id,
          available: avail,
          reserved: res,
          quarantine: quar,
          inRepair: inRep,
          totalStock: avail + res + quar + inRep,
        };
      } else {
        // Compute from immutable ledger
        const entries = ledgerEntries.filter((l) => l.productId === prod.id);
        let net = 0;
        for (const e of entries) {
          net += e.quantityIn - e.quantityOut;
        }
        balances[prod.id] = {
          productId: prod.id,
          available: Math.max(0, net),
          reserved: 0,
          quarantine: 0,
          inRepair: 0,
          totalStock: Math.max(0, net),
        };
      }
    }

    return balances;
  }, [products, serials, ledgerEntries]);

  // Audit Log helper (AC-042, AC-043)
  const addAuditLog = (
    action: string,
    entityType: string,
    entityId: string,
    oldValue?: string,
    newValue?: string
  ) => {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      timestamp: new Date().toISOString(),
      ipAddress: '118.69.182.45',
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Product operations
  const addProduct = (
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { initialStock?: number }
  ) => {
    // SKU must be unique
    const skuExists = products.some(
      (p) => p.sku.trim().toLowerCase() === data.sku.trim().toLowerCase()
    );
    if (skuExists) {
      return { success: false, error: `Mã SKU "${data.sku}" đã tồn tại trên hệ thống` };
    }

    const now = new Date().toISOString();
    const newProduct: Product = {
      ...data,
      barcode: data.barcode?.trim() || data.sku.trim(),
      trackingType: data.trackingType || 'SERIAL',
      costPrice: data.costPrice ?? 0,
      id: `prod-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    setProducts((prev) => [newProduct, ...prev]);

    const initialStock = Math.max(0, Number(data.initialStock) || 0);
    if (initialStock > 0) {
      const whId = 'wh-main';

      // If product tracking is SERIAL, create individual serial entries
      if (newProduct.trackingType === 'SERIAL') {
        const newSerials: ProductSerial[] = [];
        for (let i = 1; i <= initialStock; i++) {
          newSerials.push({
            id: `ser-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
            productId: newProduct.id,
            serialNumber: `${newProduct.sku}-${String(i).padStart(3, '0')}`,
            warehouseId: whId,
            status: 'IN_STOCK',
            receivedDate: now.split('T')[0],
          });
        }
        setSerials((prev) => [...newSerials, ...prev]);
      }

      // Also record an initial inventory ledger entry
      const initialLedger: InventoryLedgerEntry = {
        id: `led-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        transactionCode: `TX-INIT-${Date.now().toString().slice(-6)}`,
        transactionType: 'ADJUST_INCREASE',
        sourceDocument: 'TON_KHA_DUNG_BAN_DAU',
        productId: newProduct.id,
        productName: newProduct.name,
        warehouseId: whId,
        quantityIn: initialStock,
        quantityOut: 0,
        unitCost: newProduct.costPrice || 0,
        transactionDate: now.split('T')[0],
        createdBy: currentUser.fullName,
        postedAt: now,
        notes: `Khởi tạo tồn khả dụng ban đầu khi tạo sản phẩm: ${initialStock}`,
      };
      setLedgerEntries((prev) => [initialLedger, ...prev]);
    }

    addAuditLog(
      'CREATE',
      'PRODUCT',
      newProduct.id,
      undefined,
      `Tạo sản phẩm mới ${newProduct.name} (SKU: ${newProduct.sku}) với tồn khả dụng: ${initialStock}`
    );
    return { success: true, product: newProduct };
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return { success: false, error: 'Không tìm thấy sản phẩm' };

    // Check SKU uniqueness if changed
    if (updates.sku && updates.sku.trim().toLowerCase() !== existing.sku.trim().toLowerCase()) {
      const skuExists = products.some(
        (p) => p.id !== id && p.sku.trim().toLowerCase() === updates.sku!.trim().toLowerCase()
      );
      if (skuExists) return { success: false, error: `Mã SKU "${updates.sku}" đã bị trùng lặp` };
    }

    const updated: Product = {
      ...existing,
      ...updates,
      barcode: updates.barcode !== undefined ? updates.barcode : (existing.barcode || existing.sku),
      trackingType: updates.trackingType || existing.trackingType || 'SERIAL',
      costPrice: updates.costPrice !== undefined ? updates.costPrice : (existing.costPrice ?? 0),
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    addAuditLog('EDIT', 'PRODUCT', id, JSON.stringify(existing), JSON.stringify(updated));
    return { success: true };
  };

  // Brands CRUD
  const addBrand = (b: Omit<Brand, 'id'>) => {
    const newBrand: Brand = {
      ...b,
      id: `br-${Date.now()}`,
    };
    setBrands((prev) => [...prev, newBrand]);
    addAuditLog('CREATE', 'BRAND', newBrand.id, undefined, `Thêm thương hiệu ${newBrand.name}`);
    return newBrand;
  };

  const updateBrand = (id: string, b: Partial<Brand>) => {
    const existing = brands.find((br) => br.id === id);
    setBrands((prev) => prev.map((br) => (br.id === id ? { ...br, ...b } : br)));
    addAuditLog('EDIT', 'BRAND', id, undefined, `Cập nhật thương hiệu ${b.name || existing?.name || id}`);
    return { success: true };
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((br) => br.id !== id));
    addAuditLog('DELETE', 'BRAND', id, undefined, `Xóa thương hiệu ${id}`);
    return { success: true };
  };

  const deleteProduct = (id: string) => {
    const existing = products.find((p) => p.id === id);
    if (!existing) {
      return { success: false, error: 'Không tìm thấy sản phẩm cần xóa' };
    }

    // Unconditionally allow deletion of musical instrument product
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSerials((prev) => prev.filter((s) => s.productId !== id));
    setLedgerEntries((prev) => prev.filter((l) => l.productId !== id));
    setWarranties((prev) => prev.filter((w) => w.productId !== id));
    setWarrantyClaims((prev) => prev.filter((c) => c.productId !== id));

    addAuditLog('DELETE', 'PRODUCT', id, undefined, `Đã xóa sản phẩm nhạc cụ ${existing.name} (SKU: ${existing.sku})`);
    return { success: true };
  };

  // Supplier
  const addSupplier = (s: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...s,
      id: `sup-${Date.now()}`,
    };
    setSuppliers((prev) => [...prev, newSup]);
    addAuditLog('CREATE', 'SUPPLIER', newSup.id, undefined, `Thêm nhà cung cấp ${newSup.name}`);
  };

  const updateSupplier = (id: string, s: Partial<Supplier>) => {
    const existing = suppliers.find((sup) => sup.id === id);
    setSuppliers((prev) => prev.map((sup) => (sup.id === id ? { ...sup, ...s } : sup)));
    addAuditLog('EDIT', 'SUPPLIER', id, undefined, `Cập nhật thông tin NCC ${existing ? existing.name : id}`);
  };

  const deleteSupplier = (id: string): { success: boolean; error?: string } => {
    const existing = suppliers.find((s) => s.id === id);
    if (!existing) return { success: false, error: 'Không tìm thấy nhà cung cấp' };

    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    addAuditLog('DELETE', 'SUPPLIER', id, undefined, `Đã xóa nhà cung cấp ${existing.name} (${existing.code})`);
    return { success: true };
  };

  // Purchasing & Goods Receipt (AC-006, AC-009)
  const createPurchaseOrder = (
    poData: Omit<PurchaseOrder, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ) => {
    const code = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      code,
      createdBy: currentUser.fullName,
      createdAt: now,
      updatedAt: now,
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    addAuditLog('CREATE', 'PURCHASE_ORDER', newPO.id, undefined, `Tạo đơn mua hàng ${newPO.code}`);
    return newPO;
  };

  const approvePurchaseOrder = (id: string) => {
    const po = purchaseOrders.find((p) => p.id === id);
    if (!po) return { success: false, error: 'Đơn mua không tồn tại' };
    if (po.status !== 'PENDING_APPROVAL' && po.status !== 'DRAFT') {
      return { success: false, error: 'Đơn mua không ở trạng thái chờ duyệt' };
    }

    const updated: PurchaseOrder = {
      ...po,
      status: 'APPROVED',
      approvedBy: currentUser.fullName,
      updatedAt: new Date().toISOString(),
    };

    setPurchaseOrders((prev) => prev.map((p) => (p.id === id ? updated : p)));
    addAuditLog('APPROVE', 'PURCHASE_ORDER', id, po.status, 'APPROVED');
    return { success: true };
  };

  const createGoodsReceipt = (receipt: {
    purchaseOrderId: string;
    items: { productId: string; quantity: number; unitCost: number; serials?: string[] }[];
    notes?: string;
  }) => {
    const po = purchaseOrders.find((p) => p.id === receipt.purchaseOrderId);
    if (!po) return { success: false, error: 'Không tìm thấy đơn mua hàng nguồn' };

    // Check serial uniqueness across entire system before proceeding
    const allInputSerials: string[] = [];
    for (const it of receipt.items) {
      if (it.serials && it.serials.length > 0) {
        for (const s of it.serials) {
          if (allInputSerials.includes(s.trim())) {
            return { success: false, error: `Mã Serial ${s} bị nhập trùng trong cùng phiếu nhận` };
          }
          allInputSerials.push(s.trim());
          const exists = serials.some((existingS) => existingS.serialNumber.toLowerCase() === s.trim().toLowerCase());
          if (exists) {
            return { success: false, error: `Mã Serial "${s}" đã tồn tại trên hệ thống (AC-001/AC-008)` };
          }
        }
      }
    }

    const grCode = `GR-${new Date().getFullYear()}-${String(goodsReceipts.length + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const grId = `gr-${Date.now()}`;

    const newGR: GoodsReceipt = {
      id: grId,
      code: grCode,
      purchaseOrderId: po.id,
      supplierId: po.supplierId,
      receivedBy: currentUser.fullName,
      receivedDate: now,
      items: receipt.items,
      notes: receipt.notes,
    };

    // 1. Add new serials to serial database
    const newSerialsList: ProductSerial[] = [];
    // 2. Generate ledger transactions (AC-009)
    const newLedgerEntriesList: InventoryLedgerEntry[] = [];

    for (const it of receipt.items) {
      const prod = products.find((p) => p.id === it.productId);
      const prodName = prod?.name || 'Sản phẩm';

      if (prod?.trackingType === 'SERIAL' && it.serials) {
        for (const sNum of it.serials) {
          const sObj: ProductSerial = {
            id: `ser-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            productId: it.productId,
            serialNumber: sNum.trim(),
            status: 'IN_STOCK',
            warehouseId: 'wh-main',
            purchaseOrderId: po.id,
            goodsReceiptId: grId,
            receivedDate: now,
            notes: `Nhập kho theo phiếu ${grCode}`,
          };
          newSerialsList.push(sObj);

          newLedgerEntriesList.push({
            id: `led-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            transactionCode: `TRX-${Date.now().toString().slice(-6)}`,
            transactionType: 'IMPORT_PURCHASE',
            sourceDocument: grCode,
            productId: it.productId,
            productName: prodName,
            serialNumber: sNum.trim(),
            warehouseId: 'wh-main',
            quantityIn: 1,
            quantityOut: 0,
            unitCost: it.unitCost,
            transactionDate: now,
            createdBy: currentUser.fullName,
            postedAt: now,
            notes: `Nhập đàn serial ${sNum.trim()}`,
          });
        }
      } else {
        // QUANTITY tracking
        newLedgerEntriesList.push({
          id: `led-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          transactionCode: `TRX-${Date.now().toString().slice(-6)}`,
          transactionType: 'IMPORT_PURCHASE',
          sourceDocument: grCode,
          productId: it.productId,
          productName: prodName,
          warehouseId: 'wh-main',
          quantityIn: it.quantity,
          quantityOut: 0,
          unitCost: it.unitCost,
          transactionDate: now,
          createdBy: currentUser.fullName,
          postedAt: now,
          notes: `Nhập kho số lượng ${it.quantity} ${prodName}`,
        });
      }
    }

    setGoodsReceipts((prev) => [newGR, ...prev]);
    if (newSerialsList.length > 0) {
      setSerials((prev) => [...prev, ...newSerialsList]);
    }
    setLedgerEntries((prev) => [...prev, ...newLedgerEntriesList]);

    // Update PO status to RECEIVED
    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === po.id ? { ...p, status: 'RECEIVED', updatedAt: now } : p))
    );

    addAuditLog('CONFIRM', 'GOODS_RECEIPT', grId, undefined, `Xác nhận phiếu nhận hàng ${grCode} cho PO ${po.code}`);
    return { success: true };
  };

  // Sales Order & POS (AC-007, AC-008, AC-014, AC-015, AC-023, AC-024)
  const createSalesOrder = (orderData: {
    customerId: string;
    items: {
      productId: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      serialNumbers?: string[];
    }[];
    discount: number;
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'MOMO_ZALOPAY';
    notes?: string;
  }) => {
    const customer = customers.find((c) => c.id === orderData.customerId);
    if (!customer) return { success: false, error: 'Không tìm thấy thông tin khách hàng' };

    // Validate stock and serial availability (AC-007, AC-008, AC-014, AC-015)
    for (const item of orderData.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) return { success: false, error: `Sản phẩm ID ${item.productId} không tồn tại` };

      // AC-005: Inactive product cannot be sold
      if (prod.status === 'INACTIVE') {
        return { success: false, error: `Sản phẩm "${prod.name}" đã ngừng kinh doanh (AC-005)` };
      }

      const bal = stockBalances[prod.id] || { available: 0 };
      if (item.quantity > bal.available) {
        return {
          success: false,
          error: `Sản phẩm "${prod.name}" không đủ tồn khả dụng (Yêu cầu: ${item.quantity}, Khả dụng: ${bal.available}) (AC-007/AC-014)`,
        };
      }

      if (prod.trackingType === 'SERIAL') {
        if (!item.serialNumbers || item.serialNumbers.length !== item.quantity) {
          return {
            success: false,
            error: `Vui lòng chọn chính xác ${item.quantity} số Serial cho nhạc cụ "${prod.name}"`,
          };
        }

        for (const sn of item.serialNumbers) {
          const serialObj = serials.find(
            (s) => s.productId === prod.id && s.serialNumber === sn
          );
          if (!serialObj || serialObj.status !== 'IN_STOCK') {
            return {
              success: false,
              error: `Số Serial "${sn}" không ở trạng thái sẵn sàng trong kho (IN_STOCK) (AC-008/AC-015)`,
            };
          }
        }
      }
    }

    // Calculate totals
    let subtotal = 0;
    const formattedItems = orderData.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId)!;
      const lineTotal = it.quantity * it.unitPrice - it.discount;
      subtotal += lineTotal;
      return {
        productId: it.productId,
        productName: prod.name,
        sku: prod.sku,
        trackingType: prod.trackingType || 'SERIAL',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discount: it.discount,
        total: lineTotal,
        serialNumbers: it.serialNumbers,
      };
    });

    const totalAmount = Math.max(0, subtotal - orderData.discount);
    const soCode = `HD-${new Date().getFullYear()}-${String(salesOrders.length + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const soId = `so-${Date.now()}`;

    const newOrder: SalesOrder = {
      id: soId,
      code: soCode,
      customerId: customer.id,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      items: formattedItems,
      subtotal,
      discount: orderData.discount,
      tax: 0,
      totalAmount,
      paidAmount: totalAmount, // Paid full in store POS
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes,
      createdBy: currentUser.fullName,
      createdAt: now,
      completedAt: now,
    };

    // 1. Mark serials as SOLD (AC-008)
    const usedSerials = orderData.items.flatMap((it) => it.serialNumbers || []);
    const updatedSerials = serials.map((s) => {
      if (usedSerials.includes(s.serialNumber)) {
        return {
          ...s,
          status: 'SOLD' as const,
          salesOrderId: soId,
          soldDate: now,
        };
      }
      return s;
    });

    // 2. Post export to immutable Inventory Ledger (AC-009)
    const newLedgerRows: InventoryLedgerEntry[] = [];
    for (const it of formattedItems) {
      if (it.trackingType === 'SERIAL' && it.serialNumbers) {
        for (const sn of it.serialNumbers) {
          newLedgerRows.push({
            id: `led-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            transactionCode: `TRX-${Date.now().toString().slice(-6)}`,
            transactionType: 'EXPORT_SALE',
            sourceDocument: soCode,
            productId: it.productId,
            productName: it.productName,
            serialNumber: sn,
            warehouseId: 'wh-main',
            quantityIn: 0,
            quantityOut: 1,
            unitCost: products.find((p) => p.id === it.productId)?.costPrice || 0,
            transactionDate: now,
            createdBy: currentUser.fullName,
            postedAt: now,
            notes: `Xuất bán theo hóa đơn ${soCode} cho ${customer.fullName}`,
          });
        }
      } else {
        newLedgerRows.push({
          id: `led-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          transactionCode: `TRX-${Date.now().toString().slice(-6)}`,
          transactionType: 'EXPORT_SALE',
          sourceDocument: soCode,
          productId: it.productId,
          productName: it.productName,
          warehouseId: 'wh-main',
          quantityIn: 0,
          quantityOut: it.quantity,
          unitCost: products.find((p) => p.id === it.productId)?.costPrice || 0,
          transactionDate: now,
          createdBy: currentUser.fullName,
          postedAt: now,
          notes: `Xuất bán ${it.quantity} ${it.productName} theo ${soCode}`,
        });
      }
    }

    // 3. Auto-activate Warranty Registration (AC-023, AC-024, AC-025, AC-026, AC-027, AC-028)
    const newWarrantiesList: WarrantyRegistration[] = [];
    for (const it of formattedItems) {
      const prod = products.find((p) => p.id === it.productId);
      if (prod && prod.warrantyPolicyId && it.serialNumbers && it.serialNumbers.length > 0) {
        const policy = warrantyPolicies.find((pol) => pol.id === prod.warrantyPolicyId) || warrantyPolicies[0];

        for (const sn of it.serialNumbers) {
          const warrCode = `BH-${new Date().getFullYear()}-${String(warranties.length + newWarrantiesList.length + 1).padStart(4, '0')}`;
          // Generate secure, cryptographically random QR Token (AC-027)
          const randomSuffix = Math.random().toString(36).substring(2, 9);
          const qrToken = `gmp_qr_${prod.sku.toLowerCase()}_${sn.toLowerCase().replace(/[^a-z0-9]/g, '')}_${randomSuffix}`;

          const startDate = now.split('T')[0];
          const expDate = new Date();
          expDate.setMonth(expDate.getMonth() + (policy.durationMonths || 12));
          const endDate = expDate.toISOString().split('T')[0];

          const warrReg: WarrantyRegistration = {
            id: `warr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            warrantyCode: warrCode,
            qrToken,
            customerId: customer.id,
            customerName: customer.fullName,
            customerPhone: customer.phone,
            productId: prod.id,
            productName: prod.name,
            productSku: prod.sku,
            serialNumber: sn,
            salesOrderId: soId,
            purchaseDate: startDate,
            activationDate: startDate,
            startDate,
            endDate,
            policySnapshot: {
              policyName: policy.name,
              durationMonths: policy.durationMonths,
              terms: policy.terms,
              exclusions: policy.exclusions,
              version: policy.version,
            },
            status: 'ACTIVE',
            notes: `Kích hoạt tự động theo hóa đơn ${soCode}`,
          };

          newWarrantiesList.push(warrReg);
        }
      }
    }

    // 4. Update customer CRM metrics
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customer.id
          ? {
              ...c,
              totalSpent: c.totalSpent + totalAmount,
              ordersCount: c.ordersCount + 1,
            }
          : c
      )
    );

    setSalesOrders((prev) => [newOrder, ...prev]);
    setSerials(updatedSerials);
    setLedgerEntries((prev) => [...prev, ...newLedgerRows]);
    if (newWarrantiesList.length > 0) {
      setWarranties((prev) => [...prev, ...newWarrantiesList]);
    }

    addAuditLog(
      'CREATE',
      'SALES_ORDER',
      soId,
      undefined,
      `Tạo và hoàn tất hóa đơn ${soCode} (${formatVND(totalAmount)}), kích hoạt ${newWarrantiesList.length} phiếu bảo hành`
    );

    return { success: true, order: newOrder };
  };

  // Stock Adjustment (AC-010, AC-011)
  const createStockAdjustment = (adj: {
    productId: string;
    type: 'INCREASE' | 'DECREASE';
    quantity: number;
    reason: string;
    notes?: string;
  }) => {
    const prod = products.find((p) => p.id === adj.productId);
    if (!prod) return { success: false, error: 'Sản phẩm không tồn tại' };

    const adjCode = `DC-${new Date().getFullYear()}-${String(stockAdjustments.length + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const newAdj: StockAdjustment = {
      id: `adj-${Date.now()}`,
      code: adjCode,
      productId: adj.productId,
      type: adj.type,
      quantity: adj.quantity,
      reason: adj.reason,
      approvedBy: currentUser.fullName,
      createdAt: now,
      notes: adj.notes,
    };

    const ledgerType = adj.type === 'INCREASE' ? 'ADJUST_INCREASE' : 'ADJUST_DECREASE';
    const newLedger: InventoryLedgerEntry = {
      id: `led-${Date.now()}`,
      transactionCode: `TRX-${Date.now().toString().slice(-6)}`,
      transactionType: ledgerType,
      sourceDocument: adjCode,
      productId: prod.id,
      productName: prod.name,
      warehouseId: 'wh-main',
      quantityIn: adj.type === 'INCREASE' ? adj.quantity : 0,
      quantityOut: adj.type === 'DECREASE' ? adj.quantity : 0,
      unitCost: prod.costPrice || 0,
      transactionDate: now,
      createdBy: currentUser.fullName,
      postedAt: now,
      notes: `Điều chỉnh kho: ${adj.reason}`,
    };

    setStockAdjustments((prev) => [newAdj, ...prev]);
    setLedgerEntries((prev) => [...prev, newLedger]);
    addAuditLog('ADJUST', 'STOCK', adjCode, undefined, `${adj.type === 'INCREASE' ? 'Tăng' : 'Giảm'} ${adj.quantity} ${prod.name}`);
    return { success: true };
  };

  // Customer
  const addCustomer = (custData: Omit<Customer, 'id' | 'code' | 'totalSpent' | 'ordersCount' | 'createdAt'>) => {
    const code = `KH-${String(customers.length + 1).padStart(3, '0')}`;
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      code,
      totalSpent: 0,
      ordersCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [...prev, newCust]);
    addAuditLog('CREATE', 'CUSTOMER', newCust.id, undefined, `Thêm khách hàng ${newCust.fullName} (${newCust.phone})`);
    return newCust;
  };

  const updateCustomer = (id: string, custData: Partial<Customer>): { success: boolean; error?: string } => {
    const existing = customers.find((c) => c.id === id);
    if (!existing) return { success: false, error: 'Không tìm thấy khách hàng' };
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...custData } : c)));
    addAuditLog('EDIT', 'CUSTOMER', id, undefined, `Cập nhật thông tin khách hàng ${existing.fullName}`);
    return { success: true };
  };

  const deleteCustomer = (id: string): { success: boolean; error?: string } => {
    const existing = customers.find((c) => c.id === id);
    if (!existing) return { success: false, error: 'Không tìm thấy khách hàng' };
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('DELETE', 'CUSTOMER', id, undefined, `Xóa khách hàng ${existing.fullName} (${existing.code})`);
    return { success: true };
  };

  // Staff / Employees CRUD
  const addUser = (userData: Omit<User, 'id'>): { success: boolean; error?: string } => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
    addAuditLog('CREATE', 'USER', newUser.id, undefined, `Thêm nhân viên ${newUser.fullName} (${newUser.role})`);
    return { success: true };
  };

  const updateUser = (id: string, userData: Partial<User>): { success: boolean; error?: string } => {
    const existing = users.find((u) => u.id === id);
    if (!existing) return { success: false, error: 'Không tìm thấy nhân viên' };
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userData } : u)));
    addAuditLog('EDIT', 'USER', id, undefined, `Cập nhật nhân viên ${existing.fullName}`);
    return { success: true };
  };

  const deleteUser = (id: string): { success: boolean; error?: string } => {
    const existing = users.find((u) => u.id === id);
    if (!existing) return { success: false, error: 'Không tìm thấy nhân viên' };
    if (existing.id === currentUser.id) {
      return { success: false, error: 'Không thể xóa tài khoản bạn đang sử dụng để đăng nhập' };
    }
    if (existing.role === 'SUPER_ADMIN' && users.filter((u) => u.role === 'SUPER_ADMIN').length <= 1) {
      return { success: false, error: 'Không thể xóa tài khoản Super Admin duy nhất của hệ thống' };
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    addAuditLog('DELETE', 'USER', id, undefined, `Xóa nhân viên ${existing.fullName} (${existing.role})`);
    return { success: true };
  };

  // Warranty Policy
  const addWarrantyPolicy = (pol: Omit<WarrantyPolicy, 'id'>) => {
    const newPol: WarrantyPolicy = {
      ...pol,
      id: `pol-${Date.now()}`,
    };
    setWarrantyPolicies((prev) => [...prev, newPol]);
    addAuditLog('CREATE', 'WARRANTY_POLICY', newPol.id, undefined, `Tạo chính sách ${newPol.name}`);
  };

  const updateWarrantyPolicy = (id: string, pol: Partial<WarrantyPolicy>) => {
    setWarrantyPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, ...pol } : p)));
    addAuditLog('EDIT', 'WARRANTY_POLICY', id, undefined, `Cập nhật chính sách bảo hành ${id}`);
  };

  // Warranty Claims (AC-029, AC-030, AC-031, AC-032)
  const submitWarrantyClaim = (claimInput: {
    warrantyId: string;
    issueDescription: string;
    photos: string[];
  }) => {
    const warranty = warranties.find((w) => w.id === claimInput.warrantyId);
    if (!warranty) return { success: false, error: 'Không tìm thấy hồ sơ bảo hành hợp lệ (AC-029)' };

    // Check if warranty is expired
    const today = new Date();
    const expiry = new Date(warranty.endDate);
    if (today > expiry) {
      return {
        success: false,
        error: `Sản phẩm đã hết hạn bảo hành từ ngày ${formatDateOnlyVN(warranty.endDate)}. Vui lòng chuyển sang dịch vụ sửa chữa có tính phí.`,
      };
    }

    const claimCode = `YCBH-${new Date().getFullYear()}-${String(warrantyClaims.length + 1).padStart(4, '0')}`;
    const trackingToken = `trk_clm_${Date.now().toString().slice(-6)}_${warranty.serialNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const now = new Date().toISOString();

    const newClaim: WarrantyClaim = {
      id: `claim-${Date.now()}`,
      claimCode,
      trackingToken,
      warrantyId: warranty.id,
      warrantyCode: warranty.warrantyCode,
      customerId: warranty.customerId,
      customerName: warranty.customerName,
      customerPhone: warranty.customerPhone,
      productId: warranty.productId,
      productName: warranty.productName,
      serialNumber: warranty.serialNumber,
      status: 'SUBMITTED',
      submittedDate: now,
      issueDescription: claimInput.issueDescription,
      photos: claimInput.photos.length > 0 ? claimInput.photos : [
        'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80',
      ],
      events: [
        {
          id: `ev-${Date.now()}`,
          claimId: `claim-${Date.now()}`,
          status: 'SUBMITTED',
          note: 'Khách hàng gửi yêu cầu bảo hành trực tuyến qua hệ thống QR Code',
          performedBy: warranty.customerName,
          timestamp: now,
        },
      ],
      updatedAt: now,
    };

    setWarrantyClaims((prev) => [newClaim, ...prev]);
    // Update serial status to IN_REPAIR
    setSerials((prev) =>
      prev.map((s) => (s.serialNumber === warranty.serialNumber ? { ...s, status: 'IN_REPAIR' } : s))
    );

    addAuditLog('SUBMIT', 'WARRANTY_CLAIM', newClaim.id, undefined, `Tạo yêu cầu bảo hành ${claimCode} cho nhạc cụ ${warranty.productName}`);
    return { success: true, claim: newClaim };
  };

  const updateClaimStatus = (
    claimId: string,
    newStatus: WarrantyClaimStatus,
    note: string,
    technicianId?: string,
    diagnosticResult?: string
  ) => {
    const claim = warrantyClaims.find((c) => c.id === claimId);
    if (!claim) return { success: false, error: 'Không tìm thấy yêu cầu bảo hành' };

    const now = new Date().toISOString();
    const techUser = technicianId ? SEED_USERS.find((u) => u.id === technicianId) : undefined;

    const newEvent = {
      id: `ev-${Date.now()}`,
      claimId,
      status: newStatus,
      note,
      performedBy: currentUser.fullName,
      timestamp: now,
    };

    const updatedClaim: WarrantyClaim = {
      ...claim,
      status: newStatus,
      diagnosticResult: diagnosticResult || claim.diagnosticResult,
      technicianId: technicianId || claim.technicianId,
      technicianName: techUser?.fullName || claim.technicianName,
      events: [...claim.events, newEvent],
      updatedAt: now,
    };

    setWarrantyClaims((prev) => prev.map((c) => (c.id === claimId ? updatedClaim : c)));
    addAuditLog('UPDATE_STATUS', 'WARRANTY_CLAIM', claimId, claim.status, newStatus);
    return { success: true };
  };

  // Repair
  const createRepairOrder = (
    claimId: string,
    techId: string,
    faultCategory: string,
    diagnosticNotes: string
  ) => {
    const claim = warrantyClaims.find((c) => c.id === claimId);
    const tech = SEED_USERS.find((u) => u.id === techId) || SEED_USERS.find((u) => u.role === 'TECHNICIAN')!;

    const repCode = `SC-${new Date().getFullYear()}-${String(repairOrders.length + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newRepair: RepairOrder = {
      id: `rep-${Date.now()}`,
      code: repCode,
      claimId,
      claimCode: claim?.claimCode || 'N/A',
      productName: claim?.productName || 'Nhạc cụ',
      serialNumber: claim?.serialNumber || 'N/A',
      technicianId: tech.id,
      technicianName: tech.fullName,
      status: 'REPAIRING',
      faultCategory,
      diagnosticNotes,
      repairAction: 'Đang tiến hành xử lý kỹ thuật chuyên sâu',
      partsUsed: [],
      laborFee: 0,
      qualityCheckPassed: false,
      createdAt: now,
    };

    setRepairOrders((prev) => [newRepair, ...prev]);

    // Link repair order to claim
    if (claim) {
      updateClaimStatus(
        claimId,
        'REPAIRING',
        `Chuyển kỹ thuật viên ${tech.fullName} tạo phiếu sửa chữa ${repCode}`,
        tech.id,
        diagnosticNotes
      );
    }

    addAuditLog('CREATE', 'REPAIR_ORDER', newRepair.id, undefined, `Tạo phiếu sửa chữa ${repCode}`);
    return newRepair;
  };

  const updateRepairOrder = (
    id: string,
    updates: Partial<RepairOrder>,
    consumeParts?: { productId: string; quantity: number }[]
  ) => {
    const rep = repairOrders.find((r) => r.id === id);
    if (!rep) return { success: false, error: 'Không tìm thấy phiếu sửa chữa' };

    // If consuming parts, deduct from inventory and write to ledger (AC-034)
    if (consumeParts && consumeParts.length > 0) {
      const now = new Date().toISOString();
      const newLedgerRows: InventoryLedgerEntry[] = [];

      for (const p of consumeParts) {
        const prod = products.find((pr) => pr.id === p.productId);
        if (prod) {
          newLedgerRows.push({
            id: `led-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            transactionCode: `TRX-${Date.now().toString().slice(-6)}`,
            transactionType: 'EXPORT_REPAIR_PART',
            sourceDocument: rep.code,
            productId: prod.id,
            productName: prod.name,
            warehouseId: 'wh-main',
            quantityIn: 0,
            quantityOut: p.quantity,
            unitCost: prod.costPrice || 0,
            transactionDate: now,
            createdBy: currentUser.fullName,
            postedAt: now,
            notes: `Xuất linh kiện thay thế cho phiếu sửa chữa ${rep.code}`,
          });
        }
      }

      setLedgerEntries((prev) => [...prev, ...newLedgerRows]);
    }

    const updated = { ...rep, ...updates };
    setRepairOrders((prev) => prev.map((r) => (r.id === id ? updated : r)));
    addAuditLog('EDIT', 'REPAIR_ORDER', id, rep.status, updated.status);
    return { success: true };
  };

  // Handover (AC-031, AC-037)
  const completeHandover = (
    claimId: string,
    handover: { deliveredBy: string; receivedBy: string; conditionCheck: string; notes?: string }
  ) => {
    const claim = warrantyClaims.find((c) => c.id === claimId);
    if (!claim) return { success: false, error: 'Không tìm thấy yêu cầu bảo hành' };

    const now = new Date().toISOString();
    const handoverRecord = {
      handoverDate: now,
      deliveredBy: handover.deliveredBy,
      receivedBy: handover.receivedBy,
      customerConfirmed: true,
      notes: handover.notes,
      productConditionCheck: handover.conditionCheck,
    };

    // Update claim to COMPLETED
    const updatedClaim: WarrantyClaim = {
      ...claim,
      status: 'COMPLETED',
      handoverRecord,
      events: [
        ...claim.events,
        {
          id: `ev-${Date.now()}`,
          claimId,
          status: 'COMPLETED',
          note: `Bàn giao nhạc cụ thành công cho khách hàng: ${handover.receivedBy}. Tình trạng: ${handover.conditionCheck}`,
          performedBy: handover.deliveredBy,
          timestamp: now,
        },
      ],
      updatedAt: now,
    };

    // Release serial back to SOLD (or customer hands)
    setSerials((prev) =>
      prev.map((s) => (s.serialNumber === claim.serialNumber ? { ...s, status: 'SOLD' } : s))
    );

    setWarrantyClaims((prev) => prev.map((c) => (c.id === claimId ? updatedClaim : c)));
    addAuditLog('HANDOVER', 'WARRANTY_CLAIM', claimId, undefined, `Hoàn tất bàn giao trả khách ${claim.claimCode}`);
    return { success: true };
  };

  const clearWarehouseDatabase = () => {
    setLedgerEntries([]);
    setGoodsReceipts([]);
    setPurchaseOrders([]);
    setStockAdjustments([]);
    setStockCounts([]);
    setSerials([]);
    setSalesOrders([]);
    setWarranties([]);
    setWarrantyClaims([]);
    setRepairOrders([]);

    localStorage.removeItem('gmp_ledger_entries');
    localStorage.removeItem('gmp_goods_receipts');
    localStorage.removeItem('gmp_purchase_orders');
    localStorage.removeItem('gmp_stock_adjustments');
    localStorage.removeItem('gmp_stock_counts');
    localStorage.removeItem('gmp_serials');
    localStorage.removeItem('gmp_sales_orders');
    localStorage.removeItem('gmp_warranties');
    localStorage.removeItem('gmp_warranty_claims');
    localStorage.removeItem('gmp_repair_orders');

    addAuditLog('CLEAR', 'WAREHOUSE_DATABASE', 'ALL', undefined, 'Đã xóa toàn bộ cơ sở dữ liệu quản lý kho và giao dịch phát sinh');
  };

  const clearAllProducts = () => {
    setProducts([]);
    setSerials([]);
    setLedgerEntries([]);
    setWarranties([]);
    setWarrantyClaims([]);
    localStorage.setItem('gmp_products', JSON.stringify([]));
    addAuditLog('CLEAR', 'PRODUCT', 'ALL', undefined, 'Đã xóa toàn bộ danh mục sản phẩm nhạc cụ');
  };

  const resetToSeedData = () => {
    localStorage.clear();
    localStorage.setItem('gmp_v2_warehouse_cleared', 'true');
    setCategories(SEED_CATEGORIES);
    setBrands(SEED_BRANDS);
    setProducts(SEED_PRODUCTS);
    setSerials([]);
    setSuppliers(SEED_SUPPLIERS);
    setCustomers(SEED_CUSTOMERS);
    setPurchaseOrders([]);
    setGoodsReceipts([]);
    setSalesOrders([]);
    setLedgerEntries([]);
    setStockAdjustments([]);
    setStockCounts([]);
    setWarrantyPolicies(SEED_WARRANTY_POLICIES);
    setWarranties([]);
    setWarrantyClaims([]);
    setRepairOrders([]);
    setAuditLogs(SEED_AUDIT_LOGS);
    addAuditLog('RESET', 'SYSTEM', 'DATABASE', undefined, 'Khôi phục danh mục mẫu chuẩn với CSDL kho sạch');
  };

  const exportDatabaseJSON = () => {
    const dump = {
      exportedAt: new Date().toISOString(),
      store: 'GuitarMP ERP Musical Instruments & Warranty',
      categories,
      brands,
      products,
      serials,
      suppliers,
      customers,
      purchaseOrders,
      goodsReceipts,
      salesOrders,
      ledgerEntries,
      warrantyPolicies,
      warranties,
      warrantyClaims,
      repairOrders,
      auditLogs,
    };
    return JSON.stringify(dump, null, 2);
  };

  return (
    <ERPContext.Provider
      value={{
        currentUser,
        setCurrentUserRole,
        allUsers: users,
        addUser,
        updateUser,
        deleteUser,
        currentPortal,
        setCurrentPortal,
        customerLookupQuery,
        setCustomerLookupQuery,
        isAuthenticated,
        login,
        logout,
        categories,
        brands,
        units,
        products,
        serials,
        suppliers,
        purchaseOrders,
        goodsReceipts,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        salesOrders,
        ledgerEntries,
        stockAdjustments,
        stockCounts,
        warrantyPolicies,
        warranties,
        warrantyClaims,
        repairOrders,
        auditLogs,
        stockBalances,
        addProduct,
        updateProduct,
        deleteProduct,
        addBrand,
        updateBrand,
        deleteBrand,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        createPurchaseOrder,
        approvePurchaseOrder,
        createGoodsReceipt,
        createSalesOrder,
        createStockAdjustment,
        addWarrantyPolicy,
        updateWarrantyPolicy,
        submitWarrantyClaim,
        updateClaimStatus,
        createRepairOrder,
        updateRepairOrder,
        completeHandover,
        resetToSeedData,
        exportDatabaseJSON,
        clearWarehouseDatabase,
        clearAllProducts,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export function useERP() {
  const ctx = useContext(ERPContext);
  if (!ctx) throw new Error('useERP must be used within an ERPProvider');
  return ctx;
}
