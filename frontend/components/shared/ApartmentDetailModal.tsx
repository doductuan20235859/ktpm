import { X, User, Calendar, Users as UsersIcon, History } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  role: 'OWNER' | 'TENANT' | 'MEMBER';
  phone: string;
  joinDate: string;
}

interface ResidencyHistory {
  id: string;
  date: string;
  event: string;
  description: string;
}

interface Apartment {
  id: string;
  code: string;
  area: number;
  owner: string;
  phone: string;
  status: 'OCCUPIED_OWNER' | 'OCCUPIED_TENANT' | 'AVAILABLE' | 'VACANT' | 'MAINTENANCE';
  members: Member[];
  history: ResidencyHistory[];

}

interface ApartmentDetailModalProps {
  apartment: Apartment;
  onClose: () => void;
}

export function ApartmentDetailModal({ apartment, onClose }: ApartmentDetailModalProps) {
  const getRoleBadge = (role: string) => {
    const styles = {
      OWNER: 'bg-blue-100 text-blue-700',
      TENANT: 'bg-green-100 text-green-700',
      MEMBER: 'bg-gray-100 text-gray-700',
    };
    return styles[role as keyof typeof styles] || styles.MEMBER;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      OCCUPIED_OWNER: { bg: 'bg-green-100 text-green-700', label: 'Chủ hộ đang ở' },
      OCCUPIED_TENANT: { bg: 'bg-blue-100 text-blue-700', label: 'Đang cho thuê' },
      AVAILABLE: { bg: 'bg-yellow-100 text-yellow-700', label: 'Có thể thuê' },
      VACANT: { bg: 'bg-gray-100 text-gray-700', label: 'Trống' },
      MAINTENANCE: { bg: 'bg-red-100 text-red-700', label: 'Đang bảo trì' },
    };
    return styles[status as keyof typeof styles] || styles.VACANT;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-white">Chi Tiết Căn Hộ {apartment.code}</h2>
            <p className="text-sm text-blue-100 mt-1">Thông tin chi tiết và lịch sử cư trú</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Basic Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Mã Căn Hộ</p>
                <p className="text-lg text-gray-900">{apartment.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Diện Tích Net</p>
                <p className="text-lg text-gray-900">{apartment.area} m²</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng Thái</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusBadge(apartment.status).bg}`}>
                  {getStatusBadge(apartment.status).label}
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Chủ Hộ</p>
                <p className="text-lg text-gray-900">{apartment.owner}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số Điện Thoại</p>
                <p className="text-lg text-gray-900">{apartment.phone}</p>
              </div>
              {/* Members Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-blue-600" />
              Danh Sách Thành Viên
            </h3>
            <div className="space-y-3">
              {apartment.members.map((member) => (
                <div
                  key={member.id}
                  className="bg-gray-50 rounded-lg p-4 flex items-start justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.phone}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        Tham gia: {member.joinDate}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${getRoleBadge(member.role)}`}>
                    {member.role === 'OWNER' && 'Chủ hộ'}
                    {member.role === 'TENANT' && 'Người thuê'}
                    {member.role === 'MEMBER' && 'Thành viên'}
                  </span>
                </div>
              ))}
            </div>
          </div>
            </div>
          </div>

          {/* Members Section */}
          

          {/* History Section */}
          <div className="p-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" />
              Lịch Sử Cư Trú
            </h3>
            <div className="space-y-3">
              {apartment.history.map((item, index) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    {index < apartment.history.length - 1 && (
                      <div className="w-0.5 h-full bg-purple-200 mt-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-gray-900">{item.event}</p>
                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                          {item.date}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Đóng
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Cập Nhật Thông Tin
          </button>
        </div>
      </div>
    </div>
  );
}
