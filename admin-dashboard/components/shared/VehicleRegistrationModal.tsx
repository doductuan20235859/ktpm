import { X, Camera, Upload } from 'lucide-react';

interface VehicleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleForm: {
    ownerName: string;
    apartmentNumber: string;
    phone: string;
    vehicleCategory: 'car' | 'motorcycle';
    vehicleType: string;
    plate: string;
    brand: string;
    color: string;
    vehiclePhoto: File | null;
    registrationDoc: File | null;
    idCard: File | null;
    contractDoc: File | null;
  };
  onFormChange: (form: any) => void;
  onSubmit: () => void;
}

export function VehicleRegistrationModal({
  isOpen,
  onClose,
  vehicleForm,
  onFormChange,
  onSubmit,
}: VehicleRegistrationModalProps) {
  if (!isOpen) return null;

  const handleFileChange = (field: string, file: File | null) => {
    onFormChange({ ...vehicleForm, [field]: file });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange('vehiclePhoto', file);
  };

  const vehicleColors = [
    { value: '', label: 'Chọn màu xe...' },
    { value: 'white', label: 'Trắng' },
    { value: 'black', label: 'Đen' },
    { value: 'silver', label: 'Bạc' },
    { value: 'gray', label: 'Xám' },
    { value: 'red', label: 'Đỏ' },
    { value: 'blue', label: 'Xanh dương' },
    { value: 'yellow', label: 'Vàng' },
    { value: 'green', label: 'Xanh lá' },
    { value: 'brown', label: 'Nâu' },
    { value: 'other', label: 'Khác' },
  ];

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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-gray-900">Form Đăng Ký Xe Mới</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-5">
          {/* Tên Chủ Xe */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Tên Chủ Xe <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={vehicleForm.ownerName}
              onChange={(e) => onFormChange({ ...vehicleForm, ownerName: e.target.value })}
              placeholder="Nhập tên chủ xe..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Số Căn Hộ */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Số Căn Hộ <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={vehicleForm.apartmentNumber}
              onChange={(e) => onFormChange({ ...vehicleForm, apartmentNumber: e.target.value })}
              placeholder="Nhập số căn hộ..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Số Điện Thoại */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Số Điện Thoại <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={vehicleForm.phone}
              onChange={(e) => onFormChange({ ...vehicleForm, phone: e.target.value })}
              placeholder="Nhập số điện thoại..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Loại Phương Tiện - Radio Buttons */}
          <div>
            <label className="block text-sm text-gray-700 mb-3">
              Loại Phương Tiện <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="vehicleCategory"
                  value="car"
                  checked={vehicleForm.vehicleCategory === 'car'}
                  onChange={(e) => onFormChange({ ...vehicleForm, vehicleCategory: e.target.value as 'car' | 'motorcycle' })}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Ô tô</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="vehicleCategory"
                  value="motorcycle"
                  checked={vehicleForm.vehicleCategory === 'motorcycle'}
                  onChange={(e) => onFormChange({ ...vehicleForm, vehicleCategory: e.target.value as 'car' | 'motorcycle' })}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Xe máy</span>
              </label>
            </div>
          </div>

          {/* Biển Số Xe */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Biển Số Xe <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={vehicleForm.plate}
              onChange={(e) => onFormChange({ ...vehicleForm, plate: e.target.value })}
              placeholder="Nhập biển số xe (VD: 29A-12345)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Loại Xe */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Loại Xe <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={vehicleForm.vehicleType}
              onChange={(e) => onFormChange({ ...vehicleForm, vehicleType: e.target.value })}
              placeholder={vehicleForm.vehicleCategory === 'car' ? 'VD: Sedan, SUV, Hatchback...' : 'VD: Xe tay ga, Xe số...'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Thương Hiệu Xe */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Thương Hiệu Xe <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={vehicleForm.brand}
              onChange={(e) => onFormChange({ ...vehicleForm, brand: e.target.value })}
              placeholder="Nhập thương hiệu xe (VD: Toyota, Honda, Yamaha)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Màu Xe - Dropdown */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Màu Xe <span className="text-red-600">*</span>
            </label>
            <select
              value={vehicleForm.color}
              onChange={(e) => onFormChange({ ...vehicleForm, color: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {vehicleColors.map((color) => (
                <option key={color.value} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ảnh Chụp Xe */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Ảnh Chụp Xe
            </label>
            <div className="relative">
              <input
                type="file"
                id="vehiclePhoto"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <label
                htmlFor="vehiclePhoto"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  {vehicleForm.vehiclePhoto ? (
                    <>
                      <Upload className="w-10 h-10 text-green-600" />
                      <span className="text-sm text-green-600">
                        {vehicleForm.vehiclePhoto.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        Chạm để thay đổi ảnh
                      </span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-10 h-10 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Chạm để tải ảnh lên
                      </span>
                      <span className="text-xs text-gray-500">
                        Định dạng: JPG, PNG (tối đa 5MB)
                      </span>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Giấy Đăng Ký Xe */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Giấy Đăng Ký Xe
            </label>
            <input
              type="file"
              onChange={(e) => handleFileChange('registrationDoc', e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {vehicleForm.registrationDoc && (
              <p className="mt-1 text-xs text-gray-600">
                {vehicleForm.registrationDoc.name}
              </p>
            )}
          </div>

          {/* Giấy CMND/CCCD */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Giấy CMND/CCCD
            </label>
            <input
              type="file"
              onChange={(e) => handleFileChange('idCard', e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {vehicleForm.idCard && (
              <p className="mt-1 text-xs text-gray-600">
                {vehicleForm.idCard.name}
              </p>
            )}
          </div>

          {/* Hợp Đồng Đăng Ký */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Hợp Đồng Đăng Ký
            </label>
            <input
              type="file"
              onChange={(e) => handleFileChange('contractDoc', e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {vehicleForm.contractDoc && (
              <p className="mt-1 text-xs text-gray-600">
                {vehicleForm.contractDoc.name}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Gửi Đăng Ký
          </button>
        </div>
      </div>
    </div>
  );
}
