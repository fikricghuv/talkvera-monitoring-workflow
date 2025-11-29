import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DetailExecution from "./pages/DetailExecution";
import ProcessQueue from "./pages/ProcessQueue";
import { HeaderLayout } from "./components/HeaderLayout";
import NotFound from "./pages/NotFound";
import WorkflowExecution from "./pages/WorkflowExecution";
import Profile from "./pages/Profile";
import WorkflowInformation from "./pages/WorkflowInformation";
import ChatbotOverview from "./pages/klinik-griya-sehat/ChatbotOverview";
import AppointmentManagement from "./pages/klinik-griya-sehat/AppointmentManagement";
import AgentOverview from "./pages/talkvera-data-agent/DataAgentOverview";
import AgentMonitoring from "./pages/talkvera-data-agent/AgentMonitoring";
import ChatSessionManagement from "./pages/klinik-griya-sehat/ChatSessionManagement";
import PatientManagement from "./pages/klinik-griya-sehat/PatientManagement";
import RagManagement from "./pages/klinik-griya-sehat/RagManagement";
import OperasionalBisnisOverview from "./pages/operasional-bisnis/OperasionalBisnisOverview";
import RagManagementTalkvera from "./pages/operasional-bisnis/RagManagementTalkvera";
import AppointmentManagementTalkvera from "./pages/operasional-bisnis/AppointmentManagementTalkvera";
import ChatSessionManagementTalkvera from "./pages/operasional-bisnis/ChatConversationsTalkvera";
import RoleManagement from "./pages/RoleManagement";
import { PermissionRoute } from "./components/PermissionRoute";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes dengan Permission Check */}
            <Route
              path="/dashboard"
              element={
                <PermissionRoute requiredResource="dashboard">
                  <HeaderLayout>
                    <Dashboard />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            <Route
              path="/workflow-information"
              element={
                <PermissionRoute requiredResource="workflow_information">
                  <HeaderLayout>
                    <WorkflowInformation />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            <Route
              path="/workflow-execution"
              element={
                <PermissionRoute requiredResource="workflow_executions">
                  <HeaderLayout>
                    <WorkflowExecution />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            <Route
              path="/node-execution"
              element={
                <PermissionRoute requiredResource="node_execution">
                  <HeaderLayout>
                    <DetailExecution />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            <Route
              path="/queue-execution"
              element={
                <PermissionRoute requiredResource="process_queue">
                  <HeaderLayout>
                    <ProcessQueue />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            
            {/* Profile - Accessible by all authenticated users */}
            <Route
              path="/profile"
              element={
                <PermissionRoute requiredResource="dashboard">
                  <HeaderLayout>
                    <Profile />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            
            {/* Access Management - Admin only */}
            <Route
              path="/access-management"
              element={
                <PermissionRoute requiredResource="access_management">
                  <HeaderLayout>
                    <RoleManagement />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            
            {/* Klinik Griya Sehat Project */}
            <Route
              path="/projects/klinik-griya-sehat/overview"
              element={
                <PermissionRoute requiredResource="klinik_overview">
                  <HeaderLayout>
                    <ChatbotOverview />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            <Route
              path="/projects/klinik-griya-sehat/data-patient"
              element={
                <PermissionRoute requiredResource="klinik_patient">
                  <HeaderLayout>
                    <PatientManagement />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            <Route
              path="/projects/klinik-griya-sehat/chat-session"
              element={
                <PermissionRoute requiredResource="klinik_chat">
                  <HeaderLayout>
                    <ChatSessionManagement />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            <Route
              path="/projects/klinik-griya-sehat/appointment"
              element={
                <PermissionRoute requiredResource="klinik_appointment">
                  <HeaderLayout>
                    <AppointmentManagement />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            <Route
              path="/projects/klinik-griya-sehat/data-upload"
              element={
                <PermissionRoute requiredResource="klinik_rag">
                  <HeaderLayout>
                    <RagManagement />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            
            {/* Talkvera Data Agent Project */}
            <Route
              path="/projects/talkvera-data-agent/overview"
              element={
                <PermissionRoute requiredResource="data_agent_overview">
                  <HeaderLayout>
                    <AgentOverview />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            <Route
              path="/projects/talkvera-data-agent/query-monitoring"
              element={
                <PermissionRoute requiredResource="data_agent_monitoring">
                  <HeaderLayout>
                    <AgentMonitoring />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            
            {/* Operasional Management Project */}
            <Route
              path="/projects/operasional-management/overview"
              element={
                <PermissionRoute requiredResource="operasional_overview">
                  <HeaderLayout>
                    <OperasionalBisnisOverview />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            <Route
              path="/projects/operasional-management/knowledge-base"
              element={
                <PermissionRoute requiredResource="operasional_kb">
                  <HeaderLayout>
                    <RagManagementTalkvera />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            <Route
              path="/projects/operasional-management/appointment-monitoring"
              element={
                <PermissionRoute requiredResource="operasional_appointment">
                  <HeaderLayout>
                    <AppointmentManagementTalkvera />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            <Route
              path="/projects/operasional-management/chat-session"
              element={
                <PermissionRoute requiredResource="operasional_chat">
                  <HeaderLayout>
                    <ChatSessionManagementTalkvera />
                  </HeaderLayout>
                </PermissionRoute>
              }
            />
            
            {/* 404 - Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;