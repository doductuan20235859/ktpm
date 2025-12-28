import { useState } from 'react';
import { ArrowLeft, Search, DollarSign, Printer, CheckCircle } from 'lucide-react';

interface UnpaidItem {
  id: string;
  invoiceNo: string;
  feeType: string;
  description: string;
  amount: number;
  dueDate: string;
  selected: boolean;
}

interface ReceiptEntryProps {
  onBack: () => void;
}

export function ReceiptEntry({ onBack }: ReceiptEntryProps) {
  const [apartmentCode, setApartmentCode] = useState('');
  const [searchResult, setSearchResult] = useState<UnpaidItem[] | null>(null);
  const [unpaidItems, setUnpaidItems] = useState<UnpaidItem[]>([]);
  const [amountReceived, setAmountReceived] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const handleSearch = () => {
    // Mock data for search result
    const mockUnpaidItems: UnpaidItem[] = [
      {
        id: '1',
        invoiceNo: 'INV-2024-12-002',
        feeType: 'Phí quản lý',
        description: 'Phí quản lý tháng 12/2024',
        amount: 1500000,
        dueDate: '15/12/2024',
        selected: false,
      },
      {
        id: '2',
        invoiceNo: 'INV-2024-12-002',
        feeType: 'Dịch vụ',
        description: 'Phí dịch vụ chung cư',
        amount: 950000,
        dueDate: '15/12/2024',
        selected: false,
      },
      {
        id: '3',
        invoiceNo: 'INV-2024-12-002',
        feeType: 'Giữ xe',
        description: 'Phí giữ xe ô tô + xe máy',
        amount: 800000,
        dueDate: '15/12/2024',
        selected: false,
      },
      {
        id: '4',
        invoiceNo: 'INV-2024-11-045',
        feeType: 'Phí quản lý',
        description: 'Phí quản lý tháng 11/2024 (còn nợ)',
        amount: 500000,
        dueDate: '15/11/2024',
        selected: false,
      },
    ];

    setUnpaidItems(mockUnpaidItems);
    setSearchResult(mockUnpaidItems);
  };

  const toggleItemSelection = (id: string) => {
    setUnpaidItems(
      unpaidItems.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectedItems = unpaidItems.filter((item) => item.selected);
  const totalSelected = selectedItems.reduce((sum, item) => sum + item.amount, 0);

  const handlePrintReceipt = () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một khoản để thanh toán');
      return;
    }

    if (!amountReceived || parseFloat(amountReceived) <= 0) {
      alert('Vui lòng nhập số tiền nhận được');
      return;
    }

    // Show success message
    setShowSuccess(true);
    
    // Reset form after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setApartmentCode('');
      setSearchResult(null);
      setUnpaidItems([]);
      setAmountReceived('');
      setNote('');
    }, 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl text-gray-900">Ghi Nhận Thu & In Phiếu Thu</h1>
          <p className="text-gray-600">Tra cứu và ghi nhận thanh toán từ cư dân</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl text-gray-900 mb-4">Tra Cứu Căn Hộ</h2>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Nhập mã căn hộ (VD: A-101, B-202...)"
              value={apartmentCode}
              onChange={(e) => setApartmentCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Tra Cứu
          </button>
        </div>
      </div>

      {/* Unpaid Items */}
      {searchResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-gray-900">
              Danh Sách Khoản Chưa Thanh Toán - {apartmentCode}
            </h2>
            <span className="text-sm text-gray-600">
              Tổng nợ: <span className="text-red-600">{formatCurrency(unpaidItems.reduce((sum, item) => sum + item.amount, 0))}</span>
            </span>
          </div>

          <div className="space-y-3 mb-6">
            {unpaidItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  item.selected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleItemSelection(item.id)}
              >
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => toggleItemSelection(item.id)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-gray-900">{item.feeType}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Số hóa đơn: {item.invoiceNo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg text-gray-900">{formatCurrency(item.amount)}</p>
                      <p className="text-xs text-orange-600">Hạn: {item.dueDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Summary */}
          {selectedItems.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  Đã chọn {selectedItems.length} khoản
                </span>
                <span className="text-xl text-blue-600">
                  Tổng: {formatCurrency(totalSelected)}
                </span>
              </div>
            </div>
          )}

          {/* Payment Form */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg text-gray-900 mb-4">Thông Tin Thanh Toán</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Số Tiền Nhận Được <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Nhập số tiền..."
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {amountReceived && parseFloat(amountReceived) > totalSelected && (
                  <p className="text-sm text-orange-600 mt-1">
                    Tiền thừa: {formatCurrency(parseFloat(amountReceived) - totalSelected)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Phương Thức Thanh Toán <span className="text-red-600">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CASH">Tiền mặt</option>
                  <option value="TRANSFER">Chuyển khoản</option>
                  <option value="CARD">Thẻ</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-700 mb-2">Ghi Chú</label>
              <textarea
                placeholder="Nhập ghi chú (tùy chọn)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handlePrintReceipt}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                In Phiếu Thu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!searchResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Nhập mã căn hộ để tra cứu</p>
          <p className="text-gray-400 text-sm">
            Hệ thống sẽ hiển thị danh sách các khoản phí chưa thanh toán
          </p>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl text-gray-900 mb-2">Ghi Nhận Thành Công!</h3>
            <p className="text-gray-600 mb-4">Phiếu thu đã được in</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Căn hộ: <span className="text-gray-900">{apartmentCode}</span></p>
              <p className="text-sm text-gray-600">Số tiền: <span className="text-green-600">{formatCurrency(parseFloat(amountReceived || '0'))}</span></p>
              <p className="text-sm text-gray-600">Phương thức: <span className="text-gray-900">
                {paymentMethod === 'CASH' ? 'Tiền mặt' : paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 'Thẻ'}
              </span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
