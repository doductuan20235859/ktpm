"use client";
import { useState } from "react";
import {
  Bell,
  DollarSign,
  MessageSquare,
  Car,
  Send,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  UserCircle,
  User,
  Download,
  Printer,
  Trash2,
} from "lucide-react";
import { InvoiceDetailModal } from "@/components/shared/InvoiceDetailModal";
import { VehicleRegistrationModal } from "@/components/shared/VehicleRegistrationModal";
import { VehicleDetailModal } from "@/components/shared/VehicleDetailModal";

interface Notification {
  id: string;
  title: string;
  content: string;
  date: string;
  type: "info" | "warning" | "success";
}

interface Payment {
  id: string;
  period: string;
  amount: number;
  status: "paid" | "unpaid" | "partial";
  dueDate: string;
}

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

interface Vehicle {
  id: string;
  plate: string;
  type: "car" | "motorcycle";
  color: string;
}

interface MyRequest {
  id: string;
  ticketCode: string;
  title: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdDate: string;
}

export default function ResidentPortal() {
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [showVehicleDetailModal, setShowVehicleDetailModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    name: "Nguyễn Văn An",
    email: "nguyenvanan@email.com",
    phone: "0987654321",
    idCard: "012345678901",
    dateOfBirth: "01/01/1985",
    apartmentNumber: "A-101",
    role: "Chủ hộ",
  });
  const [vehicleForm, setVehicleForm] = useState({
    ownerName: "",
    apartmentNumber: "",
    phone: "",
    vehicleCategory: "motorcycle" as "car" | "motorcycle",
    vehicleType: "",
    plate: "",
    brand: "",
    color: "",
    vehiclePhoto: null as File | null,
    registrationDoc: null as File | null,
    idCard: null as File | null,
    contractDoc: null as File | null,
  });

  // Mock data
  const notifications: Notification[] = [
    {
      id: "1",
      title: "Thông báo thu phí tháng 12/2024",
      content:
        "Kính gửi quý cư dân, Ban quản lý thông báo phí quản lý tháng 12/2024 đã được phát hành. Vui lòng thanh toán trước ngày 20/12/2024.",
      date: "10/12/2024",
      type: "info",
    },
    {
      id: "2",
      title: "Tạm ngưng cấp nước",
      content:
        "Ngày 15/12/2024 từ 8h-12h sẽ tạm ngưng cấp nước để vệ sinh bể nước. Vui lòng dự trữ nước sử dụng.",
      date: "12/12/2024",
      type: "warning",
    },
    {
      id: "3",
      title: "Thông báo nội quy mới về giữ xe",
      content:
        "Từ ngày 01/01/2025, mọi phương tiện ra vào phải quét thẻ. Vui lòng đăng ký thẻ tại văn phòng BQL.",
      date: "13/12/2024",
      type: "info",
    },
  ];

  const payments: Payment[] = [
    {
      id: "1",
      period: "12/2024",
      amount: 3250000,
      status: "unpaid",
      dueDate: "20/12/2024",
    },
    {
      id: "2",
      period: "11/2024",
      amount: 3250000,
      status: "paid",
      dueDate: "20/11/2024",
    },
    {
      id: "3",
      period: "10/2024",
      amount: 3250000,
      status: "paid",
      dueDate: "20/10/2024",
    },
    {
      id: "4",
      period: "09/2024",
      amount: 3250000,
      status: "paid",
      dueDate: "20/09/2024",
    },
  ];

  const vehicles: Vehicle[] = [
    { id: "1", plate: "29A-12345", type: "car", color: "Đen" },
    { id: "2", plate: "29B1-67890", type: "motorcycle", color: "Đỏ" },
  ];

  // Mock detailed vehicle data
  const getVehicleDetail = (vehicle: Vehicle) => {
    // This would normally fetch from API
    return {
      ...vehicle,
      vehicleType: vehicle.type === "car" ? "Sedan" : "Tay ga",
      brand: vehicle.type === "car" ? "Toyota" : "Honda",
      ownerName: "Nguyễn Văn An",
      apartmentNumber: "A-101",
      phone: "0987654321",
      color: vehicle.color === "Đen" ? "black" : "red",
      registrationDate: "01/01/2024",
      status: "active" as "active" | "pending" | "expired",
      vehiclePhoto: undefined,
      registrationDoc: "registration_doc.pdf",
      idCard: "id_card.pdf",
      contractDoc: "contract_doc.pdf",
    };
  };

  const handleViewVehicle = (vehicle: Vehicle) => {
    const detailedVehicle = getVehicleDetail(vehicle);
    setSelectedVehicle(detailedVehicle);
    setShowVehicleDetailModal(true);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa phương tiện này?")) {
      alert("Phương tiện đã được xóa thành công!");
      // In real app, would delete from state/database
    }
  };

  const myRequests: MyRequest[] = [
    {
      id: "1",
      ticketCode: "REQ-2024-007",
      title: "Đèn hành lang tầng 5 hỏng",
      status: "IN_PROGRESS",
      createdDate: "12/12/2024",
    },
    {
      id: "2",
      ticketCode: "REQ-2024-003",
      title: "Yêu cầu sửa chữa ổ khóa cửa",
      status: "RESOLVED",
      createdDate: "05/12/2024",
    },
  ];

  const [requestForm, setRequestForm] = useState({
    title: "",
    category: "OTHER",
    description: "",
  });

  const totalDebt = payments
    .filter((p) => p.status === "unpaid" || p.status === "partial")
    .reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Mock invoice data
  const currentInvoice: Invoice = {
    id: "INV-2024-12-A101",
    period: "12/2024",
    apartmentNumber: "A-101",
    ownerName: "Nguyễn Văn An",
    issueDate: "01/12/2024",
    dueDate: "20/12/2024",
    totalAmount: 3250000,
    status: "unpaid",
    details: [
      { name: "Phí quản lý", amount: 1500000 },
      { name: "Phí dịch vụ", amount: 800000 },
      {
        name: "Điện",
        amount: 450000,
        unit: "kWh",
        quantity: 180,
        unitPrice: 2500,
      },
      {
        name: "Nước",
        amount: 350000,
        unit: "m³",
        quantity: 14,
        unitPrice: 25000,
      },
      {
        name: "Phí gửi xe ô tô",
        amount: 150000,
        unit: "xe",
        quantity: 1,
        unitPrice: 150000,
      },
    ],
  };

  const getNotificationIcon = (type: string) => {
    if (type === "warning") return "⚠️";
    if (type === "success") return "✅";
    return "ℹ️";
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      NEW: { bg: "bg-blue-100 text-blue-700", label: "Mới", icon: AlertCircle },
      IN_PROGRESS: {
        bg: "bg-orange-100 text-orange-700",
        label: "Đang xử lý",
        icon: Clock,
      },
      RESOLVED: {
        bg: "bg-green-100 text-green-700",
        label: "Đã giải quyết",
        icon: CheckCircle,
      },
      CLOSED: {
        bg: "bg-gray-100 text-gray-700",
        label: "Đã đóng",
        icon: CheckCircle,
      },
    };
    return styles[status as keyof typeof styles] || styles.NEW;
  };

  const handleSubmitRequest = () => {
    if (!requestForm.title || !requestForm.description) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    alert(
      "Gửi yêu cầu thành công! Chúng tôi sẽ xử lý trong thời gian sớm nhất."
    );
    setRequestForm({ title: "", category: "OTHER", description: "" });
    setShowNewRequestForm(false);
  };

  const handleSubmitVehicle = () => {
    if (
      !vehicleForm.ownerName ||
      !vehicleForm.apartmentNumber ||
      !vehicleForm.phone ||
      !vehicleForm.plate ||
      !vehicleForm.vehicleType ||
      !vehicleForm.brand ||
      !vehicleForm.color
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    alert("Đăng ký xe thành công! Ban quản lý sẽ xem xét và phê duyệt.");
    setVehicleForm({
      ownerName: "",
      apartmentNumber: "",
      phone: "",
      vehicleCategory: "motorcycle",
      vehicleType: "",
      plate: "",
      brand: "",
      color: "",
      vehiclePhoto: null,
      registrationDoc: null,
      idCard: null,
      contractDoc: null,
    });
    setShowVehicleForm(false);
  };

  const handleFileChange = (
    field: "registrationDoc" | "idCard" | "contractDoc" | "vehiclePhoto",
    file: File | null
  ) => {
    setVehicleForm({ ...vehicleForm, [field]: file });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">
            Chào mừng, Nguyễn Văn An
          </h1>
          <p className="text-gray-600">Căn hộ A-101 | Chủ hộ</p>
        </div>
        <button
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors border border-gray-200"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <UserCircle className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-sm text-gray-900">Nguyễn Văn An</p>
            <p className="text-xs text-gray-500">Cập nhật thông tin</p>
          </div>
        </button>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl text-gray-900">Thông Tin Cá Nhân</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl">
                    <UserCircle className="w-16 h-16" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white border-2 border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Họ và Tên <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Số Điện Thoại <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Số CMND/CCCD
                  </label>
                  <input
                    type="text"
                    value={profileData.idCard}
                    onChange={(e) =>
                      setProfileData({ ...profileData, idCard: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Ngày Sinh
                  </label>
                  <input
                    type="text"
                    value={profileData.dateOfBirth}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        dateOfBirth: e.target.value,
                      })
                    }
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Số Căn Hộ
                  </label>
                  <input
                    type="text"
                    value={profileData.apartmentNumber}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Vai Trò
                  </label>
                  <input
                    type="text"
                    value={profileData.role}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    disabled
                  />
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    🔒 Đổi Mật Khẩu
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  alert("Cập nhật thông tin thành công!");
                  setShowProfileModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
          <Bell className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Thông Báo Mới</p>
          <p className="text-3xl mt-1">{notifications.length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-sm p-6 text-white">
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Tổng Nợ</p>
          <p className="text-2xl mt-1">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-sm p-6 text-white">
          <MessageSquare className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Yêu Cầu Đang Xử Lý</p>
          <p className="text-3xl mt-1">
            {
              myRequests.filter(
                (r) => r.status === "IN_PROGRESS" || r.status === "NEW"
              ).length
            }
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
          <Car className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Phương Tiện</p>
          <p className="text-3xl mt-1">{vehicles.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Thông Báo
            </h2>
            <button
              onClick={() => setShowAllNotifications(!showAllNotifications)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              {showAllNotifications ? "Thu gọn" : "Xem tất cả"}
            </button>
          </div>

          <div
            className={`space-y-3 ${
              showAllNotifications ? "max-h-[500px] overflow-y-auto pr-2" : ""
            }`}
          >
            {notifications
              .slice(0, showAllNotifications ? undefined : 3)
              .map((notification) => (
                <div
                  key={notification.id}
                  className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-700 mb-2">
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        {notification.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Tra Cứu Phí
            </h2>
            <button
              onClick={() => setShowPaymentHistory(!showPaymentHistory)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              {showPaymentHistory ? "Thu gọn" : "Lịch sử"}
            </button>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 mb-4 border border-red-200">
            <p className="text-sm text-gray-600 mb-1">Tổng Tiền Nợ Hiện Tại</p>
            <p className="text-3xl text-red-600">{formatCurrency(totalDebt)}</p>
            <p className="text-xs text-gray-500 mt-2">
              Hạn thanh toán:{" "}
              {payments.find((p) => p.status === "unpaid")?.dueDate}
            </p>
          </div>

          {showPaymentHistory && (
            <div className="space-y-2">
              <h3 className="text-sm text-gray-700 mb-2">Lịch sử thanh toán</h3>
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-gray-900">Tháng {payment.period}</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      payment.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {payment.status === "paid"
                      ? "Đã thanh toán"
                      : "Chưa thanh toán"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {!showPaymentHistory && (
            <button
              onClick={() => setShowPaymentDetailModal(true)}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Xem Chi Tiết & Thanh Toán
            </button>
          )}
        </div>

        {/* Request Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              Phản Ánh / Yêu Cầu
            </h2>
            <button
              onClick={() => setShowMyRequests(!showMyRequests)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              {showMyRequests ? "Gửi mới" : "Yêu cầu của tôi"}
            </button>
          </div>

          {!showNewRequestForm && !showMyRequests && (
            <div>
              <p className="text-gray-600 mb-4 text-sm">
                Gửi phản ánh hoặc yêu cầu hỗ trợ đến Ban quản lý
              </p>
              <button
                onClick={() => setShowNewRequestForm(true)}
                className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Gửi Yêu Cầu Mới
              </button>
            </div>
          )}

          {showNewRequestForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Tiêu Đề <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={requestForm.title}
                  onChange={(e) =>
                    setRequestForm({ ...requestForm, title: e.target.value })
                  }
                  placeholder="Nhập tiêu đề yêu cầu..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Hạng Mục <span className="text-red-600">*</span>
                </label>
                <select
                  value={requestForm.category}
                  onChange={(e) =>
                    setRequestForm({ ...requestForm, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="ELECTRIC">Điện</option>
                  <option value="WATER">Nước</option>
                  <option value="SECURITY">An ninh</option>
                  <option value="CLEANING">Vệ sinh</option>
                  <option value="ELEVATOR">Thang máy</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Mô Tả Chi Tiết <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={requestForm.description}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Mô tả chi tiết vấn đề..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewRequestForm(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitRequest}
                  className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Gửi
                </button>
              </div>
            </div>
          )}

          {showMyRequests && (
            <div className="space-y-3">
              {myRequests.map((request) => {
                const badge = getStatusBadge(request.status);
                const Icon = badge.icon;
                return (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-blue-600">
                        {request.ticketCode}
                      </span>
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${badge.bg}`}
                      >
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </div>
                    <h3 className="text-gray-900 mb-1">{request.title}</h3>
                    <p className="text-xs text-gray-500">
                      Tạo ngày: {request.createdDate}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Vehicles Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-green-600" />
            Thông Tin Xe
          </h2>

          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 group"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    vehicle.type === "car" ? "bg-blue-600" : "bg-green-600"
                  }`}
                >
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900">{vehicle.plate}</p>
                  <p className="text-sm text-gray-600">
                    {vehicle.type === "car" ? "Ô tô" : "Xe máy"} - Màu{" "}
                    {vehicle.color}
                  </p>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs flex-shrink-0">
                  Đã đăng ký
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewVehicle(vehicle)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Xóa phương tiện"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowVehicleForm(true)}
            className="w-full mt-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            Đăng Ký Xe Mới
          </button>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={showPaymentDetailModal}
        onClose={() => setShowPaymentDetailModal(false)}
        invoice={currentInvoice}
      />

      {/* Vehicle Registration Modal */}
      <VehicleRegistrationModal
        isOpen={showVehicleForm}
        onClose={() => setShowVehicleForm(false)}
        vehicleForm={vehicleForm}
        onFormChange={setVehicleForm}
        onSubmit={handleSubmitVehicle}
      />

      {/* Vehicle Detail Modal */}
      <VehicleDetailModal
        isOpen={showVehicleDetailModal}
        onClose={() => setShowVehicleDetailModal(false)}
        vehicle={selectedVehicle}
      />
    </div>
  );
}
