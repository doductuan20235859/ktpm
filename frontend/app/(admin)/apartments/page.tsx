'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Lock,
  Eye,
  Download,
} from 'lucide-react';

/* =======================
   TYPES – khớp backend
======================= */
type ApartmentStatus =
  | 'OCCUPIED_OWNER'
  | 'OCCUPIED_TENANT'
  | 'AVAILABLE'
  | 'VACANT'
  | 'MAINTENANCE';

interface Apartment {
  id: number;
  code: string;
  areaSqm: number;
  status: ApartmentStatus;
  ownerName: string | null;
  ownerPhone: string | null;
}

/* =======================
   STATUS UI MAP
======================= */
const statusUI: Record<
  ApartmentStatus,
  { label: string; style: string }
> = {
  OCCUPIED_OWNER: {
    label: 'Chủ hộ đang ở',
    style: 'bg-green-100 text-green-700',
  },
  OCCUPIED_TENANT: {
    label: 'Đang cho thuê',
    style: 'bg-blue-100 text-blue-700',
  },
  AVAILABLE: {
    label: 'Có thể thuê',
    style: 'bg-yellow-100 text-yellow-700',
  },
  VACANT: {
    label: 'Trống',
    style: 'bg-gray-100 text-gray-700',
  },
  MAINTENANCE: {
    label: 'Bảo trì',
    style: 'bg-red-100 text-red-700',
  },
};

export default function ApartmentManagement() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  /* =======================
     FETCH DATA FROM BACKEND
  ======================= */
  useEffect(() => {
    fetch('http://localhost:3001/apartments')
      .then((res) => res.json())
      .then((data) => {
        setApartments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* =======================
     FILTER
  ======================= */
  const filteredApartments = apartments.filter((apt) => {
    const matchesSearch =
      apt.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      (apt.ownerPhone?.includes(searchTerm) ?? false);

    const matchesStatus =
      statusFilter === 'ALL' || apt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* =======================
     STATS (FROM DB)
  ======================= */
  const total = apartments.length;
  const occupied = apartments.filter((a) =>
    a.status.startsWith('OCCUPIED')
  ).length;
  const vacant = apartments.filter(
    (a) => a.status === 'VACANT' || a.status === 'AVAILABLE'
  ).length;
  const maintenance = apartments.filter(
    (a) => a.status === 'MAINTENANCE'
  ).length;

  if (loading) {
    return <div className="p-6">Đang tải dữ liệu...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl text-gray-900 mb-2">Quản Lý Hộ Dân</h1>
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
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
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
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
              <Plus className="w-5 h-5" />
              Thêm Mới
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg">
              <Download className="w-5 h-5" />
              Xuất Excel
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
        <Stat title="Tìm Thấy" value={filteredApartments.length} color="text-blue-600" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-600">MÃ CĂN HỘ</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">DIỆN TÍCH (m²)</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">CHỦ HỘ</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">SỐ ĐIỆN THOẠI</th>
              <th className="px-6 py-3 text-left text-xs text-gray-600">TRẠNG THÁI</th>
              <th className="px-6 py-3 text-right text-xs text-gray-600">HÀNH ĐỘNG</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredApartments.map((apt) => {
              const badge = statusUI[apt.status];
              return (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-blue-600">{apt.code}</td>
                  <td className="px-6 py-4">{apt.areaSqm}</td>
                  <td className="px-6 py-4">{apt.ownerName ?? '—'}</td>
                  <td className="px-6 py-4">{apt.ownerPhone ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${badge.style}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Eye className="w-4 h-4 text-blue-600 cursor-pointer" />
                    <Edit className="w-4 h-4 text-green-600 cursor-pointer" />
                    <Lock className="w-4 h-4 text-red-600 cursor-pointer" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredApartments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Không tìm thấy căn hộ nào
          </div>
        )}
      </div>
    </div>
  );
}

/* =======================
   SMALL STAT CARD
======================= */
function Stat({
  title,
  value,
  color = 'text-gray-900',
}: {
  title: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className={`text-2xl mt-1 ${color}`}>{value}</p>
    </div>
  );
}
