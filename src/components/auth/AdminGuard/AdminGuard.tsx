"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";

import { STORAGE_KEYS } from "@/constants/storageKeys";
import { MOCK_AUTH_EVENT } from "@/lib/auth/mockAuthStorage";
import { isAdminSession } from "@/lib/auth/auth.shared";
import type { AuthSession } from "@/lib/auth/auth.types";
import type { AuthUser } from "@/types/authUser";

type AdminGuardProps = {
  children: React.ReactNode;
};

const EMPTY_SNAPSHOT = "";

function subscribe(callback: () => void) {
  window.addEventListener(MOCK_AUTH_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(MOCK_AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): string {
  if (typeof window === "undefined") {
    return EMPTY_SNAPSHOT;
  }

  return window.localStorage.getItem(STORAGE_KEYS.MOCK_USER) ?? EMPTY_SNAPSHOT;
}

function getServerSnapshot(): string {
  return EMPTY_SNAPSHOT;
}

function parseSession(snapshot: string): AuthSession {
  if (!snapshot) {
    return {
      user: null,
      isLoggedIn: false,
    };
  }

  try {
    const authUser = JSON.parse(snapshot) as AuthUser;

    return {
      user: {
        id: authUser.id,
        email: authUser.email,
        nickname: authUser.nickname,
        role: authUser.role ?? "user",
      },
      isLoggedIn: true,
    };
  } catch {
    return {
      user: null,
      isLoggedIn: false,
    };
  }
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const session = useMemo(() => parseSession(snapshot), [snapshot]);
  const isAdmin = isAdminSession(session);

  useEffect(() => {
    if (!session.isLoggedIn) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, pathname, router, session.isLoggedIn]);

  if (!session.isLoggedIn || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
