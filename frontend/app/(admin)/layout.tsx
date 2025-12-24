"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer"; // Giả sử bạn đã move file này vào đây

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State quản lý giao diện
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // State User (Trong thực tế bạn nên dùng Context hoặc Global State)
  const [userRole, setUserRole] = useState<"admin" | "resident">("admin");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>("");

  const handleLogout = () => {
    // Logic logout: chuyển hướng về trang login hoặc xóa token
    console.log("Logout clicked");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 1. Header */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userRole={userRole}
        setUserRole={setUserRole}
        onProfileClick={() => setShowProfileModal(true)}
        userAvatarUrl={userAvatarUrl}
      />

      {/* 2. Profile Drawer (Modal ẩn) */}
      <ProfileDrawer
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userRole={userRole}
        onLogout={handleLogout}
        avatarUrl={userAvatarUrl}
        onAvatarChange={setUserAvatarUrl}
      />

      {/* 3. Main Area */}
      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} userRole={userRole} />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          {/* Children chính là nội dung của các trang con (Dashboard, Apartments...) */}
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
