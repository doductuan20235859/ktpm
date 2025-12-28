"use client";

import { Menu, X, Building2, UserCircle } from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole: "admin" | "resident";
  setUserRole: (role: "admin" | "resident") => void;
  onProfileClick: () => void;
  userAvatarUrl?: string;
}

export function Header({
  sidebarOpen,
  setSidebarOpen,
  userRole,
  setUserRole,
  onProfileClick,
  userAvatarUrl,
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo & Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl text-gray-800">Hệ Thống Quản Lý Chung Cư</h1>
          </div>
        </div>

        {/* User Info & Role Switcher */}
        <div className="flex items-center gap-3">
          <select
            value={userRole}
            onChange={(e) =>
              setUserRole(e.target.value as "admin" | "resident")
            }
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="admin">Admin</option>
            <option value="resident">Cư dân</option>
          </select>

          <button
            onClick={onProfileClick}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-900">
                {userRole === "admin" ? "Admin User" : "Nguyễn Văn An"}
              </p>
              <p className="text-xs text-gray-500">
                {userRole === "admin" ? "Ban Quản Lý" : "Cư dân A-101"}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white overflow-hidden">
              {userAvatarUrl ? (
                <img
                  src={userAvatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle className="w-5 h-5" />
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
