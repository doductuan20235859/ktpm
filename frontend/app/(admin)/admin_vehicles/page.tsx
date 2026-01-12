"use client";
import { useEffect, useState } from "react";
import { Truck, CheckCircle, XCircle, Eye, Trash } from "lucide-react";

interface BackendVehicle {
  id: number;
  plateNumber: string;
  type: string;
  brand?: string | null;
  color?: string | null;
  status: string;
  user?: {
    id?: number;
    fullName?: string;
    apartmentNumber?: string;
  };
  photoUrl?: string | null;
  registrationDocUrl?: string | null;
  createdAt?: string;
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<BackendVehicle[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Vui lòng đăng nhập bằng tài khoản admin");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:3001/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        alert("Bạn không có quyền truy cập trang này. Vui lòng đăng nhập lại.");
        // Optional: redirect to login
        window.location.href = "/auth/login";
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch vehicles");
      const data: BackendVehicle[] = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách xe:", error);
      alert("Không thể lấy danh sách xe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleApprove = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn duyệt xe này?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3001/vehicles/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi khi duyệt xe");
      }
      alert("Đã duyệt xe");
      fetchVehicles();
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi duyệt xe");
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Lý do từ chối (hiển thị cho cư dân):");
    if (reason === null) return; // user cancelled
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3001/vehicles/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "REJECTED", adminResponse: reason }),
      });
      if (res.status === 401 || res.status === 403) {
        alert("Bạn không có quyền thực hiện hành động này.");
        window.location.href = "/auth/login";
        return;
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi khi từ chối");
      }
      alert("Đã từ chối xe");
      fetchVehicles();
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi từ chối xe");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa xe này (Admin)?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3001/vehicles/${id}/admin`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi khi xóa");
      }
      alert("Đã xóa xe");
      fetchVehicles();
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi xóa xe");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl text-gray-900 mb-2">Quản Lý Xe</h1>
        <p className="text-gray-600">Danh sách xe đăng ký trong hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Biển số</th>
                  <th className="px-3 py-2">Loại</th>
                  <th className="px-3 py-2">Thương hiệu</th>
                  <th className="px-3 py-2">Màu</th>
                  <th className="px-3 py-2">Chủ xe / Căn hộ</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-t">
                    <td className="px-3 py-2 align-middle">{v.id}</td>
                    <td className="px-3 py-2 align-middle">{v.plateNumber}</td>
                    <td className="px-3 py-2 align-middle">{v.type}</td>
                    <td className="px-3 py-2 align-middle">
                      {v.brand || "N/A"}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      {v.color || "N/A"}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      {v.user?.fullName || "N/A"} /{" "}
                      {v.user?.apartmentNumber || "N/A"}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-sm">
                        {v.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(v.id)}
                          title="Duyệt"
                          className="px-2 py-1 rounded bg-green-50 text-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(v.id)}
                          title="Từ chối"
                          className="px-2 py-1 rounded bg-red-50 text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          title="Xóa"
                          className="px-2 py-1 rounded bg-rose-50 text-rose-700"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {vehicles.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-gray-500">
                      Không có xe nào
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
