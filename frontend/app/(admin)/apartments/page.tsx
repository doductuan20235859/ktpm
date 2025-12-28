"use client";
import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Lock,
  Eye,
  Download,
  X,
} from "lucide-react";
import { ApartmentDetailModal } from "@/components/shared/ApartmentDetailModal";
import {
  AddApartmentModal,
  NewApartmentData,
} from "@/components/shared/AddApartmentModal";
import {
  EditApartmentModal,
  ApartmentUpdateData,
} from "@/components/shared/EditApartmentModal";
import { toast } from "sonner";

type ApartmentStatus =
  | "OCCUPIED_OWNER"
  | "OCCUPIED_TENANT"
  | "AVAILABLE"
  | "VACANT"
  | "MAINTENANCE";

interface Apartment {
  id: string;
  code: string;
  area: number;
  owner: string;
  phone: string;
  status: ApartmentStatus;
  members: Array<{
    id: string;
    name: string;
    role: "OWNER" | "TENANT" | "MEMBER";
    phone: string;
    joinDate: string;
  }>;
  history: Array<{
    id: string;
    date: string;
    event: string;
    description: string;
  }>;
}

// Mock data
const mockApartments: Apartment[] = [
  {
    id: "1",
    code: "A-101",
    area: 68.5,
    owner: "Nguyễn Văn An",
    phone: "0901234567",
    status: "OCCUPIED_OWNER",
    members: [
      {
        id: "1",
        name: "Nguyễn Văn An",
        role: "OWNER",
        phone: "0901234567",
        joinDate: "15/01/2022",
      },
      {
        id: "2",
        name: "Trần Thị Bình",
        role: "MEMBER",
        phone: "0912345678",
        joinDate: "15/01/2022",
      },
      {
        id: "3",
        name: "Nguyễn Văn Cường",
        role: "MEMBER",
        phone: "0923456789",
        joinDate: "20/03/2023",
      },
    ],
    history: [
      {
        id: "1",
        date: "15/01/2022",
        event: "Chuyển vào",
        description: "Gia đình chuyển vào căn hộ",
      },
      {
        id: "2",
        date: "20/03/2023",
        event: "Thêm thành viên",
        description: "Thêm Nguyễn Văn Cường vào hộ",
      },
    ],
  },
  {
    id: "2",
    code: "A-102",
    area: 72.0,
    owner: "Trần Thị Bảo",
    phone: "0902345678",
    status: "OCCUPIED_TENANT",
    members: [
      {
        id: "4",
        name: "Trần Thị Bảo",
        role: "OWNER",
        phone: "0902345678",
        joinDate: "10/03/2021",
      },
      {
        id: "5",
        name: "Lê Văn Đức",
        role: "TENANT",
        phone: "0913456789",
        joinDate: "01/06/2024",
      },
    ],
    history: [
      {
        id: "3",
        date: "10/03/2021",
        event: "Mua căn hộ",
        description: "Trần Thị Bảo mua căn hộ",
      },
      {
        id: "4",
        date: "01/06/2024",
        event: "Cho thuê",
        description: "Cho thuê cho Lê Văn Đức",
      },
    ],
  },
  {
    id: "3",
    code: "A-103",
    area: 85.0,
    owner: "Phạm Văn Cường",
    phone: "0903456789",
    status: "OCCUPIED_OWNER",
    members: [
      {
        id: "6",
        name: "Phạm Văn Cường",
        role: "OWNER",
        phone: "0903456789",
        joinDate: "22/08/2020",
      },
      {
        id: "7",
        name: "Nguyễn Thị Dung",
        role: "MEMBER",
        phone: "0924567890",
        joinDate: "22/08/2020",
      },
    ],
    history: [
      {
        id: "5",
        date: "22/08/2020",
        event: "Chuyển vào",
        description: "Gia đình chuyển vào căn hộ",
      },
    ],
  },
  {
    id: "4",
    code: "B-201",
    area: 95.5,
    owner: "Lê Thị Hoa",
    phone: "0904567890",
    status: "AVAILABLE",
    members: [],
    history: [
      {
        id: "6",
        date: "10/11/2024",
        event: "Trống",
        description: "Căn hộ sẵn sàng cho thuê",
      },
    ],
  },
  {
    id: "5",
    code: "B-202",
    area: 68.5,
    owner: "Hoàng Văn Khoa",
    phone: "0905678901",
    status: "MAINTENANCE",
    members: [],
    history: [
      {
        id: "7",
        date: "05/12/2024",
        event: "Bảo trì",
        description: "Đang sửa chữa hệ thống điện",
      },
    ],
  },
  {
    id: "6",
    code: "B-203",
    area: 72.0,
    owner: "Đỗ Thị Lan",
    phone: "0906789012",
    status: "OCCUPIED_OWNER",
    members: [
      {
        id: "8",
        name: "Đỗ Thị Lan",
        role: "OWNER",
        phone: "0906789012",
        joinDate: "15/05/2023",
      },
    ],
    history: [
      {
        id: "8",
        date: "15/05/2023",
        event: "Chuyển vào",
        description: "Đỗ Thị Lan chuyển vào",
      },
    ],
  },
  {
    id: "7",
    code: "C-301",
    area: 110.0,
    owner: "Vũ Văn Minh",
    phone: "0907890123",
    status: "OCCUPIED_TENANT",
    members: [
      {
        id: "9",
        name: "Vũ Văn Minh",
        role: "OWNER",
        phone: "0907890123",
        joinDate: "01/01/2022",
      },
      {
        id: "10",
        name: "Bùi Thị Nga",
        role: "TENANT",
        phone: "0918901234",
        joinDate: "01/09/2024",
      },
      {
        id: "11",
        name: "Bùi Văn Oanh",
        role: "MEMBER",
        phone: "0929012345",
        joinDate: "01/09/2024",
      },
    ],
    history: [
      {
        id: "9",
        date: "01/01/2022",
        event: "Mua căn hộ",
        description: "Vũ Văn Minh mua căn hộ",
      },
      {
        id: "10",
        date: "01/09/2024",
        event: "Cho thuê",
        description: "Cho thuê cho gia đình Bùi Thị Nga",
      },
    ],
  },
  {
    id: "8",
    code: "C-302",
    area: 68.5,
    owner: "Ngô Văn Phú",
    phone: "0908901234",
    status: "VACANT",
    members: [],
    history: [
      {
        id: "11",
        date: "20/11/2024",
        event: "Chuyển đi",
        description: "Chủ cũ chuyển đi",
      },
    ],
  },
];

export default function ApartmentManagement() {
  const [apartments] = useState<Apartment[]>(mockApartments);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const getStatusBadge = (status: ApartmentStatus) => {
    const styles = {
      OCCUPIED_OWNER: "bg-green-100 text-green-700",
      OCCUPIED_TENANT: "bg-blue-100 text-blue-700",
      AVAILABLE: "bg-yellow-100 text-yellow-700",
      VACANT: "bg-gray-100 text-gray-700",
      MAINTENANCE: "bg-red-100 text-red-700",
    };
    const labels = {
      OCCUPIED_OWNER: "Chủ hộ đang ở",
      OCCUPIED_TENANT: "Đang cho thuê",
      AVAILABLE: "Có thể thuê",
      VACANT: "Trống",
      MAINTENANCE: "Bảo trì",
    };
    return { style: styles[status], label: labels[status] };
  };

  // Filter logic
  const filteredApartments = apartments.filter((apt) => {
    const matchesSearch =
      apt.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.phone.includes(searchTerm);

    const matchesStatus = statusFilter === "ALL" || apt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl text-gray-900 mb-2">Quản Lý Hộ Dân</h1>
        <p className="text-gray-600">
          Quản lý thông tin căn hộ và cư dân trong chung cư
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã căn hộ, họ tên, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="OCCUPIED_OWNER">Chủ hộ đang ở</option>
              <option value="OCCUPIED_TENANT">Đang cho thuê</option>
              <option value="AVAILABLE">Có thể thuê</option>
              <option value="VACANT">Trống</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Thêm Mới
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5" />
              Xuất Excel
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Tổng Căn Hộ</p>
          <p className="text-2xl text-gray-900 mt-1">{apartments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Đang Ở</p>
          <p className="text-2xl text-green-600 mt-1">
            {apartments.filter((a) => a.status.startsWith("OCCUPIED")).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Trống</p>
          <p className="text-2xl text-yellow-600 mt-1">
            {
              apartments.filter(
                (a) => a.status === "AVAILABLE" || a.status === "VACANT"
              ).length
            }
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Bảo Trì</p>
          <p className="text-2xl text-red-600 mt-1">
            {apartments.filter((a) => a.status === "MAINTENANCE").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Tìm Thấy</p>
          <p className="text-2xl text-blue-600 mt-1">
            {filteredApartments.length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Mã Căn Hộ
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Diện Tích (m²)
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Chủ Hộ
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Số Điện Thoại
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Thành Viên
                </th>
                <th className="px-6 py-3 text-right text-xs text-gray-600 uppercase tracking-wider">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApartments.map((apartment) => {
                const badge = getStatusBadge(apartment.status);
                return (
                  <tr
                    key={apartment.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedApartment(apartment)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-blue-600">{apartment.code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {apartment.area}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {apartment.owner}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {apartment.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${badge.style}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {apartment.members.length} người
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApartment(apartment);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApartment(apartment);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Cập nhật"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                `Bạn có chắc muốn khóa hồ sơ ${apartment.code}?`
                              )
                            ) {
                              alert("Đã khóa hồ sơ");
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Khóa hồ sơ"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredApartments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy căn hộ nào phù hợp</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedApartment && (
        <ApartmentDetailModal
          apartment={selectedApartment}
          onClose={() => setSelectedApartment(null)}
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddApartmentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={(newApartment: NewApartmentData) => {
            console.log("New apartment created:", newApartment);
            // In production, this would be an API call
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedApartment && (
        <EditApartmentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedApartment(null);
          }}
          apartment={selectedApartment}
          onUpdate={(updatedData: ApartmentUpdateData) => {
            console.log("Apartment updated:", updatedData);
            toast.success("Căn hộ đã được cập nhật thành công!");
            setShowEditModal(false);
            setSelectedApartment(null);
          }}
        />
      )}
    </div>
  );
}
