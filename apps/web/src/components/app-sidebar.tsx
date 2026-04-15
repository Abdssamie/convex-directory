"use client";

import * as React from "react";
import {
  LayoutDashboard,
  House,
  LogIn,
  UserPlus,
  KeyRound,
  Settings,
  CreditCard,
} from "lucide-react";
import { api } from "@convex-zen/backend/convex/_generated/api";
import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import { Logo } from "@/components/logo";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navGroups: [
    {
      label: "Dashboards",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Home",
          url: "/",
          icon: House,
        },
      ],
    },
    {
      label: "Auth",
      items: [
        {
          title: "Sign In",
          url: "/sign-in",
          icon: LogIn,
        },
        {
          title: "Sign Up",
          url: "/sign-up",
          icon: UserPlus,
        },
        {
          title: "Forgot Password",
          url: "/forgot-password",
          icon: KeyRound,
        },
      ],
    },
    {
      label: "Settings",
      items: [
        {
          title: "Account",
          url: "/settings/account",
          icon: Settings,
        },
        {
          title: "Billing",
          url: "/settings/billing",
          icon: CreditCard,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useQuery(api.auth.getCurrentUser);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">ShadcnStore</span>
                  <span className="truncate text-xs">Admin Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? "ConvexZen",
            email: user?.email ?? "Signed in",
            avatar: "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
