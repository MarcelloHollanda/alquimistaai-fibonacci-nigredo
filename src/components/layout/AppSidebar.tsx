import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  Lightbulb,
  CheckSquare,
  Send,
  MessageSquare,
  Calendar,
  BarChart3,
  Bot,
  Settings,
  AlertTriangle,
  FlaskConical,
  Brain,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/permissions";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, permission: null },
  { title: "Leads", url: "/leads", icon: Upload, permission: "leads:view" },
  { title: "Estratégia", url: "/estrategia", icon: Lightbulb, permission: "estrategia:view" },
  { title: "Aprovações", url: "/aprovacoes", icon: CheckSquare, permission: "aprovacao:view" },
  { title: "Disparo", url: "/disparo", icon: Send, permission: "disparo:view" },
  { title: "Conversas", url: "/conversas", icon: MessageSquare, permission: "conversas:view" },
  { title: "Agendamentos", url: "/agendamentos", icon: Calendar, permission: "agendamentos:view" },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3, permission: "relatorios:view" },
  { title: "Objeções", url: "/objecoes", icon: AlertTriangle, permission: "relatorios:view" },
  { title: "Testes A/B", url: "/experimentos", icon: FlaskConical, permission: "relatorios:view" },
  { title: "Aprendizado", url: "/aprendizado", icon: Brain, permission: "relatorios:view" },
  { title: "Agentes", url: "/agentes", icon: Bot, permission: null },
  { title: "Usuários", url: "/users", icon: Users, permission: "config:view" },
  { title: "Configurações", url: "/config", icon: Settings, permission: "config:view" },
];

export function AppSidebar() {
  const { user } = useAuth();

  const visibleItems = menuItems.filter((item) => {
    if (!item.permission) return true;
    return user && hasPermission(user.role, item.permission);
  });

  return (
    <Sidebar collapsible="icon" className="z-50">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
