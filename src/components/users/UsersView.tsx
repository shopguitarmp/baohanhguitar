import React, { useState, useMemo } from 'react';
import {
  UserCog,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Lock,
  Mail,
  Phone,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { User, UserRole } from '../../types/erp';

const ROLE_LABELS: Record<UserRole, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin (Toàn quyền)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  OWNER: { label: 'Chủ Cửa Hàng (Owner)', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  STORE_MANAGER: { label: 'Quản Lý Cửa Hàng', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  SALES_MANAGER: { label: 'Trưởng Nhóm Bán Hàng', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  SALES_STAFF: { label: 'Nhân Viên Bán Hàng & POS', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  WAREHOUSE_MANAGER: { label: 'Quản Lý Kho Nhạc Cụ', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  WAREHOUSE_STAFF: { label: 'Thủ Kho & Nhập Hàng', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  WARRANTY_STAFF: { label: 'Nhân Viên Tiếp Nhận BH', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  TECHNICIAN: { label: 'Kỹ Thuật Viên Sửa Chữa', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  ACCOUNTANT: { label: 'Kế Toán & Thu Chi', color: 'bg-slate-100 text-slate-800 border-slate-200' },
};

export const UsersView: React.FC = () => {
  const { allUsers, currentUser, setCurrentUserRole, addUser, updateUser, deleteUser } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('SALES_STAFF');
  const [status, setStatus] = useState<'ACTIVE' | 'LOCKED'>('ACTIVE');

  // Delete Confirmation State
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFullName('');
    setUsername('');
    setEmail('');
    setPhone('');
    setRole('SALES_STAFF');
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFullName(u.fullName);
    setUsername(u.username || '');
    setEmail(u.email);
    setPhone(u.phone);
    setRole(u.role);
    setStatus(u.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showFeedback('error', 'Vui lòng nhập họ và tên nhân viên');
      return;
    }
    if (!phone.trim()) {
      showFeedback('error', 'Vui lòng nhập số điện thoại');
      return;
    }

    if (editingUser) {
      const res = updateUser(editingUser.id, {
        fullName: fullName.trim(),
        username: username.trim() || undefined,
        email: email.trim(),
        phone: phone.trim(),
        role,
        status,
      });

      if (res.success) {
        showFeedback('success', `Đã cập nhật thông tin nhân viên "${fullName}" thành công!`);
        setIsModalOpen(false);
      } else {
        showFeedback('error', res.error || 'Có lỗi xảy ra khi cập nhật nhân viên');
      }
    } else {
      const res = addUser({
        fullName: fullName.trim(),
        username: username.trim() || undefined,
        email: email.trim(),
        phone: phone.trim(),
        role,
        status,
      });

      if (res.success) {
        showFeedback('success', `Đã thêm mới nhân viên "${fullName}" thành công!`);
        setIsModalOpen(false);
      } else {
        showFeedback('error', res.error || 'Có lỗi xảy ra khi thêm nhân viên');
      }
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    const res = deleteUser(deletingUser.id);
    if (res.success) {
      showFeedback('success', `Đã xóa nhân viên "${deletingUser.fullName}" thành công.`);
    } else {
      showFeedback('error', res.error || 'Có lỗi xảy ra khi xóa nhân viên.');
    }
    setDeletingUser(null);
  };

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q);

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [allUsers, searchTerm, roleFilter]);

  const permissionsList = [
    { module: 'Sản Phẩm & Danh Mục', view: ['ALL'], create: ['SUPER_ADMIN', 'OWNER', 'STORE_MANAGER'], edit: ['SUPER_ADMIN', 'OWNER', 'STORE_MANAGER'], delete: ['SUPER_ADMIN'] },
    { module: 'Đơn Mua Hàng (PO)', view: ['ALL'], create: ['SUPER_ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF'], edit: ['SUPER_ADMIN', 'STORE_MANAGER'], delete: ['SUPER_ADMIN'] },
    { module: 'Duyệt PO & Nhập Kho', view: ['ALL'], create: ['SUPER_ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF'], edit: ['SUPER_ADMIN', 'STORE_MANAGER'], delete: ['SUPER_ADMIN'] },
    { module: 'Bán Hàng (POS & Hóa Đơn)', view: ['ALL'], create: ['SUPER_ADMIN', 'OWNER', 'STORE_MANAGER', 'SALES_STAFF'], edit: ['SUPER_ADMIN', 'STORE_MANAGER'], delete: ['SUPER_ADMIN'] },
    { module: 'Bảo Hành Điện Tử (QR)', view: ['ALL'], create: ['SUPER_ADMIN', 'WARRANTY_STAFF', 'STORE_MANAGER'], edit: ['SUPER_ADMIN', 'WARRANTY_STAFF'], delete: ['SUPER_ADMIN'] },
    { module: 'Khách Hàng (CRM)', view: ['ALL'], create: ['SUPER_ADMIN', 'SALES_STAFF', 'STORE_MANAGER'], edit: ['SUPER_ADMIN', 'STORE_MANAGER'], delete: ['SUPER_ADMIN'] },
    { module: 'Quản Trị Nhân Viên', view: ['SUPER_ADMIN', 'OWNER'], create: ['SUPER_ADMIN'], edit: ['SUPER_ADMIN'], delete: ['SUPER_ADMIN'] },
  ];

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
            <UserCog className="w-6 h-6 text-amber-600" />
            Nhân Viên & Phân Quyền (Staff Management)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thêm, sửa, xóa tài khoản nhân viên cửa hàng nhạc cụ và quản lý phân quyền theo vai trò
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Nhân Viên Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên nhân viên, email, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Vai trò:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
          >
            <option value="ALL">Tất cả vai trò ({allUsers.length})</option>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Accounts List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Danh Sách Nhân Viên ({filteredUsers.length} tài khoản)
          </h3>
          <span className="text-xs text-slate-500">
            Đang đăng nhập bằng:{' '}
            <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              {currentUser.fullName} ({ROLE_LABELS[currentUser.role]?.label.split('(')[0] || currentUser.role})
            </span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Nhân Viên</th>
                <th className="py-3 px-3">Email & SĐT</th>
                <th className="py-3 px-3">Vai Trò Quyền Hạn</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-3 text-center">Chuyển Phiên</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Không tìm thấy nhân viên phù hợp
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = currentUser.id === u.id;
                  const roleConfig = ROLE_LABELS[u.role] || {
                    label: u.role,
                    color: 'bg-slate-100 text-slate-800 border-slate-200',
                  };

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {u.fullName.slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.fullName}</div>
                            {u.username && (
                              <div className="text-[11px] text-slate-400 font-mono">@{u.username}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div className="font-mono text-slate-700">{u.phone}</div>
                        {u.email && <div className="text-[11px] text-slate-400">{u.email}</div>}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${roleConfig.color}`}>
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isCurrent ? (
                          <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Đang dùng
                          </span>
                        ) : (
                          <button
                            onClick={() => setCurrentUserRole(u.role)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          >
                            Đổi vai trò
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Sửa thông tin nhân viên"
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingUser(u)}
                            disabled={isCurrent || (u.role === 'SUPER_ADMIN' && allUsers.filter((x) => x.role === 'SUPER_ADMIN').length <= 1)}
                            title={isCurrent ? 'Không thể xóa tài khoản đang sử dụng' : 'Xóa tài khoản nhân viên'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isCurrent || (u.role === 'SUPER_ADMIN' && allUsers.filter((x) => x.role === 'SUPER_ADMIN').length <= 1)
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCog className="w-5 h-5 text-amber-600" />
                {editingUser ? `Sửa Thông Tin Nhân Viên: ${editingUser.fullName}` : 'Thêm Nhân Viên Mới'}
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
                  Họ và Tên Nhân Viên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tên Đăng Nhập</label>
                  <input
                    type="text"
                    placeholder="nguyenvana"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Số Điện Thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0901234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="nhanvien@guitarminhphat.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Vai Trò / Phân Quyền <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                >
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Trạng Thái Tài Khoản</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'LOCKED')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                >
                  <option value="ACTIVE">Đang Hoạt Động</option>
                  <option value="LOCKED">Đã Khóa Tài Khoản</option>
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
                  {editingUser ? 'Cập Nhật' : 'Thêm Nhân Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác Nhận Xóa Nhân Viên</h3>
                <p className="text-xs text-slate-500">Tài khoản sẽ bị gỡ bỏ khỏi danh sách nhân viên</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Họ và tên:</span>
                <span className="font-bold text-slate-900">{deletingUser.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vai trò:</span>
                <span className="font-semibold text-amber-800">{ROLE_LABELS[deletingUser.role]?.label || deletingUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="font-mono text-slate-700">{deletingUser.phone}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa nhân viên <strong>{deletingUser.fullName}</strong> không?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
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

      {/* RBAC Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Ma Trận Quyền Hạn Theo Module Nghiệp Vụ</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân quyền chi tiết cho từng vai trò trong cửa hàng nhạc cụ Guitar Minh Phát
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Phân Hệ Nghiệp Vụ</th>
                <th className="py-3 px-3">Quyền Xem (View)</th>
                <th className="py-3 px-3">Quyền Tạo (Create)</th>
                <th className="py-3 px-3">Quyền Sửa (Edit)</th>
                <th className="py-3 px-4">Quyền Xóa (Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsList.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{row.module}</td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {row.view.includes('ALL') ? 'Tất cả nhân viên' : row.view.join(', ')}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {row.create.join(', ')}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {row.edit.join(', ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      {row.delete.join(', ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
