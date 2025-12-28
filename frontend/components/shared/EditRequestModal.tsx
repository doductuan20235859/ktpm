import { useState, useRef, useEffect } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

type Priority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
type Category =
  | "ELECTRIC"
  | "WATER"
  | "SECURITY"
  | "CLEANING"
  | "ELEVATOR"
  | "OTHER";
type RequestStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";

interface Apartment {
  id: number;
  code: string;
  buildingName: string;
}

interface EditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    id: string;
    ticketCode: string;
    title: string;
    apartmentCode: string;
    building: string;
    category: Category;
    priority: Priority;
    status: RequestStatus;
    description: string;
    assignedTo?: string;
  };
  onUpdate: (data: RequestUpdateData) => void;
}

export interface RequestUpdateData {
  title: string;
  apartmentCode: string;
  building: string;
  category: Category;
  priority: Priority;
  status: RequestStatus;
  description: string;
  assignedTo?: string;
  attachments?: string[];
  apartmentId?: number;
}

export function EditRequestModal({
  isOpen,
  onClose,
  request,
  onUpdate,
}: EditRequestModalProps) {
  const [formData, setFormData] = useState<RequestUpdateData>({
    title: request.title,
    apartmentCode: request.apartmentCode,
    building: request.building,
    category: request.category,
    priority: request.priority,
    status: request.status,
    description: request.description,
    assignedTo: request.assignedTo || "",
    attachments: [],
  });

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [apartmentSearch, setApartmentSearch] = useState("");
  const [showApartmentDropdown, setShowApartmentDropdown] = useState(false);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredApartments = apartments.filter(apt =>
    apt.code.toLowerCase().includes(apartmentSearch.toLowerCase()) ||
    apt.buildingName.toLowerCase().includes(apartmentSearch.toLowerCase())
  );

  const selectedApartment = apartments.find(apt => apt.id === formData.apartmentId);

  // Fetch apartments
  useEffect(() => {
    if (isOpen) {
      const fetchApartments = async () => {
        try {
          const response = await fetch('http://localhost:3001/apartments');
          if (response.ok) {
            const data = await response.json();
            setApartments(data);
            // Match apartment by code
            const matchingApt = data.find((apt: Apartment) => apt.code === request.apartmentCode);
            if (matchingApt) {
              setFormData(prev => ({ ...prev, apartmentId: matchingApt.id }));
            }
          }
        } catch (error) {
          console.error('Error fetching apartments:', error);
        }
      };
      fetchApartments();
    }
  }, [isOpen, request.apartmentCode]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof RequestUpdateData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSelectApartment = (apartment: Apartment) => {
    setFormData((prev) => ({
      ...prev,
      apartmentId: apartment.id,
      apartmentCode: apartment.code,
      building: apartment.buildingName,
    }));
    setApartmentSearch("");
    setShowApartmentDropdown(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);

      // Check total files
      if (attachmentPreviews.length + fileArray.length > 5) {
        toast.error("Chỉ được tải lên tối đa 5 ảnh");
        return;
      }

      fileArray.forEach((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} vượt quá 5MB`);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setAttachmentPreviews((prev) => [...prev, result]);
          setFormData((prev) => ({
            ...prev,
            attachments: [...(prev.attachments || []), result],
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachmentPreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề";
    }

    if (!formData.apartmentCode.trim() || !formData.building.trim()) {
      newErrors.apartmentCode = "Vui lòng chọn căn hộ";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả chi tiết";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      toast.success("Đang cập nhật yêu cầu...", { duration: 2000 });
      onUpdate(formData);
    } else {
      toast.error("Vui lòng điền đầy đủ thông tin", { duration: 3000 });
    }
  };

  const categoryOptions = [
    {
      value: "ELECTRIC",
      label: "⚡ Điện",
      color: "bg-yellow-100 text-yellow-700",
    },
    { value: "WATER", label: "💧 Nước", color: "bg-blue-100 text-blue-700" },
    {
      value: "SECURITY",
      label: "🔒 An ninh",
      color: "bg-red-100 text-red-700",
    },
    {
      value: "CLEANING",
      label: "🧹 Vệ sinh",
      color: "bg-green-100 text-green-700",
    },
    {
      value: "ELEVATOR",
      label: "🛗 Thang máy",
      color: "bg-purple-100 text-purple-700",
    },
    { value: "OTHER", label: "📋 Khác", color: "bg-gray-100 text-gray-700" },
  ];

  const priorityOptions = [
    { value: "LOW", label: "Thấp", color: "bg-gray-100 text-gray-700" },
    {
      value: "NORMAL",
      label: "Bình thường",
      color: "bg-blue-100 text-blue-700",
    },
    { value: "HIGH", label: "Cao", color: "bg-orange-100 text-orange-700" },
    { value: "CRITICAL", label: "Khẩn cấp", color: "bg-red-100 text-red-700" },
  ];

  const statusOptions = [
    { value: "NEW", label: "Mới", color: "bg-blue-100 text-blue-700" },
    {
      value: "IN_PROGRESS",
      label: "Đang xử lý",
      color: "bg-orange-100 text-orange-700",
    },
    {
      value: "RESOLVED",
      label: "Đã giải quyết",
      color: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700">
          <div>
            <h2 className="text-xl text-white">Cập Nhật Yêu Cầu</h2>
            <p className="text-sm text-blue-100 mt-1">{request.ticketCode}</p>
          </div>
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
            {/* Title */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Tiêu Đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tiêu đề yêu cầu"
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Apartment */}
            <div className="relative">
              <label className="block text-sm text-gray-700 mb-2">
                Căn hộ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={selectedApartment ? `${selectedApartment.code} - ${selectedApartment.buildingName}` : apartmentSearch}
                onChange={(e) => {
                  setApartmentSearch(e.target.value);
                  setFormData(prev => ({ ...prev, apartmentId: undefined }));
                  setShowApartmentDropdown(true);
                }}
                onFocus={() => setShowApartmentDropdown(true)}
                onBlur={() => setTimeout(() => setShowApartmentDropdown(false), 200)}
                placeholder="Gõ để tìm căn hộ..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.apartmentCode ? "border-red-500" : "border-gray-300"
                }`}
              />
              {showApartmentDropdown && filteredApartments.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredApartments.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => handleSelectApartment(apt)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {apt.code} - {apt.buildingName}
                    </div>
                  ))}
                </div>
              )}
              {errors.apartmentCode && (
                <p className="text-xs text-red-500 mt-1">{errors.apartmentCode}</p>
              )}
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Hạng Mục <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Mức Độ Ưu Tiên <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Trạng Thái <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  handleInputChange("status", e.target.value as RequestStatus)
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

            {/* Assigned To */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Người Xử Lý
              </label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) =>
                  handleInputChange("assignedTo", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên người xử lý (tùy chọn)"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Mô Tả Chi Tiết <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Mô tả chi tiết về yêu cầu..."
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Image Attachments */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Đính Kèm Ảnh
              </label>
              <div className="space-y-3">
                {/* Preview Grid */}
                {attachmentPreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {attachmentPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => removeAttachment(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {attachmentPreviews.length < 5 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Tải lên ảnh đính kèm
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Tối đa 5 ảnh, mỗi ảnh không quá 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cập Nhật
          </button>
        </div>
      </div>
    </div>
  );
}
