import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DetailExecution from "./pages/DetailExecution";
import ProcessQueue from "./pages/ProcessQueue";
import { DashboardLayout } from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import WorkflowExecution from "./pages/WorkflowExecution";
import Profile from "./pages/Profile";
import WorkflowInformation from "./pages/WorkflowInformation"
import ChatbotOverview  from "./pages/klinik-griya-sehat/ChatbotOverview"
import AppointmentManagement from "./pages/klinik-griya-sehat/AppointmentManagement"

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/workflow-information"
            element={
              <DashboardLayout>
                <WorkflowInformation />
              </DashboardLayout>
            }
          />
          <Route
            path="/workflow-execution"
            element={
              <DashboardLayout>
                <WorkflowExecution />
              </DashboardLayout>
            }
          />
          <Route
            path="/node-execution"
            element={
              <DashboardLayout>
                <DetailExecution />
              </DashboardLayout>
            }
          />
          <Route
            path="/queue-execution"
            element={
              <DashboardLayout>
                <ProcessQueue />
              </DashboardLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            }
          />
          <Route
            path="/projects/klinik-sehat-sentosa/overview"
            element={
              <DashboardLayout>
                <ChatbotOverview />
              </DashboardLayout>
            }
          />
          <Route
            path="/projects/klinik-sehat-sentosa/appointment"
            element={
              <DashboardLayout>
                <AppointmentManagement />
              </DashboardLayout>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
