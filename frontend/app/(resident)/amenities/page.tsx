"use client";
import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bell,
} from "lucide-react";
import { Calendar } from "../../../components/ui/calendar";
import { useEffect } from "react"; // <--- Thêm useEffect
interface Amenity {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  openingHours: string; // Map từ openingTime và closingTime
  rules: string[];
  maxCapacity: number;
  bookingSlots: string[];
  // Thêm trường này để check trạng thái trên lịch
  existingBookings: {
    bookingDate: string;
    timeSlot: string;
    status: string;
  }[];
}

interface Booking {
  id: string;
  amenityId: string;
  amenityName: string;
  date: string;
  timeSlot: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  residentName: string;
  apartmentNumber: string;
  createdDate: string;
  rejectionReason?: string;
}

interface TimeSlotStatus {
  slot: string;
  status: "AVAILABLE" | "BOOKED" | "MAINTENANCE";
  bookedBy?: string;
}

interface AmenityNotification {
  id: string;
  type: "REMINDER" | "APPROVED" | "REJECTED" | "CANCELLED" | "SCHEDULE_CHANGE";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export default function AmenitiesManagement() {
  const [selectedView, setSelectedView] = useState<
    "list" | "calendar" | "myBookings" | "notifications"
  >("list");
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    timeSlot: "",
    notes: "",
  });
  const [currentBookingsPage, setCurrentBookingsPage] = useState(1);
  const bookingsPerPage = 5;
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        // Gọi API mới mà bạn đã tạo: /amenities/with-bookings
        const res = await fetch(
          "http://localhost:3001/amenities/with-bookings",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const rawData = await res.json();

        // 2. Kiểm tra an toàn: Đảm bảo rawData là mảng, nếu không thì dùng mảng rỗng
        const amenitiesArray = Array.isArray(rawData) ? rawData : [];

        // 3. Map dữ liệu
        const mappedAmenities: Amenity[] = amenitiesArray.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          description: item.description,
          // Logic ảnh giữ nguyên
          imageUrl:
            item.imageUrl ||
            "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7",
          // Cắt chuỗi giờ (06:00:00 -> 06:00)
          openingHours: `${item.openingTime.slice(
            0,
            5
          )} - ${item.closingTime.slice(0, 5)}`,
          rules: item.rules || [],
          maxCapacity: item.maxCapacity,
          bookingSlots: item.bookingSlots || [],
          // Lấy danh sách booking để hiển thị trạng thái
          existingBookings: item.bookings || [],
        }));

        setAmenities(mappedAmenities);
      } catch (error) {
        console.error("Lỗi lấy danh sách tiện ích:", error);
      }
    };

    fetchAmenities();
  }, []); // Chạy 1 lần khi mount
  // Mock data - Tiện ích
  // Mock data - Lịch đặt của tôi
  const [myBookings, setMyBookings] = useState<Booking[]>([]);

  // 2. Gọi API lấy dữ liệu khi vào trang
  // 2. Gọi API lấy dữ liệu khi vào trang
  // 2. Gọi API lấy dữ liệu khi vào trang
  useEffect(() => {
    const fetchMyBookings = async () => {
      // --- SỬA Ở ĐÂY: Đổi "user" thành "userInfo" ---
      const userStr = localStorage.getItem("userInfo");
      const token = localStorage.getItem("accessToken");

      // Debug để xem đã lấy được chưa
      console.log("Local Storage UserInfo:", userStr);
      console.log("Local Storage Token:", token);

      if (!userStr || !token) {
        console.warn("⚠️ Chưa tìm thấy userInfo hoặc accessToken");
        return;
      }

      // ... (bên trong useEffect fetchMyBookings)
      try {
        const user = JSON.parse(userStr);
        // ... (giữ nguyên phần gọi fetch)
        const res = await fetch(
          `http://localhost:3001/amenity-bookings/user/${user.id}`,
          {
            // ... giữ nguyên headers
          }
        );

        if (!res.ok) throw new Error(`Lỗi API: ${res.statusText}`);

        // --- SỬA TỪ ĐÂY ---

        // 1. Dữ liệu trả về là MẢNG luôn (Array)
        const responseData = await res.json();

        // 2. Kiểm tra an toàn: nếu responseData là mảng thì dùng luôn, không thì mảng rỗng
        // KHÔNG dùng responseData.data nữa
        const bookingsArray = Array.isArray(responseData) ? responseData : [];

        // 3. Map dữ liệu
        const mappedData: Booking[] = bookingsArray.map((item: any) => ({
          id: item.id.toString(),
          // Backend không trả về amenityId trong API này, gán tạm là "0"
          amenityId: "0",
          amenityName: item.amenityName,
          date: item.date,
          timeSlot: item.timeSlot,
          status: item.status,

          // Lấy tên từ userInfo (localStorage)
          residentName: user.fullName || "Tôi",
          apartmentNumber: user.apartmentCode || "N/A",

          createdDate: item.createdDate,
          // Map trường adminResponse vào rejectionReason để hiện lý do từ chối
          rejectionReason: item.adminResponse,
        }));

        setMyBookings(mappedData);
        // --- HẾT PHẦN SỬA ---
      } catch (error) {
        console.error("❌ Lỗi fetch bookings:", error);
      }
    };

    fetchMyBookings();
  }, []);

  // Hàm lấy trạng thái slots cho một ngày cụ thể
  // Hàm lấy trạng thái slots dựa trên dữ liệu thật
  const getTimeSlotStatuses = (
    amenity: Amenity,
    date: Date
  ): TimeSlotStatus[] => {
    // 1. Chuyển ngày đang chọn sang format YYYY-MM-DD (để so sánh với database)
    // Lưu ý: Cần xử lý múi giờ để tránh bị lệch ngày
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    return amenity.bookingSlots.map((slot) => {
      // 2. Tìm xem trong danh sách existingBookings có đơn nào trùng Ngày + Giờ + Status không
      const booking = amenity.existingBookings?.find(
        (b) =>
          b.bookingDate === dateStr &&
          b.timeSlot === slot &&
          (b.status === "APPROVED" || b.status === "PENDING")
        // Nếu PENDING cũng coi là BOOKED để tránh đặt trùng
      );

      if (booking) {
        return {
          slot,
          status: "BOOKED",
          bookedBy: "Đã đặt", // Backend admin mới thấy tên, user thường chỉ cần biết đã đặt
        };
      }

      // Logic bảo trì (Nếu backend có trả về status MAINTENANCE thì check ở đây)
      // Hiện tại giả định nếu tiện ích đang status = SUSPENDED thì tất cả đều bảo trì
      // Nhưng ở đây ta đang check từng slot, nên tạm thời để AVAILABLE
      return { slot, status: "AVAILABLE" };
    });
  };

  const handleBookingSubmit = async () => {
    // 1. Validate
    if (!selectedAmenity || !selectedDate || !bookingForm.timeSlot) {
      alert("Vui lòng chọn đầy đủ thông tin");
      return;
    }

    const userStr = localStorage.getItem("userInfo");
    const token = localStorage.getItem("accessToken");
    if (!userStr || !token) {
      alert("Vui lòng đăng nhập lại");
      return;
    }
    const user = JSON.parse(userStr);

    // 2. Format ngày gửi lên (YYYY-MM-DD)
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const bookingDateStr = `${year}-${month}-${day}`;

    try {
      // 3. Gọi API
      const res = await fetch("http://localhost:3001/amenity-bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amenityId: parseInt(selectedAmenity.id),
          userId: user.id,
          bookingDate: bookingDateStr,
          timeSlot: bookingForm.timeSlot,
          notes: bookingForm.notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Đặt lịch thất bại");
      }

      // 4. Lấy dữ liệu mới từ Backend trả về
      const newBookingData = await res.json();
      console.log("Booking created:", newBookingData);

      // 5. Tạo object Booking chuẩn theo Interface của Frontend để hiển thị
      // Vì Backend trả về ít thông tin hơn Frontend cần hiển thị, ta lấy thêm từ state
      const mappedNewBooking: Booking = {
        id: newBookingData.id.toString(),

        // Backend trả về { amenity: { id: 1 } } nên ta lấy id từ đó
        amenityId: newBookingData.amenity.id.toString(),

        // Backend không trả về tên, ta lấy từ state đang chọn (selectedAmenity)
        amenityName: selectedAmenity.name,

        date: newBookingData.bookingDate,
        timeSlot: newBookingData.timeSlot,
        status: newBookingData.status, // "PENDING"

        // Lấy thông tin user từ localStorage
        residentName: user.fullName || "Tôi",
        apartmentNumber: user.apartmentCode || "N/A",

        createdDate: newBookingData.createdAt,
        rejectionReason: newBookingData.adminResponse || undefined,
      };

      // 6. Cập nhật State: Thêm booking mới vào đầu danh sách myBookings
      setMyBookings((prev) => [mappedNewBooking, ...prev]);

      alert("Đặt lịch thành công! Vui lòng chờ phê duyệt.");

      // 7. Reset form và chuyển view
      setBookingForm({ timeSlot: "", notes: "" });
      setShowBookingForm(false);
      setSelectedView("myBookings");

      // Không cần window.location.reload() nữa, UI tự cập nhật -> Mượt hơn
    } catch (error: any) {
      console.error(error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = myBookings.find((b) => b.id === bookingId);
    if (!booking) return;

    if (booking.status === "APPROVED" || booking.status === "PENDING") {
      const confirm = window.confirm(
        "Bạn có chắc chắn muốn hủy lịch đặt này không?"
      );
      if (confirm) {
        alert("Hủy lịch thành công!");
      }
    } else {
      alert("Không thể hủy lịch đặt này");
    }
  };

  const getStatusBadge = (status: Booking["status"]) => {
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
        label: "Bị từ chối",
        icon: XCircle,
      },
      CANCELLED: {
        bg: "bg-gray-100 text-gray-700 border-gray-300",
        label: "Đã hủy",
        icon: XCircle,
      },
    };
    return styles[status];
  };

  const getNotificationIcon = (type: AmenityNotification["type"]) => {
    switch (type) {
      case "REMINDER":
        return "⏰";
      case "APPROVED":
        return "✅";
      case "REJECTED":
        return "❌";
      case "CANCELLED":
        return "🚫";
      case "SCHEDULE_CHANGE":
        return "ℹ️";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl text-gray-900 mb-2">
          Quản Lý Tiện Ích Chung Cư
        </h1>
        <p className="text-gray-600">Đặt lịch và quản lý tiện ích của bạn</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex gap-2 p-2">
          <button
            onClick={() => setSelectedView("list")}
            className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
              selectedView === "list"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <MapPin className="w-5 h-5 inline-block mr-2" />
            Danh Sách Tiện Ích
          </button>
          <button
            onClick={() => setSelectedView("myBookings")}
            className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
              selectedView === "myBookings"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <CalendarIcon className="w-5 h-5 inline-block mr-2" />
            Lịch Đã Đặt
            {/* SỬA Ở ĐÂY: Hiển thị tổng số lượng thay vì lọc */}
            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
              {myBookings.length}
            </span>
          </button>
        </div>
      </div>

      {/* List View - Danh sách tiện ích */}
      {selectedView === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((amenity) => (
            <div
              key={amenity.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedAmenity(amenity);
                setSelectedView("calendar");
              }}
            >
              <img
                src={amenity.imageUrl}
                alt={amenity.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl text-gray-900 mb-2">{amenity.name}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {amenity.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{amenity.openingHours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Users className="w-4 h-4 text-green-600" />
                    <span>Sức chứa: {amenity.maxCapacity} người</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    Quy định sử dụng:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {amenity.rules.slice(0, 3).map((rule, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-blue-600">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                    {amenity.rules.length > 3 && (
                      <li className="text-blue-600">
                        + {amenity.rules.length - 3} quy định khác...
                      </li>
                    )}
                  </ul>
                </div>

                <button
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAmenity(amenity);
                    setSelectedView("calendar");
                  }}
                >
                  Xem Lịch & Đặt Chỗ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar View - Xem lịch và đặt chỗ */}
      {selectedView === "calendar" && selectedAmenity && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                setSelectedView("list");
                setSelectedAmenity(null);
              }}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ChevronLeft className="w-5 h-5" />
              Quay lại danh sách
            </button>
            <h2 className="text-2xl text-gray-900">{selectedAmenity.name}</h2>
            <div className="w-24"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Calendar */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4">Chọn ngày</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="border rounded-lg p-3"
              />

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm text-gray-900 mb-3">Quy định sử dụng</h4>
                <ul className="text-xs text-gray-700 space-y-2">
                  {selectedAmenity.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Time Slots */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4">
                Khung giờ -{" "}
                {selectedDate?.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </h3>

              {selectedAmenity.bookingSlots.length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600">
                    Tiện ích này không cần đặt trước
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Bạn có thể sử dụng tự do trong giờ mở cửa
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDate &&
                    getTimeSlotStatuses(selectedAmenity, selectedDate).map(
                      (slotInfo) => {
                        const isAvailable = slotInfo.status === "AVAILABLE";
                        const isBooked = slotInfo.status === "BOOKED";
                        const isMaintenance = slotInfo.status === "MAINTENANCE";

                        return (
                          <div
                            key={slotInfo.slot}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              isAvailable
                                ? "border-green-300 bg-green-50 hover:bg-green-100 cursor-pointer"
                                : isBooked
                                ? "border-red-300 bg-red-50 cursor-not-allowed"
                                : "border-yellow-300 bg-yellow-50 cursor-not-allowed"
                            }`}
                            onClick={() => {
                              if (isAvailable) {
                                setBookingForm({
                                  ...bookingForm,
                                  timeSlot: slotInfo.slot,
                                });
                                setShowBookingForm(true);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    isAvailable
                                      ? "bg-green-500"
                                      : isBooked
                                      ? "bg-red-500"
                                      : "bg-yellow-500"
                                  }`}
                                />
                                <span className="text-gray-900">
                                  {slotInfo.slot}
                                </span>
                              </div>
                              <span
                                className={`text-sm px-3 py-1 rounded-full ${
                                  isAvailable
                                    ? "bg-green-100 text-green-700"
                                    : isBooked
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {isAvailable
                                  ? "Trống"
                                  : isBooked
                                  ? "Đã đặt"
                                  : "Bảo trì"}
                              </span>
                            </div>
                            {slotInfo.bookedBy && (
                              <p className="text-xs text-gray-600 mt-2 ml-6">
                                Đã đặt bởi: {slotInfo.bookedBy}
                              </p>
                            )}
                          </div>
                        );
                      }
                    )}
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm text-gray-900 mb-3">Chú giải</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-700">Trống - Có thể đặt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-700">Đã có người đặt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-700">Đang bảo trì</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Bookings View */}
      {selectedView === "myBookings" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl text-gray-900 mb-6">Lịch Đã Đặt Của Tôi</h2>

          {myBookings.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Bạn chưa có lịch đặt nào</p>
              <button
                onClick={() => setSelectedView("list")}
                className="text-blue-600 hover:text-blue-700"
              >
                Đặt lịch ngay
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings
                .slice(
                  (currentBookingsPage - 1) * bookingsPerPage,
                  currentBookingsPage * bookingsPerPage
                )
                .map((booking) => {
                  const badge = getStatusBadge(booking.status);
                  const Icon = badge.icon;
                  const isPastDate = new Date(booking.date) < new Date();
                  const canCancel =
                    (booking.status === "PENDING" ||
                      booking.status === "APPROVED") &&
                    !isPastDate;

                  return (
                    <div
                      key={booking.id}
                      className="border-2 border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl text-gray-900 mb-1">
                            {booking.amenityName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Ngày: {formatDate(booking.date)} | Giờ:{" "}
                            {booking.timeSlot}
                          </p>
                        </div>
                        <span
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${badge.bg}`}
                        >
                          <Icon className="w-4 h-4" />
                          {badge.label}
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-600">
                          <span className="text-gray-700">Người đặt:</span>{" "}
                          {booking.residentName} ({booking.apartmentNumber})
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="text-gray-700">Ngày tạo:</span>{" "}
                          {formatDate(booking.createdDate)}
                        </p>
                      </div>

                      {booking.status === "REJECTED" &&
                        booking.rejectionReason && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-red-700">
                              <span className="font-semibold">
                                Lý do từ chối:
                              </span>{" "}
                              {booking.rejectionReason}
                            </p>
                          </div>
                        )}

                      <div className="flex gap-3">
                        {canCancel && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Hủy Lịch
                          </button>
                        )}
                        {booking.status === "APPROVED" && !isPastDate && (
                          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Xem Chi Tiết
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

              {myBookings.length > bookingsPerPage && (
                <div className="flex justify-center items-center gap-3 mt-6">
                  <button
                    onClick={() =>
                      setCurrentBookingsPage(currentBookingsPage - 1)
                    }
                    disabled={currentBookingsPage === 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentBookingsPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Trang Trước
                  </button>
                  <span className="text-sm text-gray-600">
                    Trang {currentBookingsPage} /{" "}
                    {Math.ceil(myBookings.length / bookingsPerPage)}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentBookingsPage(currentBookingsPage + 1)
                    }
                    disabled={
                      currentBookingsPage * bookingsPerPage >= myBookings.length
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      currentBookingsPage * bookingsPerPage >= myBookings.length
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
          )}
        </div>
      )}
      {/* Booking Form Modal */}
      {showBookingForm && selectedAmenity && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl text-gray-900">Xác Nhận Đặt Lịch</h3>
              <button
                onClick={() => {
                  setShowBookingForm(false);
                  setBookingForm({ timeSlot: "", notes: "" });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-gray-900 mb-3">Thông Tin Đặt Lịch</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiện ích:</span>
                    <span className="text-gray-900">
                      {selectedAmenity.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày:</span>
                    <span className="text-gray-900">
                      {selectedDate.toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Khung giờ:</span>
                    <span className="text-gray-900">
                      {bookingForm.timeSlot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Người đặt:</span>
                    <span className="text-gray-900">Nguyễn Văn An (A-101)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Ghi chú (không bắt buộc)
                </label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, notes: e.target.value })
                  }
                  placeholder="Nhập ghi chú nếu có..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  Lưu ý quan trọng
                </h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  {selectedAmenity.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-yellow-600">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowBookingForm(false);
                    setBookingForm({ timeSlot: "", notes: "" });
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleBookingSubmit}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xác Nhận Đặt Lịch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
