"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { amenityService } from "@/lib/services/amenity.service";
import { Amenity, Booking, BookingStatus } from "@/types/amenity";

export default function AmenitiesManagement() {
  const [selectedView, setSelectedView] = useState<"list" | "calendar" | "myBookings">("list");
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({ timeSlot: "", notes: "" });

  const currentUserId = 1;

  // Khắc phục lỗi Hydration (lệch thời gian Server/Client)
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [amenityData, bookingData] = await Promise.all([
        amenityService.getAmenities(),
        amenityService.getMyBookings(currentUserId),
      ]);
      setAmenities(amenityData);
      setMyBookings(bookingData);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBookingSubmit = async () => {
    if (!selectedAmenity || !selectedDate || !bookingForm.timeSlot) {
      alert("Vui lòng chọn đầy đủ thông tin");
      return;
    }

    try {
      await amenityService.createBooking({
        amenityId: selectedAmenity.id,
        userId: currentUserId,
        bookingDate: selectedDate.toISOString().split("T")[0],
        timeSlot: bookingForm.timeSlot,
      });

      alert("Đặt lịch thành công!");
      setShowBookingForm(false);
      setBookingForm({ timeSlot: "", notes: "" });
      loadData();
      setSelectedView("myBookings");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể đặt lịch";
      alert(errorMessage);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const styles = {
      [BookingStatus.PENDING]: { bg: "bg-yellow-100 text-yellow-700", label: "Chờ duyệt", icon: Clock },
      [BookingStatus.APPROVED]: { bg: "bg-green-100 text-green-700", label: "Đã duyệt", icon: CheckCircle },
      [BookingStatus.REJECTED]: { bg: "bg-red-100 text-red-700", label: "Bị từ chối", icon: XCircle },
      [BookingStatus.CANCELLED]: { bg: "bg-gray-100 text-gray-700", label: "Đã hủy", icon: XCircle },
    };
    return styles[status] || styles[BookingStatus.PENDING];
  };

  if (loading) return <div className="p-10 text-center text-gray-600">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header & Tabs giữ nguyên */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tiện Ích Chung Cư</h1>
        <p className="text-gray-600">Đặt chỗ các dịch vụ tiện ích tại tòa nhà</p>
      </div>

      <div className="flex gap-2 p-2 bg-white rounded-lg shadow-sm border mb-6">
        <button
          onClick={() => setSelectedView("list")}
          className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
            selectedView === "list" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
          }`}
        >
          <MapPin className="w-5 h-5" /> Danh Sách
        </button>
        <button
          onClick={() => setSelectedView("myBookings")}
          className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
            selectedView === "myBookings" ? "bg-blue-600 text-white" : "hover:bg-gray-100"
          }`}
        >
          <CalendarIcon className="w-5 h-5" /> Lịch Đã Đặt ({myBookings.length})
        </button>
      </div>

      {selectedView === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((amenity) => (
            <div key={amenity.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="relative w-full h-48 bg-gray-100">
                <Image 
                  src={amenity.imageUrl || "/placeholder-amenity.jpg"} 
                  alt={amenity.name}
                  fill
                  className="object-cover"
                  // FIX LỖI 16.0.10: Thêm unoptimized để Next.js không chặn hostname ngoại
                  unoptimized={true} 
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">{amenity.name}</h3>
                <div className="text-sm text-gray-600 space-y-2 mb-4">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {amenity.openingTime} - {amenity.closingTime}</div>
                  <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Tối đa {amenity.maxCapacity} người</div>
                </div>
                <button
                  onClick={() => { setSelectedAmenity(amenity); setShowBookingForm(true); }}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Đặt Chỗ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Bookings & Modal giữ nguyên cấu trúc cũ */}
      {selectedView === "myBookings" && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-2xl font-bold mb-6">Lịch Sử Đặt Chỗ</h2>
          <div className="space-y-4">
            {myBookings.length === 0 ? (
                <p className="text-gray-500 italic text-center">Bạn chưa có lịch đặt nào.</p>
            ) : (
                myBookings.map((booking) => {
                  const badge = getStatusBadge(booking.status);
                  const Icon = badge.icon;
                  return (
                    <div key={booking.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-lg">{booking.amenityName}</h4>
                        <p className="text-sm text-gray-600">{booking.bookingDate} | {booking.timeSlot}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${badge.bg}`}>
                        <Icon className="w-3 h-3" /> {badge.label}
                      </span>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {showBookingForm && selectedAmenity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Xác Nhận Đặt: {selectedAmenity.name}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Chọn khung giờ</label>
              <select 
                className="w-full border rounded-lg p-2"
                value={bookingForm.timeSlot}
                onChange={(e) => setBookingForm({...bookingForm, timeSlot: e.target.value})}
              >
                <option value="">-- Chọn khung giờ --</option>
                {selectedAmenity.bookingSlots?.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowBookingForm(false)} className="flex-1 py-2 border rounded-lg">Hủy</button>
              <button onClick={handleBookingSubmit} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Xác Nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}