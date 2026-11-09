import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  User,
  Hash,
  X,
  Printer,
  ChevronRight,
  FileCheck,
  AlertTriangle,
  Sparkles,
  PackageCheck,
  Check,
} from 'lucide-react';
import { useERP, formatDateOnlyVN, formatDateVN } from '../../context/ERPContext';
import { WarrantyClaim, WarrantyClaimStatus, WarrantyRegistration, WarrantyPolicy } from '../../types/erp';
import { QRCodeDisplay } from '../common/QRCodeDisplay';

export const WarrantyView: React.FC = () => {
  const {
    warranties,
    warrantyClaims,
    warrantyPolicies,
    products,
    updateClaimStatus,
    completeHandover,
    allUsers,
    currentUser,
    setCurrentPortal,
    setCustomerLookupQuery,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'claims' | 'registrations' | 'policies'>('claims');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaimStatus, setSelectedClaimStatus] = useState<string>('ALL');

  // Modals
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
  const [printingWarranty, setPrintingWarranty] = useState<WarrantyRegistration | null>(null);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handoverDeliveredBy, setHandoverDeliveredBy] = useState(currentUser.fullName);
  const [handoverReceivedBy, setHandoverReceivedBy] = useState('');
  const [handoverCondition, setHandoverCondition] = useState('Đàn đã căn chỉnh action êm tay, âm vang chuẩn, bề mặt sạch bóng');
  const [handoverNotes, setHandoverNotes] = useState('');

  // Status transition note
  const [statusNote, setStatusNote] = useState('');
  const [technicianAssign, setTechnicianAssign] = useState('');
  const [diagnosticNote, setDiagnosticNote] = useState('');

  // Filtered Claims
  const filteredClaims = warrantyClaims.filter((c) => {
    const matchSearch =
      c.claimCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.productName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = selectedClaimStatus === 'ALL' || c.status === selectedClaimStatus;
    return matchSearch && matchStatus;
  });

  // Filtered Registrations
  const filteredRegistrations = warranties.filter((w) => {
    return (
      w.warrantyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAdvanceStatus = (newStatus: WarrantyClaimStatus) => {
    if (!selectedClaim) return;

    const note = statusNote || `Chuyển trạng thái sang ${newStatus}`;
    const res = updateClaimStatus(
      selectedClaim.id,
      newStatus,
      note,
      technicianAssign || selectedClaim.technicianId,
      diagnosticNote || selectedClaim.diagnosticResult
    );

    if (res.success) {
      // Update current selected claim view
      const updated = warrantyClaims.find((c) => c.id === selectedClaim.id);
      setSelectedClaim(updated || null);
      setStatusNote('');
    }
  };

  const handleConfirmHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    completeHandover(selectedClaim.id, {
      deliveredBy: handoverDeliveredBy,
      receivedBy: handoverReceivedBy || selectedClaim.customerName,
      conditionCheck: handoverCondition,
      notes: handoverNotes,
    });

    setIsHandoverModalOpen(false);
    const updated = warrantyClaims.find((c) => c.id === selectedClaim.id);
    setSelectedClaim(updated || null);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
            Hệ Thống Bảo Hành Điện Tử & QR Code
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý vòng đời bảo hành, kiểm tra tiếp nhận nhạc cụ, phân công kỹ thuật, in thẻ QR và bàn giao
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'claims'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Yêu Cầu & Tiếp Nhận Bảo Hành ({warrantyClaims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('registrations')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'registrations'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Hồ Sơ Bảo Hành Đã Kích Hoạt ({warranties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'policies'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Chính Sách Bảo Hành ({warrantyPolicies.length})</span>
        </button>
      </div>

      {/* Tab 1: Warranty Claims Processing */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm mã yêu cầu YCBH, tên khách, số điện thoại, serial đàn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>

            <div className="w-full sm:w-64">
              <select
                value={selectedClaimStatus}
                onChange={(e) => setSelectedClaimStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
              >
                <option value="ALL">Tất cả trạng thái xử lý ({warrantyClaims.length})</option>
                <option value="SUBMITTED">SUBMITTED - Khách vừa gửi qua QR</option>
                <option value="RECEIVED">RECEIVED - Cửa hàng đã tiếp nhận đàn</option>
                <option value="INSPECTING">INSPECTING - Kỹ thuật đang chẩn đoán</option>
                <option value="APPROVED">APPROVED - Đã phê duyệt phương án</option>
                <option value="REPAIRING">REPAIRING - Đang tiến hành sửa chữa</option>
                <option value="QUALITY_CHECK">QUALITY_CHECK - Kiểm tra chất lượng (QC)</option>
                <option value="READY_FOR_PICKUP">READY_FOR_PICKUP - Chờ khách đến nhận</option>
                <option value="COMPLETED">COMPLETED - Đã bàn giao hoàn tất</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Mã YCBH</th>
                    <th className="py-3 px-3">Nhạc Cụ & Serial</th>
                    <th className="py-3 px-3">Khách Hàng</th>
                    <th className="py-3 px-3">Tình Trạng Báo Lỗi</th>
                    <th className="py-3 px-3 text-center">Trạng Thái Xử Lý</th>
                    <th className="py-3 px-3">Kỹ Thuật Phụ Trách</th>
                    <th className="py-3 px-4 text-right">Xử Lý Ca</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Không có yêu cầu bảo hành nào
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((claim) => {
                      const statusColor = {
                        SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-200',
                        RECEIVED: 'bg-amber-100 text-amber-800 border-amber-200',
                        INSPECTING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                        AWAITING_APPROVAL: 'bg-purple-100 text-purple-800 border-purple-200',
                        APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                        REJECTED: 'bg-rose-100 text-rose-800 border-rose-200',
                        REPAIRING: 'bg-amber-100 text-amber-800 border-amber-200',
                        WAITING_PARTS: 'bg-orange-100 text-orange-800 border-orange-200',
                        WAITING_CUSTOMER: 'bg-cyan-100 text-cyan-800 border-cyan-200',
                        QUALITY_CHECK: 'bg-teal-100 text-teal-800 border-teal-200',
                        READY_FOR_PICKUP: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                        COMPLETED: 'bg-slate-200 text-slate-700 border-slate-300',
                        CANCELLED: 'bg-gray-200 text-gray-700 border-gray-300',
                      }[claim.status] || 'bg-slate-100 text-slate-700';

                      return (
                        <tr key={claim.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{claim.claimCode}</td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800">{claim.productName}</div>
                            <div className="font-mono text-[11px] text-purple-700 font-bold mt-0.5">
                              SN: {claim.serialNumber}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800">{claim.customerName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{claim.customerPhone}</div>
                          </td>
                          <td className="py-3 px-3">
                            <p className="line-clamp-2 text-slate-600 text-[11px] max-w-xs">
                              {claim.issueDescription}
                            </p>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                              {claim.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-700">{claim.technicianName || 'Chưa gán'}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedClaim(claim);
                                setTechnicianAssign(claim.technicianId || '');
                                setDiagnosticNote(claim.diagnosticResult || '');
                                setHandoverReceivedBy(claim.customerName);
                              }}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ml-auto shadow-xs"
                            >
                              <span>Chi tiết & Chuyển bước</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Registrations & Printable QR Passes */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm mã BH-..., Serial, tên khách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRegistrations.map((warr) => {
              const isExpired = new Date(warr.endDate) < new Date();

              return (
                <div
                  key={warr.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {warr.warrantyCode}
                        </span>
                        <div className="font-bold text-slate-900 text-sm mt-2 line-clamp-1">
                          {warr.productName}
                        </div>
                        <div className="text-[11px] font-mono text-purple-700 font-semibold mt-0.5">
                          SN: {warr.serialNumber}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isExpired
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isExpired ? 'HẾT HẠN' : 'CÒN HẠN'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] space-y-1 text-slate-600">
                      <div>
                        Khách hàng: <span className="font-semibold text-slate-800">{warr.customerName}</span> (
                        {warr.customerPhone})
                      </div>
                      <div>
                        Thời hạn:{' '}
                        <span className="font-semibold">
                          {formatDateOnlyVN(warr.startDate)} → {formatDateOnlyVN(warr.endDate)}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        Chính sách: {warr.policySnapshot.policyName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setPrintingWarranty(warr)}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-600" />
                      In Thẻ Bảo Hành QR
                    </button>

                    <button
                      onClick={() => {
                        setCustomerLookupQuery(warr.qrToken);
                        setCurrentPortal('customer');
                      }}
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Xem Cổng Khách
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Warranty Policies */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warrantyPolicies.map((pol) => (
            <div key={pol.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {pol.code}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  v{pol.version} • {pol.durationMonths} Tháng
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">{pol.name}</h4>

              <div className="text-xs space-y-2 text-slate-600">
                <div>
                  <span className="font-semibold text-slate-800 block text-[11px]">Điều kiện bảo hành:</span>
                  <p className="text-[11px] text-slate-500 line-clamp-3 bg-slate-50 p-2 rounded-lg">
                    {pol.terms}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-rose-800 block text-[11px]">Trường hợp loại trừ:</span>
                  <p className="text-[11px] text-slate-500 line-clamp-2 bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                    {pol.exclusions}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Processing Drawer / Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-slate-900">{selectedClaim.claimCode}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    {selectedClaim.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Nhạc cụ: <span className="font-bold text-slate-800">{selectedClaim.productName}</span> • SN:{' '}
                  <span className="font-mono font-bold text-purple-700">{selectedClaim.serialNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer problem report */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Mô Tả Lỗi Từ Khách Hàng:</span>
                <span className="text-slate-400 font-normal">
                  Gửi lúc {formatDateVN(selectedClaim.submittedDate)}
                </span>
              </div>
              <p className="text-slate-700 italic bg-white p-3 rounded-lg border border-slate-200/60">
                "{selectedClaim.issueDescription}"
              </p>
              <div className="text-[11px] text-slate-500">
                Khách hàng: <span className="font-semibold text-slate-800">{selectedClaim.customerName}</span> •
                SĐT: <span className="font-mono font-semibold">{selectedClaim.customerPhone}</span>
              </div>
            </div>

            {/* Technician Diagnostic Form */}
            <div className="bg-purple-50/60 border border-purple-200 p-4 rounded-xl space-y-3 text-xs">
              <h4 className="font-bold text-purple-900 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-purple-700" />
                Chẩn Đoán Kỹ Thuật & Phân Công Thợ Sửa
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kỹ thuật viên phụ trách</label>
                  <select
                    value={technicianAssign}
                    onChange={(e) => setTechnicianAssign(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-white"
                  >
                    <option value="">-- Chọn kỹ thuật viên --</option>
                    {allUsers
                      .filter((u) => u.role === 'TECHNICIAN' || u.role === 'STORE_MANAGER' || u.role === 'SUPER_ADMIN')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kết quả đo đạc / Chẩn đoán</label>
                  <input
                    type="text"
                    placeholder="VD: Cần đàn võng 0.3mm, phím 5 cao, rè dây..."
                    value={diagnosticNote}
                    onChange={(e) => setDiagnosticNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Status Transition Action Buttons */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800">
                Chuyển Bước Quy Trình Tiếp Theo (Theo PRD 3.11):
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedClaim.status === 'SUBMITTED' && (
                  <button
                    onClick={() => handleAdvanceStatus('RECEIVED')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                  >
                    1. Tiếp nhận đàn tại cửa hàng (RECEIVED)
                  </button>
                )}

                {(selectedClaim.status === 'RECEIVED' || selectedClaim.status === 'SUBMITTED') && (
                  <button
                    onClick={() => handleAdvanceStatus('INSPECTING')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                  >
                    2. Kỹ thuật viên kiểm tra (INSPECTING)
                  </button>
                )}

                {selectedClaim.status === 'INSPECTING' && (
                  <>
                    <button
                      onClick={() => handleAdvanceStatus('APPROVED')}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    >
                      3. Phê duyệt bảo hành miễn phí (APPROVED)
                    </button>
                    <button
                      onClick={() => handleAdvanceStatus('REJECTED')}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                    >
                      Từ chối (Hết hạn / Rơi vỡ ngoại lệ)
                    </button>
                  </>
                )}

                {selectedClaim.status === 'APPROVED' && (
                  <button
                    onClick={() => handleAdvanceStatus('REPAIRING')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                  >
                    4. Bắt đầu sửa chữa / Căn chỉnh (REPAIRING)
                  </button>
                )}

                {selectedClaim.status === 'REPAIRING' && (
                  <button
                    onClick={() => handleAdvanceStatus('QUALITY_CHECK')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                  >
                    5. Hoàn thành sửa & Kiểm tra chất lượng âm thanh (QUALITY_CHECK)
                  </button>
                )}

                {selectedClaim.status === 'QUALITY_CHECK' && (
                  <button
                    onClick={() => handleAdvanceStatus('READY_FOR_PICKUP')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  >
                    6. Đã kiểm tra đạt • Báo khách đến nhận đàn (READY_FOR_PICKUP)
                  </button>
                )}

                {selectedClaim.status === 'READY_FOR_PICKUP' && (
                  <button
                    onClick={() => setIsHandoverModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md flex items-center gap-1.5"
                  >
                    <PackageCheck className="w-4 h-4" />
                    7. Lập Biên Bản Bàn Giao Trả Khách & Đóng Ca (COMPLETED)
                  </button>
                )}
              </div>
            </div>

            {/* Timeline of events (AC-030) */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Nhật Ký Các Bước Xử Lý (Timeline Events - AC-030):
              </div>
              <div className="space-y-2">
                {selectedClaim.events.map((ev) => (
                  <div key={ev.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{ev.status}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDateVN(ev.timestamp)}</span>
                      </div>
                      <div className="text-slate-600 text-[11px] mt-0.5">{ev.note}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Thực hiện bởi: {ev.performedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handover Protocol Modal (AC-031, AC-037) */}
      {isHandoverModalOpen && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              Biên Bản Bàn Giao Nhạc Cụ Bảo Hành (Handover)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Lưu trữ danh tính người giao, người nhận và tình trạng kiểm tra trước khi đóng yêu cầu (AC-031/AC-037).
            </p>

            <form onSubmit={handleConfirmHandover} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Người giao (Nhân viên cửa hàng) *</label>
                <input
                  type="text"
                  required
                  value={handoverDeliveredBy}
                  onChange={(e) => setHandoverDeliveredBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Người nhận (Khách hàng) *</label>
                <input
                  type="text"
                  required
                  value={handoverReceivedBy}
                  onChange={(e) => setHandoverReceivedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tình trạng kiểm tra khi giao đàn *</label>
                <textarea
                  rows={2}
                  required
                  value={handoverCondition}
                  onChange={(e) => setHandoverCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsHandoverModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Xác Nhận & Đóng Ca Bảo Hành
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Warranty Card Modal */}
      {printingWarranty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-600" />
                Thẻ Bảo Hành Điện Tử Nhạc Cụ (Kèm Mã QR)
              </h3>
              <button
                onClick={() => setPrintingWarranty(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warranty Card Design */}
            <div className="p-5 bg-gradient-to-tr from-slate-900 to-amber-950 text-white rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
                <div>
                  <h2 className="font-black text-sm tracking-wider text-amber-400">GUITAR MP MUSIC STORE</h2>
                  <p className="text-[10px] text-slate-300">THẺ BẢO HÀNH ĐIỆN TỬ CHÍNH HÃNG</p>
                </div>
                <span className="font-mono text-xs font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  {printingWarranty.warrantyCode}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-xl shrink-0">
                  <QRCodeDisplay
                    token={printingWarranty.qrToken}
                    warrantyCode={printingWarranty.warrantyCode}
                    serialNumber={printingWarranty.serialNumber}
                    size={110}
                    showScanButton={false}
                  />
                </div>

                <div className="text-[11px] space-y-1.5 flex-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nhạc Cụ:</span>
                    <span className="font-bold text-white text-xs">{printingWarranty.productName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Số Serial:</span>
                    <span className="font-mono font-bold text-amber-400">{printingWarranty.serialNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Chủ Sở Hữu:</span>
                    <span className="font-medium text-slate-200">
                      {printingWarranty.customerName} ({printingWarranty.customerPhone})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Hiệu Lực:</span>
                    <span className="font-semibold text-emerald-400">
                      {formatDateOnlyVN(printingWarranty.startDate)} đến {formatDateOnlyVN(printingWarranty.endDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 text-center pt-2 border-t border-slate-800">
                Quét mã QR bằng điện thoại để kiểm tra bảo hành hoặc gửi yêu cầu căn chỉnh phím đàn trực tuyến 24/7.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPrintingWarranty(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> In Thẻ Bảo Hành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
