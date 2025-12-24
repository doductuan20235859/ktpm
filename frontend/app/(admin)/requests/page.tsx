"use client";
import { use, useState } from "react";
import {
  Plus,
  Filter,
  Search,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { RequestDetailModal } from "@/components/shared/RequestDetailModal";
import {
  CreateRequestModal,
  RequestFormData,
} from "@/components/shared/CreateRequestModal";
import { toast } from "sonner";

type RequestStatus = "NEW" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type Priority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
type Category =
  | "ELECTRIC"
  | "WATER"
  | "SECURITY"
  | "CLEANING"
  | "ELEVATOR"
  | "OTHER";

interface Request {
  id: string;
  ticketCode: string;
  title: string;
  apartmentCode: string;
  category: Category;
  priority: Priority;
  status: RequestStatus;
  createdDate: string;
  createdBy: string;
  assignedTo?: string;
  description: string;
  notes: Array<{
    id: string;
    author: string;
    content: string;
    date: string;
  }>;
}

const mockRequests: Request[] = [
  {
    id: "1",
    ticketCode: "REQ-2024-001",
    title: "Thang máy số 2 bị kẹt",
    apartmentCode: "A-101",
    category: "ELEVATOR",
    priority: "CRITICAL",
    status: "IN_PROGRESS",
    createdDate: "14/12/2024 09:30",
    createdBy: "Nguyễn Văn An",
    assignedTo: "Kỹ thuật Phạm Đức",
    description: "Thang máy số 2 bị kẹt tại tầng 5, có người mắc kẹt bên trong",
    notes: [
      {
        id: "1",
        author: "Kỹ thuật Phạm Đức",
        content: "Đã tiếp nhận, đang di chuyển đến hiện trường",
        date: "14/12/2024 09:35",
      },
    ],
  },
  {
    id: "2",
    ticketCode: "REQ-2024-002",
    title: "Rò rỉ nước tại hành lang tầng 3",
    apartmentCode: "B-301",
    category: "WATER",
    priority: "HIGH",
    status: "NEW",
    createdDate: "14/12/2024 10:15",
    createdBy: "Trần Thị Bảo",
    description:
      "Phát hiện nước rò rỉ từ trần hành lang tầng 3, khu vực gần thang máy",
    notes: [],
  },
  {
    id: "3",
    ticketCode: "REQ-2024-003",
    title: "Đèn hành lang tầng 7 không sáng",
    apartmentCode: "C-702",
    category: "ELECTRIC",
    priority: "NORMAL",
    status: "ASSIGNED",
    createdDate: "13/12/2024 18:20",
    createdBy: "Lê Văn Cường",
    assignedTo: "Điện Lực Nguyễn",
    description: "Đèn hành lang tầng 7 khu C không sáng từ 2 ngày trước",
    notes: [
      {
        id: "2",
        author: "Bảo vệ",
        content: "Đã xác nhận, đèn không hoạt động",
        date: "13/12/2024 19:00",
      },
    ],
  },
  {
    id: "4",
    ticketCode: "REQ-2024-004",
    title: "Vệ sinh bể nước ngầm",
    apartmentCode: "BQL",
    category: "CLEANING",
    priority: "NORMAL",
    status: "RESOLVED",
    createdDate: "10/12/2024 08:00",
    createdBy: "Ban quản lý",
    assignedTo: "Vệ sinh Công ty ABC",
    description: "Định kỳ vệ sinh bể nước ngầm 6 tháng/lần",
    notes: [
      {
        id: "3",
        author: "Vệ sinh Công ty ABC",
        content: "Đã hoàn thành vệ sinh và kiểm tra chất lượng nước",
        date: "12/12/2024 16:00",
      },
    ],
  },
  {
    id: "5",
    ticketCode: "REQ-2024-005",
    title: "Kiểm tra camera an ninh tầng hầm",
    apartmentCode: "BQL",
    category: "SECURITY",
    priority: "HIGH",
    status: "IN_PROGRESS",
    createdDate: "13/12/2024 14:30",
    createdBy: "Bảo vệ trưởng",
    assignedTo: "Kỹ thuật An ninh",
    description: "Camera số 7 và 8 tại tầng hầm B1 bị mất hình ảnh",
    notes: [
      {
        id: "4",
        author: "Kỹ thuật An ninh",
        content: "Đang kiểm tra đường truyền",
        date: "13/12/2024 15:00",
      },
    ],
  },
  {
    id: "6",
    ticketCode: "REQ-2024-006",
    title: "Tiếng ồn từ máy bơm nước",
    apartmentCode: "A-508",
    category: "OTHER",
    priority: "LOW",
    status: "NEW",
    createdDate: "14/12/2024 07:45",
    createdBy: "Phạm Thị Dung",
    description: "Máy bơm nước phát ra tiếng ồn lớn vào buổi sáng sớm",
    notes: [],
  },
];

export default function RequestsManagement() {
  const [requests] = useState<Request[]>(mockRequests);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [isCreateRequestModalOpen, setIsCreateRequestModalOpen] =
    useState(false);

  const getStatusBadge = (status: RequestStatus) => {
    const styles = {
      NEW: { bg: "bg-blue-100 text-blue-700", label: "Mới", icon: AlertCircle },
      ASSIGNED: {
        bg: "bg-purple-100 text-purple-700",
        label: "Đã phân công",
        icon: Clock,
      },
      IN_PROGRESS: {
        bg: "bg-orange-100 text-orange-700",
        label: "Đang xử lý",
        icon: Clock,
      },
      RESOLVED: {
        bg: "bg-green-100 text-green-700",
        label: "Đã giải quyết",
        icon: CheckCircle,
      },
      CLOSED: {
        bg: "bg-gray-100 text-gray-700",
        label: "Đã đóng",
        icon: XCircle,
      },
    };
    return styles[status];
  };

  const getPriorityBadge = (priority: Priority) => {
    const styles = {
      LOW: "bg-gray-100 text-gray-700",
      NORMAL: "bg-blue-100 text-blue-700",
      HIGH: "bg-orange-100 text-orange-700",
      CRITICAL: "bg-red-100 text-red-700",
    };
    const labels = {
      LOW: "Thấp",
      NORMAL: "Bình thường",
      HIGH: "Cao",
      CRITICAL: "Khẩn cấp",
    };
    return { style: styles[priority], label: labels[priority] };
  };

  const getCategoryLabel = (category: Category) => {
    const labels = {
      ELECTRIC: "Điện",
      WATER: "Nước",
      SECURITY: "An ninh",
      CLEANING: "Vệ sinh",
      ELEVATOR: "Thang máy",
      OTHER: "Khác",
    };
    return labels[category];
  };

  // Filter logic
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.apartmentCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    const matchesPriority =
      priorityFilter === "ALL" || req.priority === priorityFilter;
    const matchesCategory =
      categoryFilter === "ALL" || req.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Group by status for Kanban
  const kanbanColumns: {
    status: RequestStatus;
    label: string;
    color: string;
  }[] = [
    { status: "NEW", label: "Mới", color: "border-blue-300 bg-blue-50" },
    {
      status: "ASSIGNED",
      label: "Đã Phân Công",
      color: "border-purple-300 bg-purple-50",
    },
    {
      status: "IN_PROGRESS",
      label: "Đang Xử Lý",
      color: "border-orange-300 bg-orange-50",
    },
    {
      status: "RESOLVED",
      label: "Đã Giải Quyết",
      color: "border-green-300 bg-green-50",
    },
    { status: "CLOSED", label: "Đã Đóng", color: "border-gray-300 bg-gray-50" },
  ];

  const getRequestsByStatus = (status: RequestStatus) => {
    return filteredRequests.filter((req) => req.status === status);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl text-gray-900 mb-2">
          Quản Lý Phản Ánh & Yêu Cầu
        </h1>
        <p className="text-gray-600">Theo dõi và xử lý các yêu cầu từ cư dân</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Tổng Yêu Cầu</p>
          <p className="text-2xl text-gray-900 mt-1">{requests.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Mới</p>
          <p className="text-2xl text-blue-600 mt-1">
            {requests.filter((r) => r.status === "NEW").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Đang Xử Lý</p>
          <p className="text-2xl text-orange-600 mt-1">
            {
              requests.filter(
                (r) => r.status === "IN_PROGRESS" || r.status === "ASSIGNED"
              ).length
            }
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Đã Giải Quyết</p>
          <p className="text-2xl text-green-600 mt-1">
            {requests.filter((r) => r.status === "RESOLVED").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Khẩn Cấp</p>
          <p className="text-2xl text-red-600 mt-1">
            {
              requests.filter(
                (r) => r.priority === "CRITICAL" || r.priority === "HIGH"
              ).length
            }
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã phiếu, tiêu đề, căn hộ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Add Button */}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              onClick={() => {
                console.log("Button clicked! Opening modal...");
                setIsCreateRequestModalOpen(true);
              }}
            >
              <Plus className="w-5 h-5" />
              Tạo Yêu Cầu
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-4 py-2 text-sm ${
                  viewMode === "kanban"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 text-sm ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Bảng
              </button>
            </div>

            {/* Filters */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="NEW">Mới</option>
              <option value="ASSIGNED">Đã phân công</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Đã giải quyết</option>
              <option value="CLOSED">Đã đóng</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="LOW">Thấp</option>
              <option value="NORMAL">Bình thường</option>
              <option value="HIGH">Cao</option>
              <option value="CRITICAL">Khẩn cấp</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="ALL">Tất cả hạng mục</option>
              <option value="ELECTRIC">Điện</option>
              <option value="WATER">Nước</option>
              <option value="SECURITY">An ninh</option>
              <option value="CLEANING">Vệ sinh</option>
              <option value="ELEVATOR">Thang máy</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kanbanColumns.map((column) => {
            const columnRequests = getRequestsByStatus(column.status);
            return (
              <div key={column.status} className="flex flex-col">
                <div className={`border-2 ${column.color} rounded-lg p-3 mb-3`}>
                  <h3 className="text-gray-900 flex items-center justify-between">
                    <span>{column.label}</span>
                    <span className="text-sm bg-white px-2 py-1 rounded">
                      {columnRequests.length}
                    </span>
                  </h3>
                </div>
                <div className="space-y-3 flex-1">
                  {columnRequests.map((request) => {
                    const priorityBadge = getPriorityBadge(request.priority);
                    return (
                      <div
                        key={request.id}
                        onClick={() => setSelectedRequest(request)}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs text-blue-600">
                            {request.ticketCode}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${priorityBadge.style}`}
                          >
                            {priorityBadge.label}
                          </span>
                        </div>
                        <h4 className="text-gray-900 mb-2 line-clamp-2">
                          {request.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{request.apartmentCode}</span>
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {getCategoryLabel(request.category)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {request.createdDate}
                        </p>
                      </div>
                    );
                  })}
                  {columnRequests.length === 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-400 text-sm">
                      Không có yêu cầu
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Mã Phiếu
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Tiêu Đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Căn Hộ
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Hạng Mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Mức Độ
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                    Ngày Tạo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request) => {
                  const statusBadge = getStatusBadge(request.status);
                  const priorityBadge = getPriorityBadge(request.priority);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <tr
                      key={request.id}
                      onClick={() => setSelectedRequest(request)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-blue-600">
                          {request.ticketCode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{request.title}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {request.apartmentCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                          {getCategoryLabel(request.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs ${priorityBadge.style}`}
                        >
                          {priorityBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${statusBadge.bg} w-fit`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                        {request.createdDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Không tìm thấy yêu cầu nào phù hợp
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdate={(updatedRequest) => {
            // Update request logic here
            setSelectedRequest(null);
          }}
        />
      )}

      {/* Create Request Modal */}
      {isCreateRequestModalOpen && (
        <CreateRequestModal
          isOpen={isCreateRequestModalOpen}
          onClose={() => setIsCreateRequestModalOpen(false)}
          onSubmit={(formData: RequestFormData) => {
            // Add request logic here
            toast.success("Yêu cầu đã được tạo thành công");
            setIsCreateRequestModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
