"use client";
import { ChevronRight, Inbox } from "lucide-react";
import { useRouter } from "next/navigation"; // [1] Import useRouter

interface Request {
  id: string;
  residentName: string;
  unitNumber: string;
  category: string;
  status: "New" | "Processing" | "Resolved" | "Rejected";
  createdAt: string;
}

interface RecentRequestsWidgetProps {
  onViewAll?: () => void; // Cho phép prop này optional
}

export function RecentRequestsWidget({ onViewAll }: RecentRequestsWidgetProps) {
  const router = useRouter(); // [2] Khởi tạo router

  // Mock data - Top 5 most recent requests
  const recentRequests: Request[] = [
    {
      id: "1",
      residentName: "Nguyễn Văn An",
      unitNumber: "A-101",
      category: "Plumbing",
      status: "New",
      createdAt: "5 phút trước",
    },
    {
      id: "2",
      residentName: "Trần Thị Bình",
      unitNumber: "B-205",
      category: "Noise",
      status: "New",
      createdAt: "15 phút trước",
    },
    {
      id: "3",
      residentName: "Lê Văn Cường",
      unitNumber: "C-302",
      category: "Electrical",
      status: "Processing",
      createdAt: "1 giờ trước",
    },
    {
      id: "4",
      residentName: "Phạm Thị Dung",
      unitNumber: "A-108",
      category: "Cleaning",
      status: "Processing",
      createdAt: "2 giờ trước",
    },
    {
      id: "5",
      residentName: "Hoàng Văn Minh",
      unitNumber: "B-301",
      category: "Security",
      status: "New",
      createdAt: "3 giờ trước",
    },
  ];

  const newRequestsCount = recentRequests.filter(
    (r) => r.status === "New"
  ).length;

  const getStatusBadge = (status: Request["status"]) => {
    switch (status) {
      case "New":
        return {
          style: "bg-red-100 text-red-700 border border-red-200",
          label: "Mới",
        };
      case "Processing":
        return {
          style: "bg-yellow-100 text-yellow-700 border border-yellow-200",
          label: "Đang xử lý",
        };
      case "Resolved":
        return {
          style: "bg-green-100 text-green-700 border border-green-200",
          label: "Đã giải quyết",
        };
      case "Rejected":
        return {
          style: "bg-gray-100 text-gray-700 border border-gray-200",
          label: "Từ chối",
        };
    }
  };

  const getCategoryBadge = (category: string) => {
    const categories: { [key: string]: { style: string; icon: string } } = {
      Plumbing: { style: "bg-blue-50 text-blue-700", icon: "🔧" },
      Noise: { style: "bg-purple-50 text-purple-700", icon: "🔊" },
      Electrical: { style: "bg-orange-50 text-orange-700", icon: "⚡" },
      Cleaning: { style: "bg-green-50 text-green-700", icon: "🧹" },
      Security: { style: "bg-red-50 text-red-700", icon: "🔒" },
    };
    return (
      categories[category] || { style: "bg-gray-50 text-gray-700", icon: "📋" }
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h3 className="text-lg text-gray-900">Incoming Requests</h3>
          {newRequestsCount > 0 && (
            <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {newRequestsCount} new
            </span>
          )}
        </div>
      </div>

      {/* Body - Fixed height, no scroll */}
      <div className="flex-1 px-6 py-4">
        {recentRequests.length > 0 ? (
          <div className="space-y-3">
            {recentRequests.map((request) => {
              const statusBadge = getStatusBadge(request.status);
              const categoryBadge = getCategoryBadge(request.category);

              return (
                <div
                  key={request.id}
                  // [Option] Cũng có thể cho click vào từng item để xem chi tiết
                  onClick={() => router.push(`/requests?id=${request.id}`)}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 cursor-pointer"
                >
                  {/* Category Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg ${categoryBadge.style} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-lg">{categoryBadge.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm text-gray-900 truncate">
                        {request.residentName}
                      </p>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {request.createdAt}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-blue-600 px-2 py-0.5 bg-blue-50 rounded">
                        {request.unitNumber}
                      </span>
                      <span className="text-xs text-gray-600">
                        {request.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${statusBadge.style}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-1">No Recent Requests</p>
            <p className="text-xs text-gray-500">
              All caught up! No pending requests.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <button
          onClick={() => {
            // [3] Điều hướng khi bấm nút
            router.push("/requests");
          }}
          className="flex items-center justify-end gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors ml-auto group"
        >
          View All Requests
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
