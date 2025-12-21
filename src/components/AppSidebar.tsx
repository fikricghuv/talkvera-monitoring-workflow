import { useState } from "react";
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
  FolderKanban,
  ChevronDown,
  Loader2,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';

type MenuItemType = {
  title: string;
  url: string;
  icon?: LucideIcon;
  resource?: string; // resource_key dari database
  resources?: string[]; // untuk parent menu yang punya banyak children
  action?: string; // default 'view'
  children?: MenuItemType[];
};

const menuItems: MenuItemType[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    resource: "dashboard",
  },
  {
    title: "Workflow Information",
    url: "/workflow-information",
    icon: Network,
    resource: "workflow_information",
  },
  {
    title: "Workflow Executions",
    url: "/workflow-execution",
    icon: Workflow,
    resource: "workflow_executions",
  },
  {
    title: "Detail Node Execution",
    url: "/node-execution",
    icon: FileClock,
    resource: "node_execution",
  },
  {
    title: "Process Queue",
    url: "/queue-execution",
    icon: Boxes,
    resource: "process_queue",
  },
  {
    title: "Access Management",
    url: "/access-management",
    icon: Shield,
    resource: "access_management",
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderKanban,
    resources: [ 
      "operasional_overview", 
      "klinik_overview",
      "data_agent_overview",
    ],
    children: [
      {
        title: "Operasional Talkvera",
        url: "/projects/operasional-management",
        resources: [ 
          "operasional_overview",
          "operasional_appointment",
          "operasional_chat",
          "operasional_whatsapp",
          "operasional_kb",
        ],
        children: [
          {
            title: "Overview",
            url: "/projects/operasional-management/overview",
            resource: "operasional_overview",
          },
          {
            title: "Appointment Monitoring",
            url: "/projects/operasional-management/appointment-monitoring",
            resource: "operasional_appointment",
          },
          {
            title: "CRM",
            url: "/projects/operasional-management/crm",
            resource: "crm",
          },
          {
            title: "Chat Agent",
            url: "/projects/operasional-management/chat-session",
            resource: "operasional_chat",
          },
          {
            title: "Consultation",
            url: "/projects/operasional-management/consultation",
            resource: "operasional_consultation",
          },
          {
            title: "Knowledge Base",
            url: "/projects/operasional-management/knowledge-base",
            resource: "operasional_kb",
          },
        ],
      },
      {
        title: "Klinik Griya Sehat",
        url: "/projects/klinik-griya-sehat",
        resources: [ 
          "klinik_overview",
          "klinik_patient",
          "klinik_chat",
          "klinik_appointment",
          "klinik_rag",
        ],
        children: [
          {
            title: "Overview",
            url: "/projects/klinik-griya-sehat/overview",
            resource: "klinik_overview",
          },
          {
            title: "Data Pasien",
            url: "/projects/klinik-griya-sehat/data-patient",
            resource: "klinik_patient",
          },
          {
            title: "Chat Session",
            url: "/projects/klinik-griya-sehat/chat-session",
            resource: "klinik_chat",
          },
          {
            title: "Appointment Monitoring",
            url: "/projects/klinik-griya-sehat/appointment",
            resource: "klinik_appointment",
          },
          {
            title: "Upload Document",
            url: "/projects/klinik-griya-sehat/data-upload",
            resource: "klinik_rag",
          },
        ],
      },
      {
        title: "Analisis Data Agent",
        url: "/projects/talkvera-data-agent",
        resources: [
          "data_agent_overview",
          "data_agent_monitoring",
        ],
        children: [
          {
            title: "Overview",
            url: "/projects/talkvera-data-agent/overview",
            resource: "data_agent_overview",
          },
          {
            title: "Query Monitoring",
            url: "/projects/talkvera-data-agent/query-monitoring",
            resource: "data_agent_monitoring",
          },
        ],
      },
    ],
  },
];

const RenderCollapsedSubmenu = ({ item }: { item: MenuItemType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isItemActive = location.pathname === item.url;
  const isGroupActive = location.pathname.startsWith(item.url);

  if (!item.children) {
    return (
      <DropdownMenuItem
        onClick={() => navigate(item.url)}
        className={`
          cursor-pointer
          focus:bg-primary/10 focus:text-primary
          hover:bg-primary/10 hover:text-primary
          ${isItemActive ? "bg-primary/15 text-primary" : ""}
        `}
      >
        {item.title}
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        className={`
          cursor-pointer
          focus:bg-primary/10 focus:text-primary
          hover:bg-primary/10 hover:text-primary
          data-[state=open]:bg-primary/10
          ${isGroupActive ? "bg-primary/15 text-primary" : ""}
        `}
      >
        <span>{item.title}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent sideOffset={8} alignOffset={-5}>
          {item.children.map((child) => (
            <RenderCollapsedSubmenu key={child.title} item={child} />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};

const RenderMenuItem = ({ item, level = 0 }: { item: MenuItemType; level?: number }) => {
  const { hasPermission, hasAnyPermission, loading } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const [isOpen, setIsOpen] = useState(location.pathname.startsWith(item.url));
  const isGroupActive = location.pathname.startsWith(item.url);
  const isItemActive = location.pathname === item.url;

  // Logika Pengecekan Izin berdasarkan resource
  let canRender = false;
  const action = item.action || 'view';
  
  if (item.children) {
    // Parent menu: cek apakah user punya akses ke minimal satu child
    if (item.resources) {
      canRender = hasAnyPermission(item.resources, action);
    } else {
      // Ambil semua resources dari children
      const childResources = item.children
        .flatMap(child => child.resource || (child.resources || []))
        .filter(r => r);
      canRender = hasAnyPermission(childResources, action);
    }
  } else if (item.resource) {
    // Leaf menu: cek resource spesifik
    canRender = hasPermission(item.resource, action);
  } else {
    // Default: public/accessible
    canRender = true;
  }
  
  if (loading || !canRender) {
    return null;
  }

  // Item tanpa children
  if (!item.children) {
    return (
      <SidebarMenuItem
        style={{ animationDelay: `${level * 50}ms` }}
        className={`transition-all ${level === 0 ? 'animate-in fade-in slide-in-from-left-2 duration-300' : ''}`}
      >
        <SidebarMenuButton
          asChild
          isActive={isItemActive}
          className={`
            group relative overflow-hidden transition-all duration-300 ease-in-out
            ${collapsed ? 'justify-center' : 'justify-start hover:translate-x-1'}
            hover:bg-primary/10
            ${isItemActive ? 'bg-primary/15 text-primary font-medium shadow-sm' : 'bg-white'}
          `}
          style={{ paddingLeft: collapsed ? 0 : `${level * 1.25 + 0.5}rem` }}
        >
          <NavLink
            to={item.url}
            className={`flex items-center w-full ${collapsed ? 'justify-center' : 'justify-start'}`}
          >
            {isItemActive && !collapsed && level === 0 && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full animate-in slide-in-from-left duration-300" />
            )}
            
            {item.icon && level === 0 && (
              <item.icon
                className={`
                  !h-5 !w-5 transition-all duration-300
                  ${isItemActive ? 'text-primary scale-110' : 'group-hover:scale-110'}
                  ${collapsed ? '' : 'ml-2'}
                `}
              />
            )}

            {!collapsed && (
              <span className={`text-sm transition-all duration-300 pl-2 ${isItemActive ? 'text-primary' : 'group-hover:text-primary'}`}>
                {item.title}
              </span>
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Item dengan children - collapsed (popover)
  if (collapsed) {
    return (
      <SidebarMenuItem className={`transition-all ${level === 0 ? 'animate-in fade-in slide-in-from-left-2 duration-300' : ''}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              isActive={isGroupActive}
              className={`
                group relative overflow-hidden transition-all duration-300 ease-in-out
                justify-center hover:bg-primary/10
                ${isGroupActive ? 'bg-primary/15 text-primary font-medium shadow-sm' : 'bg-white'}
              `}
            >
              <div className="flex items-center w-full justify-center">
                {item.icon && (
                  <item.icon
                    className={`!h-5 !w-5 transition-all duration-300 ${isGroupActive ? 'text-primary scale-110' : 'group-hover:scale-110'}`}
                  />
                )}
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
          <DropdownMenuPortal>
            <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-56">
              <div className="px-2 py-1.5 text-sm font-semibold">{item.title}</div>
              {item.children.map((child) => (
                <RenderCollapsedSubmenu key={child.title} item={child} />
              ))}
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  // Item dengan children - expanded (accordion)
  return (
    <SidebarMenuItem
      style={{ animationDelay: `${level * 50}ms` }}
      className={`transition-all ${level === 0 ? 'animate-in fade-in slide-in-from-left-2 duration-300' : ''}`}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isGroupActive}
            className={`
              group relative overflow-hidden transition-all duration-300 ease-in-out
              justify-start hover:translate-x-1 hover:bg-primary/10 w-full 
              ${isGroupActive ? 'bg-primary/15 text-primary' : 'bg-white'}
            `}
            style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                {item.icon && level === 0 && (
                  <item.icon
                    className={`!h-5 !w-5 transition-all duration-300 ${isGroupActive ? 'text-primary scale-110' : 'group-hover:scale-110'} ml-2`}
                  />
                )}
                <span className={`text-sm transition-all duration-300 pl-2 ${isGroupActive ? 'text-primary' : 'group-hover:text-primary'}`}>
                  {item.title}
                </span>
              </div>
              <ChevronDown
                className={`!h-4 !w-4 transition-transform duration-200 mr-2 ${isOpen ? 'rotate-180' : ''} ${isGroupActive ? 'text-primary' : 'text-neutral-500'}`}
              />
            </div>
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <SidebarMenu className="space-y-1 mt-1">
            {item.children.map((child) => (
              <RenderMenuItem key={child.title} item={child} level={level + 1} />
            ))}
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};

export function AppSidebar({ isMobileDrawer = false }) {
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const collapsed = isMobileDrawer ? false : state === "collapsed";
  const location = useLocation();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error("Gagal logout: " + error.message);
        setIsLoggingOut(false);
        return;
      }
      
      toast.success("Berhasil logout!");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Terjadi kesalahan saat logout");
      setIsLoggingOut(false);
    }
  };

  return (
    <Sidebar collapsible={isMobileDrawer ? undefined : "icon"} className="flex h-full flex-col">
      <div className={`flex h-16 items-center border-b border-border/40 bg-white backdrop-blur-sm transition-all duration-300 ease-in-out ${collapsed ? "justify-center px-0" : "justify-between px-6"}`}>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
          <img src="/assets/full-logo-cyan-blue.svg" alt="Talkvera Logo" className="h-8 w-auto" />
        </div>
        {!isMobileDrawer && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="group relative overflow-hidden hover:bg-primary/10 hover:text-primary transition-all duration-300 ease-in-out">
            <div className="absolute inset-0 bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-md" />
            {collapsed ? (
              <ChevronsRight className="!w-5 !h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5" />
            ) : (
              <ChevronsLeft className="!w-5 !h-5 relative z-10 transition-transform duration-300 group-hover:-translate-x-0.5" />
            )}
          </Button>
        )}
      </div>

      <SidebarContent className={`flex-1 overflow-y-auto pt-6 bg-white transition-all duration-300 ${collapsed ? 'px-0' : 'px-2'}`}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <RenderMenuItem key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className={`mt-auto border-t border-border/40 bg-white backdrop-blur-sm transition-all duration-300 ${collapsed ? 'p-1' : 'p-2'}`}>
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname.startsWith("/profile")}
              className={`group relative overflow-hidden transition-all duration-300 ease-in-out hover:bg-primary/10 ${location.pathname.startsWith("/profile") ? 'bg-primary/15 text-primary' : ''} ${collapsed ? 'justify-center' : 'justify-start hover:translate-x-1'}`}
              disabled={isLoggingOut}
            >
              <NavLink to="/profile" className={`flex items-center w-full ${collapsed ? 'justify-center' : 'justify-start'}`}>
                <Settings className={`!h-5 !w-5 transition-all duration-300 ${collapsed ? '' : 'ml-2'} ${collapsed ? 'group-hover:rotate-90 group-hover:scale-110' : 'group-hover:rotate-90'}`} />
                {!collapsed && <span className="text-sm pl-2 transition-all duration-300 group-hover:text-primary">Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`group relative overflow-hidden transition-all duration-300 ease-in-out hover:bg-red-500/10 text-red-500 ${collapsed ? 'justify-center' : 'justify-start hover:translate-x-1'} ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`flex items-center w-full ${collapsed ? 'justify-center' : 'justify-start'}`}>
                {isLoggingOut ? (
                  <Loader2 className={`!h-5 !w-5 text-red-500 animate-spin ${collapsed ? '' : 'ml-2'}`} />
                ) : (
                  <LogOut className={`!h-5 !w-5 text-red-500 transition-all duration-300 ${collapsed ? '' : 'ml-2'} ${collapsed ? 'group-hover:scale-110' : 'group-hover:scale-110'}`} />
                )}
                {!collapsed && <span className="text-sm pl-2 transition-all duration-300 group-hover:text-red-600">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}