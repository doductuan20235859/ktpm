export interface Amenity {
  id: number; // Sửa từ string -> number
  name: string;
  description: string;
  imageUrl: string;

  // Sửa tên biến cho khớp Backend
  openingTime: string; // Thay vì openingHours
  closingTime: string; // Thay vì closingHours

  maxCapacity: number;
  maxDurationMinutes: number;
  maxBookingsPerMonth: number;
  requiresApproval: boolean;
  status: "ACTIVE" | "SUSPENDED" | "MAINTENANCE"; // Khớp Backend
  isActive: boolean; // Backend đã trả về cái này rồi, rất tốt

  rules: string[];
  bookingSlots: string[] | null; // Backend có thể trả về null
  createdAt: string;
}
