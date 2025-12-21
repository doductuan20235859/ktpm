// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Hook để chuyển trang
import { Building2, Eye, EyeOff, LogIn, UserPlus, Key } from "lucide-react";

export default function LoginPage() {
  // <--- Phải là DEFAULT export
  const router = useRouter();

  // Các state cũ giữ nguyên
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "resident">("admin");
  const [currentView, setCurrentView] = useState<
    "login" | "register" | "forgot"
  >("login");
  const [loading, setLoading] = useState(false);

  // Register form states
  const [registerData, setRegisterData] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    apartmentCode: "",
    role: "resident" as "admin" | "resident",
  });

  // Forgot password form states
  const [forgotPhone, setForgotPhone] = useState("");
  const [resetStep, setResetStep] = useState<"phone" | "code" | "newPassword">(
    "phone"
  );
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const trimmedPhone = phone.trim();
      const trimmedPassword = password.trim();

      const isValidAdminAccount =
        trimmedPhone === "0912345678" && trimmedPassword === "123456";
      const isValidResidentAccount =
        trimmedPhone === "0987654321" && trimmedPassword === "123456";

      if (isValidAdminAccount || isValidResidentAccount) {
        // --- LOGIC MỚI CHO NEXT.JS ---
        // 1. Lưu thông tin đăng nhập (ví dụ lưu vào localStorage hoặc Cookie)
        localStorage.setItem("userRole", role);
        localStorage.setItem("isLoggedIn", "true");

        // 2. Chuyển hướng dựa trên Role
        if (role === "resident") {
          router.push("/portal"); // Ví dụ trang cư dân
        } else {
          router.push("/dashboard"); // Trang admin
        }
      } else {
        alert("Số điện thoại hoặc mật khẩu không đúng!");
      }
    }, 1000);
  };

  // ... (Phần logic handleRegister và handleForgotPassword GIỮ NGUYÊN)
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (registerData.password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      setCurrentView("login");
      setPhone(registerData.phone);
    }, 1000);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (resetStep === "phone") {
        alert("Mã xác nhận đã được gửi đến số điện thoại của bạn!");
        setResetStep("code");
      } else if (resetStep === "code") {
        if (verificationCode === "123456") {
          setResetStep("newPassword");
        } else {
          alert("Mã xác nhận không đúng!");
        }
      } else if (resetStep === "newPassword") {
        if (newPassword !== confirmNewPassword) {
          alert("Mật khẩu xác nhận không khớp!");
          return;
        }
        alert("Đặt lại mật khẩu thành công!");
        setCurrentView("login");
        setResetStep("phone");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* ... (Phần giao diện UI bên trong giữ nguyên hoàn toàn như cũ) ... */}
      {/* COPY TOÀN BỘ PHẦN return TỪ FILE CŨ VÀO ĐÂY, CHỈ LƯU Ý PHẦN FORM LOGIN GỌI HÀM handleLogin ĐÃ SỬA Ở TRÊN */}

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg hover:shadow-xl transition-shadow">
            <Building2 className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl text-gray-800 mb-2">
            Hệ Thống Quản Lý Chung Cư
          </h1>
          <p className="text-gray-600">
            {currentView === "login" && "Đăng nhập vào hệ thống"}
            {currentView === "register" && "Đăng ký tài khoản mới"}
            {currentView === "forgot" && "Khôi phục mật khẩu"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-slide-up backdrop-blur-sm bg-white/95">
          {currentView === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Đăng nhập với vai trò
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      role === "admin"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Key className="w-5 h-5" />
                      <span className="text-sm">Admin</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("resident")}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      role === "resident"
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <UserPlus className="w-5 h-5" />
                      <span className="text-sm">Cư dân</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm text-gray-700 mb-2"
                >
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm text-gray-700 mb-2"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentView("forgot")}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
              >
                <LogIn className="w-5 h-5" />
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-900 text-center mb-2">
                  <strong>Tài khoản demo:</strong>
                </p>
                <div className="space-y-1 text-xs text-amber-800">
                  <button
                    type="button"
                    onClick={() => {
                      setPhone("0912345678");
                      setPassword("123456");
                      setRole("admin");
                    }}
                    className="w-full flex items-center justify-between bg-white/60 hover:bg-white/90 px-3 py-2 rounded transition-colors"
                  >
                    <span>👨‍💼 Admin:</span>
                    <span>
                      <strong>0912345678</strong> | 123456
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ... Copy nốt phần Register và Forgot form vào đây ... */}
          {/* Để cho ngắn gọn tôi không paste lại toàn bộ UI, bạn hãy copy phần UI của file cũ vào đây nhé */}
        </div>
      </div>
    </div>
  );
}
