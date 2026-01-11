"use client";
import { ChevronRight, Inbox } from "lucide-react";
import { useRouter } from "next/navigation"; // [1] Import useRouter
import { useEffect, useState } from "react";

interface Request {
  id: string | number;
  residentName: string;
  unitNumber: string;
  category: string;
  status: string; // Backend uses enums like NEW, IN_PROGRESS, RESOLVED, REJECTED
  createdAt: string;
}

interface RecentRequestsWidgetProps {
  onViewAll?: () => void; // Cho phép prop này optional
}

export function RecentRequestsWidget({ onViewAll }: RecentRequestsWidgetProps) {
  const router = useRouter(); // [2] Khởi tạo router
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  function timeAgo(dateStr: string) {
    try {
      const date = new Date(dateStr);
      const diff = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diff < 60) return `${diff} giây trước`;
      if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const token = localStorage.getItem("accessToken");

    fetch(`${apiBase}/requests/recent?limit=5`, {
      signal: controller.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (res) => {
        if (res.status === 401) {
          setUnauthorized(true);
          setRecentRequests([]);
          setLoading(false);
          return null;
        }
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Status ${res.status} ${text}`);
        }
        setUnauthorized(false);
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        console.log("recent requests response:", data);
        // data may be array of request objects
        if (Array.isArray(data)) {
          setRecentRequests(
            data.map((r: any) => ({
              id: r.id,
              residentName: r.residentName || r.title || "N/A",
              unitNumber: r.unitNumber || "N/A",
              category: r.category || "N/A",
              status: r.status || "NEW",
              createdAt: timeAgo(r.createdAt),
            }))
          );
          setError(null);
        } else {
          console.warn("Unexpected recent requests shape", data);
          setRecentRequests([]);
          setError("Unexpected data format");
        }
      })
      .catch((err: any) => {
        // Ignore abort errors (request was intentionally cancelled)
        if (
          err &&
          (err.name === "AbortError" ||
            err.message === "The operation was aborted.")
        ) {
          return;
        }
        console.error("Error fetching recent requests:", err);
        setError(err.message || "Fetch error");
      })
      .finally(() => setLoading(false));

    return () => {
      try {
        if (!controller.signal.aborted) controller.abort();
      } catch (e) {
        // ignore any errors when aborting
      }
    };
  }, []);

  const newRequestsCount = recentRequests.filter(
    (r) => (r.status || "").toString().toUpperCase() === "NEW"
  ).length;

  const getStatusBadge = (status: string) => {
    const s = (status || "").toString().toUpperCase();
    switch (s) {
      case "NEW":
        return {
          style: "bg-red-100 text-red-700 border border-red-200",
          label: "Mới",
        };
      case "IN_PROGRESS":
      case "ASSIGNED":
        return {
          style: "bg-yellow-100 text-yellow-700 border border-yellow-200",
          label: "Đang xử lý",
        };
      case "RESOLVED":
        return {
          style: "bg-green-100 text-green-700 border border-green-200",
          label: "Đã giải quyết",
        };
      case "REJECTED":
      case "CLOSED":
        return {
          style: "bg-gray-100 text-gray-700 border border-gray-200",
          label: "Từ chối",
        };
      default:
        return {
          style: "bg-gray-100 text-gray-700 border border-gray-200",
          label: status,
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
        {loading ? (
          <div className="h-full flex items-center justify-center text-center py-8">
            <p className="text-sm text-gray-600">Đang tải...</p>
          </div>
        ) : unauthorized ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Bạn cần đăng nhập để xem yêu cầu.
            </p>
            <p className="text-xs text-gray-500">
              Vui lòng đăng nhập với tài khoản quản trị hoặc cư dân.
            </p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <p className="text-sm text-red-600 mb-2">Lỗi: {error}</p>
            <p className="text-xs text-gray-500">
              Không thể tải danh sách yêu cầu.
            </p>
          </div>
        ) : recentRequests.length > 0 ? (
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
            // Use provided onViewAll if present (from parent), otherwise default to /requests
            if (onViewAll) {
              onViewAll();
            } else {
              router.push("/requests");
            }
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
