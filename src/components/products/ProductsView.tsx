import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Guitar,
  Boxes,
  Hash,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  ShieldCheck,
  Tag,
  Building2,
  Globe,
} from 'lucide-react';
import { useERP, formatVND } from '../../context/ERPContext';
import { Product, ProductStatus, Brand } from '../../types/erp';

export const ProductsView: React.FC = () => {
  const {
    products,
    categories,
    brands,
    units,
    warrantyPolicies,
    serials,
    stockBalances,
    addProduct,
    updateProduct,
    deleteProduct,
    addBrand,
    updateBrand,
    deleteBrand,
    clearWarehouseDatabase,
    clearAllProducts,
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isClearWarehouseModalOpen, setIsClearWarehouseModalOpen] = useState(false);
  const [isClearAllProductsModalOpen, setIsClearAllProductsModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandFormName, setBrandFormName] = useState('');
  const [brandFormCountry, setBrandFormCountry] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State (No barcode, no trackingType, no costPrice)
  const initialForm = {
    name: '',
    sku: '',
    categoryId: categories[0]?.id || 'cat-1',
    brandId: brands[0]?.id || 'br-1',
    unitId: units[0]?.id || 'unit-1',
    sellingPrice: 1500000,
    minStock: 2,
    initialStock: 5,
    warrantyPolicyId: warrantyPolicies[0]?.id || 'pol-1',
    description: '',
    specifications: '',
    images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80'],
    status: 'ACTIVE' as ProductStatus,
  };

  const [formData, setFormData] = useState(initialForm);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);

      const matchCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
      const matchBrand = selectedBrand === 'ALL' || p.brandId === selectedBrand;
      const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

      return matchSearch && matchCat && matchBrand && matchStatus;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand, selectedStatus]);

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      categoryId: categories[0]?.id || '',
      brandId: brands[0]?.id || '',
      unitId: units[0]?.id || '',
      warrantyPolicyId: warrantyPolicies[0]?.id || '',
      initialStock: 5,
    });
    setEditingProduct(null);
    setIsAddModalOpen(true);
    setFeedbackMsg(null);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      categoryId: p.categoryId,
      brandId: p.brandId,
      unitId: p.unitId,
      sellingPrice: p.sellingPrice,
      minStock: p.minStock,
      initialStock: stockBalances[p.id]?.available ?? 0,
      warrantyPolicyId: p.warrantyPolicyId || '',
      description: p.description,
      specifications: p.specifications || '',
      images: p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80'],
      status: p.status,
    });
    setIsAddModalOpen(true);
    setFeedbackMsg(null);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!formData.name.trim() || !formData.sku.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Vui lòng nhập tên sản phẩm và mã SKU bắt buộc' });
      return;
    }

    if (editingProduct) {
      const res = updateProduct(editingProduct.id, {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        unitId: formData.unitId,
        sellingPrice: Math.max(0, formData.sellingPrice),
        minStock: Math.max(0, formData.minStock),
        warrantyPolicyId: formData.warrantyPolicyId,
        description: formData.description.trim(),
        specifications: formData.specifications.trim(),
        images: formData.images,
        status: formData.status,
      });
      if (!res.success) {
        setFeedbackMsg({ type: 'error', text: res.error || 'Cập nhật thất bại' });
        return;
      }
      setFeedbackMsg({ type: 'success', text: `Cập nhật "${formData.name}" thành công` });
      setIsAddModalOpen(false);
    } else {
      const res = addProduct({
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        unitId: formData.unitId,
        sellingPrice: Math.max(0, formData.sellingPrice),
        minStock: Math.max(0, formData.minStock),
        initialStock: Math.max(0, formData.initialStock),
        warrantyPolicyId: formData.warrantyPolicyId,
        description: formData.description.trim(),
        specifications: formData.specifications.trim(),
        images: formData.images,
        status: formData.status,
      });
      if (!res.success) {
        setFeedbackMsg({ type: 'error', text: res.error || 'Thêm sản phẩm thất bại' });
        return;
      }
      setFeedbackMsg({
        type: 'success',
        text: `Thêm sản phẩm "${formData.name}" thành công (Tồn khả dụng: ${formData.initialStock})`,
      });
      setIsAddModalOpen(false);
    }
  };

  // Brand Management handler
  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandFormName.trim()) return;

    if (editingBrand) {
      updateBrand(editingBrand.id, {
        name: brandFormName.trim(),
        country: brandFormCountry.trim() || 'Việt Nam',
      });
      setFeedbackMsg({ type: 'success', text: `Đã cập nhật thương hiệu "${brandFormName}"` });
    } else {
      const created = addBrand({
        name: brandFormName.trim(),
        country: brandFormCountry.trim() || 'Việt Nam',
      });
      setFormData((prev) => ({ ...prev, brandId: created.id }));
      setFeedbackMsg({ type: 'success', text: `Đã thêm thương hiệu "${created.name}"` });
    }
    setEditingBrand(null);
    setBrandFormName('');
    setBrandFormCountry('');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Guitar className="w-6 h-6 text-amber-600" />
            Danh Mục & Quản Lý Sản Phẩm Nhạc Cụ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý đàn guitar, thương hiệu, giá bán niêm yết và thông tin sản phẩm cửa hàng Minh Phát
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Manage Brands Button */}
          <button
            onClick={() => {
              setEditingBrand(null);
              setBrandFormName('');
              setBrandFormCountry('');
              setIsBrandModalOpen(true);
            }}
            title="Quản lý và chỉnh sửa danh sách thương hiệu"
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-2 rounded-xl text-xs transition-colors shadow-xs cursor-pointer border border-slate-200"
          >
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            <span>Quản Lý Thương Hiệu ({brands.length})</span>
          </button>

          <button
            onClick={() => setIsClearWarehouseModalOpen(true)}
            title="Xóa sạch toàn bộ sổ cái, phiếu nhập và serial tồn kho"
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-3 py-2 rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Boxes className="w-3.5 h-3.5 text-amber-700" />
            <span>Xóa CSDL Quản Lý Kho</span>
          </button>

          {products.length > 0 && (
            <button
              onClick={() => setIsClearAllProductsModalOpen(true)}
              title="Xóa tất cả sản phẩm nhạc cụ trong danh mục"
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold px-3 py-2 rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Xóa Toàn Bộ Sản Phẩm</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar (Removed Tracking Filter) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên nhạc cụ, mã SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="ALL">Tất cả nhóm hàng ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="ALL">Tất cả thương hiệu ({brands.length})</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.country})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table (Removed Tracking Type, Barcode, and Cost Price columns) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Sản Phẩm & Hình Ảnh</th>
                <th className="py-3 px-3">Mã SKU</th>
                <th className="py-3 px-3">Nhóm / Thương Hiệu</th>
                <th className="py-3 px-3 text-right">Giá Bán Niêm Yết</th>
                <th className="py-3 px-3 text-center">Tồn Khả Dụng</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy sản phẩm nhạc cụ phù hợp
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  const br = brands.find((b) => b.id === p.brandId);
                  const bal = stockBalances[p.id] || { available: 0, totalStock: 0 };
                  const isLowStock = bal.available <= p.minStock;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80'}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {p.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {p.sku}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{cat?.name}</div>
                        <div className="text-[11px] text-amber-700 font-semibold">{br?.name}</div>
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatVND(p.sellingPrice)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-mono font-bold px-2.5 py-1 rounded-lg text-xs ${
                            isLowStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {bal.available}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {p.status === 'ACTIVE' ? 'Đang bán' : 'Tạm ngừng'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingProduct(p)}
                            title="Xem chi tiết & Serial"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Chỉnh sửa sản phẩm"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            title="Xóa sản phẩm nhạc cụ này"
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Product Detail Modal (Removed Barcode and Cost Price) */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={viewingProduct.images[0]}
                  alt={viewingProduct.name}
                  className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{viewingProduct.name}</h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Mã SKU: {viewingProduct.sku} • Thương hiệu: {brands.find((b) => b.id === viewingProduct.brandId)?.name || '--'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Specifications & Overview (Including Tồn Khả Dụng, Without Cost Price) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Giá Niêm Yết</span>
                <span className="font-bold text-amber-700 text-sm">{formatVND(viewingProduct.sellingPrice)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tồn Khả Dụng</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {stockBalances[viewingProduct.id]?.available ?? 0}{' '}
                  <span className="text-[11px] font-normal text-slate-500">
                    {units.find((u) => u.id === viewingProduct.unitId)?.name || 'cây'}
                  </span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Định Mức Tồn Tối Thiểu</span>
                <span className="font-semibold text-slate-700">{viewingProduct.minStock} đơn vị</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Chính Sách Bảo Hành</span>
                <span className="font-semibold text-indigo-700">
                  {warrantyPolicies.find((pol) => pol.id === viewingProduct.warrantyPolicyId)?.name || 'Mặc định'}
                </span>
              </div>
            </div>

            {viewingProduct.specifications && (
              <div className="text-xs bg-amber-50/60 border border-amber-200/60 p-3 rounded-xl">
                <div className="font-semibold text-amber-900 mb-1">Thông số kỹ thuật nhạc cụ:</div>
                <div className="text-slate-700 font-mono text-[11px] leading-relaxed">
                  {viewingProduct.specifications}
                </div>
              </div>
            )}

            {/* Associated serial numbers if any */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-purple-600" />
                  Danh Sách Số Serial Của Sản Phẩm Này ({serials.filter((s) => s.productId === viewingProduct.id).length})
                </h4>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Số Serial</th>
                      <th className="py-2.5 px-3">Trạng Thái Kho</th>
                      <th className="py-2.5 px-3">Ngày Nhập</th>
                      <th className="py-2.5 px-3">Ghi Chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {serials.filter((s) => s.productId === viewingProduct.id).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400">
                          Chưa có serial nào cho sản phẩm này.
                        </td>
                      </tr>
                    ) : (
                      serials
                        .filter((s) => s.productId === viewingProduct.id)
                        .map((ser) => (
                          <tr key={ser.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              {ser.serialNumber}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {ser.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">{ser.receivedDate}</td>
                            <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                              {ser.notes || 'Trong kho'}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal (Removed Barcode, Tracking Type, and Cost Price) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? `Chỉnh Sửa Nhạc Cụ: ${editingProduct.name}` : 'Thêm Sản Phẩm Nhạc Cụ Mới'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">
                    Tên Sản Phẩm Nhạc Cụ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Đàn Guitar Acoustic Yamaha FG800..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Mã SKU (Duy nhất) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: YM-FG800"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 font-mono uppercase rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nhóm Sản Phẩm</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand Selection with Edit / Add options */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-700">Thương Hiệu</label>
                    <button
                      type="button"
                      onClick={() => {
                        const curBrand = brands.find((b) => b.id === formData.brandId);
                        if (curBrand) {
                          setEditingBrand(curBrand);
                          setBrandFormName(curBrand.name);
                          setBrandFormCountry(curBrand.country);
                        } else {
                          setEditingBrand(null);
                          setBrandFormName('');
                          setBrandFormCountry('');
                        }
                        setIsBrandModalOpen(true);
                      }}
                      className="text-amber-600 hover:text-amber-700 font-semibold text-[11px] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Sửa / Thêm Thương Hiệu</span>
                    </button>
                  </div>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Đơn Vị Tính</label>
                  <select
                    value={formData.unitId}
                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Giá Bán Niêm Yết (VND) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1 flex items-center justify-between">
                    <span>
                      Tồn Khả Dụng {!editingProduct && <span className="text-rose-500">*</span>}
                    </span>
                    {!editingProduct && (
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        Nhập số lượng kho ban đầu
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      required={!editingProduct}
                      disabled={!!editingProduct}
                      value={formData.initialStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          initialStock: Math.max(0, parseInt(e.target.value) || 0),
                        })
                      }
                      placeholder="Nhập số lượng tồn khả dụng (VD: 5)"
                      className={`w-full px-3 py-2 rounded-xl border font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                        editingProduct
                          ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                          : 'bg-emerald-50/50 text-emerald-900 border-emerald-300'
                      }`}
                    />
                    {editingProduct && (
                      <span className="text-[10px] text-slate-400 absolute right-3 top-2.5">
                        Tồn thực tế
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {editingProduct
                      ? 'Tồn kho khả dụng hiện tại của sản phẩm trong kho'
                      : 'Hệ thống tự động nhập kho và sinh mã Serial để có thể bán hàng ngay'}
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Định Mức Tồn Tối Thiểu</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Chính Sách Bảo Hành Áp Dụng</label>
                  <select
                    value={formData.warrantyPolicyId}
                    onChange={(e) => setFormData({ ...formData, warrantyPolicyId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="">Không có bảo hành</option>
                    {warrantyPolicies.map((pol) => (
                      <option key={pol.id} value={pol.id}>
                        {pol.name} ({pol.durationMonths} tháng)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Trạng Thái Kinh Doanh</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="ACTIVE">ACTIVE - Đang kinh doanh</option>
                    <option value="INACTIVE">INACTIVE - Ngừng kinh doanh</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">Mô Tả Sản Phẩm</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">
                    Thông Số Kỹ Thuật (Gỗ, phím, pickup...)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Top: Solid Spruce | Back/Sides: Rosewood | Pickup: Fishman"
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">URL Hình Ảnh</label>
                  <input
                    type="url"
                    value={formData.images[0] || ''}
                    onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-sm cursor-pointer"
                >
                  {editingProduct ? 'Lưu Thay Đổi' : 'Tạo Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Management & Editing Modal */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-600" />
                Quản Lý & Chỉnh Sửa Thương Hiệu
              </h3>
              <button
                onClick={() => setIsBrandModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form to Add or Edit Brand */}
            <form onSubmit={handleSaveBrand} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-800">
                {editingBrand ? `Chỉnh sửa thương hiệu: ${editingBrand.name}` : 'Thêm Thương Hiệu Mới'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Tên Thương Hiệu *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Fender, Taylor, Martin..."
                    value={brandFormName}
                    onChange={(e) => setBrandFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Xuất Xứ / Quốc Gia</label>
                  <input
                    type="text"
                    placeholder="VD: Nhật Bản, Mỹ, Việt Nam..."
                    value={brandFormCountry}
                    onChange={(e) => setBrandFormCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                {editingBrand && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBrand(null);
                      setBrandFormName('');
                      setBrandFormCountry('');
                    }}
                    className="px-3 py-1.5 rounded-lg text-slate-600 bg-slate-200 hover:bg-slate-300 cursor-pointer"
                  >
                    Hủy sửa
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-semibold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs"
                >
                  {editingBrand ? 'Lưu Thương Hiệu' : '+ Thêm Thương Hiệu'}
                </button>
              </div>
            </form>

            {/* List of Existing Brands */}
            <div className="space-y-2">
              <div className="font-bold text-slate-800">Danh Sách Thương Hiệu Hiện Có ({brands.length})</div>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {brands.map((b) => (
                  <div key={b.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-900">{b.name}</span>
                      <span className="text-slate-400 text-[11px] ml-2">({b.country})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingBrand(b);
                          setBrandFormName(b.name);
                          setBrandFormCountry(b.country);
                        }}
                        className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer"
                        title="Chỉnh sửa tên thương hiệu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          deleteBrand(b.id);
                          setFeedbackMsg({ type: 'success', text: `Đã xóa thương hiệu "${b.name}"` });
                        }}
                        disabled={brands.length <= 1}
                        className={`p-1 rounded-lg cursor-pointer ${
                          brands.length <= 1
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Xóa thương hiệu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác Nhận Xóa Sản Phẩm</h3>
                <p className="text-xs text-slate-500">Gỡ bỏ sản phẩm khỏi hệ thống</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
              <img
                src={productToDelete.images[0] || 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80'}
                alt={productToDelete.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900 line-clamp-1">{productToDelete.name}</div>
                <div className="text-slate-500 font-mono text-[11px]">SKU: {productToDelete.sku}</div>
                <div className="text-amber-700 font-bold text-[11px] mt-0.5">{formatVND(productToDelete.sellingPrice)}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa sản phẩm <strong>"{productToDelete.name}"</strong>? Sản phẩm và dữ liệu liên quan sẽ được xóa ngay.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = deleteProduct(productToDelete.id);
                  if (res.success) {
                    setFeedbackMsg({ type: 'success', text: `Đã xóa sản phẩm "${productToDelete.name}" thành công` });
                  } else {
                    setFeedbackMsg({ type: 'error', text: res.error || 'Xóa sản phẩm thất bại' });
                  }
                  setProductToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác Nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Warehouse Database Confirmation Modal */}
      {isClearWarehouseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Boxes className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xóa CSDL Quản Lý Kho?</h3>
                <p className="text-xs text-slate-500">Làm sạch toàn bộ dữ liệu giao dịch & kho hàng</p>
              </div>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <p className="font-bold">Các mục sẽ được làm sạch:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800">
                <li>Sổ cái xuất nhập kho (Ledger entries)</li>
                <li>Phiếu nhập kho (Goods receipts) & Đơn mua hàng (PO)</li>
                <li>Serial number nhạc cụ lưu kho</li>
                <li>Thiết lập tồn kho của các sản phẩm về 0</li>
                <li><strong>Giữ nguyên danh mục các loại đàn/sản phẩm</strong></li>
              </ul>
            </div>

            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa toàn bộ cơ sở dữ liệu quản lý kho? Dữ liệu kho sẽ được làm mới hoàn toàn.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsClearWarehouseModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  clearWarehouseDatabase();
                  setIsClearWarehouseModalOpen(false);
                  setFeedbackMsg({ type: 'success', text: 'Đã xóa toàn bộ cơ sở dữ liệu quản lý kho thành công!' });
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác Nhận Xóa CSDL Kho</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Products Confirmation Modal */}
      {isClearAllProductsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xóa Toàn Bộ Sản Phẩm?</h3>
                <p className="text-xs text-slate-500">Xóa tất cả {products.length} sản phẩm nhạc cụ trong danh mục</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Hành động này sẽ xóa toàn bộ danh mục sản phẩm đàn và nhạc cụ hiện có. Bạn sẽ cần nhập hoặc tạo lại sản phẩm mới.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsClearAllProductsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllProducts();
                  setIsClearAllProductsModalOpen(false);
                  setFeedbackMsg({ type: 'success', text: 'Đã xóa toàn bộ danh mục sản phẩm nhạc cụ thành công!' });
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác Nhận Xóa Tất Cả</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
