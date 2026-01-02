"use client";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Power,
  Wrench,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Amenity } from "@/app/types/amenity"; // Đảm bảo đường dẫn đúng
import { DeleteModal } from "@/components/shared/DeleteModal"; // Đảm bảo đường dẫn đúng

// Interface cho Frontend (Giữ nguyên để không phá vỡ UI cũ)
interface BookingRequest {
  id: string;
  amenityId: number;
  amenityName: string;
  residentName: string;
  apartmentNumber: string;
  date: string;
  timeSlot: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  notes: string;
  createdDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  rejectionReason?: string;
}

// Interface cho dữ liệu trả về từ Backend (Dựa trên JSON bạn gửi)
interface BackendBookingResponse {
  id: number;
  amenity: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    fullName: string;
    apartmentNumber?: string; // Có thể có hoặc không
  };
  bookingDate: string;
  timeSlot: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  notes: string;
  adminResponse?: string;
  createdAt: string;
}

export default function AdminAmenitiesManagement() {
  const [selectedView, setSelectedView] = useState<
    "overview" | "amenities" | "requests"
  >("overview");

  // State quản lý dữ liệu
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]); // Đã chuyển thành State

  // State quản lý Form/Modal
  const [showAmenityForm, setShowAmenityForm] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [showRequestDetail, setShowRequestDetail] =
    useState<BookingRequest | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Amenity | null>(
    null
  );

  // State quản lý Filter/Pagination
  const [amenityFormWarnings, setAmenityFormWarnings] = useState<string[]>([]);
  const [currentRequestsPage, setCurrentRequestsPage] = useState(1);
  const requestsPerPage = 5;

  // --- 1. HÀM LẤY DỮ LIỆU TIỆN ÍCH ---
  const fetchAmenities = async () => {
    try {
      const res = await fetch("http://localhost:3001/amenities");
      if (!res.ok) throw new Error("Failed to fetch amenities");
      const data = await res.json();
      setAmenities(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách tiện ích:", error);
    }
  };

  // --- 2. HÀM LẤY DỮ LIỆU BOOKING VÀ MAP DỮ LIỆU ---
  const fetchBookingRequests = async () => {
    try {
      const res = await fetch("http://localhost:3001/amenity-bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data: BackendBookingResponse[] = await res.json();

      // Mapping dữ liệu từ Backend sang Frontend Interface
      const mappedData: BookingRequest[] = data.map((item) => ({
        id: item.id.toString(), // Chuyển số sang chuỗi cho Frontend
        amenityId: item.amenity.id,
        amenityName: item.amenity.name,
        residentName: item.user.fullName,
        apartmentNumber: item.user.apartmentNumber || "N/A", // Xử lý nếu thiếu
        date: item.bookingDate,
        timeSlot: item.timeSlot,
        status: item.status,
        notes: item.notes,
        createdDate: item.createdAt,
        rejectionReason: item.adminResponse || undefined,
      }));

      setBookingRequests(mappedData);
    } catch (error) {
      console.error("Lỗi lấy danh sách đặt lịch:", error);
    }
  };

  // Gọi API khi load trang
  useEffect(() => {
    fetchAmenities();
    fetchBookingRequests();
  }, []);

  // --- 3. XỬ LÝ DUYỆT YÊU CẦU (GỌI API) ---
  // --- XỬ LÝ DUYỆT YÊU CẦU ---
  const handleApproveRequest = async (requestId: string) => {
    // 1. Hỏi xác nhận trước khi duyệt
    const confirm = window.confirm("Bạn có chắc chắn muốn duyệt yêu cầu này?");
    if (!confirm) return;

    try {
      // 2. Gọi API PATCH
      const res = await fetch(
        `http://localhost:3001/amenity-bookings/${requestId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "APPROVED" }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi khi duyệt yêu cầu");
      }

      // 3. Thông báo và cập nhật lại dữ liệu
      alert("Đã duyệt yêu cầu thành công!");
      setShowRequestDetail(null); // Đóng modal chi tiết nếu đang mở

      // Quan trọng: Gọi lại hàm lấy dữ liệu để danh sách tự cập nhật
      fetchBookingRequests();
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi duyệt yêu cầu. Vui lòng thử lại.");
    }
  };
  // --- 4. XỬ LÝ TỪ CHỐI YÊU CẦU (GỌI API) ---
  // --- XỬ LÝ TỪ CHỐI YÊU CẦU ---
  const handleRejectRequest = async (requestId: string, reason: string) => {
    // 1. Kiểm tra phải có lý do
    if (!reason || reason.trim() === "") {
      alert("Vui lòng nhập lý do từ chối để cư dân được biết.");
      return;
    }

    const confirm = window.confirm(
      "Bạn có chắc chắn muốn từ chối yêu cầu này?"
    );
    if (!confirm) return;

    try {
      // 2. Gọi API PATCH
      const res = await fetch(
        `http://localhost:3001/amenity-bookings/${requestId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "REJECTED",
            adminResponse: reason, // Gửi kèm lý do
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi khi từ chối yêu cầu");
      }

      // 3. Thông báo và cập nhật lại dữ liệu
      alert("Đã từ chối yêu cầu!");
      setShowRequestDetail(null); // Đóng modal

      // Quan trọng: Gọi lại hàm lấy dữ liệu
      fetchBookingRequests();
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi từ chối yêu cầu.");
    }
  };

  // --- CÁC HÀM CŨ (Create/Update/Delete Amenity) GIỮ NGUYÊN ---
  const handleInputChange = (field: keyof Amenity, value: any) => {
    if (!editingAmenity) return;
    setEditingAmenity({
      ...editingAmenity,
      [field]: value,
    });
  };

  const handleSaveAmenity = async () => {
    if (!editingAmenity) return;
    try {
      const isEditing = editingAmenity.id !== 0;
      const url = isEditing
        ? `http://localhost:3001/amenities/${editingAmenity.id}`
        : `http://localhost:3001/amenities`;
      const method = isEditing ? "PUT" : "POST";

      const { id, isActive, createdAt, ...payload } = editingAmenity;
      if (payload.bookingSlots === null) delete (payload as any).bookingSlots;

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi khi lưu dữ liệu");
      }

      alert(isEditing ? "Đã cập nhật thành công!" : "Đã thêm mới thành công!");
      fetchAmenities(); // Load lại danh sách tiện ích
      setShowAmenityForm(false);
      setEditingAmenity(null);
      setAmenityFormWarnings([]);
    } catch (error) {
      console.error(error);
      alert(`Có lỗi xảy ra: ${error}`);
    }
  };

  const handleDeleteAmenity = async (amenityId: number) => {
    try {
      const res = await fetch(`http://localhost:3001/amenities/${amenityId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Không thể xóa tiện ích này");
      }
      alert("Đã xóa tiện ích thành công!");
      fetchAmenities(); // Load lại
    } catch (error: any) {
      alert(`Lỗi: ${error.message}. \n(Hãy thử chọn 'Ngưng sử dụng')`);
    }
  };

  const handleSuspendAmenity = async (amenityId: number) => {
    try {
      const currentAmenity = amenities.find((a) => a.id === amenityId);
      if (!currentAmenity) return;

      const payload = { ...currentAmenity, status: "SUSPENDED" };
      const { id, isActive, createdAt, ...cleanPayload } = payload;
      if (cleanPayload.bookingSlots === null)
        delete (cleanPayload as any).bookingSlots;

      const res = await fetch(`http://localhost:3001/amenities/${amenityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanPayload),
      });

      if (!res.ok) throw new Error("Lỗi khi cập nhật trạng thái");
      alert("Đã ngưng sử dụng tiện ích!");
      fetchAmenities(); // Load lại
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi ngưng sử dụng tiện ích.");
    }
  };

  const handleToggleActive = (amenityId: number) => {
    // Lưu ý: Logic này đang chỉ sửa UI tạm thời. Nếu muốn lưu DB phải gọi API PUT
    // Ở đây tôi giữ nguyên logic cũ của bạn là cập nhật local state
    setAmenities(
      amenities.map((a) =>
        a.id === amenityId ? { ...a, isActive: !a.isActive } : a
      )
    );
  };

  // --- CÁC HÀM UTILS ---
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: BookingRequest["status"]) => {
    const styles = {
      PENDING: {
        bg: "bg-yellow-100 text-yellow-700 border-yellow-300",
        label: "Chờ duyệt",
        icon: Clock,
      },
      APPROVED: {
        bg: "bg-green-100 text-green-700 border-green-300",
        label: "Đã duyệt",
        icon: CheckCircle,
      },
      REJECTED: {
        bg: "bg-red-100 text-red-700 border-red-300",
        label: "Từ chối",
        icon: XCircle,
      },
      CANCELLED: {
        bg: "bg-gray-100 text-gray-700 border-gray-300",
        label: "Đã hủy",
        icon: XCircle,
      },
    };
    return styles[status] || styles.PENDING;
  };

  // --- THỐNG KÊ (Tính toán từ dữ liệu thật) ---
  const stats = {
    totalAmenities: amenities.length,
    activeAmenities: amenities.filter((a) => a.isActive).length,
    todayBookings: bookingRequests.filter(
      (b) => b.date === new Date().toISOString().split("T")[0]
    ).length,
    pendingRequests: bookingRequests.filter((b) => b.status === "PENDING")
      .length,
    maintenanceCount: amenities.filter((a) => a.status === "MAINTENANCE")
      .length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl text-gray-900 mb-2">Quản Lý Tiện Ích</h1>
        <p className="text-gray-600">
          Quản lý tiện ích chung cư và yêu cầu đặt của cư dân
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex gap-2 p-2 overflow-x-auto">
          <button
            onClick={() => setSelectedView("overview")}
            className={`px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
              selectedView === "overview"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Sparkles className="w-5 h-5 inline-block mr-2" />
            Tổng Quan
          </button>
          <button
            onClick={() => setSelectedView("amenities")}
            className={`px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
              selectedView === "amenities"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Sparkles className="w-5 h-5 inline-block mr-2" />
            Quản Lý Tiện Ích
          </button>
          <button
            onClick={() => setSelectedView("requests")}
            className={`px-4 py-3 rounded-lg transition-colors whitespace-nowrap relative ${
              selectedView === "requests"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <CheckCircle className="w-5 h-5 inline-block mr-2" />
            Duyệt Yêu Cầu ({stats.pendingRequests})
          </button>
        </div>
      </div>

      {/* Overview */}
      {selectedView === "overview" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
              <Sparkles className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Tổng Tiện Ích</p>
              <p className="text-3xl mt-1">{stats.totalAmenities}</p>
              <p className="text-xs opacity-75 mt-2">
                {stats.activeAmenities} đang hoạt động
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
              <CalendarIcon className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Lịch Đặt Hôm Nay</p>
              <p className="text-3xl mt-1">{stats.todayBookings}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-sm p-6 text-white">
              <Clock className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Chờ Duyệt</p>
              <p className="text-3xl mt-1">{stats.pendingRequests}</p>
              <p className="text-xs opacity-75 mt-2">Cần xử lý</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-sm p-6 text-white">
              <Wrench className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Đang Bảo Trì</p>
              <p className="text-3xl mt-1">{stats.maintenanceCount}</p>
            </div>
          </div>

          {/* Recent Requests (Lấy 5 cái mới nhất từ API) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl text-gray-900 mb-4">Yêu Cầu Gần Đây</h2>
            <div className="space-y-3">
              {bookingRequests.slice(0, 5).map((request) => {
                const badge = getStatusBadge(request.status);
                const Icon = badge.icon;
                return (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-gray-900">{request.amenityName}</h3>
                        <p className="text-sm text-gray-600">
                          {request.residentName}{" "}
                          {request.apartmentNumber !== "N/A"
                            ? `(${request.apartmentNumber})`
                            : ""}{" "}
                          - {formatDate(request.date)} {request.timeSlot}
                        </p>
                      </div>
                      <span
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${badge.bg}`}
                      >
                        <Icon className="w-4 h-4" />
                        {badge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
              {bookingRequests.length === 0 && (
                <p className="text-gray-500 text-center">
                  Chưa có yêu cầu đặt lịch nào.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Amenities Management */}
      {selectedView === "amenities" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-gray-900">Danh Sách Tiện Ích</h2>
            <button
              onClick={() => {
                setEditingAmenity({
                  id: 0,
                  name: "",
                  description: "",
                  imageUrl: "",
                  openingTime: "06:00",
                  closingTime: "22:00",
                  maxCapacity: 20,
                  maxDurationMinutes: 120,
                  maxBookingsPerMonth: 5,
                  requiresApproval: true,
                  status: "ACTIVE",
                  isActive: true,
                  rules: [],
                  bookingSlots: null,
                  createdAt: new Date().toISOString(),
                });
                setShowAmenityForm(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm Tiện Ích
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {amenities.map((amenity) => (
              <div
                key={amenity.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {amenity.imageUrl && (
                  <img
                    src={amenity.imageUrl}
                    alt={amenity.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl text-gray-900 font-bold">
                      {amenity.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {amenity.status === "MAINTENANCE" && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                          Bảo trì
                        </span>
                      )}
                      <button
                        onClick={() => handleToggleActive(amenity.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          amenity.isActive
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                        title={amenity.isActive ? "Đang hoạt động" : "Đã tắt"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {amenity.description}
                  </p>

                  <div className="text-sm text-gray-700 mb-4 space-y-1">
                    <p>
                      <Clock className="w-4 h-4 inline mr-1" />
                      {amenity.openingTime} - {amenity.closingTime}
                    </p>
                    <p>Sức chứa: {amenity.maxCapacity} người</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingAmenity(amenity);
                        setShowAmenityForm(true);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Sửa
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(amenity)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requests Approval */}
      {selectedView === "requests" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl text-gray-900 mb-4">
            Duyệt Yêu Cầu Đặt Tiện Ích
          </h2>

          <div className="space-y-4">
            {bookingRequests.filter((r) => r.status === "PENDING").length ===
            0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Không có yêu cầu chờ duyệt</p>
              </div>
            ) : (
              bookingRequests
                .filter((r) => r.status === "PENDING")
                .map((request) => (
                  <div
                    key={request.id}
                    className="border-2 border-yellow-200 rounded-lg p-5 bg-yellow-50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl text-gray-900 mb-1">
                          {request.amenityName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Ngày: {formatDate(request.date)} | Giờ:{" "}
                          {request.timeSlot}
                        </p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm border border-yellow-300">
                        Chờ duyệt
                      </span>
                    </div>

                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Người đặt</p>
                          <p className="text-gray-900">
                            {request.residentName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Căn hộ</p>
                          <p className="text-gray-900">
                            {request.apartmentNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ngày tạo</p>
                          <p className="text-gray-900">
                            {formatDate(request.createdDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ghi chú</p>
                          <p className="text-gray-900">
                            {request.notes || "Không có"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Duyệt Yêu Cầu
                      </button>
                      <button
                        onClick={() => setShowRequestDetail(request)}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Từ Chối
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Lịch Sử Duyệt */}
          <div className="mt-8">
            <h3 className="text-lg text-gray-900 mb-4">Lịch Sử Duyệt</h3>
            <div className="space-y-3">
              {bookingRequests
                .filter((r) => r.status !== "PENDING")
                .slice(
                  (currentRequestsPage - 1) * requestsPerPage,
                  currentRequestsPage * requestsPerPage
                )
                .map((request) => {
                  const badge = getStatusBadge(request.status);
                  const Icon = badge.icon;
                  return (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-gray-900">
                            {request.amenityName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {request.residentName}{" "}
                            {request.apartmentNumber !== "N/A" &&
                              `(${request.apartmentNumber})`}{" "}
                            - {formatDate(request.date)} {request.timeSlot}
                          </p>
                        </div>
                        <span
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${badge.bg}`}
                        >
                          <Icon className="w-4 h-4" />
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Pagination */}
            {bookingRequests.filter((r) => r.status !== "PENDING").length >
              requestsPerPage && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() =>
                    setCurrentRequestsPage(currentRequestsPage - 1)
                  }
                  disabled={currentRequestsPage === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentRequestsPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trang Trước
                </button>
                <span className="text-sm text-gray-600">
                  Trang {currentRequestsPage} /{" "}
                  {Math.ceil(
                    bookingRequests.filter((r) => r.status !== "PENDING")
                      .length / requestsPerPage
                  )}
                </span>
                <button
                  onClick={() =>
                    setCurrentRequestsPage(currentRequestsPage + 1)
                  }
                  disabled={
                    currentRequestsPage * requestsPerPage >=
                    bookingRequests.filter((r) => r.status !== "PENDING").length
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentRequestsPage * requestsPerPage >=
                    bookingRequests.filter((r) => r.status !== "PENDING").length
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Trang Tiếp
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {showRequestDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl text-gray-900">Chi Tiết Yêu Cầu</h3>
              <button
                onClick={() => setShowRequestDetail(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="text-gray-900 mb-3">Thông Tin Đặt Lịch</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Tiện ích</p>
                    <p className="text-gray-900">
                      {showRequestDetail.amenityName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ngày</p>
                    <p className="text-gray-900">
                      {formatDate(showRequestDetail.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Khung giờ</p>
                    <p className="text-gray-900">
                      {showRequestDetail.timeSlot}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Người đặt</p>
                    <p className="text-gray-900">
                      {showRequestDetail.residentName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Căn hộ</p>
                    <p className="text-gray-900">
                      {showRequestDetail.apartmentNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ngày tạo</p>
                    <p className="text-gray-900">
                      {formatDate(showRequestDetail.createdDate)}
                    </p>
                  </div>
                </div>
                {showRequestDetail.notes && (
                  <div className="mt-3">
                    <p className="text-gray-600 text-sm">Ghi chú</p>
                    <p className="text-gray-900">{showRequestDetail.notes}</p>
                  </div>
                )}
              </div>

              {showRequestDetail.status === "PENDING" && (
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Lý do từ chối (nếu từ chối)
                  </label>

                  {/* Input nhập lý do */}
                  <textarea
                    id="rejection-reason" // ID này quan trọng để lấy dữ liệu
                    placeholder="Nhập lý do từ chối (ví dụ: đang bảo trì, trùng lịch...)"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
                  />

                  <div className="flex gap-3">
                    {/* Nút Duyệt */}
                    <button
                      onClick={() => handleApproveRequest(showRequestDetail.id)}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      Duyệt
                    </button>

                    {/* Nút Từ Chối */}
                    <button
                      onClick={() => {
                        // Lấy giá trị từ ô textarea thông qua ID
                        const reasonInput = document.getElementById(
                          "rejection-reason"
                        ) as HTMLTextAreaElement;
                        handleRejectRequest(
                          showRequestDetail.id,
                          reasonInput?.value || ""
                        );
                      }}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <XCircle className="w-5 h-5 inline mr-2" />
                      Từ Chối
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Component Mới) */}
      <DeleteModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        amenity={showDeleteConfirm}
        onConfirmDelete={(id) => {
          handleDeleteAmenity(id);
          setShowDeleteConfirm(null);
        }}
        onConfirmSuspend={(id) => {
          handleSuspendAmenity(id);
          setShowDeleteConfirm(null);
        }}
      />

      {/* Amenity Form Modal (Create/Edit) - GIỮ NGUYÊN CODE MODAL CỦA BẠN */}
      {showAmenityForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* ... Copy lại nội dung Modal Form từ code cũ của bạn ... */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl text-gray-900">
                {editingAmenity ? "Chỉnh Sửa Tiện Ích" : "Thêm Tiện Ích Mới"}
              </h3>
              <button
                onClick={() => {
                  setShowAmenityForm(false);
                  setEditingAmenity(null);
                  setAmenityFormWarnings([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Thông tin cơ bản */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-gray-900 mb-4">📋 Thông Tin Cơ Bản</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2">
                      Tên tiện ích *
                    </label>
                    <input
                      type="text"
                      value={editingAmenity?.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Ví dụ: Bể Bơi..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2">
                      Mô tả ngắn
                    </label>
                    <textarea
                      value={editingAmenity?.description || ""}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Nhập mô tả..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2">
                      Hình ảnh
                    </label>
                    {editingAmenity && editingAmenity.imageUrl ? (
                      <div className="mb-3">
                        <img
                          src={editingAmenity.imageUrl}
                          alt={editingAmenity.name}
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    ) : null}
                    <input
                      type="text"
                      value={editingAmenity?.imageUrl || ""}
                      onChange={(e) =>
                        handleInputChange("imageUrl", e.target.value)
                      }
                      placeholder="URL hình ảnh..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Thời gian & Quy định */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-gray-900 mb-4">🕐 Thời Gian & Quy Định</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Giờ mở/đóng */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Giờ mở cửa
                    </label>
                    <input
                      type="time"
                      value={
                        editingAmenity?.openingTime?.slice(0, 5) || "06:00"
                      }
                      onChange={(e) =>
                        handleInputChange("openingTime", e.target.value)
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Giờ đóng cửa
                    </label>
                    <input
                      type="time"
                      value={
                        editingAmenity?.closingTime?.slice(0, 5) || "22:00"
                      }
                      onChange={(e) =>
                        handleInputChange("closingTime", e.target.value)
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  {/* Các chỉ số */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Max phút/lượt
                    </label>
                    <input
                      type="number"
                      value={editingAmenity?.maxDurationMinutes || 0}
                      onChange={(e) =>
                        handleInputChange(
                          "maxDurationMinutes",
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Max lượt/tháng
                    </label>
                    <input
                      type="number"
                      value={editingAmenity?.maxBookingsPerMonth || 0}
                      onChange={(e) =>
                        handleInputChange(
                          "maxBookingsPerMonth",
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Sức chứa
                    </label>
                    <input
                      type="number"
                      value={editingAmenity?.maxCapacity || 0}
                      onChange={(e) =>
                        handleInputChange("maxCapacity", Number(e.target.value))
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingAmenity?.requiresApproval || false}
                        onChange={(e) =>
                          handleInputChange(
                            "requiresApproval",
                            e.target.checked
                          )
                        }
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-gray-700">Cần duyệt</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Trạng thái */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-gray-900 mb-4">🔧 Trạng Thái</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="amenityStatus"
                      value="ACTIVE"
                      checked={editingAmenity?.status === "ACTIVE"}
                      onChange={() => handleInputChange("status", "ACTIVE")}
                    />
                    <span>Đang hoạt động</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="amenityStatus"
                      value="SUSPENDED"
                      checked={editingAmenity?.status === "SUSPENDED"}
                      onChange={() => handleInputChange("status", "SUSPENDED")}
                    />
                    <span>Tạm ngưng</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="amenityStatus"
                      value="MAINTENANCE"
                      checked={editingAmenity?.status === "MAINTENANCE"}
                      onChange={() =>
                        handleInputChange("status", "MAINTENANCE")
                      }
                    />
                    <span>Bảo trì</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAmenityForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveAmenity}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
