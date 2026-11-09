import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldAlert,
  User,
  Clock,
  Globe,
  Lock,
} from 'lucide-react';
import { useERP, formatDateVN } from '../../context/ERPContext';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.newValue && log.newValue.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchAction = selectedAction === 'ALL' || log.action === selectedAction;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-amber-600" />
            Nhật Ký Hoạt Động Hệ Thống (Audit Logs)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bảo đảm truy vết mọi hành vi người dùng: Đăng nhập, Tạo/Sửa dữ liệu, Duyệt chứng từ, Điều chỉnh kho (AC-042 & AC-043)
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-semibold">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>Bảo mật bất biến: Không cho phép chỉnh sửa/xóa log</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo người thực hiện, thao tác, đối tượng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
          >
            <option value="ALL">Tất cả hành động ({auditLogs.length})</option>
            <option value="CREATE">CREATE - Tạo mới dữ liệu</option>
            <option value="EDIT">EDIT - Chỉnh sửa thông tin</option>
            <option value="APPROVE">APPROVE - Phê duyệt chứng từ</option>
            <option value="CONFIRM">CONFIRM - Xác nhận nhập/xuất kho</option>
            <option value="ADJUST">ADJUST - Điều chỉnh tồn kho</option>
            <option value="HANDOVER">HANDOVER - Bàn giao nhạc cụ</option>
            <option value="SWITCH_ROLE">SWITCH_ROLE - Chuyển đổi vai trò RBAC</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Thời Gian</th>
                <th className="py-3 px-3">Người Thực Hiện</th>
                <th className="py-3 px-3">Vai Trò</th>
                <th className="py-3 px-3 text-center">Hành Động</th>
                <th className="py-3 px-3">Thực Thể & Mã</th>
                <th className="py-3 px-3">Chi Tiết Thay Đổi</th>
                <th className="py-3 px-4 font-mono">Địa Chỉ IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const actionBadge = {
                  CREATE: 'bg-blue-100 text-blue-800',
                  EDIT: 'bg-amber-100 text-amber-800',
                  DELETE: 'bg-rose-100 text-rose-800',
                  APPROVE: 'bg-emerald-100 text-emerald-800',
                  CONFIRM: 'bg-emerald-100 text-emerald-800',
                  ADJUST: 'bg-purple-100 text-purple-800',
                  HANDOVER: 'bg-teal-100 text-teal-800',
                  SUBMIT: 'bg-indigo-100 text-indigo-800',
                  LOGIN: 'bg-slate-200 text-slate-700',
                  SWITCH_ROLE: 'bg-orange-100 text-orange-800',
                }[log.action] || 'bg-slate-100 text-slate-700';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {formatDateVN(log.timestamp)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{log.userName}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${actionBadge}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{log.entityType}</div>
                      <div className="text-[10px] font-mono text-slate-400">{log.entityId}</div>
                    </td>
                    <td className="py-3 px-3 max-w-sm">
                      <div className="text-slate-700 text-[11px] line-clamp-2">
                        {log.newValue || log.oldValue || '--'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{log.ipAddress}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
