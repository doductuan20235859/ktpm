export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface Amenity {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  openingTime: string;
  closingTime: string;
  maxCapacity: number;
  rules: string[];
  bookingSlots: string[];
}

export interface Booking {
  id: number;
  amenityId: number;
  amenityName: string;
  bookingDate: string;
  timeSlot: string;
  status: BookingStatus;
  adminResponse?: string;
}
