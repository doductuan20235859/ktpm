"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Filter, Plus, Edit, Lock, Eye, Download } from "lucide-react";

// Import các Modal
import { ApartmentDetailModal } from "@/components/shared/ApartmentDetailModal";
import { EditApartmentModal } from "@/components/shared/EditApartmentModal";
import { AddApartmentModal } from "@/components/shared/AddApartmentModal";

/* =======================
   TYPES – khớp backend
======================= */
type ApartmentStatus =
  | "OCCUPIED_OWNER"
  | "OCCUPIED_TENANT"
  | "AVAILABLE"
  | "VACANT"
  | "MAINTENANCE";

interface Apartment {
  id: number;
  code: string;
  areaSqm: number;
  status: ApartmentStatus;
  ownerName: string | null;
  ownerPhone: string | null;
  residentCount: number;
}

const statusUI: Record<ApartmentStatus, { label: string; style: string }> = {
  OCCUPIED_OWNER: {
    label: "Chủ hộ đang ở",
    style: "bg-green-100 text-green-700",
  },
  OCCUPIED_TENANT: {
    label: "Đang cho thuê",
    style: "bg-blue-100 text-blue-700",
  },
  AVAILABLE: {
    label: "Có thể thuê",
    style: "bg-yellow-100 text-yellow-700",
  },
  VACANT: {
    label: "Trống",
    style: "bg-gray-100 text-gray-700",
  },
  MAINTENANCE: {
    label: "Bảo trì",
    style: "bg-red-100 text-red-700",
  },
};

export default function ApartmentManagement() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [lockedApartments, setLockedApartments] = useState<number[]>([]); // Lưu ID các căn hộ bị khóa

  // --- LOGIC MODAL ---
  const [selectedApartment, setSelectedApartment] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const toggleLock = (id: number) => {
    setLockedApartments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch("http://localhost:3001/apartments")
      .then((res) => res.json())
      .then((data) => {
        setApartments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  /* =======================
      HÀNH ĐỘNG (ACTION HANDLERS)
  ======================= */

  const handleSaveNewApartment = async (newData: any) => {
    try {
      const res = await fetch("http://localhost:3001/apartments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: `${newData.block}-${newData.unitNumber}`,
          areaSqm: newData.area,
          status: newData.status.toUpperCase(),
          floor: newData.floorLevel,
        }),
      });

      if (res.ok) {
        setIsAddOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Lỗi khi thêm mới:", error);
    }
  };

  const handleView = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3001/apartments/${id}`);
      const data = await res.json();
      const mappedData = {
        ...data,
        area: data.areaSqm,
        owner: data.ownerName || "Chưa rõ",
        phone: data.ownerPhone || "—",
        members:
          data.residents?.map((r: any) => ({
            id: r.id,
            name: r.user?.fullName,
            role: r.isAdmin ? "OWNER" : "MEMBER",
            phone: r.user?.phoneNumber,
            joinDate: new Date(r.createdAt).toLocaleDateString("vi-VN"),
          })) || [],
        history: [],
      };
      setSelectedApartment(mappedData);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
    }
  };

  const handleEdit = (apt: Apartment) => {
    // Chặn chỉnh sửa nếu bị khóa
    if (lockedApartments.includes(apt.id)) {
      alert("Căn hộ này đang bị khóa, không thể chỉnh sửa!");
      return;
    }
    setSelectedApartment({
      id: apt.id.toString(),
      code: apt.code,
      area: apt.areaSqm,
      owner: apt.ownerName || "",
      phone: apt.ownerPhone || "",
      status: apt.status,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (formData: any) => {
    // try {
    //   const res = await fetch(`
    //     ${selectedApartment.id}`, {
    //     method: 'PATCH',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       code: formData.code,        // Thêm mã căn hộ
    //       areaSqm: formData.area,    // Map diện tích sang areaSqm
    //       status: formData.status,    // Trạng thái căn hộ
    //       ownerPhone: formData.phone, // Gửi số điện thoại để Backend xử lý owner_id
    //     }),
    //   });

    //   if (res.ok) {
    //     const updatedApartment = await res.json(); // Lấy dữ liệu đã format từ Backend trả về

    //     // Cập nhật state cục bộ thay vì gọi lại fetchData() để giao diện mượt hơn
    //     setApartments((prev) =>
    //       prev.map((item) =>
    //         item.id === updatedApartment.id
    //           ? {
    //               ...item,
    //               ...updatedApartment,
    //               // Đồng bộ key giữa Backend và Table Frontend
    //               area: updatedApartment.areaSqm,
    //               owner: updatedApartment.ownerName,
    //               phone: updatedApartment.ownerPhone
    //             }
    //           : item
    //       )
    //     );

    //     setIsEditOpen(false);
    //     toast.success("Cập nhật thành công!");
    //   } else {
    //     const errorData = await res.json();
    //     toast.error(errorData.message || "Cập nhật thất bại");
    //   }
    // } catch (error) {
    //   console.error("Lỗi cập nhật:", error);
    //   toast.error("Không thể kết nối đến máy chủ");
    // }

    try {
      const res = await fetch(
        `http://localhost:3001/apartments/${selectedApartment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: formData.code,
            areaSqm: Number(formData.area),
            status: formData.status,
            ownerPhone: formData.phone, // Số điện thoại mới
            ownerName: formData.owner, // Tên chủ hộ mới (Đã thêm trường này)
          }),
        }
      );

      if (res.ok) {
        // 1. Backend trả về Object căn hộ đầy đủ từ hàm findOne(id)
        const updatedApartment = await res.json();

        // 2. Cập nhật State danh sách để giao diện thay đổi ngay lập tức
        setApartments((prev) =>
          prev.map((item) =>
            item.id === updatedApartment.id
              ? {
                  ...item,
                  ...updatedApartment,
                  // Quan trọng: Map lại các key Backend sang key Table đang dùng
                  area: updatedApartment.areaSqm,
                  owner: updatedApartment.ownerName, // fullName từ quan hệ owner
                  phone: updatedApartment.ownerPhone, // phoneNumber từ quan hệ owner
                }
              : item
          )
        );

        setIsEditOpen(false); // Đóng Modal
        toast.success("Cập nhật thông tin căn hộ thành công!");
      } else {
        // Xử lý lỗi trả về từ ValidationPipe của NestJS
        const errorData = await res.json();
        toast.error(
          Array.isArray(errorData.message)
            ? errorData.message[0]
            : errorData.message
        );
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    }
  };
  /* =======================
      FILTER & STATS
  ======================= */
  const filteredApartments = apartments.filter((apt) => {
    const matchesSearch =
      apt.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      (apt.ownerPhone?.includes(searchTerm) ?? false);

    const matchesStatus = statusFilter === "ALL" || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = apartments.length;
  const occupied = apartments.filter((a) =>
    a.status.startsWith("OCCUPIED")
  ).length;
  const vacant = apartments.filter(
    (a) => a.status === "VACANT" || a.status === "AVAILABLE"
  ).length;
  const maintenance = apartments.filter(
    (a) => a.status === "MAINTENANCE"
  ).length;

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl text-gray-900 mb-2 font-bold">
          Quản Lý Hộ Dân
        </h1>
        <p className="text-gray-600">
          Quản lý thông tin căn hộ và cư dân trong chung cư
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã căn hộ, họ tên, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="OCCUPIED_OWNER">Chủ hộ đang ở</option>
              <option value="OCCUPIED_TENANT">Đang cho thuê</option>
              <option value="AVAILABLE">Có thể thuê</option>
              <option value="VACANT">Trống</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" /> Thêm Mới
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Stat title="Tổng Căn Hộ" value={total} />
        <Stat title="Đang Ở" value={occupied} color="text-green-600" />
        <Stat title="Trống" value={vacant} color="text-yellow-600" />
        <Stat title="Bảo Trì" value={maintenance} color="text-red-600" />
        <Stat
          title="Tìm Thấy"
          value={filteredApartments.length}
          color="text-blue-600"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                MÃ CĂN HỘ
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                DIỆN TÍCH (m²)
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                CHỦ HỘ
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                SỐ ĐIỆN THOẠI
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                THÀNH VIÊN
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                TRẠNG THÁI
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                HÀNH ĐỘNG
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredApartments.map((apt) => {
              const badge = statusUI[apt.status];
              const isLocked = lockedApartments.includes(apt.id);
              return (
                <tr
                  key={apt.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    isLocked ? "opacity-75" : ""
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-blue-600">
                    {apt.code}
                  </td>
                  <td className="px-6 py-4">{apt.areaSqm}</td>
                  <td className="px-6 py-4">{apt.ownerName ?? "—"}</td>
                  <td className="px-6 py-4">{apt.ownerPhone ?? "—"}</td>
                  <td className="px-6 py-4">{apt.residentCount ?? "—"}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${badge.style}`}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <Eye
                      className="w-5 h-5 text-blue-600 cursor-pointer hover:scale-110"
                      onClick={() => handleView(apt.id)}
                    />
                    <Edit
                      className={`w-5 h-5 transition-all ${
                        isLocked
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-green-600 cursor-pointer hover:scale-110"
                      }`}
                      onClick={() => handleEdit(apt)}
                    />
                    <Lock
                      className={`w-5 h-5 cursor-pointer hover:scale-110 transition-colors ${
                        isLocked ? "text-orange-500" : "text-red-600"
                      }`}
                      onClick={() => toggleLock(apt.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Render Modals */}
      {isAddOpen && (
        <AddApartmentModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSave={handleSaveNewApartment}
        />
      )}

      {isDetailOpen && selectedApartment && (
        <ApartmentDetailModal
          apartment={selectedApartment}
          onClose={() => setIsDetailOpen(false)}
        />
      )}

      {isEditOpen && selectedApartment && (
        <EditApartmentModal
          isOpen={isEditOpen}
          apartment={selectedApartment}
          onClose={() => setIsEditOpen(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

function Stat({
  title,
  value,
  color = "text-gray-900",
}: {
  title: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
