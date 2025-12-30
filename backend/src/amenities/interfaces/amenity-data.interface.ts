export interface IBooking {
  id: number;
  userId: number;
  amenityId: number;
  amenityName: string;
  bookingDate: string;
  timeSlot: string;
  status: string;
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}
