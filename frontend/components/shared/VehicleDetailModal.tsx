import {
  X,
  Car,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: any;
}

export function VehicleDetailModal({
  isOpen,
  onClose,
  vehicle,
}: VehicleDetailModalProps) {
  if (!isOpen || !vehicle) return null;

  const getStatusInfo = (status: string) => {
    const statusMap: any = {
      PENDING: {
        label: "Chờ duyệt",
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
        icon: Clock,
      },
      APPROVED: {
        label: "Đã duyệt",
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
        icon: CheckCircle,
      },
      REJECTED: {
        label: "Từ chối",
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: XCircle,
      },
    };
    return (
      statusMap[status] || {
        label: status,
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
        icon: Clock,
      }
    );
  };

  const statusInfo = getStatusInfo(vehicle.status);
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl text-gray-900 font-semibold flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            Chi Tiết Phương Tiện
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Status Badge */}
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${statusInfo.bg} ${statusInfo.border}`}
          >
            <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Trạng thái</p>
              <p className={`font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </p>
            </div>
          </div>

          {/* Vehicle Photo */}
          {vehicle.photoUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh Xe
              </label>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={vehicle.photoUrl}
                  alt={`Xe ${vehicle.plate}`}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/400x300?text=No+Image";
                  }}
                />
              </div>
            </div>
          )}

          {/* Vehicle Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Biển Số Xe</p>
              <p className="text-lg font-bold text-gray-900">{vehicle.plate}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Loại Xe</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {vehicle.type === "car" ? "🚗 Ô tô" : "🏍️ Xe máy"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Thương Hiệu</p>
              <p className="text-lg font-semibold text-gray-900">
                {vehicle.brand || "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Màu Xe</p>
              <p className="text-lg font-semibold text-gray-900">
                {vehicle.color || "N/A"}
              </p>
            </div>
          </div>

          {/* Registration Document */}
          {vehicle.registrationDocUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giấy Đăng Ký Xe
              </label>
              <a
                href={vehicle.registrationDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">
                  Xem tài liệu
                </span>
              </a>
            </div>
          )}

          {/* Created Date */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <div>
                <p className="text-sm">Ngày đăng ký</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(vehicle.createdAt)}
                </p>
              </div>
            </div>
          </div>
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
