import { useState } from 'react';
import { X, Plus, Trash2, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';

interface InvoiceItem {
  id: string;
  feeType: string;
  description: string;
  amount: number;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoiceData: any) => void;
}

const feeTypes = [
  { value: 'MANAGEMENT', label: 'Phí quản lý' },
  { value: 'SERVICE', label: 'Phí dịch vụ' },
  { value: 'PARKING', label: 'Phí giữ xe' },
  { value: 'WATER', label: 'Tiền nước' },
  { value: 'ELECTRIC', label: 'Tiền điện' },
  { value: 'INTERNET', label: 'Internet/Truyền hình' },
  { value: 'OTHER', label: 'Phí khác' },
];

const buildings = ['Tòa A', 'Tòa B', 'Tòa C', 'Tòa D'];

export function CreateInvoiceModal({ isOpen, onClose, onSubmit }: CreateInvoiceModalProps) {
  const [formData, setFormData] = useState({
    building: '',
    apartmentCode: '',
    period: '',
    dueDate: '',
    notes: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', feeType: '', description: '', amount: 0 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      feeType: '',
      description: '',
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.building) newErrors.building = 'Vui lòng chọn tòa nhà';
    if (!formData.apartmentCode) newErrors.apartmentCode = 'Vui lòng nhập mã căn hộ';
    if (!formData.period) newErrors.period = 'Vui lòng chọn kỳ thanh toán';
    if (!formData.dueDate) newErrors.dueDate = 'Vui lòng chọn hạn thanh toán';

    items.forEach((item, index) => {
      if (!item.feeType) newErrors[`feeType_${index}`] = 'Vui lòng chọn loại phí';
      if (!item.description) newErrors[`description_${index}`] = 'Vui lòng nhập mô tả';
      if (!item.amount || item.amount <= 0) newErrors[`amount_${index}`] = 'Số tiền phải lớn hơn 0';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => { // Thêm async ở đây
  if (validate()) {
    // Loại bỏ 'id' khỏi từng item để tránh lỗi validation
    const cleanItems = items.map(({ id, ...rest }) => rest);
    // 1. Chuẩn bị dữ liệu hoàn chỉnh
    const invoiceData = {
      ...formData,
      items: cleanItems,
      totalAmount: calculateTotal(),
      status: 'PUBLISHED', // Gán trạng thái mặc định
      paidAmount: 0,       // Hóa đơn mới tạo mặc định chưa đóng tiền
    };

    try {
      // 2. Gửi yêu cầu POST đến Backend
      const response = await axios.post('http://localhost:3001/invoices', invoiceData);

      if (response.status === 201 || response.status === 200) {
        // 3. Nếu thành công, thực hiện các logic cũ của bạn
        onSubmit(response.data.data); // Truyền dữ liệu thật từ DB về (có kèm ID)
        handleReset();
        onClose();
      }
    } catch (error) {
      console.error("Lỗi khi tạo hóa đơn:", error);
      alert("Không thể kết nối với máy chủ để lưu hóa đơn.");
    }
  }
};

  const handleReset = () => {
    setFormData({
      building: '',
      apartmentCode: '',
      period: '',
      dueDate: '',
      notes: '',
    });
    setItems([{ id: '1', feeType: '', description: '', amount: 0 }]);
    setErrors({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-white">Tạo Hóa Đơn Mới</h2>
            <p className="text-sm text-blue-100 mt-1">Nhập thông tin hóa đơn thu phí căn hộ</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Basic Info */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4">Thông tin cơ bản</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Tòa nhà <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.building ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Chọn tòa nhà</option>
                  {buildings.map((building) => (
                    <option key={building} value={building}>
                      {building}
                    </option>
                  ))}
                </select>
                {errors.building && (
                  <p className="text-xs text-red-500 mt-1">{errors.building}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Mã căn hộ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.apartmentCode}
                  onChange={(e) => setFormData({ ...formData, apartmentCode: e.target.value })}
                  placeholder="Ví dụ: 101, 202, 303..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.apartmentCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.apartmentCode && (
                  <p className="text-xs text-red-500 mt-1">{errors.apartmentCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Kỳ thanh toán <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="month"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.period ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.period && (
                  <p className="text-xs text-red-500 mt-1">{errors.period}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Hạn thanh toán <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.dueDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.dueDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Fee Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-900">Chi tiết các khoản thu</h3>
              <button
                onClick={addItem}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm khoản thu
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm text-gray-600">Khoản thu #{index + 1}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                        title="Xóa khoản thu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Loại phí <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={item.feeType}
                        onChange={(e) => updateItem(item.id, 'feeType', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          errors[`feeType_${index}`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Chọn loại phí</option>
                        {feeTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors[`feeType_${index}`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`feeType_${index}`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Mô tả <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Nhập mô tả chi tiết"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          errors[`description_${index}`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`description_${index}`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`description_${index}`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Số tiền (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={item.amount || ''}
                          onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                            errors[`amount_${index}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors[`amount_${index}`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`amount_${index}`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-900">Tổng tiền hóa đơn:</span>
              <span className="text-2xl text-blue-600">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Nhập ghi chú cho hóa đơn (không bắt buộc)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Đặt lại
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tạo Hóa Đơn
          </button>
        </div>
      </div>
    </div>
  );
}
