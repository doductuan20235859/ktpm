"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  Plus,
  Eye,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { ReceiptEntry } from "@/components/shared/ReceiptEntry";
import { CreateInvoiceModal } from "@/components/shared/CreateInvoiceModal";

type InvoiceStatus = "PUBLISHED" | "OVERDUE" | "PAID" | "PARTIAL";

interface Invoice {
  id: string;
  invoiceNo: string;
  apartmentCode: string;
  period: string;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  dueDate: Date;          // Để là Date nếu bạn lưu đối tượng
  displayDueDate: string; // Để là string cho bản đã format
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  feeType: string;
  description: string;
  amount: number;
  paid: boolean;
}

export default function FinancialManagement() {
  // Khởi tạo là mảng rỗng thay vì dùng dữ liệu mock
const [invoices, setInvoices] = useState<Invoice[]>([]);

// Thêm hàm này để gọi API
const fetchInvoicesFromDB = async () => {
  try {
    const response = await axios.get("http://localhost:3001/invoices");
    
    // Trích xuất mảng từ object { "data": [...] }
    const dbData = response.data.data; 

    const mappedData = dbData.map((item: any) => ({
      id: item.id.toString(),
      // Lấy invoiceCode từ JSON và gán vào invoiceNo để hiển thị ở bảng
      invoiceNo: item.invoiceCode, 
      // Mapping căn hộ 
      apartmentCode: item.apartment.code, 
      // Cắt chuỗi lấy YYYY-MM
      period: item.periodDate.substring(0, 7), 
      // Chuyển string "1500000.00" thành số để tính toán
      totalAmount: Number(item.totalAmount),
      // paidAmount
      paidAmount: Number(item.paidAmount),
      // status
      status: calculateStatus(item.totalAmount, item.paidAmount, new Date(item.dueDate)),
      dueDate: new Date(item.dueDate),
      // Định dạng ngày hiển thị: 20/11/2024
      displayDueDate: new Date(item.dueDate).toLocaleDateString("vi-VN"),
      items: [] 
    }));

    setInvoices(mappedData);
  } catch (error) {
    console.error("Lỗi kết nối API:", error);
  }
};
// Gọi hàm này ngay khi trang vừa load
useEffect(() => {
  fetchInvoicesFromDB();
}, []);
  const [periodFilter, setPeriodFilter] = useState("2024-12");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showReceiptEntry, setShowReceiptEntry] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [createdInvoiceData, setCreatedInvoiceData] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const calculateStatus = (total: number, paid: number, dueDateStr: Date): string => {
  const remaining = total - paid;
  const dueDate = dueDateStr;
  const now = new Date();
  
  // 1. Nếu tiền còn phải trả là 0 -> PAID
  if (remaining <= 0) return "PAID";

  // 2. Kiểm tra xem đã quá hạn chưa
  const isOverdue = now > dueDate;

  if (isOverdue) {
    // Nếu quá hạn mà vẫn còn nợ -> OVERDUE
    return "OVERDUE";
  } else {
    // Nếu chưa quá hạn
    if (paid > 0) {
      // Đã trả một phần -> PARTIAL
      return "PARTIAL";
    } else {
      // Chưa thanh toán đồng nào -> PUBLISHED
      return "PUBLISHED";
    }
  }
};

  const getStatusBadge = (status: InvoiceStatus) => {
    const styles = {
      PUBLISHED: {
        bg: "bg-blue-100 text-blue-700",
        label: "Đã phát hành",
        icon: Clock,
      },
      OVERDUE: {
        bg: "bg-red-100 text-red-700",
        label: "Quá hạn",
        icon: AlertCircle,
      },
      PAID: {
        bg: "bg-green-100 text-green-700",
        label: "Đã thanh toán",
        icon: CheckCircle,
      },
      PARTIAL: {
        bg: "bg-yellow-100 text-yellow-700",
        label: "Thanh toán 1 phần",
        icon: DollarSign,
      },
    };
    // Logic: Nếu tìm thấy status trong danh sách trên thì dùng, 
  // không thì trả về một object có cấu trúc tương tự để không lỗi .bg
  return styles[status] || { 
    bg: "bg-gray-100 text-gray-500", 
    label: status || "Đang tải...", // Hiển thị chính cái status đó nếu có
    icon: Clock 
  };
  };

  // Filter logic
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.apartmentCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPeriod = periodFilter === "ALL" || inv.period === periodFilter;
    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;

    return matchesSearch && matchesPeriod && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    paid: filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
    unpaid: filteredInvoices.reduce(
      (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
      0
    ),
    overdueCount: filteredInvoices.filter((inv) => inv.status === "OVERDUE")
      .length,
  };

  if (showReceiptEntry) {
    return <ReceiptEntry onBack={() => setShowReceiptEntry(false)} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl text-gray-900 mb-2">
          Quản Lý Thu Phí & Hóa Đơn
        </h1>
        <p className="text-gray-600">
          Tra cứu, tạo hóa đơn và ghi nhận thanh toán từ cư dân
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Tổng Phải Thu</p>
          <p className="text-2xl text-gray-900 mt-1">
            {formatCurrency(stats.total)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Đã Thu</p>
          <p className="text-2xl text-green-600 mt-1">
            {formatCurrency(stats.paid)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Còn Nợ</p>
          <p className="text-2xl text-red-600 mt-1">
            {formatCurrency(stats.unpaid)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Hóa Đơn Quá Hạn</p>
          <p className="text-2xl text-orange-600 mt-1">{stats.overdueCount}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo số hóa đơn, mã căn hộ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tất cả kỳ</option>
              <option value="2024-12">Tháng 12/2024</option>
              <option value="2024-11">Tháng 11/2024</option>
              <option value="2024-10">Tháng 10/2024</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PUBLISHED">Đã phát hành</option>
              <option value="OVERDUE">Quá hạn</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="PARTIAL">Thanh toán 1 phần</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowReceiptEntry(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <DollarSign className="w-5 h-5" />
              Ghi Nhận Thu
            </button>
            <button
              onClick={() => setShowCreateInvoiceModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tạo Hóa Đơn
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Số Hóa Đơn
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Căn Hộ
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Kỳ
                </th>
                <th className="px-6 py-3 text-right text-xs text-gray-600 uppercase tracking-wider">
                  Tổng Tiền
                </th>
                <th className="px-6 py-3 text-right text-xs text-gray-600 uppercase tracking-wider">
                  Đã Trả
                </th>
                <th className="px-6 py-3 text-right text-xs text-gray-600 uppercase tracking-wider">
                  Còn Lại
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Hạn Thanh Toán
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => {
                const badge = getStatusBadge(invoice.status);
                const Icon = badge.icon;
                const remaining = invoice.totalAmount - invoice.paidAmount;
                return (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-blue-600">{invoice.invoiceNo}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {invoice.apartmentCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {invoice.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-green-600">
                      {formatCurrency(invoice.paidAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-red-600">
                      {formatCurrency(remaining)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {invoice.displayDueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${badge.bg} w-fit`}
                      >
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy hóa đơn nào phù hợp</p>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl text-white">Chi Tiết Hóa Đơn</h2>
                <p className="text-sm text-blue-100 mt-1">
                  {selectedInvoice.invoiceNo}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-white hover:bg-blue-500 p-2 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Căn hộ</p>
                  <p className="text-lg text-gray-900">
                    {selectedInvoice.apartmentCode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kỳ thanh toán</p>
                  <p className="text-lg text-gray-900">
                    {selectedInvoice.period}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hạn thanh toán</p>
                  <p className="text-lg text-gray-900">
                    {selectedInvoice.displayDueDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm ${
                      getStatusBadge(selectedInvoice.status).bg
                    }`}
                  >
                    {getStatusBadge(selectedInvoice.status).label}
                  </span>
                </div>
              </div>

              <h3 className="text-lg text-gray-900 mb-4">Chi tiết khoản thu</h3>
              <div className="space-y-3 mb-6">
                {selectedInvoice.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-gray-900">{item.feeType}</p>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900">
                        {formatCurrency(item.amount)}
                      </p>
                      {item.paid && (
                        <span className="text-xs text-green-600">
                          ✓ Đã thanh toán
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="text-gray-900">
                    {formatCurrency(selectedInvoice.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Đã thanh toán:</span>
                  <span className="text-green-600">
                    {formatCurrency(selectedInvoice.paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-900">Còn lại:</span>
                  <span className="text-red-600">
                    {formatCurrency(
                      selectedInvoice.totalAmount - selectedInvoice.paidAmount
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Đóng
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                In Hóa Đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {/* <CreateInvoiceModal
        isOpen={showCreateInvoiceModal}
        onClose={() => setShowCreateInvoiceModal(false)}
        onSubmit={(invoiceData) => {
          console.log("Tạo hóa đơn:", invoiceData);
          // Add logic to save invoice here
        }}
      /> */}

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={showCreateInvoiceModal}
        onClose={() => setShowCreateInvoiceModal(false)}
        onSubmit={(invoiceData) => {
          console.log('Tạo hóa đơn:', invoiceData);
          // Add logic to save invoice here
          // Bổ sung thông tin cho hóa đơn mới
          const completeInvoiceData = {
            ...invoiceData,
            // status: 'PUBLISHED' as InvoiceStatus,
            // paidAmount: 0,
            // items: invoiceData.items.map((item: any) => ({
            //   ...item,
            //   paid: false,
            // })),
          };
          setCreatedInvoiceData(completeInvoiceData);
          setShowSuccessModal(true);
        }}
      />

      {/* Success Modal */}
      {showSuccessModal && createdInvoiceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl text-white">Tạo Hóa Đơn Thành Công</h2>
                <p className="text-sm text-green-100 mt-1">Hóa đơn mới đã được tạo thành công</p>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-white hover:bg-green-500 p-2 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Căn hộ</p>
                  <p className="text-lg text-gray-900">{createdInvoiceData?.building?.replace(/Tòa\s+/i, '')}-{createdInvoiceData?.apartmentCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kỳ thanh toán</p>
                  <p className="text-lg text-gray-900">{createdInvoiceData?.period}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hạn thanh toán</p>
                  <p className="text-lg text-gray-900">{new Date(createdInvoiceData.dueDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusBadge(createdInvoiceData?.status).bg}`}>
                    {getStatusBadge(createdInvoiceData?.status).label}
                  </span>
                </div>
              </div>

              <h3 className="text-lg text-gray-900 mb-4">Chi tiết khoản thu</h3>
              <div className="space-y-3 mb-6">
                {(createdInvoiceData?.items ?? []).map((item: InvoiceItem, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-gray-900">{item.feeType}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900">{formatCurrency(item.amount)}</p>
                      {item.paid && (
                        <span className="text-xs text-green-600">✓ Đã thanh toán</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="text-gray-900">{formatCurrency(createdInvoiceData?.totalAmount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Đã thanh toán:</span>
                  <span className="text-green-600">{formatCurrency(createdInvoiceData?.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-900">Còn lại:</span>
                  <span className="text-red-600">{formatCurrency(createdInvoiceData?.totalAmount - createdInvoiceData?.paidAmount)}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Đóng
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                In Hóa Đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
