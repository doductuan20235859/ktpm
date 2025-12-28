import {
  Building2,
  Home,
  Users,
  Wrench,
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { StatsCard } from "@/components/shared/StatsCard";
import { RecentRequestsWidget } from "@/components/shared/RecentRequestsWidget";

interface DashboardProps {
  onNavigateToRequests?: () => void;
}

export function Dashboard({ onNavigateToRequests }: DashboardProps) {
  // Mock data cho các chỉ số
  const apartmentStats = {
    total: 240,
    occupied: 198,
    available: 32,
    maintenance: 10,
  };

  const financialStats = {
    totalRevenue: 456780000, // VND
    debtorCount: 12,
    collectionRate: 94.5, // %
    totalExpected: 485000000, // VND
  };

  const requestStats = {
    new: 15,
    inProgress: 8,
    resolved: 142,
  };

  // Dữ liệu biểu đồ thu phí theo loại
  const revenueByFeeType = [
    { name: "Quản lý", amount: 156000000 },
    { name: "Dịch vụ", amount: 124500000 },
    { name: "Giữ xe", amount: 89200000 },
    { name: "Nước", amount: 65800000 },
    { name: "Điện", amount: 21280000 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl text-gray-900 mb-2">Dashboard Tổng Quan</h1>
        <p className="text-gray-600">
          Chào mừng trở lại! Dưới đây là tổng quan hoạt động của chung cư.
        </p>
      </div>

      {/* Section: Chỉ số Hộ dân */}
      <div className="mb-6">
        <h2 className="text-xl text-gray-800 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Chỉ Số Hộ Dân
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Tổng Số Căn Hộ"
            value={apartmentStats.total}
            icon={Building2}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            subtitle="Tổng căn hộ trong chung cư"
          />
          <StatsCard
            title="Số Hộ Đang Ở"
            value={apartmentStats.occupied}
            icon={Home}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            subtitle="OCCUPIED_OWNER / TENANT"
            trend={{ value: "5.2%", isPositive: true }}
          />
          <StatsCard
            title="Số Hộ Trống"
            value={apartmentStats.available}
            icon={Users}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
            subtitle="AVAILABLE / VACANT"
          />
          <StatsCard
            title="Đang Bảo Trì"
            value={apartmentStats.maintenance}
            icon={Wrench}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
            subtitle="MAINTENANCE"
          />
        </div>
      </div>

      {/* Section: Chỉ số Tài chính */}
      <div className="mb-6">
        <h2 className="text-xl text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Chỉ Số Tài Chính
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Tổng Thu Tháng Này"
            value={formatCurrency(financialStats.totalRevenue)}
            icon={DollarSign}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            subtitle={`Trong tổng số ${formatCurrency(
              financialStats.totalExpected
            )}`}
            trend={{ value: "8.3%", isPositive: true }}
          />
          <StatsCard
            title="Số Hộ Còn Nợ"
            value={financialStats.debtorCount}
            icon={CreditCard}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
            subtitle="Cần theo dõi và nhắc nhở"
            trend={{ value: "2 hộ", isPositive: false }}
          />
          <StatsCard
            title="Tỷ Lệ Thu Phí"
            value={`${financialStats.collectionRate}%`}
            icon={TrendingUp}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            subtitle="Tổng thu / Tổng phải thu"
            trend={{ value: "1.2%", isPositive: true }}
          />
        </div>
      </div>

      {/* Section: Yêu cầu/Phản ánh */}
      <div className="mb-6">
        <h2 className="text-xl text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          Yêu Cầu / Phản Ánh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Yêu Cầu Mới"
            value={requestStats.new}
            icon={AlertCircle}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
            subtitle="Cần xử lý ngay"
          />
          <StatsCard
            title="Đang Xử Lý"
            value={requestStats.inProgress}
            icon={Clock}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            subtitle="IN_PROGRESS"
          />
          <StatsCard
            title="Đã Giải Quyết"
            value={requestStats.resolved}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            subtitle="Tháng này"
          />
        </div>
      </div>

      {/* Section: Biểu đồ */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Tổng Thu Theo Loại Phí (Tháng Hiện Tại)
          </h2>
          <div style={{ width: "100%", height: 320, minHeight: 320 }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={revenueByFeeType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fill: "#6b7280" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="amount"
                  fill="#3b82f6"
                  name="Số tiền thu (VNĐ)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg text-blue-900 mb-3">Thông Tin Nổi Bật</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Tỷ lệ lấp đầy:{" "}
              <span>
                {(
                  (apartmentStats.occupied / apartmentStats.total) *
                  100
                ).toFixed(1)}
                %
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Số tiền còn nợ:{" "}
              <span>
                {formatCurrency(
                  financialStats.totalExpected - financialStats.totalRevenue
                )}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Tổng yêu cầu đang mở:{" "}
              <span>{requestStats.new + requestStats.inProgress}</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <h3 className="text-lg text-green-900 mb-3">Xu Hướng Tháng Này</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              Thu phí tăng 8.3% so với tháng trước
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>5 căn
              hộ mới có người chuyển vào
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              Giải quyết 142 yêu cầu trong tháng
            </li>
          </ul>
        </div>
      </div>

      {/* Recent Requests Widget */}
      <div className="mt-6">
        <RecentRequestsWidget
          onViewAll={() => {
            // In production, this would navigate to requests page
            if (onNavigateToRequests) {
              onNavigateToRequests();
            } else {
              console.log("Navigate to requests page");
            }
          }}
        />
      </div>
    </div>
  );
}
