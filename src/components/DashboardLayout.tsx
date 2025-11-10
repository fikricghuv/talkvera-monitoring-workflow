import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
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
import { ChartPie, CircleUserRound, UserRoundPen, LogOut, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardHeader() {
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = () => {
    toast.success("Berhasil logout!");
    navigate("/login");
  };

  const handleProfile = () => {
    toast.info("Navigasi ke halaman profile");
    navigate("/profile");
  };

  return (
    <header className="h-16 border-b bg-card flex items-center px-6 gap-4">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={toggleSidebar}
        className="hover:bg-accent"
      >
        {isCollapsed ? (
          <ChevronsRight className="!w-5 !h-5" />
        ) : (
          <ChevronsLeft className="!w-5 !h-5" />
        )}
      </Button>
      
      <div className="flex items-center gap-2 flex-1">
        <ChartPie className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-semibold">Workflow Monitoring</h1>
      </div>
      
      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <CircleUserRound className="!w-8 !h-8" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
            <UserRoundPen className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}