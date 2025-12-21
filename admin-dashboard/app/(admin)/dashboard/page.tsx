// app/(dashboard)/dashboard/page.tsx
"use client";

import { Dashboard } from "@/components/modules/Dashboard";
// (Đảm bảo bạn đã import đúng đường dẫn tới component Dashboard cũ)

export default function DashboardPage() {
  return <Dashboard onNavigateToRequests={() => {}} />;
}
