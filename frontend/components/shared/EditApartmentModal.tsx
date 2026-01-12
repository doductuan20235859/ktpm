import { useState, useRef } from "react";
import { X, Upload, Camera } from "lucide-react";
import { toast } from "sonner";

type ApartmentStatus =
  | "OCCUPIED_OWNER"
  | "OCCUPIED_TENANT"
  | "AVAILABLE"
  | "VACANT"
  | "MAINTENANCE";

interface EditApartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  apartment: {
    id: string;
    code: string;
    area: number;
    owner: string;
    phone: string;
    status: ApartmentStatus;
  };
  onUpdate: (data: ApartmentUpdateData) => void;
}

export interface ApartmentUpdateData {
  code: string;
  area: number;
  owner: string;
  phone: string;
  status: ApartmentStatus;
  avatarUrl?: string;
  coverUrl?: string;
}

export function EditApartmentModal({
  isOpen,
  onClose,
  apartment,
  onUpdate,
}: EditApartmentModalProps) {
  const [formData, setFormData] = useState<ApartmentUpdateData>({
    code: apartment.code,
    area: apartment.area,
    owner: apartment.owner,
    phone: apartment.phone,
    status: apartment.status,
  });

  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [coverPreview, setCoverPreview] = useState<string>("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái loading
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleInputChange = (
    field: keyof ApartmentUpdateData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setFormData((prev) => ({ ...prev, avatarUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCoverPreview(result);
        setFormData((prev) => ({ ...prev, coverUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Vui lòng nhập mã căn hộ";
    }

    if (!formData.owner.trim()) {
      newErrors.owner = "Vui lòng nhập tên chủ hộ";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (formData.area <= 0) {
      newErrors.area = "Diện tích phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // const response = await fetch(`http://localhost:3001/apartments/${apartment.id}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     code: formData.code,
      //     areaSqm: formData.area, // Lưu ý: Backend dùng areaSqm
      //     status: formData.status,
      //     // Nếu bạn muốn cập nhật thông tin chủ hộ, backend cần xử lý ownerId
      //   }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || "Lỗi cập nhật");
      // }

      // const updatedData = await response.json();

      // toast.success("Cập nhật căn hộ thành công!");
      // onUpdate(updatedData); // Gọi callback để cập nhật lại danh sách ở trang cha
      // onClose(); // Đóng modal
      await onUpdate(formData);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Lỗi cập nhật");
    } finally {
      setIsSubmitting(false);
    }
  };
  const statusOptions = [
    { value: "OCCUPIED_OWNER", label: "Chủ hộ đang ở" },
    { value: "OCCUPIED_TENANT", label: "Đang cho thuê" },
    { value: "AVAILABLE", label: "Sẵn sàng cho thuê" },
    // { value: "VACANT", label: "Trống" },
    { value: "MAINTENANCE", label: "Đang bảo trì" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-xl text-white">Cập Nhật Căn Hộ</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            {/* Cover Image Upload
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Ảnh Bìa
                </label>
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="relative h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors group"
                >
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-gray-50 group-hover:bg-gray-100">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Tải lên ảnh bìa</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Kích thước tối đa: 5MB
                      </p>
                    </div>
                  )}
                  {coverPreview && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </div> */}

            {/* Avatar Upload */}
            {/* <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Ảnh Đại Diện
                </label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-full overflow-hidden cursor-pointer hover:border-blue-500 transition-colors group"
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full bg-gray-50 group-hover:bg-gray-100">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    {avatarPreview && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div> */}
            {/* <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">
                      Tải lên ảnh đại diện cho căn hộ
                    </p>
                    <p className="text-xs text-gray-400">
                      Định dạng: JPG, PNG. Kích thước tối đa: 5MB
                    </p>
                  </div> */}
            {/* </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div> */}

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Mã Căn Hộ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.code ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="VD: A-101"
                />
                {errors.code && (
                  <p className="text-xs text-red-500 mt-1">{errors.code}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Diện Tích (m²) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) =>
                    handleInputChange("area", parseFloat(e.target.value))
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.area ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="VD: 68.5"
                  step="0.1"
                />
                {errors.area && (
                  <p className="text-xs text-red-500 mt-1">{errors.area}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Chủ Hộ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => handleInputChange("owner", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.owner ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tên chủ hộ"
              />
              {errors.owner && (
                <p className="text-xs text-red-500 mt-1">{errors.owner}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Số Điện Thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0901234567"
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Trạng Thái <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  handleInputChange("status", e.target.value as ApartmentStatus)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang lưu...
              </>
            ) : (
              "Cập Nhật"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
