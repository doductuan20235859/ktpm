"use client";

import { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo 
} from "react";

import {
  Sparkles,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Bell,
  Wrench,
  X,
  Send,
  Dumbbell,
  Waves,
  Trophy,
  Filter,
  Check,
  User,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Save,
  History,
  Settings,
  Upload,
  Image as ImageIcon,
  Activity,
  ShieldCheck,
  Info,
  Users,
  Megaphone,
  Eye
} from "lucide-react";

import Image from "next/image";
import { amenityService } from "@/lib/services/amenity.service";
import { Amenity, Booking } from "@/types/amenity";

// -------------------------------------------------------------------------
// 1. KHAI BÁO KIỂU DỮ LIỆU TƯỜNG MINH
// -------------------------------------------------------------------------

type ViewType = 
  | "overview" 
  | "amenities" 
  | "history" 
  | "requests" 
  | "maintenance" 
  | "notifications";

type AmenityStatus = 
  | "ACTIVE" 
  | "SUSPENDED" 
  | "MAINTENANCE";

interface BookingWithRelations extends Omit<Booking, "amenityId" | "userId" | "bookingDate" | "status"> {
  amenity?: { 
    name: string 
  };
  user?: { 
    fullName: string; 
    roomNumber?: string 
  };
  bookingDate: string;
  timeSlot: string;
  status: string;
  id: number;
}

interface AmenityExtended extends Omit<Amenity, "imageUrl"> {
  image_url?: string;
  status: AmenityStatus;
  maxCapacity: number;
  name: string;
  description: string;
  id: number;
  openTime?: string;
  closeTime?: string;
  maxDuration?: number;
  maxBookingsPerMonth?: number;
  requiresApproval?: boolean;
  rules: string[]; // Đảm bảo luôn là mảng để fix lỗi TS2430
}

interface DashboardStats {
  total: number;
  active: number;
  today: number;
  pending: number;
  maintenance: number;
}

interface NotificationItem {
  id: number;
  title: string;
  content: string;
  type: string;
  recipient: string;
  date: string;
}

// -------------------------------------------------------------------------
// 2. ĐỊNH NGHĨA COMPONENT CHÍNH
// -------------------------------------------------------------------------

export default function AdminAmenitiesManagement() {
  
  // --- QUẢN LÝ TRẠNG THÁI GIAO DIỆN ---
  const [selectedView, setSelectedView] = useState<ViewType>("overview");
  const [maintenanceSubView, setMaintenanceSubView] = useState<"active" | "history">("active");
  const [loading, setLoading] = useState(true);

  // --- QUẢN LÝ DỮ LIỆU HỆ THỐNG ---
  const [amenities, setAmenities] = useState<AmenityExtended[]>([]);
  const [allBookings, setAllBookings] = useState<BookingWithRelations[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    today: 0,
    pending: 0,
    maintenance: 0,
  });

  const [notifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: "Thông báo bảo trì định kỳ hồ bơi tòa A",
      content: "Hệ thống lọc nước tòa A sẽ được vệ sinh vào sáng Thứ 7 tuần này. Kính mong cư dân sắp xếp lịch trình phù hợp.",
      type: "Bảo trì",
      recipient: "Tất cả cư dân",
      date: "30/12/2025"
    }
  ]);

  // --- TRẠNG THÁI PHÂN TRANG VÀ BỘ LỌC ---
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // --- TRẠNG THÁI CỬA SỔ MODAL ---
  const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [editingAmenity, setEditingAmenity] = useState<AmenityExtended | null>(null);
  const [showRequestModal, setShowRequestModal] = useState<BookingWithRelations | null>(null);

  // --- DỮ LIỆU FORM TIỆN ÍCH ---
  const [amenityFormData, setAmenityFormData] = useState({
    name: "",
    description: "",
    openTime: "06:00",
    closeTime: "22:00",
    maxDuration: 120,
    maxBookingsPerMonth: 8,
    maxCapacity: 50,
    requiresApproval: true,
    status: "ACTIVE" as AmenityStatus,
    image: null as File | null,
    imagePreview: "" as string,
    rules: "" as string // Chuỗi nhập liệu để tách dòng
  });

  // --- DỮ LIỆU FORM BẢO TRÌ ---
  const [maintenanceFormData, setMaintenanceFormData] = useState({
    amenityId: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    reason: "",
    conflictAction: "CANCEL_ALL",
    notifyResidents: true
  });

  // --- DỮ LIỆU FORM THÔNG BÁO ---
  const [notificationFormData, setNotificationFormData] = useState({
    title: "",
    content: "",
    type: "Thông báo chung",
    recipient: "Tất cả cư dân"
  });

  // -------------------------------------------------------------------------
  // 3. ĐỒNG BỘ DỮ LIỆU (API FETCHING)
  // -------------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [amenData, bookingData, statsRes] = await Promise.all([
        amenityService.getAmenities(),
        amenityService.getAllBookings(),
        fetch("http://localhost:3001/amenities/dashboard/stats"),
      ]);

      const statsData = (await statsRes.json()) as DashboardStats;
      
      setAmenities(amenData as unknown as AmenityExtended[]);
      setAllBookings(bookingData as unknown as BookingWithRelations[]);
      setStats(statsData);
      
    } catch (err) {
      console.error("Đồng bộ thất bại:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -------------------------------------------------------------------------
  // 4. XỬ LÝ SỰ KIỆN VÀ NGHIỆP VỤ
  // -------------------------------------------------------------------------

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAmenityFormData({
          ...amenityFormData,
          image: file,
          imagePreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAmenityModal = (amenity?: AmenityExtended) => {
    if (amenity) {
      setEditingAmenity(amenity);
      setAmenityFormData({
        name: amenity.name,
        description: amenity.description,
        openTime: amenity.openTime || "06:00",
        closeTime: amenity.closeTime || "22:00",
        maxDuration: amenity.maxDuration || 120,
        maxBookingsPerMonth: amenity.maxBookingsPerMonth || 8,
        maxCapacity: amenity.maxCapacity || 50,
        requiresApproval: amenity.requiresApproval ?? true,
        status: amenity.status,
        image: null,
        imagePreview: amenity.image_url || "",
        rules: amenity.rules ? amenity.rules.join("\n") : ""
      });
    } else {
      setEditingAmenity(null);
      setAmenityFormData({
        name: "",
        description: "",
        openTime: "06:00",
        closeTime: "22:00",
        maxDuration: 120,
        maxBookingsPerMonth: 8,
        maxCapacity: 50,
        requiresApproval: true,
        status: "ACTIVE",
        image: null,
        imagePreview: "",
        rules: ""
      });
    }
    setIsAmenityModalOpen(true);
  };

  const handleSaveAmenity = async () => {
    try {
      const finalData = {
        ...amenityFormData,
        rules: amenityFormData.rules.split("\n").filter(r => r.trim() !== "")
      };
      if (editingAmenity) {
        await amenityService.updateAmenity(editingAmenity.id, finalData);
      } else {
        await amenityService.createAmenity(finalData);
      }
      setIsAmenityModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error("Lưu dữ liệu lỗi:", error);
    }
  };

  const handleEndMaintenance = async (id: number) => {
    if (confirm("Xác nhận hoàn thành bảo trì và mở cửa tiện ích?")) {
      try {
        await amenityService.updateAmenity(id, { status: "ACTIVE" });
        await fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateMaintenance = async () => {
    try {
      if (!maintenanceFormData.amenityId) return alert("Chọn hạ tầng!");
      await amenityService.updateAmenity(
        parseInt(maintenanceFormData.amenityId), 
        { status: "MAINTENANCE" }
      );
      setIsMaintenanceModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAmenity = async (id: number) => {
    if (confirm("Dữ liệu sẽ bị xóa sạch khỏi hệ thống?")) {
      try {
        await amenityService.deleteAmenity(id);
        await fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdateBookingStatus = async (id: number, status: "APPROVED" | "REJECTED") => {
    try {
      await amenityService.updateBookingStatus(id, status);
      setShowRequestModal(null);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendNotification = () => {
    alert("Bản tin đã được phát hành thành công!");
    setIsNotificationModalOpen(false);
  };

  // --- LOGIC PHÂN TRANG ---
  const filteredHistory = useMemo(() => {
    return allBookings.filter(
      (b) => b.bookingDate === selectedDate && b.status !== "PENDING"
    );
  }, [allBookings, selectedDate]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i <= 3 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`w-9 h-9 rounded-lg font-bold text-[11px] transition-all duration-300 ${
              currentPage === i 
              ? "bg-blue-600 text-white shadow-md" 
              : "text-slate-400 hover:bg-slate-100"
            }`}
          >
            {i}
          </button>
        );
      } else if (i === 4 && totalPages > 5) {
        pages.push(<MoreHorizontal key="dots" className="text-slate-300 px-1" />);
      }
    }
    return pages;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-50 text-amber-600 border-amber-100";
      case "APPROVED": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "REJECTED": return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-slate-50 text-slate-600";
    }
  };

  const getAmenityTheme = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("gym")) return { icon: <Dumbbell size={24} />, color: "from-blue-600 to-indigo-600" };
    if (n.includes("bể bơi") || n.includes("pool")) return { icon: <Waves size={24} />, color: "from-cyan-500 to-blue-500" };
    return { icon: <Sparkles size={24} />, color: "from-slate-500 to-slate-700" };
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-blue-600 uppercase text-[10px] tracking-widest">Đang tải hạ tầng...</p>
      </div>
    </div>
  );

  // -------------------------------------------------------------------------
  // 7. GIAO DIỆN HIỂN THỊ CHÍNH (JSX)
  // -------------------------------------------------------------------------

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen font-sans text-slate-800">
      
      {/* 7.1 HEADER SECTION */}
      <div className="mb-8 flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-600" size={24} />
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Quản Lý Hạ Tầng</h1>
          </div>
          <p className="text-slate-400 font-bold text-[11px] mt-1 italic uppercase flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> Hệ điều hành KTPM | 2025
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsNotificationModalOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all text-xs flex items-center gap-2"
          >
            <Megaphone size={16} /> THÔNG BÁO
          </button>
          <button 
            onClick={() => setIsMaintenanceModalOpen(true)}
            className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2 text-xs"
          >
            <Wrench size={16} /> BẢO TRÌ
          </button>
          <button 
            onClick={() => handleOpenAmenityModal()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all text-xs flex items-center gap-2"
          >
            <Plus size={18} strokeWidth={2.5}/> THÊM MỚI
          </button>
        </div>
      </div>

      {/* 7.2 TAB NAVIGATION */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 mb-8 p-1 flex gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: "overview", label: "Tổng Quan", icon: Sparkles },
          { id: "amenities", label: "Danh Mục", icon: Trophy },
          { id: "history", label: "Lịch Sử", icon: History },
          { id: "requests", label: `Duyệt Đơn (${stats.pending})`, icon: Clock },
          { id: "maintenance", label: "Bảo Trì", icon: AlertCircle },
          { id: "notifications", label: "Bản Tin", icon: Bell },
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setSelectedView(tab.id as ViewType)}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all text-[11px] uppercase tracking-wider
              ${selectedView === tab.id ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"}
            `}
          >
            <tab.icon size={15} strokeWidth={2.5} /> {tab.label}
          </button>
        ))}
      </div>

      {/* 7.3 TAB CONTENTS */}

      {selectedView === "overview" && (
        <div className="animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-white text-center">
            <div className="bg-blue-600 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
              <Sparkles className="absolute -right-3 -bottom-3 opacity-10 group-hover:scale-110 transition-transform" size={80} />
              <p className="font-bold opacity-80 text-[9px] uppercase tracking-widest mb-1">TỔNG TIỆN ÍCH</p>
              <p className="text-4xl font-black">{stats.total}</p>
            </div>
            <div className="bg-emerald-500 p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <CalendarIcon className="absolute -right-3 -bottom-3 opacity-10" size={80} />
              <p className="font-bold opacity-80 text-[9px] uppercase tracking-widest mb-1">LỊCH HÔM NAY</p>
              <p className="text-4xl font-black">{stats.today}</p>
            </div>
            <div className="bg-amber-500 p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <Clock className="absolute -right-3 -bottom-3 opacity-10" size={80} />
              <p className="font-bold opacity-80 text-[9px] uppercase tracking-widest mb-1">CHỜ DUYỆT</p>
              <p className="text-4xl font-black">{stats.pending}</p>
            </div>
            <div className="bg-rose-500 p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <Wrench className="absolute -right-3 -bottom-3 opacity-10" size={80} />
              <p className="font-bold opacity-80 text-[9px] uppercase tracking-widest mb-1">BẢO TRÌ</p>
              <p className="text-4xl font-black">{stats.maintenance}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-6 text-slate-800">
            <div className="flex justify-between items-center mb-6 border-b pb-2 text-slate-900">
              <h3 className="text-base font-black uppercase tracking-tight">Đăng ký mới</h3>
              <button onClick={() => setSelectedView("history")} className="text-blue-600 font-bold text-[10px] hover:underline flex items-center gap-1 uppercase">Toàn bộ lịch sử <ChevronRight size={14}/></button>
            </div>
            <div className="space-y-3">
              {allBookings.slice(0, 5).map((b) => (
                <div key={b.id} className="flex justify-between items-center p-4 rounded-xl border bg-slate-50/30 hover:bg-white transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg text-slate-400"><Clock size={18}/></div>
                    <div><h4 className="font-bold text-xs uppercase leading-none mb-1 text-slate-900">{b.amenity?.name}</h4><p className="text-[10px] text-slate-400 font-medium">Cư dân: {b.user?.fullName} | {b.bookingDate}</p></div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${getStatusStyle(b.status)}`}>{b.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedView === "amenities" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {amenities.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all group relative cursor-pointer" onClick={() => handleOpenAmenityModal(a)}>
              <div className="h-44 w-full overflow-hidden bg-slate-100 flex items-center justify-center text-white relative">
                {a.image_url ? (
                   <Image 
                     src={a.image_url} 
                     alt={a.name} 
                     fill 
                     style={{ objectFit: 'cover' }}
                     className="group-hover:scale-110 transition-transform duration-700" 
                     unoptimized
                   />
                ) : (
                   <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getAmenityTheme(a.name).color}`}>{getAmenityTheme(a.name).icon}</div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border border-white/20 shadow-md ${a.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{a.status}</span>
                </div>
              </div>
              <div className="p-5 text-slate-900">
                <h4 className="text-sm font-black uppercase mb-1">{a.name}</h4>
                <p className="text-slate-400 text-[10px] font-medium mb-6 line-clamp-2 h-8 italic">&quot;{a.description}&quot;</p>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleOpenAmenityModal(a); }} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-all text-[10px] uppercase shadow-sm">Hiệu chỉnh</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteAmenity(a.id); }} className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedView === "history" && (
        <div className="flex flex-col lg:flex-row gap-6 animate-in slide-in-from-bottom-4 duration-500 text-slate-800">
          <div className="lg:w-1/3 bg-white rounded-2xl border shadow-sm p-6 h-fit">
            <h3 className="text-xs font-black uppercase mb-4 border-b pb-2 tracking-tighter">Chọn ngày xem lịch</h3>
            <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }} className="w-full p-3 border rounded-xl bg-slate-50 font-bold outline-none focus:border-blue-600 transition-all text-[11px] shadow-inner cursor-pointer" />
          </div>
          <div className="lg:w-2/3 flex flex-col">
            <div className="bg-white rounded-2xl border shadow-sm p-8 min-h-[500px] flex flex-col">
              <h3 className="text-sm font-black uppercase mb-6 border-b pb-3 flex justify-between items-center text-slate-900 tracking-tighter">Nhật ký đăng ký - {selectedDate} <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border">{filteredHistory.length} bản ghi</span></h3>
              <div className="space-y-3 flex-1">
                {paginatedHistory.length > 0 ? paginatedHistory.map((b) => (
                  <div key={b.id} className="p-4 rounded-xl border bg-white hover:shadow-md transition-all flex justify-between items-center group">
                    <div className="flex gap-4 items-center">
                      <div className="w-1 h-10 bg-blue-600 rounded-full"></div>
                      <div>
                        <h4 className="font-black text-xs uppercase leading-none text-slate-900">{b.amenity?.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1.5"><User size={12} className="text-blue-500"/> {b.user?.fullName} | {b.timeSlot}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-lg font-black text-[9px] uppercase border shadow-sm ${getStatusStyle(b.status)}`}>{b.status}</span>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 font-bold italic uppercase gap-4 opacity-50 py-20"><CalendarIcon size={60}/><p className="text-xs">Trống lịch</p></div>
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-center gap-2">{renderPagination()}</div>
            </div>
          </div>
        </div>
      )}

      {selectedView === "requests" && (
        <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-500">
          {allBookings.filter(b => b.status === 'PENDING').length === 0 ? (
            <div className="p-32 text-center bg-white rounded-2xl border-4 border-dashed border-slate-100 opacity-60"><Check size={80} className="mx-auto text-emerald-200 mb-6" /><p className="text-slate-400 font-black uppercase text-base">Đã duyệt hết yêu cầu cư dân</p></div>
          ) : (
            allBookings.filter(b => b.status === 'PENDING').map(request => (
              <div key={request.id} onClick={() => setShowRequestModal(request)} className="bg-white rounded-xl border p-6 flex items-center justify-between shadow-sm hover:shadow-xl cursor-pointer transition-all">
                <div className="flex items-center gap-6">
                  <div className="bg-amber-50 p-4 rounded-xl text-amber-500 shadow-inner"><Clock size={32}/></div>
                  <div className="text-slate-800"><h4 className="font-black text-base uppercase mb-1">{request.amenity?.name || "N/A"}</h4><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest"><User size={14} className="inline mr-1 text-blue-500"/> {request.user?.fullName} | {String(request.bookingDate)}</p></div>
                </div>
                <div className="flex gap-4">
                  <button onClick={(e) => { e.stopPropagation(); handleUpdateBookingStatus(request.id, "REJECTED"); }} className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-black text-[10px] uppercase hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-sm">Từ chối</button>
                  <button onClick={(e) => { e.stopPropagation(); handleUpdateBookingStatus(request.id, "APPROVED"); }} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95"><Check size={18}/> Duyệt đơn</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* HIỂN THỊ MODAL DUYỆT ĐƠN CHI TIẾT */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[9999] p-8 animate-in fade-in duration-500">
           <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl p-8 border-4 border-slate-50 relative overflow-hidden text-slate-900 font-black text-center">
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                 <h3 className="text-lg font-black uppercase">Xác Nhận Yêu Cầu</h3>
                 <button onClick={() => setShowRequestModal(null)}><X size={24}/></button>
              </div>
              <p className="mb-8 font-bold text-slate-600 italic leading-relaxed text-sm">Bạn đang thao tác với lịch đặt của {showRequestModal.user?.fullName} cho {showRequestModal.amenity?.name} vào ngày {showRequestModal.bookingDate}.</p>
              <div className="flex gap-4">
                 <button onClick={() => handleUpdateBookingStatus(showRequestModal.id, "REJECTED")} className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-xl uppercase font-black text-[10px] border border-rose-200">Từ chối yêu cầu</button>
                 <button onClick={() => handleUpdateBookingStatus(showRequestModal.id, "APPROVED")} className="flex-1 py-4 bg-blue-600 text-white rounded-xl uppercase font-black text-[10px] shadow-lg">Duyệt lịch cư dân</button>
              </div>
           </div>
        </div>
      )}

      {selectedView === "maintenance" && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in zoom-in-95 duration-500">
           <div className="flex gap-4 border-b pb-3 mb-8 text-slate-900 font-black uppercase tracking-tight">
              <button onClick={() => setMaintenanceSubView("active")} className={`px-6 py-2 rounded-full text-[10px] uppercase transition-all ${maintenanceSubView === 'active' ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>Đang bảo trì ({amenities.filter(a => a.status === 'MAINTENANCE').length})</button>
              <button onClick={() => setMaintenanceSubView("history")} className={`px-6 py-2 rounded-full text-[10px] uppercase transition-all ${maintenanceSubView === 'history' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>Lịch sử hoàn thành</button>
           </div>
           {maintenanceSubView === 'active' ? (
              <div className="space-y-6">
                 {amenities.filter(a => a.status === 'MAINTENANCE').length === 0 ? <div className="p-20 text-center bg-white rounded-2xl border-4 border-dashed border-slate-50 text-slate-300 font-bold uppercase italic tracking-widest text-base">Không có thiết bị đang bảo trì</div> : (
                    amenities.filter(a => a.status === 'MAINTENANCE').map(a => (
                       <div key={a.id} className="bg-white rounded-2xl p-8 border-2 border-rose-100 flex justify-between items-center shadow-lg relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-2 h-full bg-rose-500 transition-all"></div>
                          <div>
                             <h4 className="text-xl font-black text-slate-900 uppercase leading-none mb-1">{a.name}</h4>
                             <p className="text-rose-500 font-black text-[10px] uppercase flex items-center gap-2 mb-4 tracking-widest"><AlertCircle size={16}/> Tạm ngưng phục vụ</p>
                             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 max-w-lg text-slate-500 font-medium italic text-xs leading-relaxed shadow-inner">&quot;Đang kiểm tra bảo dưỡng kỹ thuật định kỳ.&quot;</div>
                          </div>
                          <button onClick={() => handleEndMaintenance(a.id)} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase shadow-xl hover:bg-emerald-600 transition-all flex items-center gap-2 tracking-widest active:scale-95"><Check size={16} strokeWidth={3}/> Kết thúc bảo trì</button>
                       </div>
                    ))
                 )}
              </div>
           ) : <div className="p-20 text-center text-slate-300 font-black uppercase italic tracking-[0.3em] text-base">Lịch sử bảo trì trống</div>}
        </div>
      )}

      {selectedView === "notifications" && (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 text-slate-800">
           <div className="flex justify-between items-center"><h3 className="text-lg font-black uppercase text-slate-900 tracking-tight leading-none">Bản tin cư dân</h3><button onClick={() => setIsNotificationModalOpen(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg flex items-center gap-2 text-[10px] uppercase hover:bg-blue-700 active:scale-95 transition-all"><Send size={16}/> Gửi tin mới</button></div>
           <div className="bg-white rounded-2xl border shadow-xl divide-y overflow-hidden text-slate-900 font-black">
              {notifications.map(item => (
                <div key={item.id} onClick={() => setSelectedNotification(item)} className="p-8 flex items-start gap-8 hover:bg-slate-50 transition-all cursor-pointer group relative">
                  <div className="bg-blue-50 p-6 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><Bell size={32} strokeWidth={2.5}/></div>
                  <div className="flex-1 pt-1 space-y-2">
                    <div className="flex justify-between items-start">
                        <h4 className="font-black text-base tracking-tight uppercase group-hover:text-blue-600 transition-colors duration-300">{item.title}</h4>
                        <span className="px-4 py-1.5 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest shadow-sm">{item.date}</span>
                    </div>
                    <p className="text-slate-500 font-bold text-xs leading-relaxed italic opacity-80 line-clamp-1">&quot;{item.content}&quot;</p>
                    <div className="flex gap-4 mt-2">
                       <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest"><Users size={12} className="text-blue-500"/> {item.recipient}</span>
                       <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest"><Info size={12} className="text-blue-500"/> {item.type}</span>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-100 mt-4 group-hover:translate-x-2 group-hover:text-blue-500 transition-all" size={32} strokeWidth={4} />
                </div>
              ))}
           </div>
        </div>
      )}

      {/* MODAL THÔNG BÁO CHI TIẾT */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[9999] p-8 animate-in fade-in duration-500">
           <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl border-4 border-slate-50 relative overflow-hidden text-slate-900 font-black">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center gap-4"><Eye className="text-blue-600" size={24} strokeWidth={3} /><h3 className="text-base font-black uppercase tracking-tight">Chi Tiết Bản Tin</h3></div>
                 <button onClick={() => setSelectedNotification(null)} className="p-2 hover:bg-white rounded-full text-slate-300 hover:text-rose-500 transition-all hover:rotate-90 duration-500"><X size={24} strokeWidth={3} /></button>
              </div>
              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-hide text-slate-900">
                 <div className="space-y-2"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase border border-blue-100 shadow-sm">{selectedNotification.type}</span><h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{selectedNotification.title}</h4></div>
                 <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 shadow-inner text-slate-900 font-bold italic opacity-90"><p className="text-sm leading-relaxed whitespace-pre-wrap">&quot;{selectedNotification.content}&quot;</p></div>
                 <div className="flex gap-4"><div className="flex-1 p-4 border rounded-xl bg-white flex items-center gap-3"><Users className="text-blue-500" size={18}/><div className="leading-none"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Đối tượng</p><p className="text-xs font-black text-slate-800 uppercase">{selectedNotification.recipient}</p></div></div><div className="flex-1 p-4 border rounded-xl bg-white flex items-center gap-3"><Check className="text-emerald-500" size={18} strokeWidth={3}/><div className="leading-none"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Trạng thái</p><p className="text-xs font-black text-emerald-600 uppercase">Đã gửi</p></div></div></div>
              </div>
              <div className="p-6 border-t bg-slate-50/50 flex gap-4"><button onClick={() => setSelectedNotification(null)} className="flex-1 py-3 font-black text-slate-400 bg-white border border-slate-200 rounded-xl uppercase tracking-widest text-[10px] shadow-sm active:scale-95 transition-all">Đóng cửa sổ</button></div>
           </div>
        </div>
      )}

      {isNotificationModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[9000] p-4 text-slate-800">
          <div className="bg-white rounded-[1.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden border-2 border-white relative text-slate-900 font-black">
            <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm leading-none">
              <h2 className="text-base font-black uppercase tracking-tight flex items-center gap-3"><Megaphone className="text-indigo-600" size={20}/> Gửi Thông Báo Mới</h2>
              <button onClick={() => setIsNotificationModalOpen(false)} className="p-1.5 hover:bg-slate-50 rounded-full text-slate-300 transition-all hover:rotate-90 duration-500"><X size={24} strokeWidth={3}/></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh] scrollbar-hide text-slate-900 font-bold">
              <div className="space-y-1.5"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề thông báo *</label><input value={notificationFormData.title} onChange={(e) => setNotificationFormData({...notificationFormData, title: e.target.value})} className="w-full p-3.5 border-2 border-slate-100 rounded-xl bg-slate-50/50 font-bold outline-none focus:border-indigo-600 transition-all text-sm shadow-inner" placeholder="Bảo trì thang máy, Vệ sinh định kỳ..." /></div>
              <div className="space-y-1.5"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung chi tiết *</label><textarea rows={5} value={notificationFormData.content} onChange={(e) => setNotificationFormData({...notificationFormData, content: e.target.value})} className="w-full p-4 border-2 border-slate-100 rounded-xl bg-slate-50/50 font-medium outline-none focus:border-indigo-600 transition-all text-xs shadow-inner leading-relaxed" placeholder="Nhập nội dung thông báo gửi cư dân..." /></div>
              <div className="grid grid-cols-2 gap-6 text-slate-900 font-black"><div className="space-y-1.5"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại thông báo</label><select value={notificationFormData.type} onChange={(e) => setNotificationFormData({...notificationFormData, type: e.target.value})} className="w-full p-3.5 border-2 border-slate-100 rounded-xl bg-white font-bold outline-none focus:border-indigo-600 shadow-sm text-sm"><option>Thông báo chung</option><option>Thông báo khẩn cấp</option><option>Thông báo bảo trì</option><option>Thông báo sự kiện</option></select></div><div className="space-y-1.5"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Đối tượng nhận tin</label><select value={notificationFormData.recipient} onChange={(e) => setNotificationFormData({...notificationFormData, recipient: e.target.value})} className="w-full p-3.5 border-2 border-slate-100 rounded-xl bg-white font-bold outline-none focus:border-indigo-600 shadow-sm text-sm"><option>Tất cả cư dân</option><option>Chủ hộ (Owners)</option><option>Khách thuê (Tenants)</option></select></div></div>
            </div>
            <div className="p-5 border-t bg-slate-50/50 flex gap-4 sticky bottom-0 z-10 backdrop-blur-md rounded-b-3xl shadow-inner"><button onClick={() => setIsNotificationModalOpen(false)} className="flex-1 py-3.5 font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest text-[9px] bg-white border border-slate-200 rounded-xl transition-all shadow-sm">Hủy bản nháp</button><button onClick={handleSendNotification} className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase text-[10px] flex items-center justify-center gap-2 active:scale-95 leading-none"><Send size={18} strokeWidth={3} /> PHÁT HÀNH TIN TỨC</button></div>
          </div>
        </div>
      )}

      {/* AMENITY MODAL - TÍCH HỢP MÔ TẢ & NỘI QUY */}
      {isAmenityModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[5000] p-4 overflow-y-auto">
          <div className="bg-white rounded-[1.5rem] w-full max-w-xl my-4 shadow-2xl border-2 border-white animate-in zoom-in-95 duration-300 overflow-hidden relative text-slate-800">
            <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md rounded-t-[1.5rem]"><div><h2 className="text-md font-black uppercase text-slate-900 leading-none mb-1">Thiết Lập Hạ Tầng</h2><p className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-70 italic leading-none">Admin hệ thống</p></div><button onClick={() => setIsAmenityModalOpen(false)} className="p-1.5 hover:bg-white rounded-full text-slate-300 hover:text-rose-500 transition-all border border-slate-100 shadow-sm"><X size={20}/></button></div>
            <div className="p-6 space-y-8 max-h-[75vh] overflow-y-auto scrollbar-hide text-slate-900 font-bold">
               <div className="space-y-6">
                  <div className="space-y-2"><label className="block text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">Tên tiện ích nội khu *</label><input value={amenityFormData.name} onChange={(e) => setAmenityFormData({ ...amenityFormData, name: e.target.value })} className="w-full p-3.5 border-2 border-slate-100 rounded-xl bg-slate-50/50 font-bold text-sm outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner text-slate-900" placeholder="Tên định danh..." /></div>
                  
                  {/* Ô NHẬP MÔ TẢ NGẮN (BỔ SUNG) */}
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">Mô tả tóm tắt tiện ích</label>
                    <textarea rows={2} value={amenityFormData.description} onChange={(e) => setAmenityFormData({...amenityFormData, description: e.target.value})} className="w-full p-3.5 border-2 border-slate-100 rounded-xl bg-slate-50 font-medium text-xs shadow-inner" placeholder="Nhập mô tả ngắn gọn hiển thị trên thẻ tiện ích..."/>
                  </div>

                  {/* Ô NHẬP NỘI QUY CHI TIẾT (BỔ SUNG) */}
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">Quy định sử dụng (Mỗi nội quy một dòng)</label>
                    <textarea rows={4} value={amenityFormData.rules} onChange={(e) => setAmenityFormData({...amenityFormData, rules: e.target.value})} className="w-full p-3.5 border-2 border-slate-100 rounded-xl bg-slate-50 font-medium text-xs shadow-inner" placeholder="- Đeo mũ bơi bắt buộc&#10;- Không mang giày cao gót..."/>
                  </div>

                  <div className="group bg-slate-50/50 p-5 rounded-2xl border-2 border-dashed border-slate-200">
                    <label className="block text-[9px] font-black text-slate-300 mb-3 uppercase tracking-widest">Hình ảnh đại diện hạ tầng</label>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-xl bg-white border-2 border-slate-100 shadow-inner flex items-center justify-center overflow-hidden relative cursor-pointer">
                        {amenityFormData.imagePreview ? (
                          <Image src={amenityFormData.imagePreview} fill style={{ objectFit: 'cover' }} alt="Preview" unoptimized />
                        ) : (
                          <ImageIcon size={32} className="text-slate-100" />
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-[10px] text-slate-400 font-bold italic mb-3 leading-relaxed">&quot;Sử dụng ảnh thực tế để cư dân dễ nhận diện hạ tầng.&quot;</p>
                        <div className="relative">
                           <button className="px-5 py-2 bg-white border-2 border-slate-100 rounded-lg font-black text-[9px] text-slate-500 uppercase tracking-widest hover:border-blue-600 transition-all shadow-sm leading-none flex items-center gap-1">
                             <Upload size={14} /> Tải tệp ảnh
                           </button>
                           <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
               <div className="space-y-4"><div className="flex items-center gap-2 text-blue-600 font-black uppercase text-[9px] tracking-widest border-b pb-1.5 opacity-80 leading-none"><Clock size={14}/> THỜI GIAN VẬN HÀNH</div><div className="grid grid-cols-2 gap-4 text-slate-900 font-black leading-none"><div className="space-y-1.5"><label className="block text-[9px] font-black text-slate-400 uppercase">Mở cửa *</label><input type="time" value={amenityFormData.openTime} onChange={(e) => setAmenityFormData({ ...amenityFormData, openTime: e.target.value })} className="w-full p-3.5 border-2 border-slate-50 rounded-xl bg-white font-black text-sm shadow-inner tracking-widest text-slate-900" /></div><div className="space-y-1.5"><label className="block text-[9px] font-black text-slate-400 uppercase">Đóng cửa *</label><input type="time" value={amenityFormData.closeTime} onChange={(e) => setAmenityFormData({ ...amenityFormData, closeTime: e.target.value })} className="w-full p-3.5 border-2 border-slate-50 rounded-xl bg-white font-black text-sm shadow-inner tracking-widest text-slate-900" /></div></div></div>
               <div className="space-y-4 text-slate-900 font-black leading-none"><div className="flex items-center gap-2 text-blue-600 font-black uppercase text-[9px] tracking-widest border-b pb-1.5 opacity-80"><Settings size={14}/> QUY ĐỊNH ĐĂNG KÝ</div><div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="block text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-tighter">Phút tối đa / lượt</label><input type="number" value={amenityFormData.maxDuration} onChange={(e) => setAmenityFormData({ ...amenityFormData, maxDuration: parseInt(e.target.value) })} className="w-full p-3 border-2 border-slate-50 rounded-xl bg-white font-bold text-sm shadow-inner outline-none" /></div><div className="space-y-1.5"><label className="block text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-tighter">Lượt đặt / tháng</label><input type="number" value={amenityFormData.maxBookingsPerMonth} onChange={(e) => setAmenityFormData({ ...amenityFormData, maxBookingsPerMonth: parseInt(e.target.value) })} className="w-full p-3 border-2 border-slate-50 rounded-xl bg-white font-bold text-sm shadow-inner outline-none" /></div><div className="col-span-1 space-y-1.5"><label className="block text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-tighter">Sức chứa phục vụ</label><input type="number" value={amenityFormData.maxCapacity} onChange={(e) => setAmenityFormData({ ...amenityFormData, maxCapacity: parseInt(e.target.value) })} className="w-full p-3 border-2 border-slate-50 rounded-xl bg-white font-bold text-sm shadow-inner outline-none" /></div><div className="flex items-center gap-3 pt-6 pl-2"><div onClick={() => setAmenityFormData({ ...amenityFormData, requiresApproval: !amenityFormData.requiresApproval })} className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${amenityFormData.requiresApproval ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100" : "bg-white border-slate-200 shadow-inner"}`}>{amenityFormData.requiresApproval && <Check size={20} strokeWidth={5} />}</div><label className="text-[10px] font-black text-slate-700 uppercase cursor-pointer leading-none">BQL duyệt đơn</label></div></div></div>
            </div>
            <div className="p-5 border-t bg-slate-50/50 flex gap-3 sticky bottom-0 z-10 backdrop-blur-md rounded-b-[1.5rem] shadow-inner text-slate-900 leading-none"><button onClick={() => setIsAmenityModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest text-[9px] transition-all border border-slate-200 rounded-xl bg-white shadow-sm">Hủy bỏ</button><button onClick={handleSaveAmenity} className="flex-[1.8] py-4 bg-blue-600 text-white rounded-xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase text-[9px] flex items-center justify-center gap-2 active:scale-95"><Save size={16} strokeWidth={3} /> LƯU DỮ LIỆU</button></div>
          </div>
        </div>
      )}

      {/* MODAL TẠO LỊCH BẢO TRÌ */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[6000] p-4 text-slate-800">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden relative border-2 border-white text-slate-900 font-black">
            <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10"><h2 className="text-base font-black text-slate-900 uppercase tracking-tight leading-none flex items-center gap-2"><Wrench size={18} className="text-amber-500"/> Tạo lịch bảo trì</h2><button onClick={() => setIsMaintenanceModalOpen(false)} className="p-1.5 hover:bg-slate-50 rounded-full text-slate-300 transition-all border border-slate-100 shadow-sm leading-none"><X size={20} strokeWidth={3}/></button></div>
            <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh] scrollbar-hide text-slate-900 font-black">
              <div className="space-y-1.5"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Hạ tầng bảo trì *</label><select value={maintenanceFormData.amenityId} onChange={(e) => setMaintenanceFormData({...maintenanceFormData, amenityId: e.target.value})} className="w-full p-3 border border-slate-100 rounded-xl text-xs bg-slate-50 font-bold focus:border-blue-600 outline-none shadow-inner transition-all"><option value="">-- Chọn tiện ích nội khu --</option>{amenities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-5 text-slate-900 font-black"><div className="space-y-1.5"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày bắt đầu *</label><input type="date" value={maintenanceFormData.startDate} onChange={(e) => setMaintenanceFormData({...maintenanceFormData, startDate: e.target.value})} className="w-full p-3.5 border-2 border-slate-50 rounded-xl text-xs font-black shadow-inner leading-none" /></div><div className="space-y-1.5"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Giờ bắt đầu *</label><input type="time" value={maintenanceFormData.startTime} onChange={(e) => setMaintenanceFormData({...maintenanceFormData, startTime: e.target.value})} className="w-full p-3.5 border-2 border-slate-50 rounded-xl text-xs font-black shadow-inner leading-none" /></div></div>
              <div className="grid grid-cols-2 gap-5 text-slate-900 font-black"><div className="space-y-1.5"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày kết thúc *</label><input type="date" value={maintenanceFormData.endDate} onChange={(e) => setMaintenanceFormData({...maintenanceFormData, endDate: e.target.value})} className="w-full p-3.5 border-2 border-slate-50 rounded-xl text-xs font-black shadow-inner leading-none" /></div><div className="space-y-1.5"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Giờ kết thúc *</label><input type="time" value={maintenanceFormData.endTime} onChange={(e) => setMaintenanceFormData({...maintenanceFormData, endTime: e.target.value})} className="w-full p-3.5 border-2 border-slate-50 rounded-xl text-xs font-black shadow-inner leading-none" /></div></div>
              <div className="space-y-1.5 text-slate-900 font-black leading-none mb-1"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-slate-900 font-black">Lý do bảo dưỡng *</label><textarea rows={3} value={maintenanceFormData.reason} onChange={(e) => setMaintenanceFormData({...maintenanceFormData, reason: e.target.value})} className="w-full p-4 border border-slate-200 rounded-xl text-xs shadow-inner leading-relaxed outline-none focus:border-blue-600 font-bold" placeholder="Nhập lý do chi tiết..." /></div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-700 shadow-sm leading-none"><AlertCircle size={20} strokeWidth={3} className="shrink-0"/><p className="text-[10px] font-black leading-relaxed uppercase tracking-tighter">Phát hiện {stats.pending} đơn đặt lịch bị ảnh hưởng bởi bảo trì.</p></div>
              <div className="space-y-4 text-slate-900 font-black uppercase"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Phương án xử lý đơn trùng</label><div className="space-y-2.5">{[{ id: "CANCEL_ALL", label: "HỦY TOÀN BỘ ĐƠN ĐẶT LỊCH" }, { id: "NOTIFY", label: "GỬI CẢNH BÁO CHO CƯ DÂN" }].map(opt => (<div key={opt.id} onClick={() => setMaintenanceFormData({...maintenanceFormData, conflictAction: opt.id})} className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${maintenanceFormData.conflictAction === opt.id ? "border-blue-600 bg-blue-50/20 shadow-md" : "border-slate-50 bg-white"}`}><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${maintenanceFormData.conflictAction === opt.id ? "border-blue-600 bg-blue-600 shadow-inner shadow-white/20" : "border-slate-200 bg-white"}`}>{maintenanceFormData.conflictAction === opt.id && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}</div><span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter leading-none">{opt.label}</span></div>))}</div></div>
              <div className="flex items-center gap-3 pt-3 pl-2 text-slate-900 font-black leading-none mb-1"><div onClick={() => setMaintenanceFormData({...maintenanceFormData, notifyResidents: !maintenanceFormData.notifyResidents})} className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${maintenanceFormData.notifyResidents ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-100" : "bg-slate-100 shadow-inner"}`}>{maintenanceFormData.notifyResidents && <Check size={14} className="text-white" strokeWidth={5} />}</div><span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter cursor-pointer">Phát hành bản tin cư dân tự động</span></div>
            </div>
            <div className="p-6 border-t bg-slate-50/50 flex gap-4 sticky bottom-0 z-10 backdrop-blur-md rounded-b-2xl shadow-inner text-slate-900 font-black leading-none mb-1"><button onClick={() => setIsMaintenanceModalOpen(false)} className="flex-1 py-3.5 font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest text-[9px] bg-white border border-slate-100 rounded-xl shadow-sm transition-all leading-none">Đóng</button><button onClick={handleCreateMaintenance} className="flex-[2] py-3.5 bg-blue-600 text-white rounded-xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase text-[10px] flex items-center justify-center gap-2 active:scale-95 leading-none"><Save size={16} strokeWidth={3} /> XÁC NHẬN TẠO LỊCH</button></div>
          </div>
        </div>
      )}
    </div>
  );
}