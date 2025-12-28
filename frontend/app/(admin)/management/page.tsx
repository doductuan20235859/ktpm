"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Calendar,
  Filter,
  LayoutGrid,
  List,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserCircle,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { RequestDetailModal } from "@/components/shared/RequestDetailModal";
import {
  CreateRequestModal,
  RequestFormData,
} from "@/components/shared/CreateRequestModal";
import {
  EditRequestModal,
  RequestUpdateData,
} from "@/components/shared/EditRequestModal";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
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
  building: string;
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

// Generate mock data
const generateMockRequests = (): Request[] => {
  const statuses: RequestStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED"];
  const priorities: Priority[] = ["LOW", "NORMAL", "HIGH", "CRITICAL"];
  const categories: Category[] = [
    "ELECTRIC",
    "WATER",
    "SECURITY",
    "CLEANING",
    "ELEVATOR",
    "OTHER",
  ];
  const buildings = ["Tòa A", "Tòa B", "Tòa C", "Tòa D"];
  const titles = [
    "Thang máy bị kẹt",
    "Rò rỉ nước tại hành lang",
    "Đèn hành lang không sáng",
    "Vệ sinh bể nước ngầm",
    "Kiểm tra camera an ninh",
    "Tiếng ồn từ máy bơm",
    "Cửa sắt tầng hầm hỏng",
    "Sửa chữa hệ thống báo cháy",
    "Kiểm tra máy phát điện",
    "Vệ sinh khu vực sảnh",
  ];
  const names = [
    "Nguyễn Văn An",
    "Trần Thị Bảo",
    "Lê Văn Cường",
    "Phạm Thị Dung",
    "Hoàng Văn Em",
  ];
  const assignees = [
    "Kỹ thuật Phạm Đức",
    "Điện Lực Nguyễn",
    "Vệ sinh Công ty ABC",
    "Kỹ thuật An ninh",
    "Bảo vệ",
  ];

  const requests: Request[] = [];
  for (let i = 1; i <= 50; i++) {
    const building = buildings[Math.floor(Math.random() * buildings.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    requests.push({
      id: `${i}`,
      ticketCode: `REQ-2024-${String(i).padStart(3, "0")}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      apartmentCode: `${building.split(" ")[1]}-${
        Math.floor(Math.random() * 9) + 1
      }${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}`,
      building: building,
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: status,
      createdDate: `${Math.floor(Math.random() * 15) + 1}/12/2024 ${String(
        Math.floor(Math.random() * 24)
      ).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(
        2,
        "0"
      )}`,
      createdBy: names[Math.floor(Math.random() * names.length)],
      assignedTo:
        status !== "NEW"
          ? assignees[Math.floor(Math.random() * assignees.length)]
          : undefined,
      description: "Mô tả chi tiết về vấn đề cần xử lý",
      notes:
        status === "RESOLVED"
          ? [
              {
                id: "1",
                author: "Admin",
                content: "Đã hoàn thành",
                date: "16/12/2024 10:00",
              },
            ]
          : [],
    });
  }
  return requests;
};

const mockRequests = generateMockRequests();

export default function RequestManagementPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [buildingFilter, setBuildingFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [appliedDateRange, setAppliedDateRange] = useState({ from: "", to: "" });
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateRequestModalOpen, setIsCreateRequestModalOpen] =
    useState(false);
  const [isEditRequestModalOpen, setIsEditRequestModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:3001/requests');
        if (response.ok) {
          const data = await response.json();
          console.log('Backend requests data:', data);
          // Transform data to match frontend interface
          const transformedData = data.map((req: any) => ({
            id: req.id.toString(),
            ticketCode: req.ticketCode || `REQ-${req.id}`,
            title: req.title,
            apartmentCode: req.apartment?.code || 'N/A',
            building: req.apartment?.building?.name || 'N/A',
            category: req.category,
            priority: req.priority,
            status: req.status,
            // Format: dd/mm/yyyy hh:mm từ createdAt
            createdDate: req.createdAt ? new Date(req.createdAt).toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }).replace(',', '') : 'N/A',
            createdBy: req.createdBy?.name || req.createdByName || 'Ban quản lý',
            assignedTo: req.assignedTo?.name,
            description: req.description || '',
            notes: req.notes?.map((note: any) => ({
              id: note.id.toString(),
              author: note.author?.name || 'N/A',
              content: note.content,
              date: new Date(note.createdAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }).replace(',', ''),
            })) || [],
          }));
          setRequests(transformedData);
        } else {
          console.error('Failed to fetch requests:', response.status);
          setRequests([]);
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, buildingFilter, priorityFilter, categoryFilter, appliedDateRange]);
  const itemsPerPage = 10;

  // Filter logic - convert ngày thành YYYY-MM-DD để so sánh
  const extractDateOnly = (dateStr: string): string => {
    try {
      // Handle both formats: "d/m/yyyy hh:mm" or "dd/mm/yyyy hh:mm"
      const datePart = dateStr.split(' ')[0];
      if (!datePart) return '';
      const parts = datePart.split('/');
      if (parts.length !== 3) return '';
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    } catch (e) {
      return '';
    }
  };

  // Helper to format date for display: dd/mm/yyyy hh:mm
  const formatDateForDisplay = (date: Date | string): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', '');
    } catch (e) {
      return 'N/A';
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.apartmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    const matchesBuilding =
      buildingFilter === "ALL" || req.building === buildingFilter;
    const matchesPriority =
      priorityFilter === "ALL" || req.priority === priorityFilter;
    const matchesCategory =
      categoryFilter === "ALL" || req.category === categoryFilter;

    // Date filter - simple string comparison
    let matchesDate = true;
    if (appliedDateRange.from || appliedDateRange.to) {
      const reqDateStr = extractDateOnly(req.createdDate);
      if (reqDateStr) {
        if (appliedDateRange.from) {
          matchesDate = matchesDate && reqDateStr >= appliedDateRange.from;
        }
        if (appliedDateRange.to) {
          matchesDate = matchesDate && reqDateStr <= appliedDateRange.to;
        }
      }
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesBuilding &&
      matchesPriority &&
      matchesCategory &&
      matchesDate
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper functions
  const getStatusConfig = (status: RequestStatus) => {
    const configs = {
      NEW: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "Mới",
        icon: AlertCircle,
      },
      ASSIGNED: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Đã giao",
        icon: UserCircle,
      },
      IN_PROGRESS: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        label: "Đang xử lý",
        icon: Clock,
      },
      RESOLVED: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Đã giải quyết",
        icon: CheckCircle,
      },
      CLOSED: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        label: "Đã đóng",
        icon: CheckCircle,
      },
    };
    return configs[status];
  };

  const getPriorityConfig = (priority: Priority) => {
    const configs = {
      LOW: { bg: "bg-gray-100", text: "text-gray-700", label: "Thấp" },
      NORMAL: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "Bình thường",
      },
      HIGH: { bg: "bg-orange-100", text: "text-orange-700", label: "Cao" },
      CRITICAL: { bg: "bg-red-100", text: "text-red-700", label: "Khẩn cấp" },
    };
    return configs[priority];
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

  const moveRequest = (requestId: string, newStatus: RequestStatus) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
  };

  const handleCreateRequest = async (formData: RequestFormData) => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        apartmentId: formData.apartmentId,
        createdByUserId: formData.createdByUserId || 1,
      };
      const response = await fetch('http://localhost:3001/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const newRequest = await response.json();
        const transformed = {
          id: newRequest.id.toString(),
          ticketCode: newRequest.ticketCode || `REQ-${newRequest.id}`,
          title: newRequest.title,
          apartmentCode: newRequest.apartment?.code || 'N/A',
          building: newRequest.apartment?.building?.name || 'N/A',
          category: newRequest.category,
          priority: newRequest.priority,
          status: newRequest.status,
          createdDate: formatDateForDisplay(newRequest.createdAt),
          createdBy: newRequest.createdBy?.name || 'Ban quản lý',
          assignedTo: newRequest.assignedTo?.name,
          description: newRequest.description,
          notes: newRequest.notes?.map((note: any) => ({
            id: note.id.toString(),
            author: note.author?.name || 'N/A',
            content: note.content,
            date: formatDateForDisplay(note.createdAt),
          })) || [],
        };
        setRequests([...requests, transformed]);
        toast.success("Yêu cầu đã được tạo thành công!");
        setIsCreateRequestModalOpen(false);
      } else {
        toast.error("Lỗi khi tạo yêu cầu!");
      }
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error("Lỗi khi tạo yêu cầu!");
    }
  };

  const handleEditRequest = async (updatedData: RequestUpdateData) => {
    if (selectedRequest) {
      try {
        const payload = {
          title: updatedData.title,
          description: updatedData.description,
          category: updatedData.category,
          priority: updatedData.priority,
          status: updatedData.status,
          // assignedToUserId: updatedData.assignedTo ? getUserId(updatedData.assignedTo) : null,
        };
        const response = await fetch(`http://localhost:3001/requests/${selectedRequest.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const updatedRequest = await response.json();
          // Transform and update state
          const transformed = {
            ...selectedRequest,
            title: updatedRequest.title,
            category: updatedRequest.category,
            priority: updatedRequest.priority,
            status: updatedRequest.status,
            description: updatedRequest.description,
            apartmentCode: updatedRequest.apartment?.code || selectedRequest.apartmentCode,
            building: updatedRequest.apartment?.buildingName || selectedRequest.building,
            createdBy: updatedRequest.createdBy?.name || selectedRequest.createdBy,
          };
          setRequests((prev) =>
            prev.map((req) =>
              req.id === selectedRequest.id ? transformed : req
            )
          );
          toast.success("Yêu cầu đã được cập nhật thành công!");
          setIsEditRequestModalOpen(false);
        } else {
          toast.error("Lỗi khi cập nhật yêu cầu!");
        }
      } catch (error) {
        console.error('Error updating request:', error);
        toast.error("Lỗi khi cập nhật yêu cầu!");
      }
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/requests/${requestId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
        toast.success("Yêu cầu đã được xóa thành công!");
        setIsDeleteConfirmModalOpen(false);
      } else {
        toast.error("Lỗi khi xóa yêu cầu!");
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error("Lỗi khi xóa yêu cầu!");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-gray-900">
                Quản Lý Yêu Cầu & Phản Ánh
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Theo dõi và xử lý các yêu cầu từ cư dân
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Switcher */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="text-sm">Danh Sách</span>
                </button>
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                    viewMode === "kanban"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-sm">Kanban</span>
                </button>
              </div>

              {/* Create Button */}
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setIsCreateRequestModalOpen(true)}
              >
                <Plus className="w-5 h-5" />
                Tạo Yêu Cầu Mới
              </button>
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col gap-4">
            {/* Search and Date Range */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã phiếu, tiêu đề, căn hộ, người tạo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                  className="text-sm border-none outline-none w-32"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                  className="text-sm border-none outline-none w-32"
                />
                <button
                  onClick={() => setAppliedDateRange(dateRange)}
                  className="px-3 py-1 ml-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="NEW">Mới</option>
                <option value="IN_PROGRESS">Đang xử lý</option>
                <option value="RESOLVED">Đã giải quyết</option>
              </select>

              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ALL">Tất cả tòa nhà</option>
                <option value="Tòa A">Tòa A</option>
                <option value="Tòa B">Tòa B</option>
                <option value="Tòa C">Tòa C</option>
                <option value="Tòa D">Tòa D</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ALL">Tất cả hạng mục</option>
                <option value="ELECTRIC">Điện</option>
                <option value="WATER">Nước</option>
                <option value="SECURITY">An ninh</option>
                <option value="CLEANING">Vệ sinh</option>
                <option value="ELEVATOR">Thang máy</option>
                <option value="OTHER">Khác</option>
              </select>

              {(searchTerm ||
                statusFilter !== "ALL" ||
                buildingFilter !== "ALL" ||
                priorityFilter !== "ALL" ||
                categoryFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                    setBuildingFilter("ALL");
                    setPriorityFilter("ALL");
                    setCategoryFilter("ALL");
                    setDateRange({ from: "", to: "" });
                    setAppliedDateRange({ from: "", to: "" });
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 whitespace-nowrap"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Tổng yêu cầu</p>
              <p className="text-2xl text-gray-900 mt-1">
                {filteredRequests.length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Mới</p>
              <p className="text-2xl text-blue-600 mt-1">
                {filteredRequests.filter((r) => r.status === "NEW").length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Đang xử lý</p>
              <p className="text-2xl text-orange-600 mt-1">
                {
                  filteredRequests.filter((r) => r.status === "IN_PROGRESS")
                    .length
                }
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Đã giải quyết</p>
              <p className="text-2xl text-green-600 mt-1">
                {filteredRequests.filter((r) => r.status === "RESOLVED").length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Khẩn cấp</p>
              <p className="text-2xl text-red-600 mt-1">
                {
                  filteredRequests.filter(
                    (r) => r.priority === "CRITICAL" || r.priority === "HIGH"
                  ).length
                }
              </p>
            </div>
          </div>

          {/* List View */}
          {viewMode === "list" && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                        Mã Phiếu
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                        Người Yêu Cầu
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                        Mức Độ
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                        Hạng Mục
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                        Người Xử Lý
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                        Trạng Thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                        Thời Gian Tạo
                      </th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                        Hành Động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedRequests.map((request) => {
                      const statusConfig = getStatusConfig(request.status);
                      const priorityConfig = getPriorityConfig(
                        request.priority
                      );
                      const StatusIcon = statusConfig.icon;
                      return (
                        <tr
                          key={request.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-blue-600 cursor-pointer hover:underline" onClick={() => setSelectedRequest(request)}>
                                {request.ticketCode}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {request.title}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <UserCircle className="w-5 h-5 text-gray-500" />
                              </div>
                              <div>
                                <div className="text-sm text-gray-900">
                                  {request.createdBy}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {request.apartmentCode}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded text-xs ${priorityConfig.bg} ${priorityConfig.text}`}
                            >
                              {priorityConfig.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                              {getCategoryLabel(request.category)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {request.assignedTo ? (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <UserCircle className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-sm text-gray-900">
                                  {request.assignedTo}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">
                                Chưa phân công
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${statusConfig.bg} ${statusConfig.text} w-fit`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {request.createdDate}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedRequest(request)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsEditRequestModalOpen(true);
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Bạn có chắc muốn xóa yêu cầu này?')) {
                                    handleDeleteRequest(request.id);
                                  }
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
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

              {/* Pagination */}
              {filteredRequests.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredRequests.length
                    )}{" "}
                    trong tổng số {filteredRequests.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 border rounded ${
                            currentPage === page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    {totalPages > 5 && <span className="px-2">...</span>}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Kanban View */}
          {viewMode === "kanban" && (
            <KanbanBoard
              requests={filteredRequests}
              onMoveRequest={moveRequest}
              onSelectRequest={setSelectedRequest}
              getStatusConfig={getStatusConfig}
              getPriorityConfig={getPriorityConfig}
              getCategoryLabel={getCategoryLabel}
            />
          )}
        </div>

        {/* Detail Modal */}
        {selectedRequest && (
          <RequestDetailModal
            request={selectedRequest}
            isOpen={!!selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onEdit={() => setIsEditRequestModalOpen(true)}
            onDelete={() => setIsDeleteConfirmModalOpen(true)}
          />
        )}

        {/* Create Request Modal */}
        <CreateRequestModal
          isOpen={isCreateRequestModalOpen}
          onClose={() => setIsCreateRequestModalOpen(false)}
          onSubmit={handleCreateRequest}
        />

        {/* Edit Request Modal */}
        {selectedRequest && (
          <EditRequestModal
            isOpen={isEditRequestModalOpen}
            onClose={() => setIsEditRequestModalOpen(false)}
            onUpdate={handleEditRequest}
            request={selectedRequest}
          />
        )}

        {/* Delete Confirm Modal */}
        {selectedRequest && (
          <DeleteConfirmModal
            isOpen={isDeleteConfirmModalOpen}
            onClose={() => setIsDeleteConfirmModalOpen(false)}
            onConfirm={() => handleDeleteRequest(selectedRequest.id)}
            title="Xóa Yêu Cầu"
            message="Bạn có chắc chắn muốn xóa yêu cầu này không?"
            itemName={`${selectedRequest.ticketCode} - ${selectedRequest.title}`}
          />
        )}
      </div>
    </DndProvider>
  );
}

// Kanban Board Component
interface KanbanBoardProps {
  requests: Request[];
  onMoveRequest: (requestId: string, newStatus: RequestStatus) => void;
  onSelectRequest: (request: Request) => void;
  getStatusConfig: (status: RequestStatus) => any;
  getPriorityConfig: (priority: Priority) => any;
  getCategoryLabel: (category: Category) => string;
}

function KanbanBoard({
  requests,
  onMoveRequest,
  onSelectRequest,
  getStatusConfig,
  getPriorityConfig,
  getCategoryLabel,
}: KanbanBoardProps) {
  const columns: { status: RequestStatus; label: string; color: string }[] = [
    { status: "NEW", label: "Mới", color: "bg-blue-50 border-blue-300" },
    {
      status: "IN_PROGRESS",
      label: "Đang Xử Lý",
      color: "bg-orange-50 border-orange-300",
    },
    {
      status: "RESOLVED",
      label: "Đã Giải Quyết",
      color: "bg-green-50 border-green-300",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {columns.map((column) => (
        <KanbanColumn
          key={column.status}
          status={column.status}
          label={column.label}
          color={column.color}
          requests={requests.filter((r) => r.status === column.status)}
          onMoveRequest={onMoveRequest}
          onSelectRequest={onSelectRequest}
          getStatusConfig={getStatusConfig}
          getPriorityConfig={getPriorityConfig}
          getCategoryLabel={getCategoryLabel}
        />
      ))}
    </div>
  );
}

// Kanban Column Component
interface KanbanColumnProps {
  status: RequestStatus;
  label: string;
  color: string;
  requests: Request[];
  onMoveRequest: (requestId: string, newStatus: RequestStatus) => void;
  onSelectRequest: (request: Request) => void;
  getStatusConfig: (status: RequestStatus) => any;
  getPriorityConfig: (priority: Priority) => any;
  getCategoryLabel: (category: Category) => string;
}

function KanbanColumn({
  status,
  label,
  color,
  requests,
  onMoveRequest,
  onSelectRequest,
  getStatusConfig,
  getPriorityConfig,
  getCategoryLabel,
}: KanbanColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "REQUEST_CARD",
    drop: (item: { id: string; status: RequestStatus }) => {
      if (item.status !== status) {
        onMoveRequest(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div className="flex flex-col h-full">
      <div className={`border-2 ${color} rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <h3 className="text-gray-900">{label}</h3>
          <span className="text-sm bg-white px-3 py-1 rounded-full">
            {requests.length}
          </span>
        </div>
      </div>
      <div
        ref={drop as any}
        className={`flex-1 space-y-3 min-h-[600px] p-2 rounded-lg transition-colors ${
          isOver ? "bg-gray-100" : "bg-transparent"
        }`}
      >
        {requests.map((request) => (
          <KanbanCard
            key={request.id}
            request={request}
            onSelectRequest={onSelectRequest}
            getStatusConfig={getStatusConfig}
            getPriorityConfig={getPriorityConfig}
            getCategoryLabel={getCategoryLabel}
          />
        ))}
        {requests.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-400 text-sm">
            Không có yêu cầu
          </div>
        )}
      </div>
    </div>
  );
}

// Kanban Card Component
interface KanbanCardProps {
  request: Request;
  onSelectRequest: (request: Request) => void;
  getStatusConfig: (status: RequestStatus) => any;
  getPriorityConfig: (priority: Priority) => any;
  getCategoryLabel: (category: Category) => string;
}

function KanbanCard({
  request,
  onSelectRequest,
  getStatusConfig,
  getPriorityConfig,
  getCategoryLabel,
}: KanbanCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "REQUEST_CARD",
    item: { id: request.id, status: request.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const priorityConfig = getPriorityConfig(request.priority);

  return (
    <div
      ref={drag as any}
      onClick={() => onSelectRequest(request)}
      className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-blue-600">{request.ticketCode}</span>
        <span
          className={`text-xs px-2 py-1 rounded ${priorityConfig.bg} ${priorityConfig.text}`}
        >
          {priorityConfig.label}
        </span>
      </div>
      <h4 className="text-gray-900 mb-3 line-clamp-2">{request.title}</h4>
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <UserCircle className="w-4 h-4" />
          <span>{request.createdBy}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="bg-gray-100 px-2 py-1 rounded">
            {request.apartmentCode}
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded">
            {getCategoryLabel(request.category)}
          </span>
        </div>
        {request.assignedTo && (
          <div className="flex items-center gap-2 text-blue-600">
            <UserCircle className="w-4 h-4" />
            <span>{request.assignedTo}</span>
          </div>
        )}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">{request.createdDate}</span>
        <div className="flex items-center gap-1">
          {request.notes.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {request.notes.length} ghi chú
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
