// hooks/useChatbotOverviewData.ts

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChatbotOverviewService } from "../services/chatbotOverviewService";
import { OverviewData } from "../types/chatbotOverview";

/**
 * Custom hook untuk fetch dan manage chatbot overview data
 * @param startDate - Tanggal mulai filter
 * @param endDate - Tanggal akhir filter
 * @returns Object dengan overview data, isLoading, dan refetch function
 */
export const useChatbotOverviewData = (startDate: Date, endDate: Date) => {
  const [data, setData] = useState<OverviewData>({
    kpiData: {
      totalPatients: 0,
      activeSessions: 0,
      completedSessions: 0,
      totalMessages: 0,
      totalAppointments: 0,
      pendingAppointments: 0,
    },
    recentSessions: [],
    statusDistribution: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch data dari service dengan date range
   */
  const fetchData = async (showToast: boolean = false) => {
    if (showToast) {
      setIsLoading(true);
    }

    try {
      const overviewData = await ChatbotOverviewService.fetchOverviewData(
        startDate,
        endDate
      );
      setData(overviewData);

      if (showToast) {
        toast.success("Data berhasil dimuat");
      }
    } catch (error) {
      console.error("Error fetching overview data:", error);
      toast.error("Gagal memuat data overview");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data whenever date range changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  return {
    data,
    isLoading,
    refetch: () => fetchData(true),
  };
};