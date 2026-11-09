import React, { useState } from 'react';
import {
  Truck,
  Plus,
  CheckCircle,
  Clock,
  PackagePlus,
  Hash,
  Sparkles,
  FileText,
  Printer,
  X,
  AlertCircle,
  Building,
  Check,
} from 'lucide-react';
import { useERP, formatVND, formatDateVN } from '../../context/ERPContext';
import { PurchaseOrder, GoodsReceipt } from '../../types/erp';

export const PurchasingView: React.FC = () => {
  const {
    purchaseOrders,
    goodsReceipts,
    suppliers,
    products,
    createPurchaseOrder,
    approvePurchaseOrder,
    createGoodsReceipt,
    currentUser,
  } = useERP();

  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'receipts'>('orders');
  const [isCreatePOModalOpen, setIsCreatePOModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [targetPOForReceipt, setTargetPOForReceipt] = useState<PurchaseOrder | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Print view state
  const [printingReceipt, setPrintingReceipt] = useState<GoodsReceipt | null>(null);

  // New PO form state
  const [poSupplierId, setPoSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [poNotes, setPoNotes] = useState('');
  const [poItems, setPoItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([
    { productId: products[0]?.id || '', quantity: 2, unitCost: products[0]?.costPrice || 1000000 },
  ]);

  // Goods receipt form state (serials entered per product)
  const [receiptSerials, setReceiptSerials] = useState<Record<string, string[]>>({});
  const [receiptNotes, setReceiptNotes] = useState('');

  const handleAddPOLine = () => {
    if (products.length > 0) {
      setPoItems([
        ...poItems,
        { productId: products[0].id, quantity: 1, unitCost: products[0].costPrice || 1000000 },
      ]);
    }
  };

  const handleRemovePOLine = (index: number) => {
    setPoItems(poItems.filter((_, idx) => idx !== index));
  };

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId) {
      setFeedback({ type: 'error', text: 'Vui lòng chọn nhà cung cấp' });
      return;
    }
    if (poItems.length === 0) {
      setFeedback({ type: 'error', text: 'Vui lòng thêm ít nhất một sản phẩm' });
      return;
    }

    let subtotal = 0;
    const formattedItems = poItems.map((it) => {
      const lineTotal = it.quantity * it.unitCost;
      subtotal += lineTotal;
      return {
        productId: it.productId,
        quantity: it.quantity,
        unitCost: it.unitCost,
        receivedQuantity: 0,
        total: lineTotal,
      };
    });

    const newPO = createPurchaseOrder({
      supplierId: poSupplierId,
      status: 'APPROVED', // Direct approved by manager for smooth single store flow
      items: formattedItems,
      subtotal,
      discount: 0,
      tax: 0,
      totalAmount: subtotal,
      notes: poNotes,
    });

    setFeedback({ type: 'success', text: `Tạo đơn mua hàng ${newPO.code} thành công!` });
    setIsCreatePOModalOpen(false);
  };

  const handleOpenReceiptModal = (po: PurchaseOrder) => {
    setTargetPOForReceipt(po);
    const initialSerials: Record<string, string[]> = {};

    po.items.forEach((it) => {
      const prod = products.find((p) => p.id === it.productId);
      if (prod?.trackingType === 'SERIAL') {
        const generated: string[] = [];
        const dateTag = new Date().toISOString().slice(2, 4); // '24'
        for (let i = 0; i < it.quantity; i++) {
          const randNum = Math.floor(1000 + Math.random() * 9000);
          generated.push(`${prod.sku}-${dateTag}${randNum}`);
        }
        initialSerials[it.productId] = generated;
      }
    });

    setReceiptSerials(initialSerials);
    setReceiptNotes(`Nhận hàng đợt 1 từ ${po.code}`);
    setIsReceiptModalOpen(true);
    setFeedback(null);
  };

  const handleConfirmReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPOForReceipt) return;

    const itemsToReceive = targetPOForReceipt.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        productId: it.productId,
        quantity: it.quantity,
        unitCost: it.unitCost,
        serials: prod?.trackingType === 'SERIAL' ? receiptSerials[it.productId] || [] : undefined,
      };
    });

    const res = createGoodsReceipt({
      purchaseOrderId: targetPOForReceipt.id,
      items: itemsToReceive,
      notes: receiptNotes,
    });

    if (!res.success) {
      setFeedback({ type: 'error', text: res.error || 'Nhập kho thất bại' });
      return;
    }

    setFeedback({
      type: 'success',
      text: `Xác nhận nhập kho thành công cho đơn ${targetPOForReceipt.code}. Tồn kho và số Serial đã được cập nhật!`,
    });
    setIsReceiptModalOpen(false);
    setActiveSubTab('receipts');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-600" />
            Mua Hàng & Nhập Kho Nhạc Cụ (Purchasing & Receipts)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy trình: Tạo đơn mua hàng (PO) → Duyệt đơn → Kiểm tra & Ghi nhận Serial → Nhập kho & Ghi sổ cái
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreatePOModalOpen(true);
            setFeedback(null);
          }}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đơn Mua Hàng (PO)</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeSubTab === 'orders'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Đơn Đặt Mua Hàng (Purchase Orders - {purchaseOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('receipts')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeSubTab === 'receipts'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PackagePlus className="w-4 h-4" />
          <span>Phiếu Nhập Kho & Serial Đã Ghi Sổ (Goods Receipts - {goodsReceipts.length})</span>
        </button>
      </div>

      {/* Tab 1: Orders List */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Mã Đơn PO</th>
                  <th className="py-3 px-3">Nhà Cung Cấp</th>
                  <th className="py-3 px-3">Chi Tiết Sản Phẩm</th>
                  <th className="py-3 px-3 text-right">Tổng Tiền (VNĐ)</th>
                  <th className="py-3 px-3 text-center">Trạng Thái</th>
                  <th className="py-3 px-3">Người Lập / Ngày</th>
                  <th className="py-3 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => {
                  const sup = suppliers.find((s) => s.id === po.supplierId);
                  const isReceived = po.status === 'RECEIVED';

                  return (
                    <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{po.code}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{sup?.name || 'Nhà cung cấp'}</div>
                        <div className="text-[11px] text-slate-500">{sup?.phone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          {po.items.map((it, idx) => {
                            const p = products.find((pr) => pr.id === it.productId);
                            return (
                              <div key={idx} className="text-[11px] text-slate-700">
                                • <span className="font-medium">{p?.name}</span> (SL: {it.quantity} x {formatVND(it.unitCost)})
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                        {formatVND(po.totalAmount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isReceived
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        <div>{po.createdBy}</div>
                        <div className="text-[10px]">{formatDateVN(po.createdAt)}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isReceived ? (
                          <button
                            onClick={() => handleOpenReceiptModal(po)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ml-auto shadow-xs"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                            <span>Nhập Kho & Gán Serial</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium flex items-center justify-end gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Đã nhập kho
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Goods Receipts List */}
      {activeSubTab === 'receipts' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Mã Phiếu Nhận</th>
                  <th className="py-3 px-3">Theo Đơn PO</th>
                  <th className="py-3 px-3">Nhà Cung Cấp</th>
                  <th className="py-3 px-3">Sản Phẩm & Số Serial Ghi Nhận</th>
                  <th className="py-3 px-3">Người Nhận Kho</th>
                  <th className="py-3 px-3">Ngày Nhập</th>
                  <th className="py-3 px-4 text-right">In Phiếu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {goodsReceipts.map((gr) => {
                  const sup = suppliers.find((s) => s.id === gr.supplierId);
                  const po = purchaseOrders.find((p) => p.id === gr.purchaseOrderId);

                  return (
                    <tr key={gr.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{gr.code}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">{po?.code}</td>
                      <td className="py-3 px-3 text-slate-800 font-medium">{sup?.name}</td>
                      <td className="py-3 px-3">
                        <div className="space-y-1.5">
                          {gr.items.map((it, idx) => {
                            const p = products.find((pr) => pr.id === it.productId);
                            return (
                              <div key={idx} className="text-[11px]">
                                <div className="font-semibold text-slate-800">
                                  {p?.name} (SL: {it.quantity})
                                </div>
                                {it.serials && it.serials.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {it.serials.map((sn) => (
                                      <span
                                        key={sn}
                                        className="font-mono text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-semibold"
                                      >
                                        {sn}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{gr.receivedBy}</td>
                      <td className="py-3 px-3 text-slate-500">{formatDateVN(gr.receivedDate)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setPrintingReceipt(gr)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="In phiếu nhận hàng nhập kho"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Purchase Order */}
      {isCreatePOModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-600" />
                Tạo Đơn Đặt Mua Hàng (PO)
              </h3>
              <button
                onClick={() => setIsCreatePOModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nhà Cung Cấp Nhạc Cụ *</label>
                <select
                  required
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  {suppliers.length === 0 ? (
                    <option value="">Chưa có nhà cung cấp nào (Vui lòng thêm ở mục Nhà cung cấp)</option>
                  ) : (
                    suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}) - {s.phone}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-800">Danh Sách Sản Phẩm Cần Nhập</label>
                  <button
                    type="button"
                    onClick={handleAddPOLine}
                    className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm dòng
                  </button>
                </div>

                <div className="space-y-2.5">
                  {poItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center gap-2.5"
                    >
                      <div className="flex-1 w-full">
                        <select
                          value={item.productId}
                          onChange={(e) => {
                            const newProdId = e.target.value;
                            const p = products.find((pr) => pr.id === newProdId);
                            const updated = [...poItems];
                            updated[idx] = {
                              ...updated[idx],
                              productId: newProdId,
                              unitCost: p?.costPrice || updated[idx].unitCost,
                            };
                            setPoItems(updated);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku}) [{p.trackingType}]
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <label className="block text-[10px] text-slate-400">Số lượng</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...poItems];
                            updated[idx].quantity = Math.max(1, Number(e.target.value));
                            setPoItems(updated);
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 bg-white text-center font-bold"
                        />
                      </div>

                      <div className="w-32">
                        <label className="block text-[10px] text-slate-400">Giá nhập (VNĐ)</label>
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={item.unitCost}
                          onChange={(e) => {
                            const updated = [...poItems];
                            updated[idx].unitCost = Number(e.target.value);
                            setPoItems(updated);
                          }}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 bg-white text-right font-medium"
                        />
                      </div>

                      <div className="w-28 text-right font-bold text-slate-800">
                        {formatVND(item.quantity * item.unitCost)}
                      </div>

                      {poItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePOLine(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Ghi Chú Đơn Hàng</label>
                <input
                  type="text"
                  placeholder="Ghi chú đợt giao, yêu cầu tem niêm phong..."
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatePOModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
                >
                  Tạo Đơn & Phê Duyệt PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Goods Receipt & Serial Number Input */}
      {isReceiptModalOpen && targetPOForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PackagePlus className="w-5 h-5 text-emerald-600" />
                  Phiếu Nhận Hàng & Ghi Nhận Số Serial (Goods Receipt)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo đơn mua hàng: <span className="font-mono font-bold text-slate-800">{targetPOForReceipt.code}</span>
                </p>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReceipt} className="space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl text-amber-900">
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Quy tắc quản lý Serial Number Nhạc cụ (PRD 3.6 & AC-001):
                </div>
                <div className="text-[11px] leading-relaxed">
                  Đối với các sản phẩm loại <strong>SERIAL</strong> (Guitar Acoustic, Classic, Phím lõm, Amply), mỗi cây đàn nhập kho phải được dán nhãn một mã Serial duy nhất. Hệ thống đã tự động gợi ý mã chuẩn theo SKU, bạn có thể chỉnh sửa theo đúng số khắc trên nhãn thùng đàn.
                </div>
              </div>

              <div className="space-y-4">
                {targetPOForReceipt.items.map((it, idx) => {
                  const prod = products.find((p) => p.id === it.productId);
                  const isSerial = prod?.trackingType === 'SERIAL';
                  const serialList = receiptSerials[it.productId] || [];

                  return (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{prod?.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            SKU: {prod?.sku} • Loại: {prod?.trackingType}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs">
                            SL nhận: {it.quantity} {prod?.trackingType === 'SERIAL' ? 'cây' : 'đơn vị'}
                          </span>
                        </div>
                      </div>

                      {isSerial ? (
                        <div className="space-y-2">
                          <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                            <Hash className="w-3.5 h-3.5 text-purple-600" />
                            Nhập {it.quantity} mã Serial cho từng chiếc đàn:
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Array.from({ length: it.quantity }).map((_, sIdx) => (
                              <div key={sIdx} className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 w-6 text-right">#{sIdx + 1}:</span>
                                <input
                                  type="text"
                                  required
                                  value={serialList[sIdx] || ''}
                                  onChange={(e) => {
                                    const nextList = [...serialList];
                                    nextList[sIdx] = e.target.value.toUpperCase();
                                    setReceiptSerials({
                                      ...receiptSerials,
                                      [it.productId]: nextList,
                                    });
                                  }}
                                  placeholder="VD: YM-FG800-2401"
                                  className="flex-1 px-3 py-1.5 font-mono text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-amber-500"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                          Sản phẩm quản lý theo số lượng tổng hợp (QUANTITY). Sẽ tự động tăng số lượng khả dụng trong kho thêm +{it.quantity}.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Ghi Chú Kiểm Tra Khi Nhận</label>
                <input
                  type="text"
                  value={receiptNotes}
                  onChange={(e) => setReceiptNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Xác Nhận Nhập Kho & Ghi Sổ Cái
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {printingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-600" />
                Phiếu Nhập Kho Nhạc Cụ - {printingReceipt.code}
              </h3>
              <button
                onClick={() => setPrintingReceipt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div className="text-center pb-2 border-b border-slate-200">
                <h2 className="text-base font-extrabold text-slate-900">GUITAR MP MUSIC STORE</h2>
                <p className="text-[11px] text-slate-500">PHIẾU NHẬP KHO HÀNG HÓA VÀ SERIAL NUMBER</p>
                <div className="font-mono text-slate-700 font-bold mt-1">{printingReceipt.code}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Đơn mua PO: </span>
                  <span className="font-semibold text-slate-800">
                    {purchaseOrders.find((p) => p.id === printingReceipt.purchaseOrderId)?.code}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Ngày nhập: </span>
                  <span className="font-semibold text-slate-800">{formatDateVN(printingReceipt.receivedDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Người nhận: </span>
                  <span className="font-semibold text-slate-800">{printingReceipt.receivedBy}</span>
                </div>
                <div>
                  <span className="text-slate-400">Nhà cung cấp: </span>
                  <span className="font-semibold text-slate-800">
                    {suppliers.find((s) => s.id === printingReceipt.supplierId)?.name}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden mt-3">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2">Sản phẩm</th>
                      <th className="p-2 text-center">SL</th>
                      <th className="p-2 text-right">Đơn giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {printingReceipt.items.map((it, i) => {
                      const prod = products.find((p) => p.id === it.productId);
                      return (
                        <tr key={i}>
                          <td className="p-2">
                            <div className="font-semibold">{prod?.name}</div>
                            {it.serials && (
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                SN: {it.serials.join(', ')}
                              </div>
                            )}
                          </td>
                          <td className="p-2 text-center font-bold">{it.quantity}</td>
                          <td className="p-2 text-right">{formatVND(it.unitCost)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPrintingReceipt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> In Phiếu Ra Máy In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
