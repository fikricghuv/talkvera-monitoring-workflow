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
import { ProtectedRoute } from "./components/ProtectedRoute";
import ChatSessionManagement from "./pages/klinik-griya-sehat/ChatSessionManagement"
import PatientManagement from "./pages/klinik-griya-sehat/PatientManagement"
import RagManagement from "./pages/klinik-griya-sehat/RagManagement"

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
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <HeaderLayout>
                  <Dashboard />
                </HeaderLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflow-information"
            element={
              <ProtectedRoute>
                <HeaderLayout>
                  <WorkflowInformation />
                </HeaderLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflow-execution"
            element={
              <ProtectedRoute>
                <HeaderLayout>
                  <WorkflowExecution />
                </HeaderLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/node-execution"
            element={
              <ProtectedRoute>
                <HeaderLayout>
                  <DetailExecution />
                </HeaderLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/queue-execution"
            element={
              <ProtectedRoute>
                <HeaderLayout>
                  <ProcessQueue />
                </HeaderLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <HeaderLayout>
                  <Profile />
                </HeaderLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/klinik-griya-sehat/overview"
            element={
              <ProtectedRoute>
                <HeaderLayout>
                  <ChatbotOverview />
                </HeaderLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/klinik-griya-sehat/data-patient"
            element={
              <ProtectedRoute>
                <HeaderLayout>
                  <PatientManagement />
                </HeaderLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/klinik-griya-sehat/chat-session"
            element={
              <ProtectedRoute>
                <HeaderLayout>
                  <ChatSessionManagement />
                </HeaderLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/klinik-griya-sehat/appointment"
            element={
              <ProtectedRoute>
                <HeaderLayout>
                  <AppointmentManagement />
                </HeaderLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/klinik-griya-sehat/data-upload"
            element={
              <ProtectedRoute>
                <HeaderLayout>
                  <RagManagement />
                </HeaderLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/talkvera-data-agent/overview"
            element={
              <ProtectedRoute>
                <HeaderLayout>
                  <AgentOverview />
                </HeaderLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/talkvera-data-agent/query-monitoring"
            element={
              <ProtectedRoute>
                <HeaderLayout>
                  <AgentMonitoring />
                </HeaderLayout>
              </ProtectedRoute>
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