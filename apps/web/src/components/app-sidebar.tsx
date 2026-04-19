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
  FolderSearch,
  PlusCircle,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { api } from "@convex-directory/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { useIntlayer } from "react-intlayer";
import { type To } from "@/components/localized-link";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";

const iconMap: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/": House,
  "/sign-in": LogIn,
  "/sign-up": UserPlus,
  "/forgot-password": KeyRound,
  "/settings/account": Settings,
  "/settings/organization": Building2,
  "/settings/billing": CreditCard,
  "/directory": FolderSearch,
  "/dashboard/projects": PlusCircle,
  "/dashboard/admin": ShieldCheck,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useQuery(api.auth.getCurrentUser);
  const isAdmin = useQuery(api.projects.isAdminQuery);
  const content = useIntlayer("app-sidebar");

  type NavItem = {
    title: { value: string };
    url: { value: string };
  };

  type NavGroup = {
    label: { value: string };
    items: NavItem[];
  };

  const navGroups = ((content.groups as unknown as NavGroup[]) || [])
    .filter((group: NavGroup) => {
      if (
        group.label.value === "Admin" ||
        group.label.value === "Admin Review" ||
        group.label.value === "Admin Review Queue"
      ) {
        return isAdmin;
      }
      return true;
    })
    .map((group: NavGroup) => ({
      label: group.label.value,
      items: group.items.map((item: NavItem) => ({
        title: item.title.value,
        url: item.url.value as To,
        icon: iconMap[item.url.value],
      })),
    }));

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map(
          (group: { label: string; items: { title: string; url: To; icon: LucideIcon }[] }) => (
            <NavMain key={group.label} label={group.label} items={group.items} />
          ),
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? "ConvexZen",
            email:
              user?.email ??
              ((content.signedIn as unknown as { value: string })?.value || "Signed in"),
            avatar: "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
