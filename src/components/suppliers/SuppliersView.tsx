import React, { useState, useMemo } from 'react';
import {
  Building,
  Plus,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  Search,
  DollarSign,
  Tag,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useERP, formatVND } from '../../context/ERPContext';
import { Supplier } from '../../types/erp';

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, purchaseOrders } = useERP();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Edit / Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSup, setEditingSup] = useState<Supplier | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [debtAmount, setDebtAmount] = useState(0);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Delete Confirmation Modal state
  const [deletingSup, setDeletingSup] = useState<Supplier | null>(null);

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const handleOpenAdd = () => {
    setEditingSup(null);
    setName('');
    setCode(`SUP-${Date.now().toString().slice(-4)}`);
    setContactName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setTaxCode('');
    setDebtAmount(0);
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSup(s);
    setName(s.name);
    setCode(s.code);
    setContactName(s.contactName);
    setPhone(s.phone);
    setEmail(s.email);
    setAddress(s.address);
    setTaxCode(s.taxCode || '');
    setDebtAmount(s.debtAmount);
    setStatus(s.status || 'ACTIVE');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showFeedback('error', 'Vui lòng nhập tên nhà phân phối / xưởng đàn');
      return;
    }
    if (!phone.trim()) {
      showFeedback('error', 'Vui lòng nhập số điện thoại liên hệ');
      return;
    }

    if (editingSup) {
      updateSupplier(editingSup.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        taxCode: taxCode.trim(),
        debtAmount: Math.max(0, debtAmount),
        status,
      });
      showFeedback('success', `Đã cập nhật thông tin nhà cung cấp "${name}" thành công!`);
    } else {
      addSupplier({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        taxCode: taxCode.trim(),
        debtAmount: Math.max(0, debtAmount),
        status,
      });
      showFeedback('success', `Đã thêm mới nhà cung cấp "${name}" thành công!`);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingSup) return;
    const res = deleteSupplier(deletingSup.id);
    if (res.success) {
      showFeedback('success', `Đã xóa nhà cung cấp "${deletingSup.name}" (${deletingSup.code}) thành công.`);
    } else {
      showFeedback('error', res.error || 'Có lỗi xảy ra khi xóa nhà cung cấp.');
    }
    setDeletingSup(null);
  };

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.contactName.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.taxCode && s.taxCode.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && s.status !== 'INACTIVE') ||
        (statusFilter === 'INACTIVE' && s.status === 'INACTIVE');

      return matchSearch && matchStatus;
    });
  }, [suppliers, searchQuery, statusFilter]);

  // Statistics
  const totalDebt = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + (s.debtAmount || 0), 0);
  }, [suppliers]);

  const activeCount = useMemo(() => {
    return suppliers.filter((s) => s.status !== 'INACTIVE').length;
  }, [suppliers]);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl shadow-md border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-black/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-amber-600" />
            Nhà Cung Cấp Nhạc Cụ & Phụ Kiện (Suppliers)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý thông tin nhà phân phối chính hãng (Yamaha, Ba Đờn, Swee Lee), công nợ, chỉnh sửa và xóa nhà cung cấp
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Nhà Cung Cấp</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Tổng Nhà Cung Cấp</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 flex items-baseline gap-2">
            <span>{suppliers.length}</span>
            <span className="text-xs font-normal text-slate-400">đối tác xưởng đàn</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Đang Hoạt Động</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 flex items-baseline gap-2">
            <span>{activeCount}</span>
            <span className="text-xs font-normal text-slate-400">/ {suppliers.length} NCC</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Tổng Công Nợ NCC Phải Trả</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {formatVND(totalDebt)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã NCC, người liên hệ, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Trạng thái:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs w-full md:w-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({suppliers.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'ACTIVE' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoạt động ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'INACTIVE' ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tạm ngừng ({suppliers.length - activeCount})
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Suppliers */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">
            {searchQuery ? 'Không tìm thấy nhà cung cấp phù hợp' : 'Chưa có nhà cung cấp nào'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc trạng thái để xem danh sách.'
              : 'Hãy thêm nhà cung cấp nhạc cụ mới để bắt đầu quản lý nhập hàng và công nợ.'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          ) : (
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Nhà Cung Cấp Đầu Tiên</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((s) => {
            const poCount = purchaseOrders.filter((po) => po.supplierId === s.id).length;
            const isInactive = s.status === 'INACTIVE';

            return (
              <div
                key={s.id}
                className={`bg-white p-5 rounded-2xl border transition-shadow shadow-xs hover:shadow-md space-y-3.5 relative flex flex-col justify-between ${
                  isInactive ? 'border-slate-200 bg-slate-50/60 opacity-90' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar with Badges and Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {s.code}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isInactive
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isInactive ? 'Tạm ngừng' : 'Đang hoạt động'}
                      </span>
                    </div>

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        title="Sửa thông tin nhà cung cấp"
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-amber-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingSup(s)}
                        title="Xóa nhà cung cấp"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Supplier Name */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{s.name}</h3>
                    {s.taxCode && (
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        MST: {s.taxCode}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="text-slate-400">Đại diện:</span>
                      <span className="text-slate-800 font-semibold">{s.contactName || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{s.phone}</span>
                    </div>
                    {s.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{s.email}</span>
                      </div>
                    )}
                    {s.address && (
                      <div className="flex items-start gap-1.5 text-slate-500 text-[11px] leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{s.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Debt and PO count */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Công nợ hiện hành:</span>
                    <span
                      className={`font-bold font-mono ${
                        s.debtAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {formatVND(s.debtAmount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 text-[11px] bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <ShoppingBag className="w-3 h-3 text-slate-400" />
                    <span>{poCount} đơn mua</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-600" />
                {editingSup ? `Cập Nhật Nhà Cung Cấp: ${editingSup.name}` : 'Thêm Nhà Cung Cấp Nhạc Cụ'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tên Nhà Phân Phối / Xưởng Đàn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Yamaha Music Vietnam, Xưởng Guitar Ba Đờn..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Mã Nhà Cung Cấp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Người Đại Diện / Liên Hệ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Họ tên người liên hệ"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Số Điện Thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="090..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Liên Hệ</label>
                  <input
                    type="email"
                    placeholder="sales@supplier.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Địa Chỉ Trụ Sở / Xưởng</label>
                <input
                  type="text"
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mã Số Thuế (MST)</label>
                  <input
                    type="text"
                    placeholder="0312345678"
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Công Nợ Hiện Tại (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-right font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Trạng Thái Hoạt Động</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                >
                  <option value="ACTIVE">Đang Hoạt Động (Nhập hàng bình thường)</option>
                  <option value="INACTIVE">Tạm Ngừng Hợp Tác</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shadow-xs"
                >
                  {editingSup ? 'Cập Nhật Thay Đổi' : 'Tạo Nhà Cung Cấp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (In-App) */}
      {deletingSup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác Nhận Xóa Nhà Cung Cấp</h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã NCC:</span>
                <span className="font-mono font-bold text-slate-800">{deletingSup.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tên NCC:</span>
                <span className="font-semibold text-slate-900">{deletingSup.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Người liên hệ:</span>
                <span className="text-slate-700">{deletingSup.contactName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Công nợ hiện hành:</span>
                <span className={`font-mono font-bold ${deletingSup.debtAmount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {formatVND(deletingSup.debtAmount)}
                </span>
              </div>
            </div>

            {purchaseOrders.filter((po) => po.supplierId === deletingSup.id).length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Nhà cung cấp này có {purchaseOrders.filter((po) => po.supplierId === deletingSup.id).length} đơn đặt hàng trong hệ thống. Dữ liệu lịch sử đơn mua vẫn sẽ được lưu trữ an toàn.
                </span>
              </div>
            )}

            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa nhà cung cấp <strong>{deletingSup.name}</strong> khỏi danh sách đối tác không?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSup(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác Nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
