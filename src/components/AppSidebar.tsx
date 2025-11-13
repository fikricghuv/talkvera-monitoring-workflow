import {
  LayoutDashboard,
  Workflow,
  FileClock,
  Boxes,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Network,
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
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Workflow Information",
    url: "/workflow-information",
    icon: Network,
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
    <Sidebar 
      collapsible="icon" 
      className="flex h-full flex-col border-r border-border/40 bg-white"
    >
      {/* Header dengan animasi smooth */}
      <div
        className={`
          flex h-16 items-center border-b border-border/40 bg-white backdrop-blur-sm
          transition-all duration-300 ease-in-out
          ${collapsed ? "justify-center px-0" : "justify-between px-6"}
        `}
      >
        {/* Logo dengan fade animation */}
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}
          `}
        >
          <img
            src="/assets/full-logo-cyan-blue.svg"
            alt="Talkvera Logo"
            className="h-8 w-auto"
          />
        </div>

        {/* Toggle button dengan hover effect */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="
            group relative overflow-hidden
            hover:bg-primary/10 hover:text-primary
            transition-all duration-300 ease-in-out
          "
        >
          <div className="absolute inset-0 bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-md" />
          {collapsed ? (
            <ChevronsRight className="!w-5 !h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5" />
          ) : (
            <ChevronsLeft className="!w-5 !h-5 relative z-10 transition-transform duration-300 group-hover:-translate-x-0.5" />
          )}
        </Button>
      </div>

      {/* Menu Content dengan spacing yang lebih baik */}
      <SidebarContent className={`flex-1 overflow-y-auto pt-6 bg-white transition-all duration-300 ${collapsed ? 'px-0' : 'px-2'}`}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item, index) => {
                const isActive = location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem 
                    key={item.title}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                    className="animate-in fade-in slide-in-from-left-2 duration-300 transition-all"
                  >
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        group relative overflow-hidden
                        transition-all duration-300 ease-in-out
                        ${collapsed ? 'justify-center' : 'justify-start hover:translate-x-1'}
                        hover:bg-primary/10
                        ${isActive ? 'bg-primary/15 text-primary font-medium shadow-sm' : 'bg-white'}
                      `}
                    >
                      <NavLink 
                        to={item.url} 
                        className={`flex items-center w-full ${collapsed ? 'justify-center' : 'justify-start'}`}
                      >
                        {/* Active indicator */}
                        {isActive && !collapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full animate-in slide-in-from-left duration-300" />
                        )}
                        
                        {/* Icon dengan scale animation */}
                        <item.icon 
                          className={`
                            !h-5 !w-5 transition-all duration-300
                            ${isActive ? 'text-primary scale-110' : 'group-hover:scale-110'}
                            ${collapsed ? '' : 'ml-2'}
                          `}
                        />
                        
                        {/* Text dengan fade */}
                        {!collapsed && (
                          <span 
                            className={`
                              text-sm transition-all duration-300
                              ${isActive ? 'text-primary' : 'group-hover:text-primary'}
                            `}
                          >
                            {item.title}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer dengan divider yang lebih subtle */}
      <div className={`mt-auto border-t border-border/40 bg-white backdrop-blur-sm transition-all duration-300 ${collapsed ? 'p-1' : 'p-2'}`}>
        <SidebarMenu className="space-y-1">
          {/* Settings */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname.startsWith("/profile")}
              className={`
                group relative overflow-hidden
                transition-all duration-300 ease-in-out
                hover:bg-primary/10
                ${location.pathname.startsWith("/profile") ? 'bg-primary/15 text-primary' : ''}
                ${collapsed ? 'justify-center' : 'justify-start hover:translate-x-1'}
              `}
            >
              <NavLink to="/profile" className={`flex items-center w-full ${collapsed ? 'justify-center' : 'justify-start'}`}>
                <Settings 
                  className={`
                    !h-5 !w-5 transition-all duration-300
                    ${collapsed ? '' : 'ml-2'}
                    ${collapsed ? 'group-hover:rotate-90 group-hover:scale-110' : 'group-hover:rotate-90'}
                  `}
                />
                {!collapsed && (
                  <span className="text-sm transition-all duration-300 group-hover:text-primary">
                    Settings
                  </span>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className={`
                group relative overflow-hidden
                transition-all duration-300 ease-in-out
                hover:bg-red-500/10
                ${collapsed ? 'justify-center' : 'justify-start hover:translate-x-1'}
              `}
            >
              <div className={`flex items-center w-full ${collapsed ? 'justify-center' : 'justify-start'}`}>
                <LogOut 
                  className={`
                    !h-5 !w-5 text-red-500 transition-all duration-300
                    ${collapsed ? '' : 'ml-2'}
                    ${collapsed ? 'group-hover:scale-110' : 'group-hover:scale-110'}
                  `}
                />
                {!collapsed && (
                  <span className="text-sm pl-2 text-red-500 transition-all duration-300 group-hover:text-red-600">
                    Logout
                  </span>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}