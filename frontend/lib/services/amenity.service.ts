import axios from 'axios';
import { Amenity, Booking } from '../../types/amenity';

// Sửa từ 3000 thành 3001
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface BookingWithUser extends Booking {
  user?: {
    id: number;
  };
}

export const amenityService = {
  getAmenities: async (): Promise<Amenity[]> => {
    const res = await axios.get<Amenity[]>(`${API_URL}/amenities`);
    return res.data;
  },

  createBooking: async (data: {
    amenityId: number;
    userId: number;
    bookingDate: string;
    timeSlot: string;
  }): Promise<Booking> => {
    const res = await axios.post<Booking>(`${API_URL}/amenities/${data.amenityId}/bookings`, data);
    return res.data;
  },

  getMyBookings: async (userId: number): Promise<Booking[]> => {
    const res = await axios.get<BookingWithUser[]>(`${API_URL}/amenities/bookings/all`);
    return res.data.filter((b: BookingWithUser) => b.user?.id === userId);
  },

  // THÊM HÀM NÀY CHO ADMIN: Lấy tất cả lịch đặt của toàn bộ cư dân
  getAllBookings: async (): Promise<Booking[]> => {
    const res = await axios.get<Booking[]>(`${API_URL}/amenities/bookings/all`);
    return res.data;
  },

  // THÊM HÀM NÀY CHO ADMIN: Phê duyệt hoặc từ chối
  updateBookingStatus: async (
    bookingId: number, 
    status: string, 
    adminResponse?: string
  ): Promise<Booking> => {
    const res = await axios.patch<Booking>(`${API_URL}/amenities/bookings/${bookingId}/status`, {
      status,
      adminResponse,
    });
    return res.data;
  }
};