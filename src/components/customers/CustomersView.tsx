import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Guitar,
  ShieldCheck,
  History,
  X,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useERP, formatVND, formatDateVN, formatDateOnlyVN } from '../../context/ERPContext';
import { Customer } from '../../types/erp';

export const CustomersView: React.FC = () => {
  const { customers, salesOrders, warranties, addCustomer, updateCustomer, deleteCustomer } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [notes, setNotes] = useState('');

  // Delete Confirmation State
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFullName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setDateOfBirth('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFullName(c.fullName);
    setPhone(c.phone);
    setEmail(c.email || '');
    setAddress(c.address || '');
    setDateOfBirth(c.dateOfBirth || '');
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showFeedback('error', 'Vui lòng nhập họ và tên khách hàng');
      return;
    }
    if (!phone.trim()) {
      showFeedback('error', 'Vui lòng nhập số điện thoại');
      return;
    }

    if (editingCustomer) {
      const res = updateCustomer(editingCustomer.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        dateOfBirth: dateOfBirth || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        showFeedback('success', `Đã cập nhật thông tin khách hàng "${fullName}" thành công!`);
        // If currently viewing in drawer, update reference
        if (selectedCustomer?.id === editingCustomer.id) {
          setSelectedCustomer({
            ...selectedCustomer,
            fullName: fullName.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            address: address.trim(),
            dateOfBirth: dateOfBirth || undefined,
            notes: notes.trim() || undefined,
          });
        }
        setIsModalOpen(false);
      } else {
        showFeedback('error', res.error || 'Có lỗi xảy ra khi cập nhật khách hàng');
      }
    } else {
      const newCust = addCustomer({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        dateOfBirth: dateOfBirth || undefined,
        notes: notes.trim() || undefined,
      });

      showFeedback('success', `Đã thêm mới khách hàng "${newCust.fullName}" (${newCust.code}) thành công!`);
      setIsModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingCustomer) return;
    const res = deleteCustomer(deletingCustomer.id);
    if (res.success) {
      showFeedback('success', `Đã xóa khách hàng "${deletingCustomer.fullName}" (${deletingCustomer.code}) thành công.`);
      if (selectedCustomer?.id === deletingCustomer.id) {
        setSelectedCustomer(null);
      }
    } else {
      showFeedback('error', res.error || 'Có lỗi xảy ra khi xóa khách hàng.');
    }
    setDeletingCustomer(null);
  };

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return customers.filter((c) => {
      return (
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    });
  }, [customers, searchTerm]);

  // Total Customer Spending
  const totalCustomerSpent = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  }, [customers]);

  const activeBuyingCustomers = useMemo(() => {
    return customers.filter((c) => c.ordersCount > 0).length;
  }, [customers]);

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
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-600" />
            Quản Lý Khách Hàng (Customer CRM)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lịch sử mua hàng, nhạc cụ đã sở hữu, bảo hành điện tử QR, thêm sửa xóa hồ sơ khách hàng
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Khách Hàng</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Tổng Khách Hàng Đăng Ký</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 flex items-baseline gap-2">
            <span>{customers.length}</span>
            <span className="text-xs font-normal text-slate-400">hồ sơ CRM</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Đã Có Đơn Hàng Mua Nhạc Cụ</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 flex items-baseline gap-2">
            <span>{activeBuyingCustomers}</span>
            <span className="text-xs font-normal text-slate-400">/ {customers.length} khách</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Tổng Chi Tiêu Tích Lũy</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {formatVND(totalCustomerSpent)}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên khách hàng, số điện thoại, mã KH, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Mã KH</th>
                <th className="py-3 px-3">Họ và Tên</th>
                <th className="py-3 px-3">Liên Hệ</th>
                <th className="py-3 px-3">Địa Chỉ</th>
                <th className="py-3 px-3 text-center">Số Đơn Hàng</th>
                <th className="py-3 px-3 text-right">Tổng Chi Tiêu</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Không tìm thấy khách hàng nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{c.code}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{c.fullName}</td>
                    <td className="py-3 px-3 text-slate-600">
                      <div className="flex items-center gap-1 font-mono font-medium">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {c.phone}
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {c.email}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{c.address || '--'}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{c.ordersCount}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">
                      {formatVND(c.totalSpent)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="text-amber-700 hover:text-amber-800 font-semibold text-xs hover:underline cursor-pointer"
                        >
                          Lịch sử →
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Sửa thông tin khách hàng"
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingCustomer(c)}
                          title="Xóa khách hàng"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                {editingCustomer ? `Sửa Khách Hàng: ${editingCustomer.fullName}` : 'Thêm Khách Hàng Mới'}
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
                  Họ và Tên Khách Hàng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trần Văn Nam"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Số Điện Thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0987654321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ngày Sinh</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="khachhang@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Địa Chỉ</label>
                <input
                  type="text"
                  placeholder="Số nhà, đường, quận/huyện..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Ghi Chú</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú sở thích nhạc cụ, yêu cầu đặc biệt..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
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
                  {editingCustomer ? 'Cập Nhật' : 'Thêm Khách Hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác Nhận Xóa Khách Hàng</h3>
                <p className="text-xs text-slate-500">Hành động này sẽ xóa khách hàng khỏi danh sách CRM</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã KH:</span>
                <span className="font-mono font-bold text-slate-900">{deletingCustomer.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Họ và tên:</span>
                <span className="font-semibold text-slate-900">{deletingCustomer.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="font-mono text-slate-700">{deletingCustomer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng chi tiêu:</span>
                <span className="font-mono font-bold text-emerald-700">{formatVND(deletingCustomer.totalSpent)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa khách hàng <strong>{deletingCustomer.fullName}</strong> khỏi hệ thống không?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
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

      {/* Customer 360 Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedCustomer.fullName}</h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Mã: {selectedCustomer.code} • SĐT: {selectedCustomer.phone}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(selectedCustomer)}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Sửa thông tin</span>
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Purchases */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Guitar className="w-4 h-4 text-amber-600" />
                Lịch Sử Mua Hàng & Nhạc Cụ Đã Mua:
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px]">
                    <tr>
                      <th className="p-2.5">Hóa Đơn</th>
                      <th className="p-2.5">Sản Phẩm</th>
                      <th className="p-2.5 text-right">Giá Trị</th>
                      <th className="p-2.5">Ngày Mua</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salesOrders.filter((s) => s.customerId === selectedCustomer.id).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400">
                          Chưa có lịch sử mua hàng
                        </td>
                      </tr>
                    ) : (
                      salesOrders.filter((s) => s.customerId === selectedCustomer.id).map((so) => (
                        <tr key={so.id}>
                          <td className="p-2.5 font-mono font-bold text-slate-900">{so.code}</td>
                          <td className="p-2.5">
                            {so.items.map((it, idx) => (
                              <div key={idx}>
                                {it.productName}{' '}
                                {it.serialNumbers && (
                                  <span className="font-mono text-purple-700 text-[10px]">
                                    (SN: {it.serialNumbers.join(', ')})
                                  </span>
                                )}
                              </div>
                            ))}
                          </td>
                          <td className="p-2.5 text-right font-bold">{formatVND(so.totalAmount)}</td>
                          <td className="p-2.5 text-slate-500 font-mono">{formatDateOnlyVN(so.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Warranties */}
            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Hồ Sơ Bảo Hành Đang Hiệu Lực:
              </h4>
              <div className="space-y-2">
                {warranties.filter((w) => w.customerId === selectedCustomer.id).length === 0 ? (
                  <div className="text-center py-4 text-slate-400 bg-slate-50 rounded-xl">
                    Chưa có hồ sơ bảo hành điện tử nào
                  </div>
                ) : (
                  warranties.filter((w) => w.customerId === selectedCustomer.id).map((w) => (
                    <div key={w.id} className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-indigo-900">{w.productName}</div>
                        <div className="text-slate-500 font-mono mt-0.5">
                          Số Serial: {w.serialNumber} • Mã BH: {w.warrantyCode}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
                          Hạn đến: {formatDateOnlyVN(w.endDate)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Close */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              >
                Đóng Hồ Sơ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
