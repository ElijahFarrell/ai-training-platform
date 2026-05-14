"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { BookOpenText, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SignOutMenu } from "@/components/layout/sign-out-menu";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/modules", label: "Training modules", icon: BookOpenText },
  { href: "/assistant", label: "AI assistant", icon: Sparkles },
];

const ADMIN_NAV: typeof NAV_ITEMS = [
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

interface AppShellProps {
  email: string;
  children: React.ReactNode;
}

export function AppShell({ email, children }: AppShellProps) {
  const pathname = usePathname();
  const me = useQuery(api.users.me);
  const isAdmin = me?.role === "admin";

  return (
    <div className="flex min-h-dvh w-full bg-background">
      <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar p-6 md:flex">
        <div className="flex flex-col gap-1">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-base tracking-tight">FATI</span>
          </Link>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Federal AI Training Institute
          </span>
        </div>

        <Separator />

        <nav className="flex flex-col gap-1 text-sm">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
          {isAdmin ? (
            <>
              <Separator className="my-3" />
              <span className="px-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Administration
              </span>
              {ADMIN_NAV.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </>
          ) : null}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <Separator />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="truncate text-sm font-medium">{me?.displayName ?? "Loading…"}</span>
              <span className="truncate text-xs text-muted-foreground">{email}</span>
            </div>
            <SignOutMenu />
          </div>
          {me ? (
            <Badge variant={isAdmin ? "accent" : "secondary"} className="self-start">
              {isAdmin ? "Administrator" : "Learner"}
            </Badge>
          ) : null}
        </div>
      </aside>

      <main className="flex w-full flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background/80 px-6 py-3 backdrop-blur md:hidden">
          <span className="font-display text-base tracking-tight">FATI</span>
          <SignOutMenu />
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
        </div>
      </main>
    </div>
  );
}

function NavLink({
  item,
  pathname,
}: {
  item: { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
  pathname: string | null;
}) {
  const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
        active && "bg-sidebar-accent text-foreground",
      )}
    >
      <Icon className="size-4" />
      <span>{item.label}</span>
    </Link>
  );
}
