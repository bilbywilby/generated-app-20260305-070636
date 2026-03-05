import React from "react";
import { Home, FileText, Layout, Settings, Plus, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const navItems = [
    { title: "Dashboard", icon: Home, path: "/" },
    { title: "Templates", icon: Layout, path: "/templates" },
    { title: "Drafts", icon: FileText, path: "/drafts" },
    { title: "Settings", icon: Settings, path: "/settings" },
  ];
  return (
    <Sidebar className="border-r-2 border-border bg-background">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">NexusDraft</span>
        </div>
        <Button asChild className="w-full btn-soft bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
          <Link to="/drafts/new">
            <Plus className="mr-2 h-4 w-4" /> New Draft
          </Link>
        </Button>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.path}
                className={cn(
                  "rounded-2xl px-4 py-6 mb-1 transition-all duration-200",
                  location.pathname === item.path 
                    ? "bg-primary/10 text-primary hover:bg-primary/15" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Link to={item.path}>
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium text-base">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-6">
        <div className="p-4 rounded-3xl bg-muted/50 border border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Storage Used</p>
          <div className="w-full bg-border rounded-full h-1.5 mb-2">
            <div className="bg-primary h-1.5 rounded-full w-1/3" />
          </div>
          <p className="text-[10px] text-muted-foreground italic">Free Plan • 12% space used</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}