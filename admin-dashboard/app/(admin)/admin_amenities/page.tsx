"use client";
import { useState } from "react";
import {
  Sparkles,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Power,
  Bell,
  Wrench,
  Filter,
  Search,
  Eye,
  X,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

interface Amenity {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  openingHours: string;
  closingHours: string;
  rules: string[];
  maxCapacity: number;
  maxDurationMinutes: number;
  maxBookingsPerMonth: number;
  requiresApproval: boolean;
  bookingSlots: string[];
  isActive: boolean;
  status: "ACTIVE" | "SUSPENDED" | "MAINTENANCE";
}

interface BookingRequest {
  id: string;
  amenityId: string;
  amenityName: string;
  residentName: string;
  apartmentNumber: string;
  date: string;
  timeSlot: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  notes: string;
  createdDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  rejectionReason?: string;
}

interface MaintenanceSchedule {
  id: string;
  amenityId: string;
  amenityName: string;
  startDate: string;
  endDate: string;
  reason: string;
  blockedSlots: string[];
  createdBy: string;
  affectedBookings?: number;
}

interface NotificationLog {
  id: string;
  title: string;
  message: string;
  targetAudience: "ALL" | "SPECIFIC";
  targetApartments?: string[];
  sentDate: string;
  sentBy: string;
  type: "GENERAL" | "MAINTENANCE" | "SCHEDULE_CHANGE";
}

export default function AdminAmenitiesManagement() {
  const [selectedView, setSelectedView] = useState<
    | "overview"
    | "amenities"
    | "bookings"
    | "requests"
    | "maintenance"
    | "notifications"
  >("overview");
  const [showAmenityForm, setShowAmenityForm] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [showRequestDetail, setShowRequestDetail] =
    useState<BookingRequest | null>(null);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Amenity | null>(
    null
  );
  const [deleteAction, setDeleteAction] = useState<"DELETE" | "SUSPEND">(
    "SUSPEND"
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [filterAmenity, setFilterAmenity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [amenityFormWarnings, setAmenityFormWarnings] = useState<string[]>([]);
  const [currentRequestsPage, setCurrentRequestsPage] = useState(1);
  const requestsPerPage = 5;
  const [currentBookingsPage, setCurrentBookingsPage] = useState(1);
  const bookingsPerPage = 10;

  // Mock data - Amenities
  const [amenities, setAmenities] = useState<Amenity[]>([
    {
      id: "1",
      name: "Bể Bơi",
      description: "Bể bơi Olympic chuẩn 50m với hệ thống lọc nước hiện đại",
      imageUrl:
        "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80",
      openingHours: "6:00",
      closingHours: "22:00",
      rules: [
        "Đeo mũ bơi bắt buộc",
        "Tắm trước khi vào bể",
        "Trẻ em dưới 12 tuổi phải có người lớn",
      ],
      maxCapacity: 50,
      maxDurationMinutes: 120,
      maxBookingsPerMonth: 8,
      requiresApproval: true,
      bookingSlots: [
        "6:00-8:00",
        "8:00-10:00",
        "10:00-12:00",
        "14:00-16:00",
        "16:00-18:00",
        "18:00-20:00",
        "20:00-22:00",
      ],
      isActive: true,
      status: "ACTIVE",
    },
    {
      id: "2",
      name: "Phòng Gym",
      description: "Phòng tập gym với thiết bị hiện đại từ Mỹ và EU",
      imageUrl:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      openingHours: "5:00",
      closingHours: "23:00",
      rules: ["Mang giày thể thao", "Lau máy sau khi sử dụng", "Không la hét"],
      maxCapacity: 30,
      maxDurationMinutes: 120,
      maxBookingsPerMonth: 20,
      requiresApproval: false,
      bookingSlots: [
        "5:00-7:00",
        "7:00-9:00",
        "9:00-11:00",
        "14:00-16:00",
        "16:00-18:00",
        "18:00-20:00",
        "20:00-22:00",
      ],
      isActive: true,
      status: "ACTIVE",
    },
    {
      id: "3",
      name: "Sân Tennis",
      description: "Sân tennis chuẩn quốc tế với mặt sân cao su",
      imageUrl:
        "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80",
      openingHours: "6:00",
      closingHours: "22:00",
      rules: [
        "Mang giày chuyên dụng tennis",
        "Tối đa 4 người/sân",
        "Đặt trước 48 giờ",
      ],
      maxCapacity: 4,
      maxDurationMinutes: 90,
      maxBookingsPerMonth: 12,
      requiresApproval: true,
      bookingSlots: [
        "6:00-8:00",
        "8:00-10:00",
        "10:00-12:00",
        "14:00-16:00",
        "16:00-18:00",
        "18:00-20:00",
        "20:00-22:00",
      ],
      isActive: true,
      status: "MAINTENANCE",
    },
  ]);

  // Mock data - Booking Requests (thêm nhiều dữ liệu mẫu hơn)
  const bookingRequests: BookingRequest[] = [
    {
      id: "1",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Nguyễn Văn An",
      apartmentNumber: "A-101",
      date: "2024-12-18",
      timeSlot: "18:00-20:00",
      status: "PENDING",
      notes: "Tổ chức sinh nhật cho con",
      createdDate: "2024-12-15",
    },
    {
      id: "2",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Trần Thị Bình",
      apartmentNumber: "B-205",
      date: "2024-12-16",
      timeSlot: "7:00-9:00",
      status: "PENDING",
      notes: "",
      createdDate: "2024-12-15",
    },
    {
      id: "3",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Lê Văn Cường",
      apartmentNumber: "C-302",
      date: "2024-12-17",
      timeSlot: "16:00-18:00",
      status: "APPROVED",
      notes: "",
      createdDate: "2024-12-14",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-14",
    },
    {
      id: "4",
      amenityId: "3",
      amenityName: "Sân Tennis",
      residentName: "Phạm Thị Dung",
      apartmentNumber: "A-105",
      date: "2024-12-20",
      timeSlot: "16:00-18:00",
      status: "REJECTED",
      notes: "",
      createdDate: "2024-12-10",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-10",
      rejectionReason: "Sân đang bảo trì",
    },
    {
      id: "5",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Hoàng Minh Đức",
      apartmentNumber: "B-108",
      date: "2024-12-17",
      timeSlot: "18:00-20:00",
      status: "APPROVED",
      notes: "Tập luyện buổi tối",
      createdDate: "2024-12-13",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-13",
    },
    {
      id: "6",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Vũ Thị Hương",
      apartmentNumber: "C-201",
      date: "2024-12-19",
      timeSlot: "8:00-10:00",
      status: "APPROVED",
      notes: "",
      createdDate: "2024-12-12",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-12",
    },
    {
      id: "7",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Đỗ Văn Khoa",
      apartmentNumber: "A-302",
      date: "2024-12-16",
      timeSlot: "5:00-7:00",
      status: "APPROVED",
      notes: "Tập sáng sớm",
      createdDate: "2024-12-11",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-11",
    },
    {
      id: "8",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Bùi Thị Lan",
      apartmentNumber: "B-401",
      date: "2024-12-18",
      timeSlot: "6:00-8:00",
      status: "CANCELLED",
      notes: "",
      createdDate: "2024-12-10",
    },
    {
      id: "9",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Ngô Văn Nam",
      apartmentNumber: "C-105",
      date: "2024-12-19",
      timeSlot: "16:00-18:00",
      status: "APPROVED",
      notes: "Tập buổi chiều",
      createdDate: "2024-12-14",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-14",
    },
    {
      id: "10",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Trương Thị Oanh",
      apartmentNumber: "A-205",
      date: "2024-12-20",
      timeSlot: "14:00-16:00",
      status: "APPROVED",
      notes: "Học bơi cho trẻ",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "11",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Phan Văn Phúc",
      apartmentNumber: "A-303",
      date: "2024-12-21",
      timeSlot: "10:00-12:00",
      status: "APPROVED",
      notes: "",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "12",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Lý Thị Quỳnh",
      apartmentNumber: "B-102",
      date: "2024-12-18",
      timeSlot: "9:00-11:00",
      status: "APPROVED",
      notes: "Tập yoga",
      createdDate: "2024-12-14",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-14",
    },
    {
      id: "13",
      amenityId: "3",
      amenityName: "Sân Tennis",
      residentName: "Đinh Văn Sơn",
      apartmentNumber: "C-404",
      date: "2024-12-16",
      timeSlot: "6:00-8:00",
      status: "APPROVED",
      notes: "Đánh đôi với bạn",
      createdDate: "2024-12-10",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-10",
    },
    {
      id: "14",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Hồ Thị Thu",
      apartmentNumber: "A-401",
      date: "2024-12-22",
      timeSlot: "18:00-20:00",
      status: "APPROVED",
      notes: "",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "15",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Võ Văn Tùng",
      apartmentNumber: "B-305",
      date: "2024-12-17",
      timeSlot: "20:00-22:00",
      status: "APPROVED",
      notes: "Tập tối",
      createdDate: "2024-12-13",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-13",
    },
    {
      id: "16",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Nguyễn Thị Uyên",
      apartmentNumber: "C-203",
      date: "2024-12-19",
      timeSlot: "6:00-8:00",
      status: "APPROVED",
      notes: "Bơi sáng sớm",
      createdDate: "2024-12-12",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-12",
    },
    {
      id: "17",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Phạm Văn Vinh",
      apartmentNumber: "A-104",
      date: "2024-12-20",
      timeSlot: "7:00-9:00",
      status: "APPROVED",
      notes: "",
      createdDate: "2024-12-14",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-14",
    },
    {
      id: "18",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Trần Văn Xuân",
      apartmentNumber: "B-201",
      date: "2024-12-21",
      timeSlot: "16:00-18:00",
      status: "APPROVED",
      notes: "Luyện tập bơi lội",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "19",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Lê Thị Yến",
      apartmentNumber: "C-301",
      date: "2024-12-18",
      timeSlot: "14:00-16:00",
      status: "APPROVED",
      notes: "",
      createdDate: "2024-12-13",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-13",
    },
    {
      id: "20",
      amenityId: "3",
      amenityName: "Sân Tennis",
      residentName: "Đặng Văn Zung",
      apartmentNumber: "A-202",
      date: "2024-12-17",
      timeSlot: "10:00-12:00",
      status: "APPROVED",
      notes: "Tập tennis",
      createdDate: "2024-12-11",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-11",
    },
    {
      id: "21",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Nguyễn Văn Anh",
      apartmentNumber: "B-404",
      date: "2024-12-23",
      timeSlot: "8:00-10:00",
      status: "APPROVED",
      notes: "",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "22",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Trần Thị Bảo",
      apartmentNumber: "C-402",
      date: "2024-12-19",
      timeSlot: "18:00-20:00",
      status: "APPROVED",
      notes: "Cardio và weights",
      createdDate: "2024-12-14",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-14",
    },
    {
      id: "23",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Lê Văn Cảnh",
      apartmentNumber: "A-501",
      date: "2024-12-20",
      timeSlot: "10:00-12:00",
      status: "APPROVED",
      notes: "Bơi với gia đình",
      createdDate: "2024-12-14",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-14",
    },
    {
      id: "24",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Phạm Thị Diễm",
      apartmentNumber: "B-503",
      date: "2024-12-21",
      timeSlot: "5:00-7:00",
      status: "APPROVED",
      notes: "Tập sáng",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "25",
      amenityId: "3",
      amenityName: "Sân Tennis",
      residentName: "Hoàng Văn Đức",
      apartmentNumber: "C-102",
      date: "2024-12-19",
      timeSlot: "14:00-16:00",
      status: "APPROVED",
      notes: "",
      createdDate: "2024-12-13",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-13",
    },
    {
      id: "26",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Vũ Thị Em",
      apartmentNumber: "A-403",
      date: "2024-12-24",
      timeSlot: "14:00-16:00",
      status: "PENDING",
      notes: "Học bơi",
      createdDate: "2024-12-15",
    },
    {
      id: "27",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Đỗ Văn Giang",
      apartmentNumber: "B-302",
      date: "2024-12-22",
      timeSlot: "16:00-18:00",
      status: "APPROVED",
      notes: "",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "28",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Bùi Văn Hòa",
      apartmentNumber: "C-504",
      date: "2024-12-21",
      timeSlot: "6:00-8:00",
      status: "APPROVED",
      notes: "Tập bơi buổi sáng",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "29",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Ngô Thị Huyền",
      apartmentNumber: "A-202",
      date: "2024-12-23",
      timeSlot: "9:00-11:00",
      status: "APPROVED",
      notes: "Zumba class",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "30",
      amenityId: "3",
      amenityName: "Sân Tennis",
      residentName: "Trương Văn Kiên",
      apartmentNumber: "B-405",
      date: "2024-12-18",
      timeSlot: "8:00-10:00",
      status: "APPROVED",
      notes: "Thi đấu tennis",
      createdDate: "2024-12-12",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-12",
    },
    {
      id: "31",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Phan Thị Linh",
      apartmentNumber: "C-205",
      date: "2024-12-16",
      timeSlot: "18:00-20:00",
      status: "APPROVED",
      notes: "",
      createdDate: "2024-12-11",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-11",
    },
    {
      id: "32",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Lý Văn Minh",
      apartmentNumber: "A-304",
      date: "2024-12-24",
      timeSlot: "20:00-22:00",
      status: "PENDING",
      notes: "Tập buổi tối",
      createdDate: "2024-12-15",
    },
    {
      id: "33",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Đinh Thị Nga",
      apartmentNumber: "B-104",
      date: "2024-12-22",
      timeSlot: "10:00-12:00",
      status: "APPROVED",
      notes: "Bơi với nhóm",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "34",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Hồ Văn Oai",
      apartmentNumber: "C-303",
      date: "2024-12-20",
      timeSlot: "14:00-16:00",
      status: "APPROVED",
      notes: "",
      createdDate: "2024-12-14",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-14",
    },
    {
      id: "35",
      amenityId: "3",
      amenityName: "Sân Tennis",
      residentName: "Võ Thị Phương",
      apartmentNumber: "A-105",
      date: "2024-12-21",
      timeSlot: "16:00-18:00",
      status: "APPROVED",
      notes: "Chơi tennis",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "36",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Nguyễn Văn Quân",
      apartmentNumber: "B-502",
      date: "2024-12-23",
      timeSlot: "16:00-18:00",
      status: "APPROVED",
      notes: "",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "37",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Trần Văn Rạng",
      apartmentNumber: "C-401",
      date: "2024-12-16",
      timeSlot: "18:00-20:00",
      status: "APPROVED",
      notes: "Strength training",
      createdDate: "2024-12-11",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-11",
    },
    {
      id: "38",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Lê Thị Sang",
      apartmentNumber: "A-103",
      date: "2024-12-17",
      timeSlot: "8:00-10:00",
      status: "APPROVED",
      notes: "Bơi sáng",
      createdDate: "2024-12-12",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-12",
    },
    {
      id: "39",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Phạm Văn Tâm",
      apartmentNumber: "B-203",
      date: "2024-12-21",
      timeSlot: "7:00-9:00",
      status: "APPROVED",
      notes: "",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "40",
      amenityId: "3",
      amenityName: "Sân Tennis",
      residentName: "Hoàng Thị Uyên",
      apartmentNumber: "C-104",
      date: "2024-12-22",
      timeSlot: "6:00-8:00",
      status: "APPROVED",
      notes: "Tennis doubles",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "41",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Cao Văn Vũ",
      apartmentNumber: "A-204",
      date: "2024-12-17",
      timeSlot: "14:00-16:00",
      status: "APPROVED",
      notes: "Bơi buổi chiều",
      createdDate: "2024-12-13",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-13",
    },
    {
      id: "42",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Mai Thị Xuân",
      apartmentNumber: "B-301",
      date: "2024-12-19",
      timeSlot: "11:00-13:00",
      status: "APPROVED",
      notes: "Tập luyện buổi trưa",
      createdDate: "2024-12-14",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-14",
    },
    {
      id: "43",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Dương Văn Yên",
      apartmentNumber: "C-403",
      date: "2024-12-18",
      timeSlot: "10:00-12:00",
      status: "APPROVED",
      notes: "Dạy bơi cho con",
      createdDate: "2024-12-13",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-13",
    },
    {
      id: "44",
      amenityId: "3",
      amenityName: "Sân Tennis",
      residentName: "Lưu Thị Zơ",
      apartmentNumber: "A-502",
      date: "2024-12-20",
      timeSlot: "18:00-20:00",
      status: "APPROVED",
      notes: "Chơi tennis buổi tối",
      createdDate: "2024-12-14",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-14",
    },
    {
      id: "45",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Hà Văn Ân",
      apartmentNumber: "B-402",
      date: "2024-12-22",
      timeSlot: "5:00-7:00",
      status: "APPROVED",
      notes: "Tập sáng sớm",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "46",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Tô Thị Bình",
      apartmentNumber: "C-501",
      date: "2024-12-16",
      timeSlot: "16:00-18:00",
      status: "APPROVED",
      notes: "",
      createdDate: "2024-12-11",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-11",
    },
    {
      id: "47",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Nông Văn Cường",
      apartmentNumber: "A-405",
      date: "2024-12-23",
      timeSlot: "16:00-18:00",
      status: "APPROVED",
      notes: "Tập chiều",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "48",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Quan Thị Duyên",
      apartmentNumber: "B-503",
      date: "2024-12-19",
      timeSlot: "18:00-20:00",
      status: "APPROVED",
      notes: "Bơi buổi tối",
      createdDate: "2024-12-13",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-13",
    },
    {
      id: "49",
      amenityId: "3",
      amenityName: "Sân Tennis",
      residentName: "Sầm Văn Hải",
      apartmentNumber: "C-202",
      date: "2024-12-23",
      timeSlot: "14:00-16:00",
      status: "APPROVED",
      notes: "Tập đánh tennis",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "50",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Từ Thị Khánh",
      apartmentNumber: "A-303",
      date: "2024-12-24",
      timeSlot: "14:00-16:00",
      status: "APPROVED",
      notes: "Workout buổi chiều",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "51",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Ứng Văn Lâm",
      apartmentNumber: "B-204",
      date: "2024-12-21",
      timeSlot: "8:00-10:00",
      status: "APPROVED",
      notes: "Bơi với bạn bè",
      createdDate: "2024-12-15",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-15",
    },
    {
      id: "52",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Văn Thị Minh",
      apartmentNumber: "C-304",
      date: "2024-12-18",
      timeSlot: "18:00-20:00",
      status: "APPROVED",
      notes: "",
      createdDate: "2024-12-13",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-13",
    },
    {
      id: "53",
      amenityId: "3",
      amenityName: "Sân Tennis",
      residentName: "Xa Văn Nhân",
      apartmentNumber: "A-401",
      date: "2024-12-24",
      timeSlot: "8:00-10:00",
      status: "PENDING",
      notes: "Thi đấu tennis",
      createdDate: "2024-12-15",
    },
    {
      id: "54",
      amenityId: "1",
      amenityName: "Bể Bơi",
      residentName: "Yên Thị Oanh",
      apartmentNumber: "B-103",
      date: "2024-12-20",
      timeSlot: "6:00-8:00",
      status: "APPROVED",
      notes: "Tập bơi buổi sáng",
      createdDate: "2024-12-14",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-14",
    },
    {
      id: "55",
      amenityId: "2",
      amenityName: "Phòng Gym",
      residentName: "Doãn Văn Phúc",
      apartmentNumber: "C-105",
      date: "2024-12-17",
      timeSlot: "14:00-16:00",
      status: "APPROVED",
      notes: "Tập buổi chiều",
      createdDate: "2024-12-12",
      reviewedBy: "Admin User",
      reviewedDate: "2024-12-12",
    },
  ];

  // Mock data - Maintenance Schedules
  const maintenanceSchedules: MaintenanceSchedule[] = [
    {
      id: "1",
      amenityId: "3",
      amenityName: "Sân Tennis",
      startDate: "2024-12-15",
      endDate: "2024-12-22",
      reason: "Sửa chữa mặt sân và lưới",
      blockedSlots: [],
      createdBy: "Admin User",
    },
    {
      id: "2",
      amenityId: "1",
      amenityName: "Bể Bơi",
      startDate: "2024-12-25",
      endDate: "2024-12-25",
      reason: "Vệ sinh bể nước định kỳ",
      blockedSlots: ["6:00-12:00"],
      createdBy: "Admin User",
    },
  ];

  // Mock data - Notifications
  const notificationLogs: NotificationLog[] = [
    {
      id: "1",
      title: "Bảo trì sân tennis",
      message: "Sân tennis sẽ đóng cửa từ 15/12 đến 22/12 để sửa chữa mặt sân.",
      targetAudience: "ALL",
      sentDate: "2024-12-14",
      sentBy: "Admin User",
      type: "MAINTENANCE",
    },
    {
      id: "2",
      title: "Thay đổi giờ mở cửa bể bơi",
      message: "Từ ngày 01/01/2025, bể bơi sẽ mở cửa từ 5:00 thay vì 6:00.",
      targetAudience: "ALL",
      sentDate: "2024-12-10",
      sentBy: "Admin User",
      type: "SCHEDULE_CHANGE",
    },
  ];

  // Statistics
  const stats = {
    totalAmenities: amenities.length,
    activeAmenities: amenities.filter((a) => a.isActive).length,
    todayBookings: bookingRequests.filter(
      (b) => b.date === new Date().toISOString().split("T")[0]
    ).length,
    pendingRequests: bookingRequests.filter((b) => b.status === "PENDING")
      .length,
    maintenanceCount: amenities.filter((a) => a.status === "MAINTENANCE")
      .length,
  };

  const handleApproveRequest = (requestId: string) => {
    const request = bookingRequests.find((r) => r.id === requestId);
    if (!request) return;

    const confirm = window.confirm(
      `Duyệt yêu cầu đặt ${request.amenityName} cho ${request.residentName}?`
    );
    if (confirm) {
      alert("Đã duyệt yêu cầu thành công!");
      setShowRequestDetail(null);
    }
  };

  const handleRejectRequest = (requestId: string, reason: string) => {
    if (!reason) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    const request = bookingRequests.find((r) => r.id === requestId);
    if (!request) return;

    const confirm = window.confirm(
      `Từ chối yêu cầu đặt ${request.amenityName} cho ${request.residentName}?`
    );
    if (confirm) {
      alert("Đã từ chối yêu cầu!");
      setShowRequestDetail(null);
    }
  };

  const handleDeleteAmenity = (amenityId: string) => {
    const amenity = amenities.find((a) => a.id === amenityId);
    if (!amenity) return;

    const confirm = window.confirm(
      `Bạn có chắc chắn muốn xóa tiện ích "${amenity.name}"?`
    );
    if (confirm) {
      setAmenities(amenities.filter((a) => a.id !== amenityId));
      alert("Đã xóa tiện ích thành công!");
    }
  };

  const handleToggleActive = (amenityId: string) => {
    setAmenities(
      amenities.map((a) =>
        a.id === amenityId ? { ...a, isActive: !a.isActive } : a
      )
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: BookingRequest["status"]) => {
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
        label: "Từ chối",
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

  const filteredRequests = bookingRequests.filter((request) => {
    if (filterAmenity !== "all" && request.amenityId !== filterAmenity)
      return false;
    if (filterStatus !== "all" && request.status !== filterStatus) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl text-gray-900 mb-2">Quản Lý Tiện Ích</h1>
        <p className="text-gray-600">
          Quản lý tiện ích chung cư và yêu cầu đặt của cư dân
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex gap-2 p-2 overflow-x-auto">
          <button
            onClick={() => setSelectedView("overview")}
            className={`px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
              selectedView === "overview"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Sparkles className="w-5 h-5 inline-block mr-2" />
            Tổng Quan
          </button>
          <button
            onClick={() => setSelectedView("amenities")}
            className={`px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
              selectedView === "amenities"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Sparkles className="w-5 h-5 inline-block mr-2" />
            Quản Lý Tiện Ích
          </button>
          <button
            onClick={() => setSelectedView("bookings")}
            className={`px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
              selectedView === "bookings"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <CalendarIcon className="w-5 h-5 inline-block mr-2" />
            Lịch Sử Dụng
          </button>
          <button
            onClick={() => setSelectedView("requests")}
            className={`px-4 py-3 rounded-lg transition-colors whitespace-nowrap relative ${
              selectedView === "requests"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <CheckCircle className="w-5 h-5 inline-block mr-2" />
            Duyệt Yêu Cầu ({stats.pendingRequests})
          </button>
          <button
            onClick={() => setSelectedView("maintenance")}
            className={`px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
              selectedView === "maintenance"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Wrench className="w-5 h-5 inline-block mr-2" />
            Bảo Trì
          </button>
          <button
            onClick={() => setSelectedView("notifications")}
            className={`px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
              selectedView === "notifications"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Bell className="w-5 h-5 inline-block mr-2" />
            Thông Báo
          </button>
        </div>
      </div>

      {/* Overview */}
      {selectedView === "overview" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
              <Sparkles className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Tổng Tiện Ích</p>
              <p className="text-3xl mt-1">{stats.totalAmenities}</p>
              <p className="text-xs opacity-75 mt-2">
                {stats.activeAmenities} đang hoạt động
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
              <CalendarIcon className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Lịch Đặt Hôm Nay</p>
              <p className="text-3xl mt-1">{stats.todayBookings}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-sm p-6 text-white">
              <Clock className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Chờ Duyệt</p>
              <p className="text-3xl mt-1">{stats.pendingRequests}</p>
              <p className="text-xs opacity-75 mt-2">Cần xử lý</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-sm p-6 text-white">
              <Wrench className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Đang Bảo Trì</p>
              <p className="text-3xl mt-1">{stats.maintenanceCount}</p>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl text-gray-900 mb-4">Yêu Cầu Gần Đây</h2>
            <div className="space-y-3">
              {bookingRequests.slice(0, 5).map((request) => {
                const badge = getStatusBadge(request.status);
                const Icon = badge.icon;
                return (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-gray-900">{request.amenityName}</h3>
                        <p className="text-sm text-gray-600">
                          {request.residentName} ({request.apartmentNumber}) -{" "}
                          {formatDate(request.date)} {request.timeSlot}
                        </p>
                      </div>
                      <span
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${badge.bg}`}
                      >
                        <Icon className="w-4 h-4" />
                        {badge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Amenities Management */}
      {selectedView === "amenities" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-gray-900">Danh Sách Tiện Ích</h2>
            <button
              onClick={() => {
                setEditingAmenity(null);
                setShowAmenityForm(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm Tiện Ích
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {amenities.map((amenity) => (
              <div
                key={amenity.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <img
                  src={amenity.imageUrl}
                  alt={amenity.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl text-gray-900">{amenity.name}</h3>
                    <div className="flex items-center gap-2">
                      {amenity.status === "MAINTENANCE" && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                          Bảo trì
                        </span>
                      )}
                      <button
                        onClick={() => handleToggleActive(amenity.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          amenity.isActive
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                        title={amenity.isActive ? "Đang hoạt động" : "Đã tắt"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {amenity.description}
                  </p>

                  <div className="text-sm text-gray-700 mb-4">
                    <p>
                      <Clock className="w-4 h-4 inline mr-1" />{" "}
                      {amenity.openingHours} - {amenity.closingHours}
                    </p>
                    <p className="mt-1">
                      Sức chứa: {amenity.maxCapacity} người
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingAmenity(amenity);
                        setShowAmenityForm(true);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Sửa
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(amenity)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings Calendar */}
      {selectedView === "bookings" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl text-gray-900 mb-4">Lịch Sử Dụng Tiện Ích</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Lọc theo tiện ích
              </label>
              <select
                value={filterAmenity}
                onChange={(e) => setFilterAmenity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả tiện ích</option>
                {amenities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Lọc theo trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="border rounded-lg p-3"
              />
            </div>

            <div>
              <h3 className="text-lg text-gray-900 mb-3">
                Lịch đặt - {selectedDate?.toLocaleDateString("vi-VN")}
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {filteredRequests
                  .filter(
                    (r) => r.date === selectedDate?.toISOString().split("T")[0]
                  )
                  .map((request) => {
                    const badge = getStatusBadge(request.status);
                    const Icon = badge.icon;
                    return (
                      <div
                        key={request.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-gray-900">
                              {request.amenityName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {request.timeSlot}
                            </p>
                          </div>
                          <span
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${badge.bg}`}
                          >
                            <Icon className="w-3 h-3" />
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {request.residentName} ({request.apartmentNumber})
                        </p>
                        <button
                          onClick={() => setShowRequestDetail(request)}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Xem chi tiết
                        </button>
                      </div>
                    );
                  })}
                {filteredRequests.filter(
                  (r) => r.date === selectedDate?.toISOString().split("T")[0]
                ).length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Không có lịch đặt nào
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requests Approval */}
      {selectedView === "requests" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl text-gray-900 mb-4">
            Duyệt Yêu Cầu Đặt Tiện Ích
          </h2>

          <div className="space-y-4">
            {bookingRequests.filter((r) => r.status === "PENDING").length ===
            0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Không có yêu cầu chờ duyệt</p>
              </div>
            ) : (
              bookingRequests
                .filter((r) => r.status === "PENDING")
                .map((request) => (
                  <div
                    key={request.id}
                    className="border-2 border-yellow-200 rounded-lg p-5 bg-yellow-50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl text-gray-900 mb-1">
                          {request.amenityName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Ngày: {formatDate(request.date)} | Giờ:{" "}
                          {request.timeSlot}
                        </p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm border border-yellow-300">
                        Chờ duyệt
                      </span>
                    </div>

                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Người đặt</p>
                          <p className="text-gray-900">
                            {request.residentName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Căn hộ</p>
                          <p className="text-gray-900">
                            {request.apartmentNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ngày tạo</p>
                          <p className="text-gray-900">
                            {formatDate(request.createdDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ghi chú</p>
                          <p className="text-gray-900">
                            {request.notes || "Không có"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Duyệt Yêu Cầu
                      </button>
                      <button
                        onClick={() => setShowRequestDetail(request)}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Từ Chối
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-lg text-gray-900 mb-4">Lịch Sử Duyệt</h3>
            <div className="space-y-3">
              {bookingRequests
                .filter((r) => r.status !== "PENDING")
                .slice(
                  (currentRequestsPage - 1) * requestsPerPage,
                  currentRequestsPage * requestsPerPage
                )
                .map((request) => {
                  const badge = getStatusBadge(request.status);
                  const Icon = badge.icon;
                  return (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-gray-900">
                            {request.amenityName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {request.residentName} ({request.apartmentNumber}) -{" "}
                            {formatDate(request.date)} {request.timeSlot}
                          </p>
                          {request.reviewedBy && (
                            <p className="text-xs text-gray-500 mt-1">
                              Duyệt bởi: {request.reviewedBy} -{" "}
                              {formatDate(request.reviewedDate!)}
                            </p>
                          )}
                        </div>
                        <span
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${badge.bg}`}
                        >
                          <Icon className="w-4 h-4" />
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {bookingRequests.filter((r) => r.status !== "PENDING").length >
              requestsPerPage && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() =>
                    setCurrentRequestsPage(currentRequestsPage - 1)
                  }
                  disabled={currentRequestsPage === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentRequestsPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trang Trước
                </button>
                <span className="text-sm text-gray-600">
                  Trang {currentRequestsPage} /{" "}
                  {Math.ceil(
                    bookingRequests.filter((r) => r.status !== "PENDING")
                      .length / requestsPerPage
                  )}
                </span>
                <button
                  onClick={() =>
                    setCurrentRequestsPage(currentRequestsPage + 1)
                  }
                  disabled={
                    currentRequestsPage * requestsPerPage >=
                    bookingRequests.filter((r) => r.status !== "PENDING").length
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentRequestsPage * requestsPerPage >=
                    bookingRequests.filter((r) => r.status !== "PENDING").length
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
        </div>
      )}

      {/* Maintenance Management */}
      {selectedView === "maintenance" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-gray-900">Quản Lý Bảo Trì</h2>
            <button
              onClick={() => setShowMaintenanceForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tạo Lịch Bảo Trì
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {maintenanceSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white rounded-lg shadow-sm border-2 border-red-200 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl text-gray-900 mb-1">
                      {schedule.amenityName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(schedule.startDate)} -{" "}
                      {formatDate(schedule.endDate)}
                    </p>
                  </div>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                    Đang bảo trì
                  </span>
                </div>

                <div className="bg-red-50 rounded-lg p-4 mb-3">
                  <p className="text-sm text-gray-700">
                    <span className="">Lý do:</span> {schedule.reason}
                  </p>
                  {schedule.blockedSlots.length > 0 && (
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="">Khung giờ chặn:</span>{" "}
                      {schedule.blockedSlots.join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Tạo bởi: {schedule.createdBy}
                  </p>
                </div>

                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Kết Thúc Bảo Trì
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications Management */}
      {selectedView === "notifications" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-gray-900">Quản Lý Thông Báo</h2>
            <button
              onClick={() => setShowNotificationForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Gửi Thông Báo Mới
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg text-gray-900 mb-4">Lịch Sử Thông Báo</h3>
            <div className="space-y-4">
              {notificationLogs.map((notification) => (
                <div
                  key={notification.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        notification.type === "MAINTENANCE"
                          ? "bg-red-100 text-red-700"
                          : notification.type === "SCHEDULE_CHANGE"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {notification.type === "MAINTENANCE"
                        ? "Bảo trì"
                        : notification.type === "SCHEDULE_CHANGE"
                        ? "Thay đổi"
                        : "Chung"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                    <span>Gửi: {formatDate(notification.sentDate)}</span>
                    <span>Bởi: {notification.sentBy}</span>
                    <span>
                      Đối tượng:{" "}
                      {notification.targetAudience === "ALL"
                        ? "Tất cả cư dân"
                        : "Cư dân cụ thể"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {showRequestDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl text-gray-900">Chi Tiết Yêu Cầu</h3>
              <button
                onClick={() => setShowRequestDetail(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="text-gray-900 mb-3">Thông Tin Đặt Lịch</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Tiện ích</p>
                    <p className="text-gray-900">
                      {showRequestDetail.amenityName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ngày</p>
                    <p className="text-gray-900">
                      {formatDate(showRequestDetail.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Khung giờ</p>
                    <p className="text-gray-900">
                      {showRequestDetail.timeSlot}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Người đặt</p>
                    <p className="text-gray-900">
                      {showRequestDetail.residentName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Căn hộ</p>
                    <p className="text-gray-900">
                      {showRequestDetail.apartmentNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ngày tạo</p>
                    <p className="text-gray-900">
                      {formatDate(showRequestDetail.createdDate)}
                    </p>
                  </div>
                </div>
                {showRequestDetail.notes && (
                  <div className="mt-3">
                    <p className="text-gray-600 text-sm">Ghi chú</p>
                    <p className="text-gray-900">{showRequestDetail.notes}</p>
                  </div>
                )}
              </div>

              {showRequestDetail.status === "PENDING" && (
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Lý do từ chối (nếu từ chối)
                  </label>
                  <textarea
                    id="rejection-reason"
                    placeholder="Nhập lý do từ chối..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveRequest(showRequestDetail.id)}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      Duyệt
                    </button>
                    <button
                      onClick={() => {
                        const reason = (
                          document.getElementById(
                            "rejection-reason"
                          ) as HTMLTextAreaElement
                        )?.value;
                        handleRejectRequest(showRequestDetail.id, reason);
                      }}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <XCircle className="w-5 h-5 inline mr-2" />
                      Từ Chối
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Form Modal */}
      {showNotificationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl text-gray-900">Gửi Thông Báo Mới</h3>
              <button
                onClick={() => setShowNotificationForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  placeholder="Nhập tiêu đề thông báo..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Nội dung
                </label>
                <textarea
                  placeholder="Nhập nội dung thông báo..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Loại thông báo
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="GENERAL">Thông báo chung</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                  <option value="SCHEDULE_CHANGE">Thay đổi lịch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Đối tượng nhận
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="ALL">Tất cả cư dân</option>
                  <option value="SPECIFIC">Cư dân cụ thể</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowNotificationForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    alert("Đã gửi thông báo thành công!");
                    setShowNotificationForm(false);
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Gửi Thông Báo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl text-gray-900">Xác Nhận Xóa Tiện Ích</h3>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Thông tin tiện ích */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-gray-900 mb-2">Thông Tin Tiện Ích</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-600">Tên:</span>{" "}
                    <span className="text-gray-900">
                      {showDeleteConfirm.name}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Trạng thái:</span>{" "}
                    <span className="text-gray-900">
                      {showDeleteConfirm.isActive ? "Đang hoạt động" : "Đã tắt"}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">
                      Số lịch đã đặt liên quan:
                    </span>{" "}
                    <span className="text-gray-900">
                      {
                        bookingRequests.filter(
                          (r) => r.amenityId === showDeleteConfirm.id
                        ).length
                      }{" "}
                      lịch
                    </span>
                  </p>
                </div>
              </div>

              {/* Cảnh báo */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800">
                      ⚠️ Hành động này không thể hoàn tác.
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      Tất cả lịch đặt liên quan sẽ bị hủy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Lựa chọn hành động */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Chọn hành động
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="deleteAction"
                      value="SUSPEND"
                      checked={deleteAction === "SUSPEND"}
                      onChange={(e) =>
                        setDeleteAction(e.target.value as "DELETE" | "SUSPEND")
                      }
                      className="mt-1"
                    />
                    <div>
                      <p className="text-gray-900">
                        Ngưng sử dụng (Khuyến nghị)
                      </p>
                      <p className="text-sm text-gray-600">
                        Tiện ích không hiển thị cho cư dân, dữ liệu vẫn được giữ
                        lại
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="deleteAction"
                      value="DELETE"
                      checked={deleteAction === "DELETE"}
                      onChange={(e) =>
                        setDeleteAction(e.target.value as "DELETE" | "SUSPEND")
                      }
                      className="mt-1"
                    />
                    <div>
                      <p className="text-gray-900">Xóa vĩnh viễn</p>
                      <p className="text-sm text-gray-600">
                        Chỉ khi chưa từng sử dụng. Mọi dữ liệu sẽ bị xóa hoàn
                        toàn
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    if (deleteAction === "DELETE") {
                      handleDeleteAmenity(showDeleteConfirm.id);
                    } else {
                      setAmenities(
                        amenities.map((a) =>
                          a.id === showDeleteConfirm.id
                            ? { ...a, isActive: false, status: "SUSPENDED" }
                            : a
                        )
                      );
                      alert("Đã ngưng sử dụng tiện ích!");
                    }
                    setShowDeleteConfirm(null);
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-5 h-5 inline mr-2" />
                  Xác Nhận {deleteAction === "DELETE" ? "Xóa" : "Ngưng Sử Dụng"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Amenity Form Modal (Create/Edit) */}
      {showAmenityForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl text-gray-900">
                {editingAmenity ? "Chỉnh Sửa Tiện Ích" : "Thêm Tiện Ích Mới"}
              </h3>
              <button
                onClick={() => {
                  setShowAmenityForm(false);
                  setEditingAmenity(null);
                  setAmenityFormWarnings([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Warnings */}
              {amenityFormWarnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-yellow-800">
                        ⚠️ Thay đổi này sẽ ảnh hưởng đến các lịch đặt hiện có
                        của cư dân.
                      </p>
                      <div className="mt-3 space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          <span className="text-yellow-900">
                            Gửi thông báo cho cư dân
                          </span>
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          <span className="text-yellow-900">
                            Áp dụng cho lịch đã đặt
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin cơ bản */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-gray-900 mb-4">📋 Thông Tin Cơ Bản</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2">
                      Tên tiện ích *
                    </label>
                    <input
                      type="text"
                      defaultValue={editingAmenity?.name}
                      placeholder="Ví dụ: Bể Bơi, Phòng Gym..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2">
                      Mô tả ngắn
                    </label>
                    <textarea
                      defaultValue={editingAmenity?.description}
                      placeholder="Nhập mô tả về tiện ích..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2">
                      Hình ảnh
                    </label>
                    {editingAmenity && (
                      <div className="mb-3">
                        <img
                          src={editingAmenity.imageUrl}
                          alt={editingAmenity.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        defaultValue={editingAmenity?.imageUrl}
                        placeholder="URL hình ảnh..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Đổi ảnh
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thời gian hoạt động */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-gray-900 mb-4">🕐 Thời Gian Hoạt Động</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Giờ mở cửa *
                    </label>
                    <input
                      type="time"
                      defaultValue={editingAmenity?.openingHours || "06:00"}
                      onChange={() => {
                        if (
                          editingAmenity &&
                          !amenityFormWarnings.includes("time")
                        ) {
                          setAmenityFormWarnings([
                            ...amenityFormWarnings,
                            "time",
                          ]);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Giờ đóng cửa *
                    </label>
                    <input
                      type="time"
                      defaultValue={editingAmenity?.closingHours || "22:00"}
                      onChange={() => {
                        if (
                          editingAmenity &&
                          !amenityFormWarnings.includes("time")
                        ) {
                          setAmenityFormWarnings([
                            ...amenityFormWarnings,
                            "time",
                          ]);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quy định sử dụng */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-gray-900 mb-4">📜 Quy Định Sử Dụng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Thời gian tối đa mỗi lượt (phút)
                    </label>
                    <input
                      type="number"
                      defaultValue={editingAmenity?.maxDurationMinutes || 120}
                      onChange={() => {
                        if (
                          editingAmenity &&
                          !amenityFormWarnings.includes("rules")
                        ) {
                          setAmenityFormWarnings([
                            ...amenityFormWarnings,
                            "rules",
                          ]);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Số lần đặt tối đa / tháng
                    </label>
                    <input
                      type="number"
                      defaultValue={editingAmenity?.maxBookingsPerMonth || 10}
                      onChange={() => {
                        if (
                          editingAmenity &&
                          !amenityFormWarnings.includes("rules")
                        ) {
                          setAmenityFormWarnings([
                            ...amenityFormWarnings,
                            "rules",
                          ]);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Sức chứa tối đa (người)
                    </label>
                    <input
                      type="number"
                      defaultValue={editingAmenity?.maxCapacity || 30}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={editingAmenity?.requiresApproval}
                        onChange={() => {
                          if (
                            editingAmenity &&
                            !amenityFormWarnings.includes("rules")
                          ) {
                            setAmenityFormWarnings([
                              ...amenityFormWarnings,
                              "rules",
                            ]);
                          }
                        }}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-gray-700">
                        Cần duyệt khi đặt lịch
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Trạng thái tiện ích */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-gray-900 mb-4">🔧 Trạng Thái Tiện Ích</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="amenityStatus"
                      value="ACTIVE"
                      defaultChecked={
                        editingAmenity?.status === "ACTIVE" || !editingAmenity
                      }
                      onChange={() => {
                        if (
                          editingAmenity &&
                          editingAmenity.status !== "ACTIVE" &&
                          !amenityFormWarnings.includes("status")
                        ) {
                          setAmenityFormWarnings([
                            ...amenityFormWarnings,
                            "status",
                          ]);
                        }
                      }}
                    />
                    <div>
                      <p className="text-gray-900">Đang hoạt động</p>
                      <p className="text-sm text-gray-600">
                        Cư dân có thể đặt lịch bình thường
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="amenityStatus"
                      value="SUSPENDED"
                      defaultChecked={editingAmenity?.status === "SUSPENDED"}
                      onChange={() => {
                        if (
                          editingAmenity &&
                          editingAmenity.status !== "SUSPENDED" &&
                          !amenityFormWarnings.includes("status")
                        ) {
                          setAmenityFormWarnings([
                            ...amenityFormWarnings,
                            "status",
                          ]);
                        }
                      }}
                    />
                    <div>
                      <p className="text-gray-900">Tạm ngưng</p>
                      <p className="text-sm text-gray-600">
                        Không cho phép đặt lịch mới
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="amenityStatus"
                      value="MAINTENANCE"
                      defaultChecked={editingAmenity?.status === "MAINTENANCE"}
                      onChange={() => {
                        if (
                          editingAmenity &&
                          editingAmenity.status !== "MAINTENANCE" &&
                          !amenityFormWarnings.includes("status")
                        ) {
                          setAmenityFormWarnings([
                            ...amenityFormWarnings,
                            "status",
                          ]);
                        }
                      }}
                    />
                    <div>
                      <p className="text-gray-900">Bảo trì</p>
                      <p className="text-sm text-gray-600">
                        Tiện ích đang được bảo trì
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowAmenityForm(false);
                    setEditingAmenity(null);
                    setAmenityFormWarnings([]);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  ❌ Hủy
                </button>
                <button
                  onClick={() => {
                    alert(
                      editingAmenity
                        ? "Đã cập nhật tiện ích!"
                        : "Đã thêm tiện ích mới!"
                    );
                    setShowAmenityForm(false);
                    setEditingAmenity(null);
                    setAmenityFormWarnings([]);
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  💾 Lưu Thay Đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Form Modal */}
      {showMaintenanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl text-gray-900">
                Tạo Lịch Bảo Trì Tiện Ích
              </h3>
              <button
                onClick={() => setShowMaintenanceForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Chọn tiện ích */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Chọn tiện ích *
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Chọn tiện ích --</option>
                  {amenities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Thời gian bắt đầu */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Giờ bắt đầu *
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Thời gian kết thúc */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Giờ kết thúc *
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Lý do bảo trì */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Lý do bảo trì *
                </label>
                <textarea
                  placeholder="Nhập lý do bảo trì..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Số lịch đặt bị ảnh hưởng */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Có <span className="">3 lịch đặt</span> sẽ bị ảnh hưởng bởi
                  lịch bảo trì này.
                </p>
              </div>

              {/* Tùy chọn xử lý lịch đặt bị trùng */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Xử lý lịch đặt bị trùng
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="conflictResolution"
                      value="CANCEL"
                      defaultChecked
                      className=""
                    />
                    <span className="text-gray-700">
                      Hủy tất cả lịch đặt bị trùng
                    </span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="conflictResolution"
                      value="NOTIFY"
                      className=""
                    />
                    <span className="text-gray-700">
                      Thông báo cho cư dân tự sắp xếp lại
                    </span>
                  </label>
                </div>
              </div>

              {/* Tùy chọn gửi thông báo */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-gray-700">
                    Gửi thông báo cho cư dân về lịch bảo trì
                  </span>
                </label>
              </div>

              {/* Nút hành động */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowMaintenanceForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    alert("Đã tạo lịch bảo trì!");
                    setShowMaintenanceForm(false);
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Wrench className="w-5 h-5 inline mr-2" />
                  Tạo Lịch Bảo Trì
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
