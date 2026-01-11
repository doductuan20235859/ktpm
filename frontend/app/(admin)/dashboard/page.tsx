// app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/modules/Dashboard";

interface ApartmentStats {
  total: number;
  occupied: number;
  available: number;
  maintenance: number;
}

export default function DashboardPage() {
  const [apartmentStats, setApartmentStats] = useState<ApartmentStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  async function fetchApartmentStats(signal?: AbortSignal) {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/apartments/stats`, { signal });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Failed to fetch apartment stats: ${res.status} ${text}`
        );
      }
      const data = await res.json();
      console.log("apartment stats response:", data);
      if (data && typeof data.total === "number") {
        setApartmentStats({
          total: data.total,
          occupied: data.occupied ?? 0,
          available: data.available ?? 0,
          maintenance: data.maintenance ?? 0,
        });
      } else {
        console.warn("Unexpected apartment stats shape:", data);
      }
    } catch (err: any) {
      if (err.name === "AbortError") return; // fetch was aborted
      console.error("Error fetching apartment stats:", err);
    } finally {
      setLoading(false);
    }
  }

  const [financialStats, setFinancialStats] = useState<{
    totalRevenue: number;
    debtorCount: number;
    collectionRate: number;
    totalExpected: number;
  } | null>(null);

  const [revenueByFeeType, setRevenueByFeeType] = useState<
    { name: string; amount: number }[] | null
  >(null);

  const [requestStats, setRequestStats] = useState<{
    new: number;
    inProgress: number;
    resolved: number;
  } | null>(null);

  async function fetchFinancialSummary(signal?: AbortSignal) {
    try {
      const res = await fetch(`${apiBase}/invoices/summary`, { signal });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Failed to fetch financial summary: ${res.status} ${text}`
        );
      }
      const data = await res.json();
      console.log("financial summary response:", data);
      if (data?.financialStats) {
        setFinancialStats(data.financialStats);
      }
      if (Array.isArray(data?.revenueByFeeType)) {
        setRevenueByFeeType(
          data.revenueByFeeType.map((r: any) => ({
            name: r.name,
            amount: Number(r.amount),
          }))
        );
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("Error fetching financial summary:", err);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    fetchApartmentStats(controller.signal);
    fetchFinancialSummary(controller.signal);

    // Fetch request stats
    (async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;
        const res = await fetch(`${apiBase}/requests/stats`, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `Failed to fetch request stats: ${res.status} ${text}`
          );
        }
        const data = await res.json();
        console.log("request stats response:", data);
        if (data && typeof data.new === "number") {
          setRequestStats({
            new: data.new,
            inProgress: data.inProgress ?? 0,
            resolved: data.resolved ?? 0,
          });
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Error fetching request stats:", err);
      }
    })();

    return () => controller.abort();
  }, []);

  const router = useRouter();

  return (
    <Dashboard
      onNavigateToRequests={() => router.push("/management")}
      apartmentStats={apartmentStats}
      financialStats={financialStats}
      revenueByFeeType={revenueByFeeType}
      requestStats={requestStats}
    />
  );
}
