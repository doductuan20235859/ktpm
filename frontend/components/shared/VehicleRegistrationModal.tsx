import { X, Camera, Upload, Loader2, AlertCircle } from "lucide-react";

interface VehicleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleForm: {
    ownerName: string;
    apartmentNumber: string;
    phone: string;
    vehicleCategory: "car" | "motorcycle";
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
  isSubmitting?: boolean;
}

export function VehicleRegistrationModal({
  isOpen,
  onClose,
  vehicleForm,
  onFormChange,
  onSubmit,
  isSubmitting = false,
}: VehicleRegistrationModalProps) {
  if (!isOpen) return null;

  const handleFileChange = (field: string, file: File | null) => {
    onFormChange({ ...vehicleForm, [field]: file });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange("vehiclePhoto", file);
  };

  const vehicleColors = [
    { value: "", label: "Chọn màu xe..." },
    { value: "Trắng", label: "Trắng" },
    { value: "Đen", label: "Đen" },
    { value: "Bạc", label: "Bạc" },
    { value: "Xám", label: "Xám" },
    { value: "Đỏ", label: "Đỏ" },
    { value: "Xanh dương", label: "Xanh dương" },
    { value: "Vàng", label: "Vàng" },
    { value: "Xanh lá", label: "Xanh lá" },
    { value: "Nâu", label: "Nâu" },
    { value: "Cam", label: "Cam" },
    { value: "Tím", label: "Tím" },
    { value: "Khác", label: "Khác" },
  ];

  // Validation helpers
  const isFormValid = () => {
    return (
      vehicleForm.plate.trim() !== "" &&
      vehicleForm.brand.trim() !== "" &&
      vehicleForm.color !== ""
    );
  };

  const getFileDisplay = (file: File | null, fieldName: string) => {
    if (!file) return null;

    const maxLength = 30;
    const fileName = file.name;
    const displayName =
      fileName.length > maxLength
        ? fileName.substring(0, maxLength - 3) + "..."
        : fileName;

    return (
      <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
        <Upload className="w-4 h-4 text-green-600 flex-shrink-0" />
        <span
          className="text-sm text-green-700 flex-1 truncate"
          title={fileName}
        >
          {displayName}
        </span>
        <button
          type="button"
          onClick={() => handleFileChange(fieldName, null)}
          className="text-red-600 hover:bg-red-100 rounded p-1"
          disabled={isSubmitting}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={isSubmitting ? undefined : onClose}
      />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl text-gray-900 font-semibold">
            Form Đăng Ký Xe Mới
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Đóng"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-5">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Lưu ý quan trọng:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Vui lòng điền đầy đủ thông tin có dấu (*)</li>
                <li>
                  Biển số xe sẽ được tự động chuẩn hóa (VD: 30a12345 →
                  30A-12345)
                </li>
                <li>Yêu cầu của bạn sẽ được BQL xét duyệt trong 24-48h</li>
              </ul>
            </div>
          </div>

          {/* Thông tin chủ xe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Tên Chủ Xe <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={vehicleForm.ownerName}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                title="Thông tin tự động điền từ tài khoản"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Số Căn Hộ
              </label>
              <input
                type="text"
                value={vehicleForm.apartmentNumber}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                title="Thông tin tự động điền từ tài khoản"
              />
            </div>
          </div>

          {/* Loại Phương Tiện */}
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
                  checked={vehicleForm.vehicleCategory === "car"}
                  onChange={(e) =>
                    onFormChange({
                      ...vehicleForm,
                      vehicleCategory: e.target.value as "car" | "motorcycle",
                    })
                  }
                  disabled={isSubmitting}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">🚗 Ô tô</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="vehicleCategory"
                  value="motorcycle"
                  checked={vehicleForm.vehicleCategory === "motorcycle"}
                  onChange={(e) =>
                    onFormChange({
                      ...vehicleForm,
                      vehicleCategory: e.target.value as "car" | "motorcycle",
                    })
                  }
                  disabled={isSubmitting}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">🏍️ Xe máy</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Biển Số */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Biển Số Xe <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={vehicleForm.plate}
                onChange={(e) =>
                  onFormChange({ ...vehicleForm, plate: e.target.value })
                }
                placeholder="VD: 30A-12345"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg uppercase focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Nhập biển số xe (sẽ tự động chuẩn hóa)
              </p>
            </div>
            {/* Thương hiệu */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Thương Hiệu <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={vehicleForm.brand}
                onChange={(e) =>
                  onFormChange({ ...vehicleForm, brand: e.target.value })
                }
                placeholder="VD: Honda, Toyota, Yamaha..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Màu Xe */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Màu Xe <span className="text-red-600">*</span>
            </label>
            <select
              value={vehicleForm.color}
              onChange={(e) =>
                onFormChange({ ...vehicleForm, color: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              {vehicleColors.map((color) => (
                <option key={color.value} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Tài Liệu Đính Kèm (Tùy chọn)
            </h3>
          </div>

          {/* Upload Ảnh Xe */}
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
                disabled={isSubmitting}
              />
              <label
                htmlFor="vehiclePhoto"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg transition-colors ${
                  isSubmitting
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:border-green-500 hover:bg-green-50"
                }`}
              >
                {vehicleForm.vehiclePhoto ? (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-green-600 mx-auto mb-1" />
                    <span className="text-sm text-green-600 font-medium">
                      {vehicleForm.vehiclePhoto.name}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Nhấn để thay đổi
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <span className="text-sm text-gray-500">
                      Chạm để tải ảnh
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG tối đa 5MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Giấy Đăng Ký Xe */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Giấy Đăng Ký Xe
            </label>
            <div className="relative">
              <input
                type="file"
                id="registrationDoc"
                accept="image/*,.pdf"
                onChange={(e) =>
                  handleFileChange(
                    "registrationDoc",
                    e.target.files?.[0] || null
                  )
                }
                className="hidden"
                disabled={isSubmitting}
              />
              <label
                htmlFor="registrationDoc"
                className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 transition-colors ${
                  isSubmitting
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:border-green-500 hover:bg-green-50"
                }`}
              >
                <Upload className="w-5 h-5" />
                {vehicleForm.registrationDoc ? "Thay đổi file" : "Chọn file"}
              </label>
              {getFileDisplay(vehicleForm.registrationDoc, "registrationDoc")}
            </div>
          </div>

          {/* CMND/CCCD */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Giấy CMND/CCCD
            </label>
            <div className="relative">
              <input
                type="file"
                id="idCard"
                accept="image/*,.pdf"
                onChange={(e) =>
                  handleFileChange("idCard", e.target.files?.[0] || null)
                }
                className="hidden"
                disabled={isSubmitting}
              />
              <label
                htmlFor="idCard"
                className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 transition-colors ${
                  isSubmitting
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:border-green-500 hover:bg-green-50"
                }`}
              >
                <Upload className="w-5 h-5" />
                {vehicleForm.idCard ? "Thay đổi file" : "Chọn file"}
              </label>
              {getFileDisplay(vehicleForm.idCard, "idCard")}
            </div>
          </div>

          {/* Hợp Đồng */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Hợp Đồng (nếu có)
            </label>
            <div className="relative">
              <input
                type="file"
                id="contractDoc"
                accept="image/*,.pdf"
                onChange={(e) =>
                  handleFileChange("contractDoc", e.target.files?.[0] || null)
                }
                className="hidden"
                disabled={isSubmitting}
              />
              <label
                htmlFor="contractDoc"
                className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 transition-colors ${
                  isSubmitting
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:border-green-500 hover:bg-green-50"
                }`}
              >
                <Upload className="w-5 h-5" />
                {vehicleForm.contractDoc ? "Thay đổi file" : "Chọn file"}
              </label>
              {getFileDisplay(vehicleForm.contractDoc, "contractDoc")}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !isFormValid()}
            className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              !isFormValid() ? "Vui lòng điền đầy đủ thông tin bắt buộc" : ""
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
              </>
            ) : (
              "Gửi Đăng Ký"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
