import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  ShieldCheck,
  Users,
  DollarSign,
  Clock,
  ArrowUpRight,
  Calendar,
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Phone,
  Guitar,
  FileText,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { useERP, formatVND, formatDateOnlyVN, formatDateVN } from '../../context/ERPContext';
import { AdminTab } from '../admin/AdminSidebar';

interface DashboardViewProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const {
    salesOrders,
    warranties,
    warrantyClaims,
    customers,
  } = useERP();

  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'month'>('month');

  // 1. Orders & Sales metrics
  const totalRevenue = useMemo(() => {
    return salesOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }, [salesOrders]);

  const completedOrdersCount = useMemo(() => {
    return salesOrders.filter((o) => o.status === 'COMPLETED').length;
  }, [salesOrders]);

  // 2. Warranty metrics
  const activeClaims = useMemo(() => {
    return warrantyClaims.filter(
      (c) => c.status !== 'COMPLETED' && c.status !== 'CANCELLED' && c.status !== 'REJECTED'
    );
  }, [warrantyClaims]);

  const expiringWarranties = useMemo(() => {
    const now = new Date();
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);

    return warranties.filter((w) => {
      if (w.status !== 'ACTIVE') return false;
      const end = new Date(w.endDate);
      return end >= now && end <= next30Days;
    });
  }, [warranties]);

  // 3. Customers metrics
  const customersWithOrders = useMemo(() => {
    return customers.filter((c) => c.ordersCount > 0).length;
  }, [customers]);

  const topCustomers = useMemo(() => {
    return [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guitar Minh Phát • Trung Tâm Điều Hành</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Tổng Quan Hoạt Động Cửa Hàng</h1>
          <p className="text-sm text-slate-300 mt-1">
            Báo cáo tập trung: Bảo hành điện tử QR, Đơn đặt hàng & Bán hàng POS, Quản lý khách hàng CRM
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center bg-slate-800/90 p-1.5 rounded-xl border border-slate-700">
          <Calendar className="w-4 h-4 text-amber-400 ml-2 mr-1" />
          {(['today', '7days', '30days', 'month'] as const).map((r) => {
            const labels = {
              today: 'Hôm nay',
              '7days': '7 ngày',
              '30days': '30 ngày',
              month: 'Tháng này',
            };
            return (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  dateRange === r ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {labels[r]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Core KPI Cards (Đơn Đặt Hàng, Bảo Hành, Khách Hàng) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KPI 1: Đơn Đặt Hàng */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="font-semibold text-slate-700">Đơn Đặt Hàng (Sales Orders)</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatVND(totalRevenue)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-amber-700">{salesOrders.length}</span> đơn hàng đã ghi nhận ({completedOrdersCount} hoàn tất)
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">POS & Hóa đơn bán lẻ</span>
            <button
              onClick={() => onNavigateTab('sales')}
              className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Xem đơn hàng <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* KPI 2: Bảo Hành Điện Tử */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="font-semibold text-slate-700">Bảo Hành Điện Tử (Warranties)</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>{warranties.length}</span>
              <span className="text-sm font-normal text-slate-400">hồ sơ kích hoạt QR</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-rose-600">{activeClaims.length} ca</span> yêu cầu bảo hành đang xử lý
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Tra cứu & Kỹ thuật QC</span>
            <button
              onClick={() => onNavigateTab('warranty')}
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Quản lý bảo hành <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* KPI 3: Khách Hàng */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="font-semibold text-slate-700">Khách Hàng (Customer CRM)</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>{customers.length}</span>
              <span className="text-sm font-normal text-slate-400">khách hàng đăng ký</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-emerald-700">{customersWithOrders} khách</span> đã mua và sở hữu đàn
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Hồ sơ 360° khách hàng</span>
            <button
              onClick={() => onNavigateTab('customers')}
              className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Xem khách hàng <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Section 1: Đơn Đặt Hàng Gần Đây */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">Đơn Đặt Hàng Gần Đây</h3>
          </div>
          <button
            onClick={() => onNavigateTab('sales')}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
          >
            Tạo đơn POS mới <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Mã Hóa Đơn</th>
                <th className="py-3 px-3">Khách Hàng</th>
                <th className="py-3 px-3">Nhạc Cụ & Sản Phẩm Mua</th>
                <th className="py-3 px-3 text-right">Tổng Tiền (VNĐ)</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-3 text-center">Thanh Toán</th>
                <th className="py-3 px-4 text-right">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Chưa có đơn đặt hàng nào trong hệ thống
                  </td>
                </tr>
              ) : (
                salesOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{order.code}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{order.customerPhone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="text-[11px] text-slate-700">
                            • <span className="font-medium">{it.productName}</span> (x{it.quantity})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatVND(order.totalAmount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {order.status === 'COMPLETED' ? 'Hoàn tất' : order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {order.paymentMethod === 'BANK_TRANSFER'
                          ? 'Chuyển khoản'
                          : order.paymentMethod === 'CASH'
                          ? 'Tiền mặt'
                          : order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                      {formatDateOnlyVN(order.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Section 2 & 3: Bảo Hành & Khách Hàng (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Bảo Hành (Active Claims & Expiring Soon) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Bảo Hành: Yêu Cầu Cần Xử Lý</h3>
            </div>
            <button
              onClick={() => onNavigateTab('warranty')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              Hồ sơ bảo hành <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {activeClaims.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl">
              Không có yêu cầu bảo hành nào đang chờ xử lý
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeClaims.slice(0, 3).map((claim) => (
                <div key={claim.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{claim.claimCode}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {claim.status}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800">{claim.productName} (SN: {claim.serialNumber})</div>
                  <p className="text-slate-500 text-[11px] line-clamp-1">"{claim.issueDescription}"</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>Khách: {claim.customerName}</span>
                    <span>KT: {claim.technicianName || 'Chưa phân công'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Expiring Soon Warranties */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Hồ sơ bảo hành sắp hết hạn trong 30 ngày ({expiringWarranties.length})</span>
            </div>
            {expiringWarranties.length === 0 ? (
              <div className="text-xs text-slate-400 italic">
                Không có bảo hành nào sắp hết hạn trong 30 ngày tới
              </div>
            ) : (
              <div className="space-y-1.5">
                {expiringWarranties.slice(0, 2).map((w) => (
                  <div key={w.id} className="p-2 rounded-lg bg-indigo-50/40 border border-indigo-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-slate-900">{w.productName}</span>
                      <span className="text-slate-500 text-[11px] ml-1.5 font-mono">({w.customerName})</span>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-700">
                      Hết hạn: {formatDateOnlyVN(w.endDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Module Khách Hàng (Top Customers & CRM Highlights) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Khách Hàng: Gắn Bó & Mua Nhiều Nhất</h3>
            </div>
            <button
              onClick={() => onNavigateTab('customers')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              Danh sách CRM <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {topCustomers.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl">
                Chưa có dữ liệu khách hàng
              </div>
            ) : (
              topCustomers.map((cust, idx) => (
                <div key={cust.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{cust.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {cust.phone} • {cust.ordersCount} đơn mua
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-700">{formatVND(cust.totalSpent)}</div>
                    <div className="text-[10px] text-slate-400">tổng chi tiêu</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick CRM Summary */}
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Tổng cộng {customers.length} khách hàng trong cơ sở dữ liệu</span>
            <button
              onClick={() => onNavigateTab('customers')}
              className="font-medium text-emerald-700 hover:underline cursor-pointer"
            >
              + Thêm khách hàng mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
