import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChartPie,
  CircleUserRound,
  UserRoundPen,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardHeader() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    toast.success("Berhasil logout!");
    navigate("/login");
  };

  const handleProfile = () => {
    toast.info("Navigasi ke halaman profile");
    navigate("/profile");
  };

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border/40 bg-white backdrop-blur-sm flex items-center px-6 gap-4 transition-all duration-300">
      {/* Mobile Sidebar Trigger - Hanya tampil di mobile */}
      <div className="md:hidden">
        <SidebarTrigger />
      </div>

      {/* Title Section dengan animasi */}
      <div className="flex items-center gap-3 flex-1">
        <div className="relative hidden md:block">
          <div className="absolute inset-0 bg-primary/10 rounded-lg blur-md" />
          <ChartPie className="w-6 h-6 text-primary relative z-10 transition-transform duration-300 hover:scale-110 hover:rotate-12" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            Workflow Monitoring
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Real-time analytics & insights
          </p>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-2">
        {/* Profile Dropdown dengan enhanced styling */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-105 group relative overflow-hidden"
            >
              {/* Hover effect background */}
              <div className="absolute inset-0 bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full" />
              
              <CircleUserRound className="!w-8 !h-8 relative z-10 transition-all duration-300 group-hover:text-primary" />
              
              {/* Active indicator dot */}
              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white z-20" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
          >
            <DropdownMenuLabel className="font-semibold">
              Akun Saya
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleProfile} 
              className="cursor-pointer transition-all duration-200 hover:bg-primary/15 focus:bg-primary/15 group"
            >
              <UserRoundPen className="w-4 h-4 mr-2 text-foreground group-hover:text-primary transition-all duration-200 group-hover:scale-110" />
              <span className="text-foreground group-hover:text-primary font-medium transition-colors duration-200">
                Profile
              </span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer hover:bg-red-100 focus:bg-red-100 transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 mr-2 text-red-600 group-hover:text-red-700 transition-all duration-200 group-hover:scale-110" />
              <span className="text-red-600 group-hover:text-red-700 font-medium transition-colors duration-200">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// Komponen Layout Utama dengan enhanced styling
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 bg-gradient-to-br from-background via-background to-muted/10 overflow-auto">
            <div className="max-w-[1600px] mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}