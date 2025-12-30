// src/common/enums/database.enums.ts

export enum UserRole {
  ADMIN = 'ADMIN',
  RESIDENT = 'RESIDENT',
}
export enum ResidentRole {
  OWNER = 'OWNER',
  TENANT = 'TENANT',
  MEMBER = 'MEMBER',
}
export enum ApartmentStatus {
  OCCUPIED_OWNER = 'OCCUPIED_OWNER',
  OCCUPIED_TENANT = 'OCCUPIED_TENANT',
  AVAILABLE = 'AVAILABLE',
  VACANT = 'VACANT',
  MAINTENANCE = 'MAINTENANCE',
}
export enum VehicleType {
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
}
export enum VehicleStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
export enum RequestCategory {
  ELECTRIC = 'ELECTRIC',
  WATER = 'WATER',
  SECURITY = 'SECURITY',
  CLEANING = 'CLEANING',
  ELEVATOR = 'ELEVATOR',
  OTHER = 'OTHER',
}
export enum RequestPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}
export enum RequestStatus {
  NEW = 'NEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}
export enum InvoiceItemsFeeType {
  MANAGEMENT = 'MANAGEMENT',
  PARKING = 'PARKING',
  WATER = 'WATER',
  SERVICE = 'SERVICE',
  ELECTRIC = 'ELECTRIC',
  INTERNET = 'INTERNET',
  OTHER = 'OTHER',
}
export enum InvoiceStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}
export enum AmenityStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  MAINTENANCE = 'MAINTENANCE',
}
export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}
