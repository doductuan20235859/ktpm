// dto/create-amenity.dto.ts
import { AmenityStatus } from '../../common/enums/database.enums'; // Import Enum của bạn

export class updateAmenityDto {
  name: string;
  description?: string;
  imageUrl?: string;
  openingTime?: string;
  closingTime?: string;
  maxCapacity?: number;
  maxDurationMinutes?: number;
  maxBookingsPerMonth?: number;
  requiresApproval?: boolean;
  status?: AmenityStatus; // Quan trọng: Nhận ACTIVE, MAINTENANCE...
  rules?: string[];
  bookingSlots?: string[];
}
