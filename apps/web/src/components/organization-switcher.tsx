"use client";

import { Building2, Check, ChevronsUpDown, PlusCircle, Settings2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { useOrganizationState } from "@/lib/organization";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

function getErrorMessage(error: { error: { message?: string; statusText?: string } }) {
  return error.error.message || error.error.statusText || "Organization action failed";
}

export function OrganizationSwitcher() {
  const { session, organizations, activeOrganization, isLoading } = useOrganizationState();

  if (!session.data) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {isLoading
                    ? "Loading organization"
                    : (activeOrganization?.name ?? "No organization")}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {activeOrganization?.slug ?? "Create or join workspace"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 rounded-lg">
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {organizations.length ? (
              organizations.map((organization) => {
                const isActive = organization.id === activeOrganization?.id;

                return (
                  <DropdownMenuItem
                    key={organization.id}
                    className="cursor-pointer gap-2"
                    onClick={() => {
                      if (isActive) {
                        return;
                      }

                      authClient.organization.setActive(
                        { organizationId: organization.id },
                        {
                          onSuccess: () => {
                            toast.success(`${organization.name} is now active`);
                          },
                          onError: (error) => {
                            toast.error(getErrorMessage(error));
                          },
                        },
                      );
                    }}
                  >
                    <Building2 className="size-4" />
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{organization.name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {organization.slug}
                        </p>
                      </div>
                      {isActive ? <Check className="size-4" /> : null}
                    </div>
                  </DropdownMenuItem>
                );
              })
            ) : (
              <DropdownMenuItem disabled>No organizations yet</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/settings/organization">
                <PlusCircle className="size-4" />
                Create organization
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/settings/organization">
                <Settings2 className="size-4" />
                Manage organization
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
