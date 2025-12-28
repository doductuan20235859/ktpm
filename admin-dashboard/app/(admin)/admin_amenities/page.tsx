"use client";
import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from "lucide-react"; // Đã xóa Search và MessageSquare vì không dùng
import { amenityService } from "@/lib/services/amenity.service";
import { Booking, BookingStatus } from "@/types/amenity";

export default function AdminAmenitiesPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [adminNote, setAdminNote] = useState<{ [key: number]: string }>({});

  const loadAllBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await amenityService.getAllBookings();
      setBookings(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đặt lịch:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllBookings();
  }, [loadAllBookings]);

  const handleUpdateStatus = async (
    bookingId: number,
    status: BookingStatus
  ) => {
    try {
      const note = adminNote[bookingId] || "";
      await amenityService.updateBookingStatus(bookingId, status, note);
      alert(`Đã cập nhật trạng thái: ${status}`);
      loadAllBookings();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Cập nhật thất bại";
      alert(msg);
    }
  };

  const filteredBookings = bookings.filter((b) =>
    filterStatus === "ALL" ? true : b.status === filterStatus
  );

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đặt Lịch</h1>
          <p className="text-gray-600">Phê duyệt hoặc từ chối các yêu cầu từ cư dân</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <select
              className="pl-10 pr-4 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value={BookingStatus.PENDING}>Chờ duyệt</option>
              <option value={BookingStatus.APPROVED}>Đã duyệt</option>
              <option value={BookingStatus.REJECTED}>Đã từ chối</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Tiện ích / Ngày</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Trạng thái</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Phản hồi Admin</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{booking.amenityName}</div>
                  <div className="text-xs text-gray-500">{booking.bookingDate} | {booking.timeSlot}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                    booking.status === BookingStatus.APPROVED ? "bg-green-100 text-green-700" :
                    booking.status === BookingStatus.PENDING ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                  }`}>
                    {booking.status === BookingStatus.APPROVED && <CheckCircle className="w-3 h-3" />}
                    {booking.status === BookingStatus.PENDING && <Clock className="w-3 h-3" />}
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {booking.status === BookingStatus.PENDING ? (
                    <input
                      type="text"
                      placeholder="Ghi chú..."
                      className="text-sm border rounded px-2 py-1 w-full"
                      value={adminNote[booking.id] || ""}
                      onChange={(e) => setAdminNote({ ...adminNote, [booking.id]: e.target.value })}
                    />
                  ) : (
                    <span className="text-sm text-gray-500 italic">{booking.adminResponse || "N/A"}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {booking.status === BookingStatus.PENDING && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleUpdateStatus(booking.id, BookingStatus.APPROVED)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, BookingStatus.REJECTED)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}