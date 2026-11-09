import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  User,
  CreditCard,
  QrCode,
  Printer,
  X,
  CheckCircle,
  AlertCircle,
  Hash,
  Search,
  Sparkles,
  Guitar,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useERP, formatVND, formatDateVN } from '../../context/ERPContext';
import { SalesOrder, PaymentMethod } from '../../types/erp';
import { QRCodeDisplay } from '../common/QRCodeDisplay';

export const SalesView: React.FC = () => {
  const {
    salesOrders,
    products,
    customers,
    serials,
    stockBalances,
    warranties,
    createSalesOrder,
    addCustomer,
    currentUser,
  } = useERP();

  const [isPOSModalOpen, setIsPOSModalOpen] = useState(false);
  const [printingOrder, setPrintingOrder] = useState<SalesOrder | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // POS Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState<string>('');

  const [cartItems, setCartItems] = useState<
    {
      productId: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      serialNumbers: string[];
    }[]
  >(() => {
    if (products.length > 0) {
      const p = products.find((pr) => pr.status === 'ACTIVE') || products[0];
      return [
        {
          productId: p.id,
          quantity: 1,
          unitPrice: p.sellingPrice,
          discount: 0,
          serialNumbers: [],
        },
      ];
    }
    return [];
  });

  // Quick Add Customer modal
  const [isQuickAddCustOpen, setIsQuickAddCustOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  const handleAddCartLine = () => {
    if (products.length > 0) {
      const p = products.find((pr) => pr.status === 'ACTIVE') || products[0];
      setCartItems([
        ...cartItems,
        {
          productId: p.id,
          quantity: 1,
          unitPrice: p.sellingPrice,
          discount: 0,
          serialNumbers: [],
        },
      ]);
    }
  };

  const handleRemoveCartLine = (idx: number) => {
    setCartItems(cartItems.filter((_, i) => i !== idx));
  };

  const handleQuickAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      setFeedback({ type: 'error', text: 'Vui lòng nhập tên và số điện thoại khách hàng' });
      return;
    }
    const created = addCustomer({
      fullName: newCustName,
      phone: newCustPhone,
      email: newCustEmail,
      address: newCustAddress || 'Tại cửa hàng',
    });
    setSelectedCustomerId(created.id);
    setIsQuickAddCustOpen(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  const handlePOSSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setFeedback({ type: 'error', text: 'Vui lòng chọn khách hàng' });
      return;
    }

    const res = createSalesOrder({
      customerId: selectedCustomerId,
      items: cartItems,
      discount: discountAmount,
      paymentMethod,
      notes: orderNotes,
    });

    if (!res.success) {
      setFeedback({ type: 'error', text: res.error || 'Lỗi khi tạo đơn hàng' });
      return;
    }

    setFeedback({
      type: 'success',
      text: `Tạo hóa đơn ${res.order?.code} thành công! Hệ thống đã tự động xuất kho và kích hoạt bảo hành điện tử QR Code cho khách hàng.`,
    });
    setIsPOSModalOpen(false);
    if (res.order) {
      setPrintingOrder(res.order);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-amber-600" />
            Bán Hàng & Hóa Đơn (Sales POS)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn đàn theo số Serial cụ thể, thanh toán tức thì, tự động kích hoạt Thẻ bảo hành điện tử QR Code
          </p>
        </div>

        <button
          onClick={() => {
            setIsPOSModalOpen(true);
            setFeedback(null);
          }}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đơn Bán Mới (POS)</span>
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

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Mã Hóa Đơn</th>
                <th className="py-3 px-3">Khách Hàng & SĐT</th>
                <th className="py-3 px-3">Sản Phẩm & Số Serial Đã Bán</th>
                <th className="py-3 px-3 text-right">Tổng Tiền</th>
                <th className="py-3 px-3 text-center">Thanh Toán</th>
                <th className="py-3 px-3 text-center">Phương Thức</th>
                <th className="py-3 px-3">Ngày Lập</th>
                <th className="py-3 px-4 text-right">In Hóa Đơn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesOrders.map((so) => {
                const methodLabel = {
                  CASH: 'Tiền mặt',
                  BANK_TRANSFER: 'Chuyển khoản QR',
                  CREDIT_CARD: 'Quẹt thẻ POS',
                  MOMO_ZALOPAY: 'Ví điện tử',
                }[so.paymentMethod];

                return (
                  <tr key={so.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{so.code}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{so.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{so.customerPhone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        {so.items.map((it, idx) => (
                          <div key={idx} className="text-[11px]">
                            <span className="font-medium text-slate-800">{it.productName}</span> (SL: {it.quantity})
                            {it.serialNumbers && it.serialNumbers.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {it.serialNumbers.map((sn) => (
                                  <span
                                    key={sn}
                                    className="font-mono text-[10px] bg-purple-50 text-purple-700 font-semibold px-1.5 py-0.2 rounded border border-purple-200"
                                  >
                                    SN: {sn}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                      {formatVND(so.totalAmount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {so.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 font-medium">{methodLabel}</td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] font-mono">{formatDateVN(so.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setPrintingOrder(so)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="In hóa đơn bán hàng & Thẻ bảo hành"
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

      {/* POS Modal */}
      {isPOSModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
                Tạo Đơn Hàng Mới & Xuất Bán (POS Quầy)
              </h3>
              <button
                onClick={() => setIsPOSModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePOSSubmit} className="space-y-4 text-xs">
              {/* Customer selection */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" />
                    Khách Hàng Nhận Đàn *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuickAddCustOpen(true)}
                    className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm khách mới
                  </button>
                </div>

                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-hidden"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} - {c.phone} ({c.address})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items in Cart */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800">Sản Phẩm Trong Giỏ Hàng</label>
                  <button
                    type="button"
                    onClick={handleAddCartLine}
                    className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm sản phẩm
                  </button>
                </div>

                <div className="space-y-3">
                  {cartItems.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const isSerial = prod?.trackingType === 'SERIAL';
                    const bal = stockBalances[item.productId]?.available || 0;
                    // Available serials for this product
                    const availableSerials = serials.filter(
                      (s) => s.productId === item.productId && s.status === 'IN_STOCK'
                    );

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row items-center gap-2.5">
                          <div className="flex-1 w-full">
                            <select
                              value={item.productId}
                              onChange={(e) => {
                                const newId = e.target.value;
                                const p = products.find((pr) => pr.id === newId);
                                const updated = [...cartItems];
                                updated[idx] = {
                                  ...updated[idx],
                                  productId: newId,
                                  unitPrice: p?.sellingPrice || 0,
                                  serialNumbers: [],
                                };
                                setCartItems(updated);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                            >
                              {products
                                .filter((p) => p.status === 'ACTIVE')
                                .map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.sku}) - Tồn kho: {stockBalances[p.id]?.available || 0}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div className="w-24">
                            <label className="block text-[10px] text-slate-400">Số lượng</label>
                            <input
                              type="number"
                              min={1}
                              max={bal}
                              value={item.quantity}
                              onChange={(e) => {
                                const newQty = Math.max(1, Math.min(bal, Number(e.target.value)));
                                const updated = [...cartItems];
                                updated[idx].quantity = newQty;
                                updated[idx].serialNumbers = [];
                                setCartItems(updated);
                              }}
                              className="w-full px-2 py-1 rounded-lg border border-slate-300 bg-white text-center font-bold"
                            />
                          </div>

                          <div className="w-32">
                            <label className="block text-[10px] text-slate-400">Đơn giá bán</label>
                            <input
                              type="number"
                              min={0}
                              step={1000}
                              value={item.unitPrice}
                              onChange={(e) => {
                                const updated = [...cartItems];
                                updated[idx].unitPrice = Number(e.target.value);
                                setCartItems(updated);
                              }}
                              className="w-full px-2 py-1 rounded-lg border border-slate-300 bg-white text-right font-medium"
                            />
                          </div>

                          <div className="w-28 text-right font-extrabold text-slate-900">
                            {formatVND(item.quantity * item.unitPrice)}
                          </div>

                          {cartItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCartLine(idx)}
                              className="p-1 text-rose-500 hover:text-rose-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Serial Picker for SERIAL products (AC-008, AC-015) */}
                        {isSerial && (
                          <div className="bg-purple-50/70 p-2.5 rounded-lg border border-purple-200/80 space-y-1.5">
                            <div className="font-semibold text-purple-900 flex items-center justify-between text-[11px]">
                              <span className="flex items-center gap-1">
                                <Hash className="w-3.5 h-3.5 text-purple-700" />
                                Chọn {item.quantity} số Serial có sẵn trong kho ({availableSerials.length} cây sẵn sàng):
                              </span>
                            </div>

                            {availableSerials.length === 0 ? (
                              <div className="text-[11px] text-rose-600 font-bold">
                                Không có serial nào ở trạng thái IN_STOCK. Không thể bán mặt hàng này!
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Array.from({ length: item.quantity }).map((_, sIdx) => (
                                  <select
                                    key={sIdx}
                                    required
                                    value={item.serialNumbers[sIdx] || ''}
                                    onChange={(e) => {
                                      const chosen = e.target.value;
                                      const nextSerials = [...item.serialNumbers];
                                      nextSerials[sIdx] = chosen;
                                      const updated = [...cartItems];
                                      updated[idx].serialNumbers = nextSerials;
                                      setCartItems(updated);
                                    }}
                                    className="w-full px-2 py-1 text-xs font-mono rounded border border-purple-300 bg-white focus:outline-hidden"
                                  >
                                    <option value="">-- Chọn số Serial #{sIdx + 1} --</option>
                                    {availableSerials.map((s) => (
                                      <option
                                        key={s.id}
                                        value={s.serialNumber}
                                        disabled={item.serialNumbers.includes(s.serialNumber) && item.serialNumbers[sIdx] !== s.serialNumber}
                                      >
                                        {s.serialNumber} ({s.notes || 'Chuẩn kho'})
                                      </option>
                                    ))}
                                  </select>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment & Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phương Thức Thanh Toán</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="BANK_TRANSFER">Chuyển khoản QR ngân hàng (VietQR)</option>
                    <option value="CASH">Tiền mặt tại quầy</option>
                    <option value="CREDIT_CARD">Thẻ tín dụng / Ghi nợ (POS)</option>
                    <option value="MOMO_ZALOPAY">Ví MoMo / ZaloPay</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Chiết Khấu Trực Tiếp (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPOSModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Xác Nhận Thanh Toán & Kích Hoạt Bảo Hành
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      {isQuickAddCustOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">Thêm Nhanh Khách Hàng</h3>
            <form onSubmit={handleQuickAddCustomerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Họ và Tên *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Anh Minh..."
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Số Điện Thoại (Bắt buộc để bảo hành) *</label>
                <input
                  type="tel"
                  required
                  placeholder="VD: 0908123456"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Địa Chỉ</label>
                <input
                  type="text"
                  placeholder="Địa chỉ giao nhận đàn..."
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsQuickAddCustOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white"
                >
                  Lưu Khách Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice & Warranty Slip Modal */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-600" />
                Hóa Đơn Bán Hàng Kiêm Phiếu Bảo Hành Điện Tử - {printingOrder.code}
              </h3>
              <button
                onClick={() => setPrintingOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs">
              <div className="text-center pb-3 border-b border-slate-200">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">GUITAR MINH PHÁT</h1>
                <p className="text-[11px] text-slate-500">1021 Tỉnh Lộ 10 - Phường Tân Tạo , TP.HCM</p>
                <p className="text-[11px] text-slate-500">Hotline: 0938 694 798 • Email: shopguitarmp@gmail.com</p>
                <div className="mt-2 font-mono font-bold text-sm text-amber-700 bg-amber-100 inline-block px-3 py-1 rounded-md">
                  HÓA ĐƠN: {printingOrder.code}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Khách hàng: </span>
                  <span className="font-bold text-slate-900">{printingOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Số điện thoại: </span>
                  <span className="font-mono font-bold text-slate-900">{printingOrder.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500">Ngày lập: </span>
                  <span className="font-semibold text-slate-800">{formatDateVN(printingOrder.createdAt)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Nhân viên thu ngân: </span>
                  <span className="font-semibold text-slate-800">{printingOrder.createdBy}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px]">
                    <tr>
                      <th className="p-2.5">Sản Phẩm Nhạc Cụ</th>
                      <th className="p-2.5 text-center">SL</th>
                      <th className="p-2.5 text-right">Đơn Giá</th>
                      <th className="p-2.5 text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {printingOrder.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{it.productName}</div>
                          {it.serialNumbers && it.serialNumbers.length > 0 && (
                            <div className="text-[10px] font-mono text-purple-700 font-semibold mt-0.5">
                              MÃ SERIAL: {it.serialNumbers.join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                        <td className="p-2.5 text-right">{formatVND(it.unitPrice)}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{formatVND(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="p-2.5 text-right font-bold">
                        TỔNG CỘNG THANH TOÁN:
                      </td>
                      <td className="p-2.5 text-right font-extrabold text-amber-700 text-sm">
                        {formatVND(printingOrder.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* QR Code Warranty Slip attached on invoice! */}
              {warranties.filter((w) => w.salesOrderId === printingOrder.id).length > 0 && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    TEM BẢO HÀNH ĐIỆN TỬ TÍCH HỢP (QR CODE TRA CỨU TỨC THÌ)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    {warranties
                      .filter((w) => w.salesOrderId === printingOrder.id)
                      .map((warr) => (
                        <div key={warr.id} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-amber-200">
                          <QRCodeDisplay
                            token={warr.qrToken}
                            warrantyCode={warr.warrantyCode}
                            serialNumber={warr.serialNumber}
                            size={90}
                            showScanButton={true}
                          />
                          <div className="text-[11px] space-y-1">
                            <div className="font-bold text-slate-900">{warr.productName}</div>
                            <div className="text-slate-500 font-mono">SN: {warr.serialNumber}</div>
                            <div className="text-emerald-700 font-semibold">
                              Hạn BH: {warr.endDate}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Quét QR để gửi yêu cầu bảo hành hoặc tra cứu tình trạng
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPrintingOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> In Hóa Đơn & Mã QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
