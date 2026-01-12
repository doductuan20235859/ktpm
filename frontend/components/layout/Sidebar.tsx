"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  FileText,
  ListCheck,
  Sparkles,
  DollarSign,
  Settings,
  Truck,
  Bell,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  userRole: "admin" | "resident";
}

export function Sidebar({ isOpen, userRole }: SidebarProps) {
  const pathname = usePathname(); // Lấy đường dẫn hiện tại để highlight menu

  // Logic xác định menu items dựa trên role
  const getMenuItems = () => {
    if (userRole === "resident") {
      return [
        {
          href: "/portal",
          icon: Home,
          label: "Trang Chủ",
          color: "text-blue-600",
        },
        {
          href: "/amenities",
          icon: Sparkles,
          label: "Tiện Ích",
          color: "text-purple-600",
        },
      ];
    }

    // Menu cho Admin
    return [
      {
        href: "/dashboard",
        icon: Home,
        label: "Tổng Quan",
        color: "text-blue-600",
      },
      {
        href: "/apartments",
        icon: Building2,
        label: "Quản Lý Hộ Dân",
        color: "text-green-600",
      },
      {
        href: "/management",
        icon: ListCheck,
        label: "Quản Lý Yêu Cầu",
        color: "text-indigo-600",
      },
      {
        href: "/admin_amenities",
        icon: Sparkles,
        label: "Quản Lý Tiện Ích",
        color: "text-purple-600",
      },
      {
        href: "/admin_vehicles",
        icon: Truck,
        label: "Quản Lý Xe",
        color: "text-amber-600",
      },
      {
        href: "/admin_notifications",
        icon: Bell,
        label: "Quản Lý Thông Báo",
        color: "text-red-600",
      },
      {
        href: "/financial",
        icon: DollarSign,
        label: "Thu Phí & Phiếu Thu",
        color: "text-emerald-600",
      },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-20 ${
        isOpen ? "w-64" : "w-0"
      } overflow-hidden`}
    >
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Kiểm tra link active: so sánh tương đối đường dẫn
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? item.color : "text-gray-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
