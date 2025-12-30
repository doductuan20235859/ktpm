import axios from 'axios';
import { Amenity, Booking } from '../../types/amenity';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Interface mở rộng để xử lý các biến từ Database cũ (image_url)
 */
export interface AmenityHybrid extends Partial<Amenity> {
  id: number;
  name: string;
  image_url?: string;
}

/**
 * Interface cho lịch đặt của User - Đảm bảo khớp tên biến trong file Page
 */
export interface BookingWithRelations extends Omit<Partial<Booking>, 'status'> {
  id: number;
  amenityId: number;
  userId: number;
  bookingDate: string;
  timeSlot: string;
  status?: unknown; 
  amenity?: { name: string; imageUrl?: string; image_url?: string };
  amenityName: string;
  adminResponse?: string;
}

const getAuthHeader = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token.trim()}` } : {};
};

export const amenityService = {
  // Lấy danh sách tiện ích
  getAmenities: async (): Promise<Amenity[]> => {
    const res = await axios.get<Amenity[]>(`${API_URL}/amenities`);
    return res.data.map((item: Amenity) => {
      const hybrid = item as unknown as AmenityHybrid;
      return {
        ...item,
        imageUrl: item.imageUrl || hybrid.image_url || ""
      };
    });
  },

  // USER: Lấy lịch sử đặt chỗ
  getMyBookings: async (userId: number | string): Promise<BookingWithRelations[]> => {
    try {
      const res = await axios.get(`${API_URL}/amenities/my-bookings`, {
        params: { userId: Number(userId) },
        headers: getAuthHeader()
      });
      const raw = res.data as unknown as { data?: BookingWithRelations[]; bookings?: BookingWithRelations[] } | BookingWithRelations[];
      if (Array.isArray(raw)) return raw;
      return raw.data || raw.bookings || [];
    } catch (error: unknown) {
      console.error("Lỗi getMyBookings:", error);
      return [];
    }
  },

  // USER: Đặt lịch mới
  createBooking: async (data: { amenityId: number; userId: number; bookingDate: string; timeSlot: string }): Promise<Booking> => {
    const res = await axios.post<Booking>(`${API_URL}/amenities/${data.amenityId}/bookings`, data, { 
      headers: getAuthHeader() 
    });
    return res.data;
  },

  /**
   * USER: Hủy lịch đặt chỗ (MỚI)
   * Khớp với endpoint DELETE /amenities/bookings/:id ở Backend
   */
  cancelBooking: async (bookingId: number): Promise<void> => {
    await axios.delete(`${API_URL}/amenities/bookings/${bookingId}`, {
      headers: getAuthHeader()
    });
  },

  // ADMIN: Các hàm quản trị (Giữ nguyên)
  createAmenity: async (data: unknown): Promise<Amenity> => {
    const res = await axios.post<Amenity>(`${API_URL}/amenities`, data as Record<string, unknown>, { headers: getAuthHeader() });
    return res.data;
  },

  updateAmenity: async (id: number, data: unknown): Promise<Amenity> => {
    const res = await axios.patch<Amenity>(`${API_URL}/amenities/${id}`, data as Record<string, unknown>, { headers: getAuthHeader() });
    return res.data;
  },

  deleteAmenity: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/amenities/${id}`, { headers: getAuthHeader() });
  },

  getAllBookings: async (): Promise<BookingWithRelations[]> => {
    const res = await axios.get<BookingWithRelations[]>(`${API_URL}/amenities/bookings/all`, { headers: getAuthHeader() });
    return res.data;
  },

  updateBookingStatus: async (id: number, status: string, adminResponse?: string): Promise<Booking> => {
    const res = await axios.patch<Booking>(`${API_URL}/amenities/bookings/${id}/status`, { status, adminResponse }, { headers: getAuthHeader() });
    return res.data;
  }
};