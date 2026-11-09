import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Guitar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Phone,
  MapPin,
  Camera,
  X,
  Wrench,
  Lock,
  ChevronRight,
  HelpCircle,
  BadgeCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useERP, formatDateOnlyVN, formatDateVN } from '../../context/ERPContext';
import { WarrantyRegistration, WarrantyClaim } from '../../types/erp';

export const CustomerWarrantyPortal: React.FC = () => {
  const {
    warranties,
    warrantyClaims,
    submitWarrantyClaim,
    customerLookupQuery,
    setCurrentPortal,
  } = useERP();

  const [phoneQuery, setPhoneQuery] = useState(customerLookupQuery || '');
  const [hasSearched, setHasSearched] = useState(false);
  const [matchingWarranties, setMatchingWarranties] = useState<WarrantyRegistration[]>([]);
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyRegistration | null>(null);
  const [activeClaimTracking, setActiveClaimTracking] = useState<WarrantyClaim | null>(null);

  // Claim Submission Modal/Form
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [uploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80',
  ]);
  const [claimFeedback, setClaimFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Normalization helper for phone numbers
  const normalizePhone = (p: string) => {
    return p.replace(/\D/g, '').replace(/^84/, '0');
  };

  const performLookup = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setHasSearched(false);
      setMatchingWarranties([]);
      setSelectedWarranty(null);
      setActiveClaimTracking(null);
      return;
    }

    setHasSearched(true);
    const cleaned = normalizePhone(trimmed);

    // Search by phone number primarily, with fallback to code/serial/QR
    const matched = warranties.filter((w) => {
      const wPhoneClean = normalizePhone(w.customerPhone);
      const phoneMatch =
        cleaned.length >= 4 &&
        (wPhoneClean.includes(cleaned) || cleaned.includes(wPhoneClean));
      const codeMatch = w.warrantyCode.toLowerCase().includes(trimmed.toLowerCase());
      const serialMatch = w.serialNumber.toLowerCase().includes(trimmed.toLowerCase());
      const qrMatch = w.qrToken.toLowerCase() === trimmed.toLowerCase();
      return phoneMatch || codeMatch || serialMatch || qrMatch;
    });

    setMatchingWarranties(matched);

    if (matched.length > 0) {
      const activeOne = matched[0];
      setSelectedWarranty(activeOne);

      // Check if there is an active claim
      const matchClaim = warrantyClaims.find((c) => c.warrantyId === activeOne.id);
      setActiveClaimTracking(matchClaim || null);
    } else {
      setSelectedWarranty(null);
      setActiveClaimTracking(null);
    }
  };

  // If customerLookupQuery passed from context (e.g. simulated QR scan or external click), auto search
  useEffect(() => {
    if (customerLookupQuery) {
      setPhoneQuery(customerLookupQuery);
      performLookup(customerLookupQuery);
    }
  }, [customerLookupQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(phoneQuery);
  };

  const handleSelectWarranty = (w: WarrantyRegistration) => {
    setSelectedWarranty(w);
    const matchClaim = warrantyClaims.find((c) => c.warrantyId === w.id);
    setActiveClaimTracking(matchClaim || null);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarranty) return;

    if (!issueDescription.trim()) {
      setClaimFeedback({ type: 'error', text: 'Vui lòng mô tả tình trạng lỗi của nhạc cụ' });
      return;
    }

    const res = submitWarrantyClaim({
      warrantyId: selectedWarranty.id,
      issueDescription,
      photos: uploadedPhotos,
    });

    if (!res.success) {
      setClaimFeedback({ type: 'error', text: res.error || 'Gửi yêu cầu thất bại' });
      return;
    }

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });

    setClaimFeedback({
      type: 'success',
      text: `Gửi yêu cầu bảo hành thành công! Mã tiếp nhận: ${res.claim?.claimCode}. Kỹ thuật viên sẽ liên hệ và xử lý cho bạn trong thời gian sớm nhất.`,
    });
    setIsClaimModalOpen(false);
    setIssueDescription('');
    if (res.claim) {
      setActiveClaimTracking(res.claim);
    }
  };

  // Mask phone for privacy (e.g. 0908***456)
  const maskPhone = (phone: string) => {
    if (phone.length < 7) return phone;
    return `${phone.slice(0, 4)}***${phone.slice(-3)}`;
  };

  // Remaining days calculation
  const remainingDays = useMemo(() => {
    if (!selectedWarranty) return 0;
    const now = new Date();
    const end = new Date(selectedWarranty.endDate);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [selectedWarranty]);

  // Stepper definition for claim tracking
  const STEP_SEQUENCE = [
    { key: 'SUBMITTED', title: 'Tiếp Nhận Online', desc: 'Đã gửi yêu cầu' },
    { key: 'RECEIVED', title: 'Nhận Đàn Tại Shop', desc: 'Giao đàn cho thợ' },
    { key: 'INSPECTING', title: 'Đang Kiểm Tra', desc: 'Đo action, phím, cần' },
    { key: 'APPROVED', title: 'Duyệt Bảo Hành', desc: 'Bảo hành miễn phí 100%' },
    { key: 'REPAIRING', title: 'Đang Căn Chỉnh', desc: 'Thợ đang xử lý kỹ thuật' },
    { key: 'QUALITY_CHECK', title: 'Kiểm Tra Âm (QC)', desc: 'Test âm thanh chuẩn' },
    { key: 'READY_FOR_PICKUP', title: 'Sẵn Sàng Trả Đàn', desc: 'Mời khách đến nhận' },
    { key: 'COMPLETED', title: 'Hoàn Tất Bàn Giao', desc: 'Khách đã nhận đàn' },
  ];

  const currentStepIdx = useMemo(() => {
    if (!activeClaimTracking) return -1;
    return STEP_SEQUENCE.findIndex((s) => s.key === activeClaimTracking.status);
  }, [activeClaimTracking]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* 1. SECURE CUSTOMER PORTAL HEADER (Completely hides all admin menu bars, sidebars & system tools) */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Guitar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight text-white">
                  GUITAR MINH PHÁT
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <BadgeCheck className="w-3 h-3 text-emerald-400" />
                  Bảo Hành Chính Hãng
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Hệ thống tra cứu bảo hành điện tử chính thức
              </p>
            </div>
          </div>

          {/* Hotline & Store Address */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <a
              href="tel:0938694798"
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Hotline: 0938 694 798</span>
            </a>
            <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-medium bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>1021 Tỉnh Lộ 10 - Phường Tân Tạo , TP.HCM</span>
            </div>

            {/* Lock button for admin login */}
            <button
              type="button"
              onClick={() => setCurrentPortal('admin')}
              title="Đăng nhập quản trị viên"
              className="p-2 rounded-xl text-slate-400 hover:text-amber-400 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 sm:py-8 space-y-6">
        {/* Hero Welcome Card */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs mb-3">
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              <span>Tra Cứu Nhanh Chóng • Bảo Mật 100%</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Tra Cứu Bảo Hành Nhạc Cụ Bằng Số Điện Thoại
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 mt-2 leading-relaxed">
              Quý khách chỉ cần nhập số điện thoại đã đăng ký khi mua đàn tại cửa hàng Guitar Minh Phát để kiểm tra thời hạn bảo hành, thông số đàn và gửi yêu cầu căn chỉnh phím trực tuyến.
            </p>
          </div>

          {/* Decorative Guitar Watermark */}
          <Guitar className="w-64 h-64 text-white/10 absolute -right-12 -bottom-16 pointer-events-none" />
        </div>

        {/* Search Input Box (Focused directly on Customer Phone Number) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-md">
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              Nhập Số Điện Thoại Mua Hàng Của Khách:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Phone className="w-5 h-5 text-amber-600 absolute left-4 top-3.5" />
                <input
                  type="text"
                  inputMode="tel"
                  placeholder="Nhập số điện thoại (VD: 0908 123 456 hoặc 0919 876 543)..."
                  value={phoneQuery}
                  onChange={(e) => setPhoneQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 text-sm sm:text-base rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium font-mono text-slate-900 bg-slate-50/50"
                />
                {phoneQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneQuery('');
                      setHasSearched(false);
                      setMatchingWarranties([]);
                      setSelectedWarranty(null);
                    }}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-7 py-3 rounded-2xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Tra Cứu Bảo Hành</span>
              </button>
            </div>
          </form>
        </div>

        {/* Feedback message */}
        {claimFeedback && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center justify-between ${
              claimFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {claimFeedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{claimFeedback.text}</span>
            </div>
            <button
              onClick={() => setClaimFeedback(null)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3. MULTIPLE INSTRUMENTS SELECTOR (When customer bought more than 1 guitar) */}
        {matchingWarranties.length > 1 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Guitar className="w-4 h-4 text-amber-600" />
                <span>Tìm thấy {matchingWarranties.length} nhạc cụ được bảo hành theo số điện thoại:</span>
                <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  {phoneQuery}
                </span>
              </h3>
              <span className="text-xs text-slate-500">Bấm chọn nhạc cụ để xem chi tiết</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchingWarranties.map((w) => {
                const isSelected = selectedWarranty?.id === w.id;
                const isExpired = new Date(w.endDate).getTime() < new Date().getTime();

                return (
                  <div
                    key={w.id}
                    onClick={() => handleSelectWarranty(w)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20 shadow-sm'
                        : 'bg-slate-50/50 hover:bg-slate-100/70 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{w.productName}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        Serial: <span className="font-bold text-purple-700">{w.serialNumber}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Mua ngày: {formatDateOnlyVN(w.startDate)}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {!isExpired ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Còn bảo hành
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Hết hạn
                        </span>
                      )}
                      <div className="text-[10px] text-amber-700 font-semibold mt-1">
                        {isSelected ? '✓ Đang xem' : 'Bấm xem chi tiết →'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. ACTIVE WARRANTY PASSPORT / CERTIFICATE */}
        {selectedWarranty ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden space-y-6 p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
                  <Guitar className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg border border-amber-200">
                    MÃ BẢO HÀNH: {selectedWarranty.warrantyCode}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                    {selectedWarranty.productName}
                  </h2>
                  <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                    <span>Số Serial:</span>
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {selectedWarranty.serialNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                {remainingDays > 0 ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>BẢO HÀNH CHÍNH HÃNG HỢP LỆ</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>ĐÃ HẾT HẠN BẢO HÀNH</span>
                  </div>
                )}
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <span className="text-[11px] text-slate-400 block font-medium">Khách hàng đăng ký</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {selectedWarranty.customerName}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  SĐT: {maskPhone(selectedWarranty.customerPhone)}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <span className="text-[11px] text-slate-400 block font-medium">Ngày kích hoạt mua hàng</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {formatDateOnlyVN(selectedWarranty.startDate)}
                </span>
                <span className="text-xs text-slate-500">Guitar Minh Phát Sài Gòn</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <span className="text-[11px] text-slate-400 block font-medium">Thời hạn bảo hành</span>
                <span className="font-bold text-amber-700 text-sm mt-0.5 block">
                  Đến ngày {formatDateOnlyVN(selectedWarranty.endDate)}
                </span>
                <span className={`text-xs font-semibold ${remainingDays > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {remainingDays > 0 ? `Còn ${remainingDays} ngày hiệu lực` : 'Đã hết thời hạn bảo hành'}
                </span>
              </div>
            </div>

            {/* Policy Coverage Accordion */}
            <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-amber-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-700" />
                  Quyền Lợi Thuộc Gói: {selectedWarranty.policySnapshot.policyName}
                </span>
                <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  {selectedWarranty.policySnapshot.durationMonths} Tháng
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                {selectedWarranty.policySnapshot.terms}
              </p>
              {selectedWarranty.policySnapshot.exclusions && (
                <div className="text-[11px] text-slate-500 pt-1 border-t border-amber-200/50">
                  <span className="font-semibold text-slate-600">Trường hợp loại trừ: </span>
                  {selectedWarranty.policySnapshot.exclusions}
                </div>
              )}
            </div>

            {/* Action Buttons: Request Claim */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Cần cân chỉnh action, căn phím đàn bị rè hoặc bảo dưỡng kỹ thuật?</span>
              </div>

              <button
                type="button"
                onClick={() => setIsClaimModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Wrench className="w-4 h-4" />
                <span>Gửi Yêu Cầu Căn Chỉnh / Bảo Hành Trực Tuyến</span>
              </button>
            </div>
          </div>
        ) : hasSearched && phoneQuery.trim() ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              Không Tìm Thấy Thông Tin Bảo Hành Với Số Điện Thoại Này
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Hệ thống chưa tìm thấy hồ sơ bảo hành trùng khớp với số điện thoại{' '}
              <strong className="text-slate-800 font-mono font-bold">"{phoneQuery}"</strong>.
            </p>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/80 max-w-lg mx-auto text-left text-xs space-y-1.5 text-amber-900">
              <div className="font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-700" />
                Hướng dẫn hỗ trợ khách hàng:
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800">
                <li>Kiểm tra lại xem bạn có đăng ký bằng số điện thoại khác khi mua đàn tại shop không.</li>
                <li>Nếu mới mua hàng tại shop, vui lòng liên hệ Hotline <strong>0938 694 798</strong> để nhân viên kích hoạt bảo hành điện tử ngay.</li>
              </ul>
            </div>
          </div>
        ) : null}

        {/* 5. LIVE CLAIM PROGRESS TRACKER (When an active claim exists for this warranty) */}
        {activeClaimTracking && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-lg">
                  TIẾN ĐỘ TIẾP NHẬN BẢO HÀNH
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Mã Yêu Cầu: {activeClaimTracking.claimCode}
                </h3>
              </div>
              <div className="text-xs text-slate-500">
                Cập nhật lần cuối: <span className="font-semibold text-slate-700">{formatDateVN(activeClaimTracking.updatedAt)}</span>
              </div>
            </div>

            {/* 8-step Interactive Progress Stepper */}
            <div className="relative">
              <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 relative z-10 text-xs">
                {STEP_SEQUENCE.map((step, idx) => {
                  const isPassed = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center space-y-1.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isCurrent
                            ? 'bg-amber-600 text-white ring-4 ring-amber-100 scale-110 shadow-sm'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isPassed && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div
                        className={`font-bold text-[11px] leading-tight ${
                          isCurrent ? 'text-amber-700' : isPassed ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight hidden sm:block">
                        {step.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Diagnostic Note from technician */}
            {activeClaimTracking.diagnosticResult && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs space-y-1">
                <div className="font-bold text-purple-900">
                  Ghi Chú Kỹ Thuật Viên ({activeClaimTracking.technicianName || 'Kỹ thuật trưởng Guitar MP'}):
                </div>
                <p className="text-slate-700 italic">{activeClaimTracking.diagnosticResult}</p>
              </div>
            )}

            {/* Pickup Store address if ready */}
            {activeClaimTracking.status === 'READY_FOR_PICKUP' && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Nhạc Cụ Của Bạn Đã Sẵn Sàng Bàn Giao!
                </div>
                <p>
                  Kính mời bạn đọc số điện thoại hoặc mã hẹn ghé qua cửa hàng tại:{' '}
                  <strong>1021 Tỉnh Lộ 10 - Phường Tân Tạo , TP.HCM</strong> để test thử âm và nhận đàn.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 6. CLAIM SUBMISSION MODAL */}
        {isClaimModalOpen && selectedWarranty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Gửi Yêu Cầu Căn Chỉnh / Bảo Hành</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Đàn: {selectedWarranty.productName} (SN: {selectedWarranty.serialNumber})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleClaimSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Mô Tả Hiện Tượng Lỗi Cần Xử Lý *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="VD: Dây số 3 bấm ngăn 5 bị rè phím (fret buzz), cần đàn có hiện tượng cong, action bị cao quá khó bấm, EQ ra loa có tiếng xẹt xẹt..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Hình Ảnh Kiểm Tra / Video Hiện Tượng
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center space-y-2">
                    <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                    <div className="text-slate-500 text-[11px]">
                      Hệ thống đã đính kèm ảnh kiểm tra mẫu của nhạc cụ
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Hỗ trợ định dạng JPG, PNG, MP4 tối đa 25MB
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div>
                    Thông tin liên hệ của bạn: <strong>{selectedWarranty.customerName}</strong> ({selectedWarranty.customerPhone})
                  </div>
                  <div>Cửa hàng sẽ liên hệ xác nhận trong vòng 30 phút sau khi gửi yêu cầu.</div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsClaimModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm cursor-pointer"
                  >
                    Gửi Yêu Cầu Tiếp Nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* 7. SECURE FOOTER WITH DISCREET SUPER ADMIN LOGIN ACCESS */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Cổng tra cứu bảo hành điện tử chính hãng © Guitar Minh Phát. Mọi thông tin được mã hóa bảo mật.
            </span>
          </div>

          {/* Discreet link for Super Admin login (requires Super Admin authentication) */}
          <button
            type="button"
            onClick={() => setCurrentPortal('admin')}
            title="Dành riêng cho nhân viên & Super Admin đăng nhập"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Dành Cho Quản Trị Viên (Super Admin)</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
