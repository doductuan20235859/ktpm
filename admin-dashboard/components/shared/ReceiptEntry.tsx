import { useState } from 'react';
import { ArrowLeft, Search, DollarSign, Printer, CheckCircle, Calendar, Eye, X } from 'lucide-react';
import axios from 'axios';

interface InvoiceItem {
  id: string;
  invoiceID: number;
  feeType: string;
  description: string;
  amount: number;
}

interface Invoice {
  id: string;
  totalAmount: number; 
  invoiceCode: string;
  period: string;
  dueDate: Date;
  // Bạn có thể thêm apartment ở đây nếu backend trả về cả thông tin căn hộ lồng trong invoice
  apartment?: {
    id: string;
    apartmentCode: string;
  };
  paidAmount: number;
  selected: boolean;
  items?: InvoiceItem[];
}

interface ReceiptEntryProps {
  onBack: () => void;
}

export function ReceiptEntry({ onBack }: ReceiptEntryProps) {
  const [apartmentCode, setApartmentCode] = useState('');
  const [searchedApartmentCode, setSearchedApartmentCode] = useState(''); // State riêng cho mã đã tìm kiếm
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [searchResult, setSearchResult] = useState<Invoice[] | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [amountReceived, setAmountReceived] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState<Invoice | null>(null);
  const [hasError, setHasError] = useState(false); // Trạng thái lỗi
  const [loading, setLoading] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const handleSearch = async (apartmentCode: string) => {
    // 1. Kiểm tra nếu mã căn hộ trống
  if (!apartmentCode || apartmentCode.trim() === "") {
    alert("Vui lòng nhập mã căn hộ trước khi tra cứu!"); 
    // Hoặc dùng toast.error("...") nếu bạn có cài react-toastify
    return; // Dừng hàm, không chạy tiếp xuống phần gọi API
  }

    setLoading(true);
    setHasError(false);
    setSearchedApartmentCode(apartmentCode); // Lưu mã căn hộ đã tìm kiếm
    setInvoices([]);

  try {
    const response = await axios.get(`http://localhost:3001/invoices/apartment/${apartmentCode}`);
    const rawData = response.data;

    const mappedInvoices: Invoice[] = rawData.map((inv: any) => ({
      id: inv.id.toString(),
      invoiceCode: inv.invoiceCode,
      // Chuyển đổi periodDate (2024-12-01) thành định dạng Tháng/Năm hoặc giữ nguyên
      period: inv.periodDate.substring(0, 7),
      dueDate: new Date(inv.dueDate),
      // Backend trả về chuỗi "2155000.00", cần ép kiểu về Number
      totalAmount: Number(inv.totalAmount),
      paidAmount: Number(inv.paidAmount),
      selected: false, // Mặc định chưa chọn khi mới load
      
      // Map thông tin căn hộ
      apartment: inv.apartment ? {
        id: inv.apartment.id.toString(),
        apartmentCode: inv.apartment.code // Backend dùng 'code', interface dùng 'apartmentCode'
      } : undefined,

      // Map danh sách items bên trong invoice
      items: inv.items ? inv.items.map((item: any) => ({
        id: item.id.toString(),
        invoiceID: item.invoiceId, // Chú ý chữ 'd' thường/hoa (invoiceId vs invoiceID)
        feeType: item.feeType,
        description: item.description,
        amount: Number(item.amount)
      })) : []
    }));
    
    // Lọc: Chỉ giữ lại những item có paidAmount != 0
    const filteredItems = mappedInvoices.filter(item => item.paidAmount < item.totalAmount);
    
    // Gán dữ liệu nhận được vào state để render
    setInvoices(filteredItems);
    setSearchResult(filteredItems);
  } catch (error: any) {
    if (error.response?.status === 404) {
      setHasError(true); // Kích hoạt trạng thái không tìm thấy dữ liệu
    } else {
      alert("Có lỗi kết nối hệ thống. Vui lòng thử lại!");
    }
  } finally {
    setLoading(false);
  }
};

  const toggleInvoiceSelection = (id: string) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === id ? { ...invoice, selected: !invoice.selected } : invoice
      )
    );
  };

  // Lọc invoices theo kỳ được chọn
  const filteredInvoices = selectedPeriod === 'ALL' 
    ? invoices 
    : invoices.filter(invoice => invoice.period === selectedPeriod);

  // Tính tổng tiền của các hóa đơn đã chọn
  const selectedInvoices = filteredInvoices.filter(invoice => invoice.selected);
  const totalAmount = selectedInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.paidAmount), 0);
  // Kiểm tra điều kiện lỗi
  const isInvalid = amountReceived !== "" && Number(amountReceived) < totalAmount;

  const handlePrintReceipt = async () => {
    const selectedIds = selectedInvoices.map(inv => inv.id);

    if (selectedInvoices.length === 0) {
      alert('Vui lòng chọn ít nhất một hóa đơn để thanh toán');
      return;
    }

    if (!amountReceived || parseFloat(amountReceived) <= 0) {
      alert('Vui lòng nhập số tiền nhận được');
      return;
    }

    if (isInvalid) {
      alert('Số tiền nhận được không được nhỏ hơn tổng số tiền cần thanh toán');
      return;
    }
    
    // Ở đây ta dùng Promise.all để gửi nhiều request cùng lúc cho nhanh
    await Promise.all(
      selectedInvoices.map(inv => 
        axios.patch(`http://localhost:3001/invoices/${inv.id}/pay`, {
          // Gửi số tiền muốn cập nhật (bằng totalAmount để thanh toán hết)
          paidAmount: Number(inv.totalAmount)
        })
      )
    );

    // Show success message
    setShowSuccess(true);
    
    // Reset form after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      handleSearch(apartmentCode);
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
          <h1 className="text-3xl text-gray-900">
            Ghi Nhận Thu & In Phiếu Thu
          </h1>
          <p className="text-gray-600">
            Tra cứu và ghi nhận thanh toán từ cư dân
          </p>
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
              onKeyPress={(e) =>
                e.key === "Enter" && handleSearch(apartmentCode)
              }
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => handleSearch(apartmentCode)}
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
            <div className="flex items-center gap-4">
              <h2 className="text-xl text-gray-900">
                Danh Sách Hóa Đơn Chưa Thanh Toán - {searchedApartmentCode}
              </h2>
              {/* <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">Tất cả kỳ</option>
                  <option value="2024-12">Tháng 12/2024</option>
                  <option value="2024-11">Tháng 11/2024</option>
                  <option value="2024-10">Tháng 10/2024</option>
                </select>
              </div> */}
            </div>
            <span className="text-sm text-gray-600">
              Tổng nợ tất cả:{" "}
              <span className="text-red-600">
                {formatCurrency(
                  filteredInvoices.reduce(
                    (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
                    0
                  )
                )}
              </span>
            </span>
          </div>

          {loading && <p className="text-center">Đang tra cứu dữ liệu...</p>}

          {!loading && hasError && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-center">
              <p className="text-yellow-700 font-medium">
                Không tìm thấy hóa đơn nào cho mã căn hộ này!
              </p>
              <p className="text-sm text-yellow-600">
                Vui lòng kiểm tra lại mã bạn đã nhập.
              </p>
            </div>
          )}

          {!loading && !hasError && invoices.length > 0 && (
            <div className="space-y-3 mb-6">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    invoice.selected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => toggleInvoiceSelection(invoice.id)}
                >
                  <input
                    type="checkbox"
                    checked={invoice.selected}
                    onChange={() => toggleInvoiceSelection(invoice.id)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-gray-900">
                          Số hóa đơn: {invoice.invoiceCode}
                        </p>
                        <p className="text-sm text-gray-600">
                          Kỳ thanh toán: {invoice.period}
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          Hạn thanh toán:{" "}
                          {invoice.dueDate.toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div className="text-right flex items-start gap-3">
                        <div>
                          <p className="text-sm text-gray-500">Còn nợ</p>
                          <p className="text-lg text-red-600">
                            {formatCurrency(
                              invoice.totalAmount - invoice.paidAmount
                            )}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoiceDetail(invoice);
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total Summary */}
          {selectedInvoices.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  Đã chọn {selectedInvoices.length} hóa đơn để thanh toán
                </span>
                <span className="text-xl text-blue-600">
                  Tổng: {formatCurrency(totalAmount)}
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
                <div className="space-y-2">
                  <div className="relative">
                    <DollarSign
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        isInvalid ? "text-red-500" : "text-gray-400"
                      }`}
                    />
                    <input
                      type="number"
                      placeholder="Nhập số tiền..."
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                        isInvalid
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                  </div>

                  {/* Thông báo lỗi */}
                  {isInvalid && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="font-medium">
                        ⚠️ Số tiền nhập vào phải lớn hơn hoặc bằng
                      </span>
                      <span className="font-bold">
                        {formatCurrency(totalAmount)}
                      </span>
                    </p>
                  )}
                </div>
                {amountReceived && parseFloat(amountReceived) > totalAmount && (
                  <p className="text-sm text-orange-600 mt-1">
                    Tiền thừa:{" "}
                    {formatCurrency(parseFloat(amountReceived) - totalAmount)}
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
              <label className="block text-sm text-gray-700 mb-2">
                Ghi Chú
              </label>
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
          <p className="text-gray-500 text-lg mb-2">
            Nhập mã căn hộ để tra cứu
          </p>
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
            <h3 className="text-2xl text-gray-900 mb-2">
              Ghi Nhận Thành Công!
            </h3>
            <p className="text-gray-600 mb-4">Phiếu thu đã được in</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Căn hộ:{" "}
                <span className="text-gray-900">{searchedApartmentCode}</span>
              </p>
              <p className="text-sm text-gray-600">
                Số tiền:{" "}
                <span className="text-green-600">
                  {formatCurrency(parseFloat(amountReceived || "0"))}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Phương thức:{" "}
                <span className="text-gray-900">
                  {paymentMethod === "CASH"
                    ? "Tiền mặt"
                    : paymentMethod === "TRANSFER"
                    ? "Chuyển khoản"
                    : "Thẻ"}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoiceDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl text-white">Chi Tiết Hóa Đơn</h3>
                <p className="text-sm text-blue-100 mt-1">
                  {selectedInvoiceDetail.invoiceCode}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoiceDetail(null)}
                className="text-white hover:bg-blue-500 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Invoice Info */}
              <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Số hóa đơn</p>
                  <p className="text-sm text-gray-900">
                    {selectedInvoiceDetail.invoiceCode}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Kỳ thanh toán</p>
                  <p className="text-sm text-gray-900">
                    {selectedInvoiceDetail.period}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Hạn thanh toán</p>
                  <p className="text-sm text-orange-600">
                    {selectedInvoiceDetail.dueDate.toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <h4 className="text-lg text-gray-900 mb-4">
                Danh sách các khoản phí
              </h4>
              <div className="space-y-3 mb-6">
                {selectedInvoiceDetail.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="text-gray-900">{item.feeType}</p>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg text-gray-900">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="text-gray-900">
                    {formatCurrency(selectedInvoiceDetail.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Đã thanh toán:</span>
                  <span className="text-green-600">
                    {formatCurrency(selectedInvoiceDetail.paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Còn phải trả:</span>
                  <span className="text-red-600">
                    {formatCurrency(
                      selectedInvoiceDetail.totalAmount -
                        selectedInvoiceDetail.paidAmount
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setSelectedInvoiceDetail(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}