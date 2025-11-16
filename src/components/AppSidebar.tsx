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
import { useState } from "react";

// Struktur data menu yang baru, mendukung 'children' untuk sub-menu
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

  {
    title: "Projects",
    url: "/projects", 
    icon: FolderKanban,
    children: [
      {
        title: "Klinik Griya Sehat",
        url: "/projects/klinik-griya-sehat", 
        children: [
          {
            title: "Overview",
            url: "/projects/klinik-sehat-sentosa/overview",
          },
          {
            title: "Appointment",
            url: "/projects/klinik-sehat-sentosa/appointment",
          },
        ],
      },
      {
        title: "Analisis Data Agent",
        url: "/projects/talkvera-data-agent", // URL dasar untuk sub-proyek
        children: [
          {
            title: "Overview",
            url: "/projects/talkvera-data-agent/overview",
          },
          {
            title: "Query Monitoring",
            url: "/projects/data-agent-enterprise/query-monitoring",
          },
        ],
      },
    ],
  },
];

// --- Komponen Rekursif untuk Render Menu ---
const RenderMenuItem = ({ item, level = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  // Gunakan state collapsed dari hook, kecuali jika di-override oleh prop isMobileDrawer
  const collapsed = state === "collapsed"; 

  // State untuk melacak status buka/tutup menu ini (jika punya children)
  const [isOpen, setIsOpen] = useState(location.pathname.startsWith(item.url)); // Buka default jika grup aktif

  // Cek apakah item ini atau salah satu anaknya aktif
  const isGroupActive = location.pathname.startsWith(item.url);

  // 'isItemActive' akan true hanya jika URL-nya *sama persis*
  const isItemActive = location.pathname === item.url;

  // Handler untuk klik
  const handleClick = () => {
    if (item.children) {
      // Jika punya 'children', toggle buka/tutup
      setIsOpen(!isOpen);
    } else {
      // Jika tidak punya 'children', navigasi ke URL
      navigate(item.url);
    }
  };

  // --- Render Item TANPA Children ---
  if (!item.children) {
    return (
      <SidebarMenuItem
        style={{
          animationDelay: `${level * 50}ms`,
        }}
        className="animate-in fade-in slide-in-from-left-2 duration-300 transition-all"
      >
        <SidebarMenuButton
          asChild
          isActive={isItemActive}
          className={`
            group relative overflow-hidden
            transition-all duration-300 ease-in-out
            ${collapsed ? 'justify-center' : 'justify-start hover:translate-x-1'}
            hover:bg-primary/10
            ${isItemActive ? 'bg-primary/15 text-primary font-medium shadow-sm' : 'bg-white'}
          `}
          // Beri indentasi berdasarkan level
          style={{ paddingLeft: collapsed ? 0 : `${level * 1.25 + 0.5}rem` }}
        >
          <NavLink
            to={item.url}
            className={`flex items-center w-full ${collapsed ? 'justify-center' : 'justify-start'}`}
          >
            {/* Indikator aktif untuk item level 0 */}
            {isItemActive && !collapsed && level === 0 && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full animate-in slide-in-from-left duration-300" />
            )}
            
            {/* Ikon (hanya untuk level 0) */}
            {item.icon && level === 0 && (
              <item.icon
                className={`
                  !h-5 !w-5 transition-all duration-300
                  ${isItemActive ? 'text-primary scale-110' : 'group-hover:scale-110'}
                  ${collapsed ? '' : 'ml-2'}
                `}
              />
            )}
            
            {/* Tanda titik untuk level > 0 */}
            {level > 0 && !collapsed && (
              <span className="flex h-5 w-5 items-center justify-center ml-2">
                <span className={`h-1.5 w-1.5 rounded-full ${isItemActive ? 'bg-primary' : 'bg-neutral-400'}`}></span>
              </span>
            )}

            {/* Teks */}
            {!collapsed && (
              <span
                className={`
                  text-sm transition-all duration-300 pl-2
                  ${isItemActive ? 'text-primary' : 'group-hover:text-primary'}
                `}
              >
                {item.title}
              </span>
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // --- Render Item DENGAN Children (Dropdown) ---

  // Saat 'collapsed', item dropdown bertingkah seperti link biasa
  if (collapsed) {
    return (
      <SidebarMenuItem
        className="animate-in fade-in slide-in-from-left-2 duration-300 transition-all"
      >
        <SidebarMenuButton
          asChild
          isActive={isGroupActive} // Gunakan 'isGroupActive' di sini
          className={`
            group relative overflow-hidden transition-all duration-300 ease-in-out
            justify-center hover:bg-primary/10
            ${isGroupActive ? 'bg-primary/15 text-primary font-medium shadow-sm' : 'bg-white'}
          `}
        >
          <NavLink
            to={item.url} // Link ke URL dasar
            className="flex items-center w-full justify-center"
          >
            {item.icon && (
              <item.icon
                className={`
                  !h-5 !w-5 transition-all duration-300
                  ${isGroupActive ? 'text-primary scale-110' : 'group-hover:scale-110'}
                `}
              />
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Saat 'expanded' (Desktop Expanded atau Mobile Drawer), item dropdown bisa dibuka/tutup
  return (
    <>
      <SidebarMenuItem
        style={{
          animationDelay: `${level * 50}ms`,
        }}
        className="animate-in fade-in slide-in-from-left-2 duration-300 transition-all"
      >
        <SidebarMenuButton
          onClick={handleClick} // Klik untuk toggle
          isActive={isGroupActive} // Gunakan 'isGroupActive'
          className={`
            group relative overflow-hidden
            transition-all duration-300 ease-in-out
            justify-start hover:translate-x-1
            hover:bg-primary/10
            ${isGroupActive ? 'bg-primary/15 text-primary' : 'bg-white'}
          `}
          // Beri indentasi berdasarkan level
          style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
        >
          <div className="flex items-center justify-between w-full">
            {/* Bagian Kiri: Ikon + Teks */}
            <div className="flex items-center">
              {/* Ikon (hanya untuk level 0) */}
              {item.icon && level === 0 && (
                <item.icon
                  className={`
                    !h-5 !w-5 transition-all duration-300
                    ${isGroupActive ? 'text-primary scale-110' : 'group-hover:scale-110'}
                    ml-2
                  `}
                />
              )}

              {/* Tanda titik untuk level > 0 */}
              {level > 0 && (
                <span className="flex h-5 w-5 items-center justify-center ml-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${isGroupActive ? 'bg-primary' : 'bg-neutral-500'}`}></span>
                </span>
              )}

              {/* Teks */}
              <span
                className={`
                  text-sm transition-all duration-300 pl-2
                  ${isGroupActive ? 'text-primary' : 'group-hover:text-primary'}
                `}
              >
                {item.title}
              </span>
            </div>

            {/* Bagian Kanan: Ikon Chevron */}
            <ChevronDown
              className={`
                !h-4 !w-4 transition-transform duration-200 mr-2
                ${isOpen ? 'rotate-180' : ''}
                ${isGroupActive ? 'text-primary' : 'text-neutral-500'}
              `}
            />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Render 'children' jika 'isOpen' dan 'expanded' */}
      {isOpen && (
        <div className="transition-all duration-300 ease-in-out overflow-hidden animate-in fade-in">
          {item.children.map((child) => (
            <RenderMenuItem key={child.title} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </>
  );
};
// --- Akhir Komponen Rekursif ---


export function AppSidebar({ isMobileDrawer = false }) {
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  
  // --- LOGIKA BARU ---
  // Jika ini adalah mobile drawer, paksa 'collapsed' menjadi false.
  // Jika tidak, gunakan state dari hook.
  const collapsed = isMobileDrawer ? false : state === "collapsed";
  // --- AKHIR LOGIKA BARU ---
  
  const location = useLocation();

  const handleLogout = () => {
    toast.success("Berhasil logout!");
    navigate("/login");
  };

  return (
    // Component Sidebar hanya menggunakan 'collapsible' jika bukan mobile drawer
    <Sidebar
      collapsible={isMobileDrawer ? undefined : "icon"}
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
          {/* Menggunakan h-8 dan w-auto agar responsif */}
          <img
            src="/assets/full-logo-cyan-blue.svg"
            alt="Talkvera Logo"
            className="h-8 w-auto"
          />
        </div>

        {/* Toggle button dengan hover effect */}
        {/* --- LOGIKA BARU: Sembunyikan jika ini mobile drawer --- */}
        {!isMobileDrawer && (
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
        )}
        {/* --- AKHIR LOGIKA BARU --- */}
      </div>

      {/* Menu Content dengan spacing yang lebih baik */}
      <SidebarContent className={`flex-1 overflow-y-auto pt-6 bg-white transition-all duration-300 ${collapsed ? 'px-0' : 'px-2'}`}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <RenderMenuItem 
                  key={item.title} 
                  item={item} 
                />
              ))}
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
                  <span className="text-sm pl-2 transition-all duration-300 group-hover:text-primary">
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