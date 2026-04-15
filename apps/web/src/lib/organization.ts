"use client";

import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";

export type OrganizationMember = {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date | string;
  user?: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
};

export type OrganizationInvitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  organizationId: string;
  inviterId: string;
  expiresAt: Date | string;
  createdAt: Date | string;
};

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: unknown;
  createdAt: Date | string;
};

export type OrganizationDetails = OrganizationSummary & {
  members: OrganizationMember[];
  invitations: OrganizationInvitation[];
};

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

export function slugifyOrganizationName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function useOrganizationState() {
  const session = authClient.useSession();
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<OrganizationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!session.data) {
        if (!cancelled) {
          setOrganizations([]);
          setActiveOrganization(null);
          setError(null);
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const listResult = await authClient.organization.list();
        if (listResult.error) {
          throw new Error(listResult.error.message || listResult.error.statusText);
        }

        const nextOrganizations = (listResult.data ?? []) as OrganizationSummary[];
        let nextActiveOrganization: OrganizationDetails | null = null;

        if (!session.data.session.activeOrganizationId && nextOrganizations[0]) {
          const setActiveResult = await authClient.organization.setActive({
            organizationId: nextOrganizations[0].id,
          });
          if (setActiveResult.error) {
            throw new Error(setActiveResult.error.message || setActiveResult.error.statusText);
          }
        }

        const activeResult = await authClient.organization.getFullOrganization();
        if (activeResult.error) {
          throw new Error(activeResult.error.message || activeResult.error.statusText);
        }

        nextActiveOrganization = (activeResult.data ?? null) as OrganizationDetails | null;

        if (!cancelled) {
          setOrganizations(nextOrganizations);
          setActiveOrganization(nextActiveOrganization);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getErrorMessage(loadError, "Failed to load organizations"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [session.data?.session.activeOrganizationId, session.data?.user.id]);

  return {
    session,
    organizations,
    activeOrganization,
    isLoading,
    error,
  };
}
