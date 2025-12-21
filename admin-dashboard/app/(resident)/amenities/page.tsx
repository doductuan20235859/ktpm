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

interface Amenity {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  openingHours: string;
  rules: string[];
  maxCapacity: number;
  bookingSlots: string[];
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

  // Mock data - Tiện ích
  const amenities: Amenity[] = [
    {
      id: "1",
      name: "Bể Bơi",
      description:
        "Bể bơi Olympic chuẩn 50m với hệ thống lọc nước hiện đại, khu vực bể trẻ em riêng biệt",
      imageUrl:
        "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80",
      openingHours: "6:00 - 22:00 (Thứ 2 - Chủ nhật)",
      rules: [
        "Đeo mũ bơi và đi dép bắt buộc",
        "Tắm trước khi vào bể",
        "Trẻ em dưới 12 tuổi phải có người lớn đi cùng",
        "Không mang đồ ăn vào khu vực bể bơi",
        "Đặt trước tối thiểu 24 giờ",
      ],
      maxCapacity: 50,
      bookingSlots: [
        "6:00-8:00",
        "8:00-10:00",
        "10:00-12:00",
        "14:00-16:00",
        "16:00-18:00",
        "18:00-20:00",
        "20:00-22:00",
      ],
    },
    {
      id: "2",
      name: "Phòng Gym",
      description:
        "Phòng tập gym với thiết bị hiện đại từ Mỹ và EU, có huấn luyện viên hướng dẫn",
      imageUrl:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      openingHours: "5:00 - 23:00 (Hằng ngày)",
      rules: [
        "Mang giày thể thao và khăn lau mặt",
        "Lau máy sau khi sử dụng",
        "Không la hét hoặc làm ồn",
        "Đặt trước tối thiểu 2 giờ",
        "Tối đa 90 phút/buổi",
      ],
      maxCapacity: 30,
      bookingSlots: [
        "5:00-7:00",
        "7:00-9:00",
        "9:00-11:00",
        "11:00-13:00",
        "14:00-16:00",
        "16:00-18:00",
        "18:00-20:00",
        "20:00-22:00",
        "22:00-23:00",
      ],
    },
    {
      id: "3",
      name: "Sân Tennis",
      description:
        "Sân tennis chuẩn quốc tế với mặt sân cao su, đèn chiếu sáng tốt cho buổi tối",
      imageUrl:
        "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80",
      openingHours: "6:00 - 22:00 (Hằng ngày)",
      rules: [
        "Mang giày chuyên dụng tennis",
        "Tối đa 4 người/sân",
        "Đặt trước tối thiểu 48 giờ",
        "Miễn phí trong 2 tiếng, sau đó tính phí 100k/giờ",
        "Hủy trước 24 giờ để tránh bị phạt",
      ],
      maxCapacity: 4,
      bookingSlots: [
        "6:00-8:00",
        "8:00-10:00",
        "10:00-12:00",
        "14:00-16:00",
        "16:00-18:00",
        "18:00-20:00",
        "20:00-22:00",
      ],
    },
    {
      id: "4",
      name: "Phòng Đa Năng",
      description:
        "Phòng tổ chức sự kiện, sinh nhật, họp mặt với sức chứa 100 người, có bàn ghế và âm thanh",
      imageUrl:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
      openingHours: "8:00 - 23:00 (Hằng ngày)",
      rules: [
        "Đặt trước tối thiểu 7 ngày",
        "Phí sử dụng: 2 triệu/4 giờ",
        "Dọn dẹp sau khi sử dụng",
        "Không tổ chức hoạt động vi phạm pháp luật",
        "Bồi thường nếu làm hư hỏng thiết bị",
      ],
      maxCapacity: 100,
      bookingSlots: ["8:00-12:00", "13:00-17:00", "18:00-22:00"],
    },
    {
      id: "5",
      name: "Khu BBQ",
      description:
        "Khu vực nướng ngoài trời với 5 bếp than hoa, bàn ghế, view vườn cây xanh mát",
      imageUrl:
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
      openingHours: "16:00 - 23:00 (Thứ 6, 7, CN)",
      rules: [
        "Đặt trước tối thiểu 3 ngày",
        "Tự chuẩn bị đồ ăn và than",
        "Vệ sinh khu vực sau khi sử dụng",
        "Không gây ồn ào sau 22:00",
        "Phí sử dụng: 500k/buổi",
      ],
      maxCapacity: 40,
      bookingSlots: ["16:00-19:00", "19:00-22:00"],
    },
    {
      id: "6",
      name: "Sân Chơi Trẻ Em",
      description:
        "Khu vui chơi an toàn với cầu trượt, xích đu, nhà bóng và khu cát cho trẻ dưới 12 tuổi",
      imageUrl:
        "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&q=80",
      openingHours: "6:00 - 20:00 (Hằng ngày)",
      rules: [
        "Trẻ em phải có người lớn giám sát",
        "Không sử dụng khi trời mưa",
        "Giữ vệ sinh chung",
        "Không mang đồ chơi sắc nhọn",
        "Miễn phí, không cần đặt trước",
      ],
      maxCapacity: 30,
      bookingSlots: [],
    },
  ];

  // Mock data - Lịch đặt của tôi
  const myBookings: Booking[] = [
    {
      id: "1",
      amenityId: "1",
      amenityName: "Bể Bơi",
      date: "2024-12-18",
      timeSlot: "18:00-20:00",
      status: "APPROVED",
      residentName: "Nguyễn Văn An",
      apartmentNumber: "A-101",
      createdDate: "2024-12-15",
    },
    {
      id: "2",
      amenityId: "2",
      amenityName: "Phòng Gym",
      date: "2024-12-16",
      timeSlot: "7:00-9:00",
      status: "PENDING",
      residentName: "Nguyễn Văn An",
      apartmentNumber: "A-101",
      createdDate: "2024-12-15",
    },
    {
      id: "3",
      amenityId: "3",
      amenityName: "Sân Tennis",
      date: "2024-12-20",
      timeSlot: "16:00-18:00",
      status: "PENDING",
      residentName: "Nguyễn Văn An",
      apartmentNumber: "A-101",
      createdDate: "2024-12-14",
    },
    {
      id: "4",
      amenityId: "4",
      amenityName: "Phòng Đa Năng",
      date: "2024-12-10",
      timeSlot: "18:00-22:00",
      status: "REJECTED",
      residentName: "Nguyễn Văn An",
      apartmentNumber: "A-101",
      createdDate: "2024-12-01",
      rejectionReason: "Phòng đang được bảo trì định kỳ",
    },
  ];

  // Mock data - Thông báo
  const notifications: AmenityNotification[] = [
    {
      id: "1",
      type: "REMINDER",
      title: "Nhắc nhở: Lịch bơi sắp đến",
      message:
        "Bạn có lịch đặt Bể Bơi vào ngày 18/12/2024 lúc 18:00-20:00. Vui lòng đến đúng giờ.",
      date: "2024-12-17",
      read: false,
    },
    {
      id: "2",
      type: "APPROVED",
      title: "Lịch đặt được duyệt",
      message:
        "Lịch đặt Bể Bơi ngày 18/12/2024 (18:00-20:00) đã được phê duyệt.",
      date: "2024-12-15",
      read: true,
    },
    {
      id: "3",
      type: "REJECTED",
      title: "Lịch đặt bị từ chối",
      message:
        "Lịch đặt Phòng Đa Năng ngày 10/12/2024 bị từ chối. Lý do: Phòng đang được bảo trì định kỳ.",
      date: "2024-12-02",
      read: true,
    },
    {
      id: "4",
      type: "SCHEDULE_CHANGE",
      title: "Thay đổi giờ hoạt động",
      message:
        "Khu BBQ sẽ đóng cửa vào ngày 25/12/2024 do bảo trì hệ thống điện.",
      date: "2024-12-14",
      read: false,
    },
  ];

  // Hàm lấy trạng thái slots cho một ngày cụ thể
  const getTimeSlotStatuses = (
    amenity: Amenity,
    date: Date
  ): TimeSlotStatus[] => {
    // Mock logic - trong thực tế sẽ fetch từ API
    const dateStr = date.toISOString().split("T")[0];

    return amenity.bookingSlots.map((slot) => {
      // Random status for demo
      const random = Math.random();
      if (
        dateStr === "2024-12-18" &&
        slot === "18:00-20:00" &&
        amenity.id === "1"
      ) {
        return {
          slot,
          status: "BOOKED" as const,
          bookedBy: "Nguyễn Văn An (A-101)",
        };
      }
      if (random < 0.1) {
        return { slot, status: "MAINTENANCE" as const };
      }
      if (random < 0.3) {
        return { slot, status: "BOOKED" as const, bookedBy: "Người dùng khác" };
      }
      return { slot, status: "AVAILABLE" as const };
    });
  };

  const handleBookingSubmit = () => {
    if (!selectedAmenity || !selectedDate || !bookingForm.timeSlot) {
      alert("Vui lòng chọn đầy đủ thông tin");
      return;
    }

    alert(
      `Đặt lịch thành công!\n\nTiện ích: ${
        selectedAmenity.name
      }\nNgày: ${selectedDate.toLocaleDateString("vi-VN")}\nGiờ: ${
        bookingForm.timeSlot
      }\n\nLịch đặt của bạn đang chờ Ban quản lý phê duyệt.`
    );

    setBookingForm({ timeSlot: "", notes: "" });
    setShowBookingForm(false);
    setSelectedView("myBookings");
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

  const unreadCount = notifications.filter((n) => !n.read).length;

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
            Lịch Đã Đặt (
            {
              myBookings.filter(
                (b) => b.status === "PENDING" || b.status === "APPROVED"
              ).length
            }
            )
          </button>
          <button
            onClick={() => setSelectedView("notifications")}
            className={`flex-1 px-4 py-3 rounded-lg transition-colors relative ${
              selectedView === "notifications"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Bell className="w-5 h-5 inline-block mr-2" />
            Thông Báo
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
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
                              <span className="">Lý do từ chối:</span>{" "}
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

      {/* Notifications View */}
      {selectedView === "notifications" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl text-gray-900 mb-6">Thông Báo Về Tiện Ích</h2>

          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Bạn chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-l-4 rounded-r-lg p-4 ${
                    notification.read
                      ? "border-gray-300 bg-gray-50"
                      : "border-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3
                          className={`text-gray-900 ${
                            !notification.read ? "" : ""
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            Mới
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(notification.date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
