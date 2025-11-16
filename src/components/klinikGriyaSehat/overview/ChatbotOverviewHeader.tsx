// components/overview/ChatbotOverviewHeader.tsx

import React from "react";
import { MessageSquare } from "lucide-react";

/**
 * Header component untuk halaman Chatbot Overview
 */
export const ChatbotOverviewHeader: React.FC = () => (
  <div className="flex items-center gap-3">
    <div>
      <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      <p className="text-muted-foreground">Overview aktivitas chatbot WhatsApp klinik</p>
    </div>
  </div>
);