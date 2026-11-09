import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { TopNavbar } from './components/navbar/TopNavbar';
import { AdminSidebar, AdminTab } from './components/admin/AdminSidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductsView } from './components/products/ProductsView';
import { PurchasingView } from './components/purchasing/PurchasingView';
import { SalesView } from './components/sales/SalesView';
import { CustomersView } from './components/customers/CustomersView';
import { WarrantyView } from './components/warranty/WarrantyView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { UsersView } from './components/users/UsersView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { CustomerWarrantyPortal } from './components/portal/CustomerWarrantyPortal';
import { AdminLoginModal } from './components/auth/AdminLoginModal';

const MainAppContent: React.FC = () => {
  const { currentPortal, isAuthenticated } = useERP();
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {currentPortal === 'admin' && isAuthenticated && <TopNavbar />}

      {currentPortal === 'admin' ? (
        !isAuthenticated ? (
          <AdminLoginModal />
        ) : (
          <div className="flex-1 flex flex-col md:flex-row">
            <AdminSidebar activeTab={activeAdminTab} onTabChange={setActiveAdminTab} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
              {activeAdminTab === 'dashboard' && (
                <DashboardView onNavigateTab={setActiveAdminTab} />
              )}
              {activeAdminTab === 'products' && <ProductsView />}
              {activeAdminTab === 'purchasing' && <PurchasingView />}
              {activeAdminTab === 'sales' && <SalesView />}
              {activeAdminTab === 'customers' && <CustomersView />}
              {activeAdminTab === 'warranty' && <WarrantyView />}
              {activeAdminTab === 'suppliers' && <SuppliersView />}
              {activeAdminTab === 'users_rbac' && <UsersView />}
              {activeAdminTab === 'audit_logs' && <AuditLogsView />}
            </main>
          </div>
        )
      ) : (
        <main className="flex-1 bg-slate-50">
          <CustomerWarrantyPortal />
        </main>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ERPProvider>
      <MainAppContent />
    </ERPProvider>
  );
}
