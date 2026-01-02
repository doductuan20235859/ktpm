import { useState, useEffect } from "react";
import { AlertTriangle, X, Trash2, AlertCircle } from "lucide-react";
// Đảm bảo bạn import đúng interface Amenity
// Nếu file này nằm cùng thư mục với page.tsx thì import từ file types hoặc copy interface
import { Amenity } from "@/app/types/amenity";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  amenity: Amenity | null; // Nhận vào object Amenity cần xử lý
  onConfirmDelete: (id: number) => void; // Hàm callback khi chọn Xóa
  onConfirmSuspend: (id: number) => void; // Hàm callback khi chọn Ngưng
}

export function DeleteModal({
  isOpen,
  onClose,
  amenity,
  onConfirmDelete,
  onConfirmSuspend,
}: DeleteConfirmModalProps) {
  // Quản lý state lựa chọn hành động ngay trong Modal
  const [deleteAction, setDeleteAction] = useState<"DELETE" | "SUSPEND">(
    "SUSPEND"
  );

  // Reset state về mặc định mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      setDeleteAction("SUSPEND");
    }
  }, [isOpen]);

  if (!isOpen || !amenity) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg text-gray-900">Xác Nhận Xóa</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-200 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Thông tin tiện ích */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Tiện ích:</p>
            <p className="text-gray-900 font-medium mt-1">{amenity.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              Trạng thái: {amenity.isActive ? "Đang hoạt động" : "Đã tắt"}
            </p>
          </div>

          {/* Cảnh báo */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">
              Hành động này sẽ ảnh hưởng đến các lịch đặt phòng liên quan.
            </p>
          </div>

          {/* Lựa chọn hành động (Radio Buttons) */}
          <div>
            <label className="block text-sm text-gray-700 mb-2 font-medium">
              Chọn hành động:
            </label>
            <div className="space-y-2">
              {/* Option 1: Ngưng sử dụng */}
              <label
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  deleteAction === "SUSPEND"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="deleteAction"
                  value="SUSPEND"
                  checked={deleteAction === "SUSPEND"}
                  onChange={() => setDeleteAction("SUSPEND")}
                  className="mt-1"
                />
                <div>
                  <p className="text-gray-900 font-medium">
                    Ngưng sử dụng (Khuyên dùng)
                  </p>
                  <p className="text-sm text-gray-600">
                    Chuyển trạng thái sang "Tạm ngưng". Dữ liệu lịch sử được giữ
                    lại.
                  </p>
                </div>
              </label>

              {/* Option 2: Xóa vĩnh viễn */}
              <label
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  deleteAction === "DELETE"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="deleteAction"
                  value="DELETE"
                  checked={deleteAction === "DELETE"}
                  onChange={() => setDeleteAction("DELETE")}
                  className="mt-1"
                />
                <div>
                  <p className="text-gray-900 font-medium text-red-700">
                    Xóa vĩnh viễn
                  </p>
                  <p className="text-sm text-gray-600">
                    Chỉ xóa được khi chưa có ai đặt lịch. Dữ liệu sẽ mất hoàn
                    toàn.
                  </p>
                </div>
              </label>
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
            onClick={() => {
              if (deleteAction === "DELETE") {
                onConfirmDelete(amenity.id);
              } else {
                onConfirmSuspend(amenity.id);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${
              deleteAction === "DELETE"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {deleteAction === "DELETE" ? (
              <Trash2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            Xác Nhận {deleteAction === "DELETE" ? "Xóa" : "Ngưng Sử Dụng"}
          </button>
        </div>
      </div>
    </div>
  );
}
