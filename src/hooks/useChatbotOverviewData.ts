// hooks/useChatbotOverviewData.ts

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChatbotOverviewService } from "../services/chatbotOverviewService";
import { OverviewData } from "../types/chatbotOverview";
import { OVERVIEW_CONSTANTS } from "../constants/chatbotOverview";

/**
 * Custom hook untuk fetch dan manage chatbot overview data
 * @param autoRefresh - Enable auto refresh setiap 30 detik
 * @returns Object dengan overview data, isLoading, dan refetch function
 */
export const useChatbotOverviewData = (autoRefresh: boolean = false) => {
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
   * Fetch data dari service
   */
  const fetchData = async (showToast: boolean = false) => {
    if (showToast) {
      setIsLoading(true);
    }
    
    try {
      const overviewData = await ChatbotOverviewService.fetchOverviewData();
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

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData(false); // Silent refresh
    }, OVERVIEW_CONSTANTS.AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return { 
    data,
    isLoading, 
    refetch: () => fetchData(true)
  };
};