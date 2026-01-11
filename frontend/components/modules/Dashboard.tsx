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

interface ApartmentStats {
  total: number;
  occupied: number;
  available: number;
  maintenance: number;
}

interface FinancialStats {
  totalRevenue: number;
  debtorCount: number;
  collectionRate: number;
  totalExpected: number;
}

interface FeeRow {
  name: string;
  amount: number;
}

interface RequestStats {
  new: number;
  inProgress: number;
  resolved: number;
}

interface DashboardProps {
  onNavigateToRequests?: () => void;
  apartmentStats?: ApartmentStats | null; // optional, fetched from backend
  financialStats?: FinancialStats | null;
  revenueByFeeType?: FeeRow[] | null;
  requestStats?: RequestStats | null;
}

export function Dashboard({
  onNavigateToRequests,
  apartmentStats: propApartmentStats,
  financialStats: propFinancialStats,
  revenueByFeeType: propRevenueByFeeType,
  requestStats: propRequestStats,
}: DashboardProps) {
  // Use backend-provided apartment stats when available; otherwise show zeros (no mock data)
  const apartmentStats = propApartmentStats ?? {
    total: 0,
    occupied: 0,
    available: 0,
    maintenance: 0,
  };

  const financialStats: FinancialStats = propFinancialStats ?? {
    totalRevenue: 0,
    debtorCount: 0,
    collectionRate: 0,
    totalExpected: 0,
  };

  const requestStats = propRequestStats ?? {
    new: 0,
    inProgress: 0,
    resolved: 0,
  };

  // Map backend fee types (e.g., MANAGEMENT) to friendly Vietnamese labels
  const feeTypeLabels: Record<string, string> = {
    MANAGEMENT: "Quản lý",
    SERVICE: "Dịch vụ",
    PARKING: "Giữ xe",
    WATER: "Nước",
    ELECTRIC: "Điện",
    INTERNET: "Internet",
    OTHER: "Khác",
  };

  // Dữ liệu biểu đồ thu phí theo loại - use backend data when available, else empty
  const revenueByFeeType: FeeRow[] = (propRevenueByFeeType ?? []).map((r) => ({
    name: feeTypeLabels[r.name] ?? r.name,
    amount: r.amount,
  }));

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
            value={formatCurrency(financialStats.totalExpected)}
            icon={DollarSign}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            subtitle={`Đã thu: ${formatCurrency(financialStats.totalRevenue)}`}
            trend={{
              value: `${financialStats.collectionRate}%`,
              isPositive: financialStats.collectionRate >= 0,
            }}
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
