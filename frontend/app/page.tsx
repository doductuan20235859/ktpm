import { redirect } from "next/navigation";

export default function RootPage() {
  // Khi người dùng vào trang chủ (localhost:3000),
  // tự động chuyển hướng sang trang /dashboard
  redirect("/login");
}
