"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronLeft,
  Bell,
  Users,
  Trash2,
  ListChecks
} from "lucide-react";
import Image from "next/image";
import { amenityService, BookingWithRelations, AmenityHybrid } from "@/lib/services/amenity.service";
import { Amenity } from "@/types/amenity";

// Interface mở rộng để khớp hoàn toàn với các trường dữ liệu từ Database SQL
interface AmenityWithRules extends Omit<Amenity, "rules"> {
  image_url?: string;
  opening_time?: string;
  closing_time?: string;
  max_capacity?: number;
  rules: string[]; 
}

export default function AmenitiesManagement() {
  const [activeTab, setActiveTab] = useState<"list" | "myBookings" | "notifications">("list");
  const [amenities, setAmenities] = useState<AmenityWithRules[]>([]);
  const [myBookings, setMyBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  // Trạng thái cho khung đặt chỗ chi tiết
  const [selectedAmenity, setSelectedAmenity] = useState<AmenityWithRules | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Giả định ID người dùng (Thực tế lấy từ Auth context/Token)
  const currentUserId = 1;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [amenData, bookingData] = await Promise.all([
        amenityService.getAmenities(),
        amenityService.getMyBookings(currentUserId),
      ]);
      
      // FIX LỖI @typescript-eslint/no-explicit-any TẠI DÒNG 53:
      // Định nghĩa kiểu dữ liệu cho item thay vì dùng any
      const formattedAmenities = (amenData as (AmenityWithRules & AmenityHybrid)[]).map((item) => ({
        ...item,
        rules: item.rules || [] // Đảm bảo rules luôn là mảng
      }));

      setAmenities(formattedAmenities);
      setMyBookings(bookingData);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBooking = async () => {
    if (!selectedAmenity || !selectedSlot) {
      alert("Vui lòng chọn đầy đủ ngày và giờ!");
      return;
    }

    try {
      await amenityService.createBooking({
        amenityId: selectedAmenity.id,
        userId: currentUserId,
        bookingDate: selectedDate.toISOString().split("T")[0],
        timeSlot: selectedSlot,
      });
      alert("Đặt lịch thành công!");
      setSelectedAmenity(null);
      setSelectedSlot(null);
      loadData();
      setActiveTab("myBookings");
    } catch (err) {
      console.error("Lỗi đặt lịch:", err);
      alert("Không thể đặt lịch. Vui lòng thử lại.");
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy lịch này không?")) return;
    try {
      await amenityService.cancelBooking(id);
      alert("Đã hủy thành công!");
      loadData();
    } catch (err) {
      console.error("Lỗi khi hủy lịch:", err);
      alert("Lỗi khi hủy lịch.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-black uppercase text-blue-600 tracking-tighter">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-12 border-l-[16px] border-blue-600 pl-8 py-4 bg-white shadow-sm rounded-r-3xl">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter text-gray-900">
          Tiện Ích <span className="text-blue-600">Cư Dân</span>
        </h1>
        <p className="text-gray-400 font-bold uppercase text-sm mt-2 tracking-widest">Dịch vụ đặc quyền dành riêng cho bạn</p>
      </div>

      {/* TABS ĐIỀU HƯỚNG */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {(["list", "myBookings", "notifications"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelectedAmenity(null);
            }}
            className={`py-8 rounded-[2.5rem] shadow-2xl font-black transition-all border-4 uppercase tracking-widest text-lg ${
              activeTab === tab 
                ? "bg-blue-600 text-white border-blue-300 scale-105" 
                : "bg-white text-gray-300 border-transparent hover:border-blue-200 hover:text-blue-400"
            }`}
          >
            {tab === "list" && <><MapPin className="inline mr-2 mb-1" /> Dịch vụ</>}
            {tab === "myBookings" && <><CalendarIcon className="inline mr-2 mb-1" /> Lịch của tôi</>}
            {tab === "notifications" && <><Bell className="inline mr-2 mb-1" /> Thông báo</>}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* VIEW 1: DANH SÁCH TIỆN ÍCH */}
        {activeTab === "list" && !selectedAmenity && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {amenities.map((item: AmenityWithRules) => {
              const hybrid = item as unknown as AmenityHybrid;
              const imageUrl = item.imageUrl || hybrid.image_url || "";
              return (
                <div key={item.id} className="bg-white rounded-[3.5rem] overflow-hidden border-2 border-gray-100 shadow-2xl group transition-all hover:border-blue-500 hover:-translate-y-2">
                  <div className="relative h-72 w-full bg-gray-200 overflow-hidden">
                    <Image
                      src={imageUrl || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48"}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                      unoptimized
                    />
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl font-black text-xs uppercase text-blue-600 shadow-lg">
                      {item.status}
                    </div>
                  </div>
                  <div className="p-10">
                    <h3 className="text-3xl font-black mb-4 uppercase text-gray-800 tracking-tighter">{item.name}</h3>
                    
                    <div className="space-y-4 mb-6">
                       <p className="text-gray-400 font-bold italic text-sm leading-relaxed">&quot;{item.description}&quot;</p>
                       <div className="flex flex-col gap-2 text-gray-500 font-black uppercase text-[10px] tracking-widest">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-blue-500"/> {item.opening_time || item.openingTime} - {item.closing_time || item.closingTime}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-blue-500"/> Sức chứa: {item.max_capacity || item.maxCapacity} người
                          </div>
                       </div>
                    </div>

                    {/* HIỂN THỊ NỘI QUY */}
                    <div className="mb-10 p-5 bg-blue-50/50 rounded-3xl border-2 border-blue-100/50">
                      <p className="text-[11px] font-black text-blue-800 uppercase mb-3 flex items-center gap-2">
                        <ListChecks size={14}/> Quy định sử dụng:
                      </p>
                      <ul className="space-y-2">
                        {item.rules && item.rules.length > 0 ? (
                          item.rules.slice(0, 3).map((rule: string, idx: number) => (
                            <li key={idx} className="text-[10px] font-bold text-gray-600 flex items-start gap-2">
                              <span className="text-blue-600 mt-0.5">•</span> {rule}
                            </li>
                          ))
                        ) : (
                          <li className="text-[10px] font-medium text-gray-400 italic">Chưa cập nhật nội quy</li>
                        )}
                        {item.rules && item.rules.length > 3 && (
                          <li className="text-[9px] font-black text-blue-500 uppercase italic ml-4">
                            + {item.rules.length - 3} quy định khác...
                          </li>
                        )}
                      </ul>
                    </div>

                    <button
                      onClick={() => setSelectedAmenity(item)}
                      className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl shadow-blue-100"
                    >
                      Xem Lịch & Đặt Chỗ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: KHUNG ĐẶT CHỖ CHI TIẾT */}
        {activeTab === "list" && selectedAmenity && (
          <div className="bg-white rounded-[4rem] border-4 border-gray-50 p-12 md:p-20 shadow-2xl">
            <button 
              onClick={() => setSelectedAmenity(null)} 
              className="flex items-center gap-2 text-blue-600 mb-12 font-black uppercase italic hover:translate-x-[-8px] transition-all"
            >
              <ChevronLeft /> Quay lại danh sách
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
              <div>
                <h2 className="text-4xl font-black mb-10 uppercase italic border-b-8 border-blue-100 pb-4 inline-block">01. Chọn ngày</h2>
                <div className="bg-gray-50 p-8 rounded-[3.5rem] border-2 border-gray-100 grid grid-cols-7 gap-3">
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = i + 1;
                    const isSelected = selectedDate.getDate() === day;
                    return (
                      <button 
                        key={day} 
                        onClick={() => setSelectedDate(new Date(2025, 11, day))} 
                        className={`h-14 rounded-2xl font-black text-lg transition-all ${isSelected ? "bg-blue-600 text-white scale-110 shadow-lg" : "bg-white text-gray-400 border-2 border-transparent hover:border-blue-300"}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <h2 className="text-4xl font-black mb-4 uppercase italic">{selectedAmenity.name}</h2>
                <div className="grid grid-cols-2 gap-4 mb-12">
                  {selectedAmenity.bookingSlots?.map((slot: string) => (
                    <button 
                      key={slot} 
                      onClick={() => setSelectedSlot(slot)} 
                      className={`p-6 rounded-3xl border-4 font-black transition-all ${selectedSlot === slot ? "border-blue-600 bg-blue-600 text-white" : "border-gray-100 bg-white text-gray-400"}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {selectedSlot && (
                  <button 
                    onClick={handleBooking} 
                    className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-2xl uppercase hover:bg-gray-900 transition-all"
                  >
                    Xác nhận đặt ngay
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: LỊCH SỬ ĐẶT CHỖ */}
        {activeTab === "myBookings" && (
          <div className="bg-white rounded-[4rem] border-2 border-gray-50 p-16 shadow-2xl">
            <h2 className="text-4xl font-black mb-12 uppercase italic border-b-8 border-gray-900 pb-2 inline-block tracking-tighter text-gray-800">
              Lịch sử của tôi
            </h2>
            <div className="grid gap-8">
              {myBookings.length > 0 ? (
                myBookings.map((b: BookingWithRelations) => (
                  <div key={b.id} className="group p-10 border-4 border-gray-50 rounded-[3.5rem] flex flex-col md:flex-row justify-between items-center bg-gray-50/50 hover:bg-white hover:border-blue-100 transition-all hover:shadow-xl">
                    <div className="flex gap-8 items-center mb-6 md:mb-0">
                      <div className="h-24 w-24 bg-white rounded-3xl flex items-center justify-center text-blue-600 border-4 border-blue-50 shadow-inner group-hover:scale-110 transition-transform">
                        <CalendarIcon size={40} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h4 className="font-black text-3xl text-gray-800 uppercase tracking-tighter leading-none mb-2">
                          {b.amenity?.name || b.amenityName || "Dịch vụ cư dân"}
                        </h4>
                        <div className="flex items-center gap-4 text-gray-400 font-bold italic text-lg">
                          <span className="bg-gray-200 px-3 py-1 rounded-lg not-italic text-sm">{b.bookingDate}</span>
                          <span className="text-blue-500">•</span>
                          <span className="text-sm">{b.timeSlot}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                      <span className={`px-12 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm ${
                        String(b.status) === "APPROVED" ? "bg-green-100 text-green-700 border-b-4 border-green-200" : 
                        String(b.status) === "PENDING" ? "bg-amber-100 text-amber-700 border-b-4 border-amber-200" : 
                        "bg-rose-100 text-rose-700 border-b-4 border-rose-200"
                      }`}>
                        {String(b.status)}
                      </span>
                      <button 
                        onClick={() => handleCancelBooking(b.id)}
                        className="flex items-center gap-2 px-6 py-4 bg-white text-rose-600 border-2 border-rose-100 rounded-2xl font-black uppercase text-xs hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        <Trash2 size={16} /> Hủy lịch
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-32 rounded-[4rem] border-8 border-dashed border-gray-100">
                  <p className="font-black text-gray-200 uppercase italic text-5xl tracking-tighter">
                    Chưa có dữ liệu đăng ký
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: THÔNG BÁO */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-[4rem] border-2 border-gray-50 p-16 shadow-2xl text-center">
            <Bell size={80} className="mx-auto text-gray-100 mb-6" />
            <h2 className="text-3xl font-black text-gray-300 uppercase italic tracking-widest">Hộp thư trống</h2>
          </div>
        )}
      </div>
    </div>
  );
}