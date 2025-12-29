import { useState } from "react";
import {
  X,
  Download,
  Printer,
  CreditCard,
  Building2,
  Calendar,
  User,
  FileText,
} from "lucide-react";

interface PaymentDetail {
  name: string;
  amount: number;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
}

interface Invoice {
  id: string;
  period: string;
  apartmentNumber: string;
  ownerName: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: "paid" | "unpaid" | "partial";
  details: PaymentDetail[];
}

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

export function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
}: InvoiceDetailModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleExport = () => {
    // Create a simple text version for export
    const invoiceText = `
HÓA ĐƠN THANH TOÁN PHÍ QUẢN LÝ CHUNG CƯ
=====================================

Mã hóa đơn: ${invoice.id}
Kỳ thanh toán: ${invoice.period}
Căn hộ: ${invoice.apartmentNumber}
// Chủ hộ: ${invoice.ownerName}
Ngày phát hành: ${invoice.issueDate}
Hạn thanh toán: ${invoice.dueDate}

CHI TIẾT CÁC KHOẢN PHÍ:
${invoice.details
  .map(
    (item, index) => `
${index + 1}. ${item.name}
   ${
     item.quantity && item.unitPrice
       ? `Số lượng: ${item.quantity} ${item.unit || ""} x ${formatCurrency(
           item.unitPrice
         )}`
       : ""
   }
   Thành tiền: ${formatCurrency(item.amount)}
`
  )
  .join("")}

=====================================
TỔNG CỘNG: ${formatCurrency(invoice.totalAmount)}
=====================================

Vui lòng thanh toán đầy đủ trước ngày ${invoice.dueDate}
    `.trim();

    const blob = new Blob([invoiceText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HoaDon_${invoice.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // QR Code data - in real app, this would be a payment QR code
  const qrData = `APARTMENT:${invoice.apartmentNumber}|PERIOD:${invoice.period}|AMOUNT:${invoice.totalAmount}|ID:${invoice.id}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header - No Print */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between print:hidden">
          <div>
            <h2 className="text-2xl text-white">Chi Tiết Hóa Đơn</h2>
            <p className="text-sm text-green-100 mt-1">
              Kỳ thanh toán {invoice.period}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-green-500 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)]">
          {/* Invoice Header - Print Visible */}
          <div className="px-8 py-6 border-b border-gray-200">
            {/* <div className="text-center mb-6">
              <h1 className="text-2xl text-gray-900 mb-2">
                CHUNG CƯ SUNSHINE CITY
              </h1>
              <p className="text-sm text-gray-600">
                Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
              </p>
              <p className="text-sm text-gray-600">
                Điện thoại: 028-1234-5678 | Email: info@sunshinecity.vn
              </p>
            </div> */}

            <div className="text-center mb-6">
              <h2 className="text-xl text-gray-900 mb-1">
                HÓA ĐƠN THANH TOÁN PHÍ QUẢN LÝ
              </h2>
              <p className="text-sm text-gray-600">
                Mã hóa đơn: <span className="text-blue-600">{invoice.id}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Căn hộ</p>
                    <p className="text-lg text-gray-900">
                      {invoice.apartmentNumber}
                    </p>
                  </div>
                </div>
                {/* <div className="flex items-start gap-3 mb-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Chủ hộ</p>
                    <p className="text-lg text-gray-900">{invoice.ownerName}</p>
                  </div>
                </div> */}
              </div>
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Kỳ thanh toán</p>
                    <p className="text-lg text-gray-900">{invoice.period}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Ngày phát hành</p>
                    <p className="text-lg text-gray-900">{invoice.issueDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-red-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Hạn thanh toán</p>
                    <p className="text-lg text-red-600">{invoice.dueDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="px-8 py-6">
            <h3 className="text-lg text-gray-900 mb-4">
              Chi tiết các khoản thu
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-2 text-sm text-gray-700">
                      STT
                    </th>
                    <th className="text-left py-3 px-2 text-sm text-gray-700">
                      Khoản thu
                    </th>
                    <th className="text-center py-3 px-2 text-sm text-gray-700">
                      Số lượng
                    </th>
                    <th className="text-right py-3 px-2 text-sm text-gray-700">
                      Đơn giá
                    </th>
                    <th className="text-right py-3 px-2 text-sm text-gray-700">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.details.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-4 px-2 text-gray-900">{index + 1}</td>
                      <td className="py-4 px-2">
                        <p className="text-gray-900">{item.name}</p>
                        {item.unit && (
                          <p className="text-xs text-gray-500">
                            Đơn vị: {item.unit}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-2 text-center text-gray-900">
                        {item.quantity || "-"}
                      </td>
                      <td className="py-4 px-2 text-right text-gray-900">
                        {item.unitPrice ? formatCurrency(item.unitPrice) : "-"}
                      </td>
                      <td className="py-4 px-2 text-right text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td
                      colSpan={4}
                      className="py-4 px-2 text-right text-lg text-gray-900"
                    >
                      Tổng cộng:
                    </td>
                    <td className="py-4 px-2 text-right text-xl text-red-600">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="text-yellow-700">⚠️ Lưu ý:</span> Vui lòng
                thanh toán đầy đủ trước ngày{" "}
                <span className="text-red-600">{invoice.dueDate}</span> để tránh
                phát sinh phí chậm thanh toán.
              </p>
            </div>
          </div>

          {/* QR Code Section - No Print (or show differently for print) */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Code Section */}
              <div className="bg-white rounded-lg border-2 border-green-200 p-4 text-center flex flex-col h-full justify-center">
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  Thanh toán qua QR Code
                </h4>

                <div className="flex justify-center flex-1 items-center">
                  {/* Container ảnh: Bỏ w-48, dùng w-full và max-w lớn để ảnh to ra */}
                  <div className="w-full max-w-[350px] aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src="/qr-payment.jpg"
                      alt="Mã QR thanh toán"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-lg border-2 border-blue-200 p-6">
                <h4 className="text-lg text-gray-900 mb-4">
                  Thông tin chuyển khoản
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">Ngân hàng</p>
                      <p className="text-sm text-gray-900">
                        Techcombank - Chi nhánh Nam Định
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">Số tài khoản</p>
                      <p className="text-sm text-gray-900">27022005</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">Chủ tài khoản</p>
                      <p className="text-sm text-gray-900">Đỗ Đức Tuân</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">
                        Nội dung chuyển khoản
                      </p>
                      <p className="text-sm text-gray-900 break-all">
                        {invoice.apartmentNumber} {invoice.period}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                💡 <span className="text-blue-700">Mẹo:</span> Vui lòng ghi đúng
                nội dung chuyển khoản để hệ thống tự động cập nhật thanh toán
                của bạn.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
            <div className="text-center text-sm text-gray-600">
              <p>Cảm ơn quý cư dân đã thanh toán đầy đủ và đúng hạn!</p>
              <p className="mt-1">
                Mọi thắc mắc vui lòng liên hệ: 03922278357 |
                lequangloi06032005@gmail.com{" "}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons - No Print */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Xuất Hóa Đơn
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            {isPrinting ? "Đang in..." : "In Hóa Đơn"}
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.inset-0 * {
            visibility: visible;
          }
          .fixed.inset-0 {
            position: static;
          }
          .print\\:hidden {
            display: none !important;
          }
          .overflow-y-auto {
            overflow: visible !important;
            max-height: none !important;
          }
        }
      `}</style>
    </div>
  );
}
