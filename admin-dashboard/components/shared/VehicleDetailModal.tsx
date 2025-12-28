import { X, Car, FileText } from 'lucide-react';

interface VehicleDetail {
  id: string;
  plate: string;
  type: 'car' | 'motorcycle';
  vehicleType: string;
  color: string;
  brand: string;
  ownerName: string;
  apartmentNumber: string;
  phone: string;
  vehiclePhoto?: string;
  registrationDoc?: string;
  idCard?: string;
  contractDoc?: string;
  registrationDate?: string;
  status?: 'active' | 'pending' | 'expired';
}

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleDetail | null;
}

export function VehicleDetailModal({
  isOpen,
  onClose,
  vehicle,
}: VehicleDetailModalProps) {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl text-gray-900">Chi Tiết Xe</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Vehicle Photo */}
          {vehicle.vehiclePhoto && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Ảnh Chụp Xe
              </label>
              <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={vehicle.vehiclePhoto}
                  alt={`Xe ${vehicle.plate}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Vehicle Information Section */}
          <div>
            <h3 className="text-lg text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Thông Tin Phương Tiện
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Biển Số Xe
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{vehicle.plate}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Loại Phương Tiện
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">
                    {vehicle.type === 'car' ? 'Ô tô' : 'Xe máy'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Loại Xe
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{vehicle.vehicleType || 'Không có thông tin'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Thương Hiệu
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{vehicle.brand}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Màu Xe
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ 
                      backgroundColor: 
                        vehicle.color === 'white' ? '#ffffff' :
                        vehicle.color === 'black' ? '#000000' :
                        vehicle.color === 'silver' ? '#c0c0c0' :
                        vehicle.color === 'gray' ? '#808080' :
                        vehicle.color === 'red' ? '#ff0000' :
                        vehicle.color === 'blue' ? '#0000ff' :
                        vehicle.color === 'yellow' ? '#ffff00' :
                        vehicle.color === 'green' ? '#00ff00' :
                        vehicle.color === 'brown' ? '#8b4513' :
                        '#d1d5db'
                    }}
                  />
                  <p className="text-gray-900 capitalize">{vehicle.color}</p>
                </div>
              </div>

              {vehicle.status && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Trạng Thái
                  </label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs ${
                        vehicle.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : vehicle.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {vehicle.status === 'active'
                        ? 'Đang hoạt động'
                        : vehicle.status === 'pending'
                        ? 'Chờ duyệt'
                        : 'Hết hạn'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Owner Information Section */}
          <div>
            <h3 className="text-lg text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Thông Tin Chủ Xe
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Tên Chủ Xe
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{vehicle.ownerName}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Số Căn Hộ
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{vehicle.apartmentNumber}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Số Điện Thoại
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{vehicle.phone}</p>
                </div>
              </div>

              {vehicle.registrationDate && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Ngày Đăng Ký
                  </label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{vehicle.registrationDate}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documents Section */}
          {(vehicle.registrationDoc || vehicle.idCard || vehicle.contractDoc) && (
            <div>
              <h3 className="text-lg text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Tài Liệu Đính Kèm
              </h3>
              <div className="space-y-3">
                {vehicle.registrationDoc && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Giấy Đăng Ký Xe</p>
                      <p className="text-xs text-gray-500">{vehicle.registrationDoc}</p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Xem
                    </button>
                  </div>
                )}

                {vehicle.idCard && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Giấy CMND/CCCD</p>
                      <p className="text-xs text-gray-500">{vehicle.idCard}</p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Xem
                    </button>
                  </div>
                )}

                {vehicle.contractDoc && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Hợp Đồng Đăng Ký</p>
                      <p className="text-xs text-gray-500">{vehicle.contractDoc}</p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Xem
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
