import React from 'react';
import {
  LayoutDashboard,
  Guitar,
  Truck,
  Boxes,
  BookOpenText,
  ShoppingCart,
  Users,
  ShieldCheck,
  Wrench,
  Building,
  BarChart3,
  UserCog,
  History,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'purchasing'
  | 'sales'
  | 'customers'
  | 'warranty'
  | 'suppliers'
  | 'users_rbac'
  | 'audit_logs';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const { warrantyClaims, products, stockBalances } = useERP();

  const pendingClaims = warrantyClaims.filter(
    (c) => c.status !== 'COMPLETED' && c.status !== 'CANCELLED' && c.status !== 'REJECTED'
  ).length;

  const lowStockCount = products.filter((p) => {
    const bal = stockBalances[p.id]?.available || 0;
    return bal <= p.minStock;
  }).length;

  const navItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Tổng quan Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Sản phẩm Nhạc cụ', icon: Guitar, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'sales', label: 'Bán hàng & Hóa đơn', icon: ShoppingCart },
    { id: 'purchasing', label: 'Nhập hàng & Đơn mua', icon: Truck },
    { id: 'warranty', label: 'Bảo hành Điện tử QR', icon: ShieldCheck, badge: pendingClaims > 0 ? pendingClaims : undefined, badgeColor: 'bg-rose-100 text-rose-800' },
    { id: 'customers', label: 'Khách hàng (CRM)', icon: Users },
    { id: 'suppliers', label: 'Nhà cung cấp', icon: Building },
    { id: 'users_rbac', label: 'Nhân viên & Phân quyền', icon: UserCog },
    { id: 'audit_logs', label: 'Nhật ký hoạt động', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-slate-800/80">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Phân hệ Quản trị ERP
        </div>
        <div className="text-xs text-slate-300 font-medium mt-0.5">
          Single Store • 1 Kho Hoạt Động
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-900 text-amber-400' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Store Info */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="font-medium text-slate-300">Guitar MP Music Store</div>
        <div>Hotline: 0908.123.456</div>
        <div>Email: shopguitarmp@gmail.com</div>
        <div className="text-[10px] text-slate-500 pt-1">Phiên bản PRD 1.0 • VNĐ</div>
      </div>
    </aside>
  );
};
