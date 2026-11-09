import React from 'react';
import {
  Music,
  ShieldCheck,
  Store,
  Layers,
  LogOut,
  Lock,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface TopNavbarProps {
  onSearchGlobal?: (term: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = () => {
  const {
    currentPortal,
    setCurrentPortal,
    isAuthenticated,
    logout,
    warrantyClaims,
    products,
    stockBalances,
  } = useERP();

  // Active alerts count
  const pendingClaims = warrantyClaims.filter(
    (c) => c.status !== 'COMPLETED' && c.status !== 'CANCELLED' && c.status !== 'REJECTED'
  ).length;

  const lowStockCount = products.filter((p) => {
    const bal = stockBalances[p.id]?.available || 0;
    return bal <= p.minStock;
  }).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo and Store Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                    Guitar Minh Phát <span className="text-amber-400 font-extrabold text-sm px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">ERP</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  1021 Tỉnh Lộ 10 - Phường Tân Tạo , TP.HCM • Hotline: 0938 694 798
                </p>
              </div>
            </div>

            {/* Portal Switcher (Admin vs Customer Warranty Portal) */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              <button
                onClick={() => setCurrentPortal('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentPortal === 'admin'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Quản trị Kho & Bán hàng</span>
              </button>

              <button
                onClick={() => setCurrentPortal('customer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentPortal === 'customer'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Cổng Tra cứu Bảo hành (Khách QR)</span>
              </button>
            </div>

            {/* Right Tools & Role Switcher */}
            <div className="flex items-center gap-2.5">
              {/* Notification Badges */}
              <div className="hidden lg:flex items-center gap-2 text-xs">
                {pendingClaims > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                    <span>{pendingClaims} ca bảo hành</span>
                  </span>
                )}
                {lowStockCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lowStockCount} hàng sắp hết</span>
                  </span>
                )}
              </div>



              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-[10px]">
                      MP
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="font-bold text-white text-xs leading-tight flex items-center gap-1">
                        guitarminhphat
                      </div>
                      <div className="text-[10px] text-amber-400 font-medium">
                        Super Admin
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản Super Admin?')) {
                        logout();
                      }
                    }}
                    title="Đăng xuất khỏi trang quản trị"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600/80 border border-rose-500/30 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCurrentPortal('admin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-sm transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Đăng Nhập Quản Trị</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
