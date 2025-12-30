import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type Priority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
type Category =
  | "ELECTRIC"
  | "WATER"
  | "SECURITY"
  | "CLEANING"
  | "ELEVATOR"
  | "OTHER";

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RequestFormData) => void;
}

export interface RequestFormData {
  title: string;
  apartmentId: number;
  category: Category;
  priority: Priority;
  description: string;
  createdBy: string;
  createdByUserId?: number;
}

interface Apartment {
  id: number;
  code: string;
  buildingName: string;
}

export function CreateRequestModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateRequestModalProps) {
  const [formData, setFormData] = useState<RequestFormData>({
    title: "",
    apartmentId: 0,
    category: "OTHER",
    priority: "NORMAL",
    description: "",
    createdBy: "Ban quản lý",
  });

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [apartmentSearch, setApartmentSearch] = useState("");
  const [showApartmentDropdown, setShowApartmentDropdown] = useState(false);
  const [adminUserId, setAdminUserId] = useState<number | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredApartments = apartments.filter(apt =>
    apt.code.toLowerCase().includes(apartmentSearch.toLowerCase()) ||
    apt.buildingName.toLowerCase().includes(apartmentSearch.toLowerCase())
  );

  const selectedApartment = apartments.find(apt => apt.id === formData.apartmentId);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoadingApartments(true);
        try {
          const token = localStorage.getItem("accessToken");
          // Fetch apartments
          const apartmentsResponse = await fetch('http://localhost:3001/apartments', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (apartmentsResponse.ok) {
            const data = await apartmentsResponse.json();
            setApartments(data);
          } else {
            console.error('Failed to fetch apartments');
          }

          // Fetch admin user
          try {
            const usersResponse = await fetch('http://localhost:3001/users', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (usersResponse.ok) {
              const users = await usersResponse.json();
              // Find admin user
              const adminUser = users.find((user: any) => user.role === 'ADMIN');
              if (adminUser) {
                setAdminUserId(adminUser.id);
                setFormData((prev) => ({
                  ...prev,
                  createdBy: adminUser.name || 'Ban quản lý',
                }));
              } else {
                // No admin user found, set default
                setAdminUserId(1);
                setFormData((prev) => ({
                  ...prev,
                  createdBy: 'Ban quản lý',
                }));
              }
            } else {
              // Fetch failed, set default
              setAdminUserId(1);
              setFormData((prev) => ({
                ...prev,
                createdBy: 'Ban quản lý',
              }));
            }
          } catch (error) {
            console.warn('Error fetching users, using default admin:', error);
            // Set default values if fetch fails
            setAdminUserId(1);
            setFormData((prev) => ({
              ...prev,
              createdBy: 'Ban quản lý',
            }));
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoadingApartments(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof RequestFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề";
    }

    if (!formData.apartmentId) {
      newErrors.apartmentId = "Vui lòng chọn căn hộ";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả chi tiết";
    }

    if (!formData.createdBy.trim()) {
      newErrors.createdBy = "Vui lòng nhập người tạo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        ...formData,
        createdByUserId: adminUserId || undefined,
      });
      toast.success("Tạo yêu cầu thành công!", {
        description: `Mã yêu cầu: REQ-2024-${String(
          Math.floor(Math.random() * 1000)
        ).padStart(3, "0")}`,
        duration: 3000,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      apartmentId: 0,
      category: "OTHER",
      priority: "NORMAL",
      description: "",
      createdBy: "Ban quản lý",
    });
    setApartmentSearch("");
    setShowApartmentDropdown(false);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-modal-appear pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-2xl text-white">Tạo Yêu Cầu Mới</h2>
              <p className="text-blue-100 text-sm mt-1">
                Điền thông tin chi tiết yêu cầu/phản ánh
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="VD: Thang máy số 2 bị hỏng"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Apartment and Created By */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm text-gray-700 mb-2">
                    Căn hộ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedApartment ? `${selectedApartment.code} - ${selectedApartment.buildingName}` : apartmentSearch}
                    onChange={(e) => {
                      setApartmentSearch(e.target.value);
                      setFormData(prev => ({ ...prev, apartmentId: 0 }));
                      setShowApartmentDropdown(true);
                    }}
                    onFocus={() => setShowApartmentDropdown(true)}
                    onBlur={() => setTimeout(() => setShowApartmentDropdown(false), 200)}
                    placeholder="Gõ để tìm căn hộ..."
                    disabled={loadingApartments}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.apartmentId ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {showApartmentDropdown && filteredApartments.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredApartments.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, apartmentId: apt.id }));
                            setApartmentSearch("");
                            setShowApartmentDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {apt.code} - {apt.buildingName}
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.apartmentId && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.apartmentId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Người tạo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.createdBy}
                    readOnly
                    className={`w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed ${
                      errors.createdBy ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.createdBy && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.createdBy}
                    </p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Hạng mục <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      value: "ELECTRIC",
                      label: "Điện",
                      color: "border-yellow-500 bg-yellow-50 text-yellow-700",
                    },
                    {
                      value: "WATER",
                      label: "Nước",
                      color: "border-blue-500 bg-blue-50 text-blue-700",
                    },
                    {
                      value: "SECURITY",
                      label: "An ninh",
                      color: "border-red-500 bg-red-50 text-red-700",
                    },
                    {
                      value: "CLEANING",
                      label: "Vệ sinh",
                      color: "border-green-500 bg-green-50 text-green-700",
                    },
                    {
                      value: "ELEVATOR",
                      label: "Thang máy",
                      color: "border-purple-500 bg-purple-50 text-purple-700",
                    },
                    {
                      value: "OTHER",
                      label: "Khác",
                      color: "border-gray-500 bg-gray-50 text-gray-700",
                    },
                  ].map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() =>
                        handleInputChange(
                          "category",
                          category.value as Category
                        )
                      }
                      className={`px-4 py-3 rounded-lg border-2 transition-all text-sm ${
                        formData.category === category.value
                          ? category.color
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Mức độ ưu tiên <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    {
                      value: "LOW",
                      label: "Thấp",
                      color: "border-gray-400 bg-gray-50 text-gray-700",
                    },
                    {
                      value: "NORMAL",
                      label: "Bình thường",
                      color: "border-blue-500 bg-blue-50 text-blue-700",
                    },
                    {
                      value: "HIGH",
                      label: "Cao",
                      color: "border-orange-500 bg-orange-50 text-orange-700",
                    },
                    {
                      value: "CRITICAL",
                      label: "Khẩn cấp",
                      color: "border-red-500 bg-red-50 text-red-700",
                    },
                  ].map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() =>
                        handleInputChange(
                          "priority",
                          priority.value as Priority
                        )
                      }
                      className={`px-4 py-3 rounded-lg border-2 transition-all text-sm ${
                        formData.priority === priority.value
                          ? priority.color
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Mô tả chi tiết vấn đề cần xử lý..."
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {formData.description.length}/500 ký tự
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Tạo yêu cầu
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-modal-appear {
          animation: modal-appear 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
