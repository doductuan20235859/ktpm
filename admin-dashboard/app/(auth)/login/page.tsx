// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, LogIn, UserPlus, Key } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  // State
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "resident">("admin");

  // View State
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

  // Forgot password states
  const [forgotPhone, setForgotPhone] = useState("");
  const [resetStep, setResetStep] = useState<"phone" | "code" | "newPassword">(
    "phone"
  );
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // --- HÀM XỬ LÝ ĐĂNG NHẬP GỌI API (ĐÃ SỬA) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Gọi API Backend
      const response = await fetch("http://[::1]:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phone,
          password: password,
          role: role.toUpperCase(), // Gửi lên backend: 'ADMIN' hoặc 'RESIDENT'
        }),
      });

      const data = await response.json();

      // 2. Kiểm tra lỗi từ Backend
      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // 3. Đăng nhập thành công - Lưu dữ liệu vào localStorage
      console.log("Login Success Data:", data); // Log để kiểm tra

      localStorage.setItem("accessToken", data.accessToken);

      // Lưu thông tin User (Bao gồm cả role từ DB trả về cho chắc chắn)
      if (data.user) {
        localStorage.setItem("userInfo", JSON.stringify(data.user));
        localStorage.setItem("userRole", data.user.role); // Lưu "ADMIN" hoặc "RESIDENT"
      }

      // 4. Chuyển hướng dựa trên Role TRẢ VỀ TỪ BACKEND
      // Backend trả về: "ADMIN" hoặc "RESIDENT" (Uppercase)
      const userRole = data.user?.role;

      alert(`Đăng nhập thành công! Xin chào ${data.user?.fullName}`);

      if (userRole === "ADMIN") {
        router.push("/dashboard");
      } else if (userRole === "RESIDENT") {
        router.push("/portal");
      } else {
        // Trường hợp role lạ hoặc lỗi
        console.error("Unknown role:", userRole);
        router.push("/");
      }
    } catch (error: any) {
      // Xử lý lỗi
      console.error("Login Error:", error);
      alert(error.message || "Có lỗi xảy ra khi kết nối tới server.");
    } finally {
      setLoading(false);
    }
  };

  // ... (Các hàm handleRegister và handleForgotPassword giữ nguyên)
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
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
        alert("Mã xác nhận giả lập: 123456");
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
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
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

        {/* Card Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-slide-up backdrop-blur-sm bg-white/95">
          {/* LOGIN FORM */}
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
                <label className="block text-sm text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
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
                <label className="block text-sm text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
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
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>

              {/* Nút chuyển sang đăng ký */}
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-600">
                  Chưa có tài khoản?{" "}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentView("register")}
                  className="text-sm text-blue-600 font-semibold hover:underline"
                >
                  Đăng ký ngay
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {currentView === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Simplified Register Form */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg"
                  value={registerData.fullName}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      fullName: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border rounded-lg"
                  value={registerData.phone}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border rounded-lg"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Nhập lại mật khẩu
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border rounded-lg"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCurrentView("login")}
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {currentView === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {resetStep === "phone" && (
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border rounded-lg"
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    required
                  />
                </div>
              )}
              {resetStep === "code" && (
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Mã xác nhận (Demo: 123456)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                </div>
              )}
              {resetStep === "newPassword" && (
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    className="w-full px-4 py-3 border rounded-lg"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    className="w-full px-4 py-3 border rounded-lg"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all"
              >
                {loading ? "Đang xử lý..." : "Tiếp tục"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCurrentView("login")}
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
