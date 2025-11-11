import {
  LayoutDashboard,
  Workflow,
  FileClock,
  Boxes,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const menuItems = [
  // ... (menu items Anda tetap sama)
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Workflow Executions",
    url: "/workflow-execution",
    icon: Workflow,
  },
  {
    title: "Detail Node Execution",
    url: "/node-execution",
    icon: FileClock,
  },
  {
    title: "Process Queue",
    url: "/queue-execution",
    icon: Boxes,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const handleLogout = () => {
    toast.success("Berhasil logout!");
    navigate("/login");
  };

  return (
    // Sebaiknya gunakan h-full di sini agar pas dengan DashboardLayout
    <Sidebar collapsible="icon" className="flex h-full flex-col">
      {/* 2. Bagian Header (Logo/Nama Aplikasi) */}
      <div
        // --- PERUBAHAN 1: className dinamis untuk header ---
        className={`flex h-16 items-center border-b bg-card ${
          collapsed ? "justify-center px-2" : "px-6"
        }`}
      >
        {/* --- PERUBAHAN 2: Sembunyikan logo saat collapsed --- */}
        {!collapsed && (
          <img
            src="/assets/full-logo-cyan-blue.svg"
            alt="Talkvera Logo"
            className="h-8 w-auto"
          />
        )}

        {/* --- PERUBAHAN 3: Tombol toggle dengan margin dinamis --- */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          // --- PERUBAHAN 4: 'ml-auto' HANYA saat tidak collapsed ---
          className={`hover:bg-accent ${!collapsed ? "ml-auto" : ""}`}
        >
          {collapsed ? (
            <ChevronsRight className="!w-5 !h-5" />
          ) : (
            <ChevronsLeft className="!w-5 !h-5" />
          )}
        </Button>
      </div>

      {/* Area konten/menu (tidak berubah) */}
      <SidebarContent className="flex-1 overflow-y-auto pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink to={item.url}>
                        <item.icon className="!h-5 !w-5" />
                        {!collapsed && <span className="text-l">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Bagian Footer (tidak berubah) */}
      <div className="mt-auto border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname.startsWith("/profile")}
            >
              <NavLink to="/profile">
                <Settings className="!h-5 !h-5" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="!h-5 !w-5 text-red-500" />
              {!collapsed && <span className="text-red-500">Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}