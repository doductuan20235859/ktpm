// app/(resident)/layout.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Cố định role là resident cho layout này
  const userRole = "resident";

  const handleLogout = () => {
    // Xóa session/token
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userRole={userRole}
        // Ở trang resident thì không cho đổi role qua lại, truyền hàm rỗng
        setUserRole={() => {}}
        onProfileClick={() => setShowProfileModal(true)}
      />

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userRole={userRole}
        onLogout={handleLogout}
        avatarUrl=""
        onAvatarChange={() => {}}
      />

      <div className="flex pt-16">
        {/* Sidebar: Truyền role="resident" để nó chỉ hiện menu của cư dân */}
        <Sidebar isOpen={sidebarOpen} userRole={userRole} />

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
