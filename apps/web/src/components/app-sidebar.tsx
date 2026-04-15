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
  Building2,
} from "lucide-react";
import { api } from "@convex-zen/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { OrganizationSwitcher } from "@/components/organization-switcher";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";

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
          title: "Organization",
          url: "/settings/organization",
          icon: Building2,
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
        <OrganizationSwitcher />
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
