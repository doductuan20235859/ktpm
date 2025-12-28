"use client";
import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { InvoiceDetailModal } from "@/components/shared/InvoiceDetailModal";
import { VehicleRegistrationModal } from "@/components/shared/VehicleRegistrationModal";
import { VehicleDetailModal } from "@/components/shared/VehicleDetailModal";
import { toast } from "sonner";

// --- INTERFACES ---
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
  brand: string;
  status: string;
  photoUrl?: string;
  registrationDocUrl?: string;
  createdAt?: string;
}

interface RequestItem {
  id: number;
  ticketCode: string;
  title: string;
  createdDate: string;
  status: string;
  category: string;
}

interface UserData {
  id: number;
  fullName: string;
  phoneNumber: string;
  role: string;
  apartmentCode: string;
  apartmentId: number;
}

export default function ResidentPortal() {
  // --- STATE QUẢN LÝ UI ---
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [showVehicleDetailModal, setShowVehicleDetailModal] = useState(false);

  // --- STATE DATA & LOADING ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const [myRequests, setMyRequests] = useState<RequestItem[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  // --- STATE FORMS ---
  const [requestForm, setRequestForm] = useState({
    title: "",
    category: "OTHER",
    description: "",
  });

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    idCard: "",
    dateOfBirth: "",
    apartmentNumber: "",
    role: "Cư dân",
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

  // --- LOAD USER DATA FROM LOCALSTORAGE ---
  useEffect(() => {
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      try {
        const userData: UserData = JSON.parse(userDataStr);
        setCurrentUser(userData);

        // Cập nhật profile data
        setProfileData({
          name: userData.fullName,
          email: "",
          phone: userData.phoneNumber,
          idCard: "",
          dateOfBirth: "",
          apartmentNumber: userData.apartmentCode,
          role: userData.role === "RESIDENT" ? "Cư dân" : "Chủ hộ",
        });

        // Cập nhật vehicle form
        setVehicleForm((prev) => ({
          ...prev,
          ownerName: userData.fullName,
          apartmentNumber: userData.apartmentCode,
          phone: userData.phoneNumber,
        }));
      } catch (error) {
        console.error("Lỗi parse user data:", error);
        toast.error("Không thể tải thông tin người dùng");
      }
    }
  }, []);

  // --- API CALLS ---

  // 1. Lấy danh sách yêu cầu
  const fetchMyRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:3001/requests/my-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map((item: any) => ({
          id: item.id,
          ticketCode: item.ticketCode,
          title: item.title,
          createdDate: new Date(item.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: item.status,
          category: item.category,
        }));
        setMyRequests(mappedData);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách yêu cầu:", error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // 2. Lấy danh sách xe
  const fetchMyVehicles = async () => {
    try {
      setIsLoadingVehicles(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:3001/vehicles/my-vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map((item: any) => ({
          id: item.id,
          plate: item.plateNumber,
          type: item.type === "CAR" ? "car" : "motorcycle",
          color: item.color,
          brand: item.brand,
          status: item.status,
          photoUrl: item.photoUrl,
          registrationDocUrl: item.registrationDocUrl,
          createdAt: item.createdAt,
        }));
        setVehicles(mappedData);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách xe:", error);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  // 3. Gửi yêu cầu mới
  const handleSubmitRequest = async () => {
    if (!requestForm.title.trim() || !requestForm.description.trim()) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và mô tả");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("accessToken");

      const res = await fetch("http://localhost:3001/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: requestForm.title,
          category: requestForm.category,
          description: requestForm.description,
          priority: "NORMAL",
        }),
      });

      if (!res.ok) {
        throw new Error("Gửi yêu cầu thất bại");
      }

      const data = await res.json();
      toast.success(`Gửi yêu cầu thành công! Mã: ${data.ticketCode}`);

      // Reset form
      setRequestForm({ title: "", category: "OTHER", description: "" });
      setShowNewRequestForm(false);
      setShowMyRequests(true);
      fetchMyRequests();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi gửi yêu cầu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Gửi đăng ký xe mới
  const handleSubmitVehicle = async () => {
    // Validation
    if (!vehicleForm.plate.trim()) {
      toast.error("Vui lòng nhập biển số xe");
      return;
    }
    if (!vehicleForm.brand.trim()) {
      toast.error("Vui lòng nhập thương hiệu xe");
      return;
    }
    if (!vehicleForm.color) {
      toast.error("Vui lòng chọn màu xe");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("accessToken");

      const formData = new FormData();

      // Chuẩn hóa biển số (uppercase, trim)
      const plateNumber = vehicleForm.plate.trim().toUpperCase();
      formData.append("plateNumber", plateNumber);

      // Map vehicleCategory sang type backend expect
      const vehicleType =
        vehicleForm.vehicleCategory === "car" ? "CAR" : "MOTORCYCLE";
      formData.append("type", vehicleType);

      formData.append("brand", vehicleForm.brand.trim());
      formData.append("color", vehicleForm.color);

      // Append files (chỉ append nếu có file)
      if (vehicleForm.vehiclePhoto) {
        formData.append("vehiclePhoto", vehicleForm.vehiclePhoto);
      }
      if (vehicleForm.registrationDoc) {
        formData.append("registrationDoc", vehicleForm.registrationDoc);
      }
      if (vehicleForm.idCard) {
        formData.append("idCard", vehicleForm.idCard);
      }
      if (vehicleForm.contractDoc) {
        formData.append("contractDoc", vehicleForm.contractDoc);
      }

      const res = await fetch("http://localhost:3001/vehicles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Đăng ký xe thất bại");
      }

      const responseData = await res.json();

      toast.success(
        `Đăng ký xe ${responseData.plateNumber} thành công! Trạng thái: ${
          responseData.status === "PENDING" ? "Chờ duyệt" : responseData.status
        }`
      );

      // Reset form - chỉ reset các field liên quan đến xe
      setVehicleForm((prev) => ({
        ...prev,
        vehicleCategory: "motorcycle" as "car" | "motorcycle",
        vehicleType: "",
        plate: "",
        brand: "",
        color: "",
        vehiclePhoto: null,
        registrationDoc: null,
        idCard: null,
        contractDoc: null,
      }));

      setShowVehicleForm(false);
      fetchMyVehicles();
    } catch (error: any) {
      console.error("Lỗi đăng ký xe:", error);
      toast.error(error.message || "Có lỗi xảy ra khi đăng ký xe");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. ✅ XEM CHI TIẾT XE - Gọi API để lấy full data
  const handleViewVehicle = async (vehicle: Vehicle) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3001/vehicles/${vehicle.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const detailData = await res.json();
        setSelectedVehicle({
          ...detailData,
          plate: detailData.plateNumber,
          type: detailData.type === "CAR" ? "car" : "motorcycle",
        });
        setShowVehicleDetailModal(true);
      } else {
        toast.error("Không thể tải thông tin xe");
      }
    } catch (error) {
      console.error("Lỗi tải chi tiết xe:", error);
      toast.error("Có lỗi xảy ra khi tải thông tin xe");
    }
  };

  // 6. ✅ XÓA XE - GỌI API DELETE
  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa phương tiện này?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }

      console.log("[DELETE] Sending request for vehicle ID:", id);

      const res = await fetch(`http://localhost:3001/vehicles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("[DELETE] Response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("[DELETE] Success:", data);
        toast.success(data.message || "Xóa xe thành công");

        // Refresh danh sách sau khi xóa thành công
        await fetchMyVehicles();
      } else {
        const errorData = await res.json();
        console.error("[DELETE] Error response:", errorData);
        toast.error(errorData.message || "Xóa xe thất bại");
      }
    } catch (error) {
      console.error("[DELETE] Exception:", error);
      toast.error("Có lỗi xảy ra khi xóa xe");
    }
  };

  // --- USE EFFECT ---
  useEffect(() => {
    fetchMyRequests();
    fetchMyVehicles();
  }, []);

  // --- MOCK DATA & HELPERS ---
  const notifications: Notification[] = [
    {
      id: "1",
      title: "Thông báo thu phí tháng 12/2024",
      content: "Kính gửi quý cư dân, Ban quản lý thông báo phí quản lý...",
      date: "10/12/2024",
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
  ];

  const totalDebt = payments
    .filter((p) => p.status === "unpaid" || p.status === "partial")
    .reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const currentInvoice: Invoice = {
    id: "INV-2024-12-A101",
    period: "12/2024",
    apartmentNumber: profileData.apartmentNumber,
    ownerName: profileData.name,
    issueDate: "01/12/2024",
    dueDate: "20/12/2024",
    totalAmount: 3250000,
    status: "unpaid",
    details: [{ name: "Phí quản lý", amount: 1500000 }],
  };

  const getNotificationIcon = (type: string) => {
    if (type === "warning") return "⚠️";
    if (type === "success") return "✅";
    return "ℹ️";
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
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
      DONE: {
        bg: "bg-green-100 text-green-700",
        label: "Hoàn thành",
        icon: CheckCircle,
      },
      CLOSED: {
        bg: "bg-gray-100 text-gray-700",
        label: "Đã đóng",
        icon: CheckCircle,
      },
    };
    return styles[status] || styles.NEW;
  };

  const getVehicleStatusLabel = (status: string) => {
    const statusMap: any = {
      PENDING: { label: "Chờ duyệt", color: "text-orange-600" },
      APPROVED: { label: "Đã duyệt", color: "text-green-600" },
      REJECTED: { label: "Từ chối", color: "text-red-600" },
    };
    return statusMap[status] || { label: status, color: "text-gray-600" };
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">
            Chào mừng, {profileData.name || "Cư dân"}
          </h1>
          <p className="text-gray-600">
            Căn hộ {profileData.apartmentNumber} | {profileData.role}
          </p>
        </div>
        <button
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors border border-gray-200"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <UserCircle className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-sm text-gray-900">{profileData.name}</p>
            <p className="text-xs text-gray-500">Xem thông tin</p>
          </div>
        </button>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl text-gray-900">Thông Tin Cá Nhân</h2>
              <button onClick={() => setShowProfileModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Họ tên</p>
                <p className="text-gray-900 font-medium">{profileData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="text-gray-900 font-medium">{profileData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Căn hộ</p>
                <p className="text-gray-900 font-medium">
                  {profileData.apartmentNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vai trò</p>
                <p className="text-gray-900 font-medium">{profileData.role}</p>
              </div>
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
                  className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4"
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

        {/* --- REQUEST CARD --- */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              Phản Ánh / Yêu Cầu
            </h2>
            <button
              onClick={() => {
                if (!showMyRequests) fetchMyRequests();
                setShowMyRequests(!showMyRequests);
                setShowNewRequestForm(false);
              }}
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

          {/* Form Gửi Yêu Cầu Mới */}
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
                  disabled={isSubmitting}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...
                    </>
                  ) : (
                    "Gửi"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Danh Sách Yêu Cầu Của Tôi */}
          {showMyRequests && (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {isLoadingRequests ? (
                <div className="flex justify-center py-6 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải...
                </div>
              ) : myRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Bạn chưa gửi yêu cầu nào.
                </p>
              ) : (
                myRequests.map((request) => {
                  const badge = getStatusBadge(request.status);
                  const Icon = badge.icon;
                  return (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {request.ticketCode}
                        </span>
                        <span
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.bg}`}
                        >
                          <Icon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>
                      <h3 className="text-gray-900 mb-1 font-medium">
                        {request.title}
                      </h3>
                      <div className="flex justify-between items-end">
                        <p className="text-xs text-gray-500">
                          Ngày tạo: {request.createdDate}
                        </p>
                        <span className="text-xs text-gray-400 border border-gray-200 px-1.5 rounded bg-gray-50">
                          {request.category}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* --- VEHICLES CARD --- */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-green-600" />
            Thông Tin Xe
          </h2>
          <div className="space-y-3">
            {isLoadingVehicles ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-gray-400" />
              </div>
            ) : vehicles.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Chưa có phương tiện nào.
              </p>
            ) : (
              vehicles.map((vehicle) => {
                const statusInfo = getVehicleStatusLabel(vehicle.status);
                return (
                  <div
                    key={vehicle.id}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        vehicle.type === "car" ? "bg-blue-600" : "bg-green-600"
                      }`}
                    >
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-bold">{vehicle.plate}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {vehicle.type === "car" ? "Ô tô" : "Xe máy"} -{" "}
                        {vehicle.brand} - {vehicle.color}
                      </p>
                      <p className="text-xs mt-1">
                        Trạng thái:{" "}
                        <span className={`${statusInfo.color} font-bold`}>
                          {statusInfo.label}
                        </span>
                      </p>
                    </div>
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
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <button
            onClick={() => setShowVehicleForm(true)}
            className="w-full mt-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
          >
            Đăng Ký Xe Mới
          </button>
        </div>
      </div>

      <InvoiceDetailModal
        isOpen={showPaymentDetailModal}
        onClose={() => setShowPaymentDetailModal(false)}
        invoice={currentInvoice}
      />

      <VehicleRegistrationModal
        isOpen={showVehicleForm}
        onClose={() => setShowVehicleForm(false)}
        vehicleForm={vehicleForm}
        onFormChange={setVehicleForm}
        onSubmit={handleSubmitVehicle}
        isSubmitting={isSubmitting}
      />

      <VehicleDetailModal
        isOpen={showVehicleDetailModal}
        onClose={() => setShowVehicleDetailModal(false)}
        vehicle={selectedVehicle}
      />
    </div>
  );
}
