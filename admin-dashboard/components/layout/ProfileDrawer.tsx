import { useState, useRef } from "react";
import {
  X,
  Camera,
  Calendar,
  Phone,
  MessageSquare,
  CheckCircle,
  LogOut,
} from "lucide-react";
import { ChangePasswordModal } from "../shared/ChangePasswordModal";
import { toast } from "sonner";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: "admin" | "resident";
  onLogout?: () => void;
  avatarUrl?: string;
  onAvatarChange?: (url: string) => void;
}

export function ProfileDrawer({
  isOpen,
  onClose,
  userRole,
  onLogout,
  avatarUrl: initialAvatarUrl,
  onAvatarChange,
}: ProfileDrawerProps) {
  const [profileData, setProfileData] = useState({
    fullName: userRole === "admin" ? "Nguyễn Văn Admin" : "Nguyễn Văn An",
    dob: userRole === "admin" ? "1985-05-15" : "1990-03-20",
    phone: userRole === "admin" ? "0912345678" : "0987654321",
    zaloId: userRole === "admin" ? "admin.nguyen" : "vanan90",
    apartment: userRole === "admin" ? "N/A" : "Căn A-101",
    status: "active",
  });

  const [localAvatarUrl, setLocalAvatarUrl] = useState<string>(
    initialAvatarUrl || ""
  );
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [isEdited, setIsEdited] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    setIsEdited(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalAvatarUrl(reader.result as string);
        setIsEdited(true);
        toast.success("Đã chọn ảnh đại diện mới", {
          description: 'Nhấn "Lưu thay đổi" để cập nhật',
        });
        if (onAvatarChange) {
          onAvatarChange(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverUrl(reader.result as string);
        setIsEdited(true);
        toast.success("Đã chọn ảnh bìa mới", {
          description: 'Nhấn "Lưu thay đổi" để cập nhật',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Save logic here
    console.log("Saving profile data:", profileData);
    setIsEdited(false);
    // Show success toast
    toast.success("Cập nhật thông tin thành công!", {
      description: "Thông tin cá nhân đã được lưu.",
      duration: 3000,
    });
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Bạn có chắc muốn đăng xuất?");
    if (confirmLogout) {
      // Mock logout logic
      console.log("Logging out...");
      toast.success("Đăng xuất thành công!", {
        description: "Hẹn gặp lại bạn.",
        duration: 2000,
      });
      // In a real app, this would redirect to login page
      // window.location.href = '/login';
      if (onLogout) {
        onLogout();
      }
    }
  };

  const handleClose = () => {
    if (isEdited) {
      const confirmClose = window.confirm(
        "Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng?"
      );
      if (confirmClose) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Cover Image */}
        <div
          className="relative h-32 flex-shrink-0 overflow-hidden"
          style={{
            backgroundImage: coverUrl
              ? `url(${coverUrl})`
              : "linear-gradient(to bottom right, #3b82f6, #2563eb, #9333ea)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-colors group"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
          />
        </div>

        {/* Profile Info Section */}
        <div className="relative px-6 pb-6 flex-shrink-0">
          {/* Avatar overlapping banner */}
          <div className="relative -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl overflow-hidden">
              {localAvatarUrl ? (
                <img
                  src={localAvatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{profileData.fullName.charAt(0)}</span>
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-2 right-2 p-2 bg-white border-2 border-gray-200 rounded-full shadow-md hover:bg-gray-50 transition-colors"
            >
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Name and Status */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl text-gray-900 mb-1">
                {profileData.fullName}
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                {userRole === "admin" ? "Ban Quản Lý" : profileData.apartment}
              </p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
              <CheckCircle className="w-4 h-4" />
              Hoạt động
            </span>
          </div>
        </div>

        {/* Scrollable Form Section */}
        <div className="flex-1 overflow-y-auto px-6 pb-24">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm text-gray-500 mb-4">Thông tin cá nhân</h3>

              {/* Full Name Field */}
              <div className="mb-5">
                <label className="block text-sm text-gray-700 mb-2">
                  Họ và tên đầy đủ
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="Nhập họ và tên"
                />
              </div>

              {/* DOB Field */}
              <div className="mb-5">
                <label className="block text-sm text-gray-700 mb-2">
                  Ngày sinh
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={profileData.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="mb-5">
                <label className="block text-sm text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              {/* Zalo ID Field */}
              <div className="mb-5">
                <label className="block text-sm text-gray-700 mb-2">
                  Zalo ID
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.zaloId}
                    onChange={(e) =>
                      handleInputChange("zaloId", e.target.value)
                    }
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    placeholder="Nhập Zalo ID"
                  />
                </div>
              </div>

              {userRole === "resident" && (
                <div className="mb-5">
                  <label className="block text-sm text-gray-700 mb-2">
                    Căn hộ
                  </label>
                  <input
                    type="text"
                    value={profileData.apartment}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>
              )}
            </div>

            {/* Additional Section */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm text-gray-500 mb-4">Bảo mật</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 py-2 flex items-center gap-2 transition-colors"
                >
                  Đổi mật khẩu →
                </button>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700 py-2 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shadow-lg">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            disabled={!isEdited}
            className={`px-6 py-2.5 rounded-xl transition-all ${
              isEdited
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userRole={userRole}
      />

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
