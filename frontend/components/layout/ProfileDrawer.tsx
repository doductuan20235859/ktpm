import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Camera, Phone, CheckCircle, LogOut, Key } from "lucide-react";
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
  const router = useRouter();

  const [profileData, setProfileData] = useState({
    fullName: "",
    dob: "",
    phone: "",
    zaloId: "",
    apartment: "",
    status: "active",
    realRole: "",
  });

  const [localAvatarUrl, setLocalAvatarUrl] = useState<string>(
    initialAvatarUrl || ""
  );
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [isEdited, setIsEdited] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- LOGIC LOAD DỮ LIỆU TỪ LOCAL STORAGE ---
  useEffect(() => {
    if (isOpen) {
      try {
        const storedUserInfo = localStorage.getItem("userInfo");
        if (storedUserInfo) {
          const user = JSON.parse(storedUserInfo);

          setProfileData((prev) => ({
            ...prev,
            fullName: user.fullName || "",
            phone: user.phoneNumber || "",
            realRole: user.role || "",
            apartment:
              user.apartmentCode ||
              (user.role === "ADMIN" ? "Văn phòng BQL" : "Đang cập nhật"),
          }));

          // [QUAN TRỌNG] Lấy ảnh từ LocalStorage hiển thị lên ngay khi mở
          if (user.avatarUrl) {
            setLocalAvatarUrl(user.avatarUrl);
          }
        }
      } catch (error) {
        console.error("Lỗi đọc dữ liệu user:", error);
      }
    }
  }, [isOpen]);

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

      // Lưu file gốc để tí nữa gửi lên server
      setSelectedFile(file);

      // Hiển thị Preview tạm thời bằng Base64 để user thấy ngay
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalAvatarUrl(reader.result as string);
        setIsEdited(true);
        toast.success("Đã chọn ảnh đại diện mới", {
          description: 'Nhấn "Lưu thay đổi" để cập nhật lên hệ thống',
        });
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
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      // A. Nếu có chọn ảnh mới -> Upload ảnh trước
      if (selectedFile) {
        const formData = new FormData();
        formData.append("avatar", selectedFile);

        const uploadRes = await fetch("http://[::1]:3001/users/upload-avatar", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          const status = uploadRes.status;
          let errorMsg = "Lỗi không xác định";
          try {
            const errorData = await uploadRes.json();
            errorMsg = errorData.message || JSON.stringify(errorData);
          } catch (e) {
            errorMsg = await uploadRes.text();
          }
          throw new Error(`Server báo lỗi (${status}): ${errorMsg}`);
        }

        const uploadData = await uploadRes.json();

        // [QUAN TRỌNG] Cập nhật URL ảnh mới từ Backend vào localStorage
        const storedUserInfo = localStorage.getItem("userInfo");
        if (storedUserInfo) {
          const user = JSON.parse(storedUserInfo);
          user.avatarUrl = uploadData.avatarUrl; // Lưu link mới (http://localhost:3001/uploads/...)
          localStorage.setItem("userInfo", JSON.stringify(user));
        }

        // [QUAN TRỌNG] Cập nhật State hiển thị bằng Link thật từ Server (thay thế preview base64)
        setLocalAvatarUrl(uploadData.avatarUrl);

        console.log("Ảnh mới đã lưu:", uploadData.avatarUrl);
      }

      // B. Cập nhật các thông tin text khác
      const storedUserInfo = localStorage.getItem("userInfo");
      if (storedUserInfo) {
        const user = JSON.parse(storedUserInfo);
        const updatedUser = {
          ...user,
          fullName: profileData.fullName,
          phoneNumber: profileData.phone,
        };
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      }

      setIsEdited(false);
      setSelectedFile(null);

      toast.success("Cập nhật thông tin thành công!", {
        description: "Thông tin cá nhân đã được lưu.",
        duration: 3000,
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Có lỗi xảy ra khi lưu thông tin");
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Bạn có chắc muốn đăng xuất?");
    if (confirmLogout) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userInfo");

      toast.success("Đăng xuất thành công!", {
        description: "Hẹn gặp lại bạn.",
        duration: 2000,
      });

      if (onLogout) {
        onLogout();
      }
      router.push("/login");
    }
  };

  const handleClose = () => {
    if (isEdited) {
      const confirmClose = window.confirm(
        "Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng?"
      );
      if (confirmClose) {
        // Reset lại avatar về giá trị cũ trong localStorage nếu đóng mà không lưu
        const storedUserInfo = localStorage.getItem("userInfo");
        if (storedUserInfo) {
          const user = JSON.parse(storedUserInfo);
          if (user.avatarUrl) setLocalAvatarUrl(user.avatarUrl);
        }
        setIsEdited(false);
        setSelectedFile(null);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getDisplayRole = () => {
    if (profileData.realRole === "ADMIN") return "Ban Quản Lý";
    if (profileData.realRole === "RESIDENT") return "Cư dân";
    return userRole === "admin" ? "Ban Quản Lý" : "Cư dân";
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Cover Image Section */}
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
          <div className="relative -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl overflow-hidden bg-white">
              {localAvatarUrl ? (
                <img
                  src={localAvatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback nếu ảnh lỗi
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-gray-400 font-bold text-4xl">
                  {profileData.fullName.charAt(0)?.toUpperCase()}
                </span>
              )}
              {/* Hiển thị chữ cái đầu nếu img lỗi hoặc không có url nhưng img bị ẩn */}
              {localAvatarUrl && (
                <span className="hidden">Mock to keep layout</span>
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

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl text-gray-900 mb-1 font-bold">
                {profileData.fullName || "Đang tải..."}
              </h2>
              <p className="text-sm text-gray-500 mb-2 font-medium">
                {getDisplayRole()}
                {profileData.apartment &&
                  profileData.apartment !== "N/A" &&
                  ` - ${profileData.apartment}`}
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
              <h3 className="text-sm text-gray-500 mb-4 font-semibold uppercase tracking-wider">
                Thông tin cá nhân
              </h3>

              <div className="mb-5">
                <label className="block text-sm text-gray-700 mb-2 font-medium">
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

              <div className="mb-5">
                <label className="block text-sm text-gray-700 mb-2 font-medium">
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

              {userRole === "resident" && (
                <div className="mb-5">
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
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

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm text-gray-500 mb-4 font-semibold uppercase tracking-wider">
                Bảo mật
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="w-full text-left text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg flex items-center gap-3 transition-colors"
                >
                  <Key className="w-4 h-4" />
                  Đổi mật khẩu
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shadow-lg">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            disabled={!isEdited}
            className={`px-6 py-2.5 rounded-xl transition-all font-medium ${
              isEdited
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userRole={userRole}
      />

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
