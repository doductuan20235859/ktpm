"use client";
import { useEffect, useState } from "react";
import { Bell, Trash2, Edit2, Check, X, Plus } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  targetAudience: string;
  targetIds: string[] | null;
  createdAt: string;
  createdBy: {
    id?: number;
    fullName?: string;
  } | null;
}

interface CreateNotificationForm {
  title: string;
  message: string;
  type: string;
  targetAudience: "ALL" | "APARTMENT" | "ROLE" | "USER";
  targetIds: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CreateNotificationForm>({
    title: "",
    message: "",
    type: "INFO",
    targetAudience: "ALL",
    targetIds: "",
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:3001/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        alert("Bạn không có quyền truy cập trang này.");
        window.location.href = "/auth/login";
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data: Notification[] = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách thông báo:", error);
      alert(
        "Không thể lấy danh sách thông báo. Kiểm tra console để xem chi tiết."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      alert("Vui lòng điền đầy đủ tiêu đề và nội dung");
      return;
    }

    const targetIds =
      formData.targetAudience === "ALL"
        ? undefined
        : formData.targetIds
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id.length > 0);

    try {
      const token = localStorage.getItem("accessToken");
      const method = editingId ? "PATCH" : "POST";
      const url = editingId
        ? `http://localhost:3001/notifications/${editingId}`
        : "http://localhost:3001/notifications";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          message: formData.message,
          type: formData.type,
          targetAudience: formData.targetAudience,
          targetIds: targetIds || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("API Error Response:", err);
        const errorMessage =
          err.message || err.error?.message || "Lỗi khi tạo/sửa thông báo";
        throw new Error(errorMessage);
      }

      alert(editingId ? "Cập nhật thành công" : "Tạo thành công");
      setFormData({
        title: "",
        message: "",
        type: "INFO",
        targetAudience: "ALL",
        targetIds: "",
      });
      setEditingId(null);
      setShowCreateForm(false);
      fetchNotifications();
    } catch (error) {
      console.error("Create/Update Error:", error);
      const errorMsg = error instanceof Error ? error.message : "Có lỗi xảy ra";
      alert(errorMsg);
    }
  };

  const handleEdit = (notification: Notification) => {
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type || "INFO",
      targetAudience: (notification.targetAudience as any) || "ALL",
      targetIds: notification.targetIds?.join(", ") || "",
    });
    setEditingId(notification.id);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3001/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi khi xóa");
      }

      alert("Đã xóa thông báo");
      fetchNotifications();
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi xóa thông báo");
    }
  };

  const cancelEdit = () => {
    setFormData({
      title: "",
      message: "",
      type: "INFO",
      targetAudience: "ALL",
      targetIds: "",
    });
    setEditingId(null);
    setShowCreateForm(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Quản Lý Thông Báo</h1>
          <p className="text-gray-600">Tạo và quản lý thông báo cho cư dân</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tạo Thông Báo
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl text-gray-800 mb-4">
            {editingId ? "Sửa Thông Báo" : "Tạo Thông Báo Mới"}
          </h2>
          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Tiêu Đề
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Nhập tiêu đề thông báo"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Nội Dung
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Nhập nội dung thông báo"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Loại</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="INFO">Thông tin</option>
                  <option value="WARNING">Cảnh báo</option>
                  <option value="URGENT">Khẩn cấp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Gửi Tới
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetAudience: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="ALL">Tất cả cư dân</option>
                  <option value="APARTMENT">Căn hộ cụ thể</option>
                  <option value="ROLE">Theo vai trò</option>
                  <option value="USER">Từng cư dân</option>
                </select>
              </div>
            </div>

            {formData.targetAudience !== "ALL" && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Danh sách{" "}
                  {formData.targetAudience === "APARTMENT"
                    ? "(Mã căn hộ, ngăn cách bằng dấu phẩy)"
                    : formData.targetAudience === "ROLE"
                    ? "(ADMIN hoặc RESIDENT)"
                    : "(ID cư dân, ngăn cách bằng dấu phẩy)"}
                </label>
                <input
                  type="text"
                  value={formData.targetIds}
                  onChange={(e) =>
                    setFormData({ ...formData, targetIds: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="VD: A-101, A-102 hoặc 1, 2, 3"
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                {editingId ? "Cập Nhật" : "Tạo"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Tiêu Đề</th>
                  <th className="px-3 py-2">Nội Dung</th>
                  <th className="px-3 py-2">Loại</th>
                  <th className="px-3 py-2">Gửi Tới</th>
                  <th className="px-3 py-2">Tạo Bởi</th>
                  <th className="px-3 py-2">Ngày Tạo</th>
                  <th className="px-3 py-2">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n.id} className="border-t">
                    <td className="px-3 py-2 align-middle">{n.id}</td>
                    <td className="px-3 py-2 align-middle font-semibold">
                      {n.title}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <div className="max-w-xs truncate text-gray-600">
                        {n.message}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                        {n.type || "INFO"}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-middle">
                      {n.targetAudience}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      {n.createdBy?.fullName || "System"}
                    </td>
                    <td className="px-3 py-2 align-middle text-xs text-gray-500">
                      {new Date(n.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(n)}
                          title="Sửa"
                          className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(n.id)}
                          title="Xóa"
                          className="px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {notifications.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-gray-500">
                      Không có thông báo nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
