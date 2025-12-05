"use client";

import { cn } from "@/lib/utils";
import {
  AtomIcon,
  Code2Icon,
  LayersIcon,
  PanelTopIcon,
  PlugZapIcon,
  Building2Icon,
  FormInputIcon,
  WorkflowIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type DemoLink = {
  title: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const demoLinks: DemoLink[] = [
  {
    title: "Demo Catalog",
    href: "/demos",
    description: "Overview of all available demos.",
    icon: LayersIcon,
  },
  {
    title: "Orchestrator Agent",
    href: "/demos/orchestrator",
    description: "Multi-agent orchestrator/worker chat demo.",
    icon: WorkflowIcon,
  },
  {
    title: "Company Analysis Orchestrator",
    href: "/demos/company-analysis-orchestrator",
    description: "Site scrape + stack finder + analyzer demo.",
    icon: Building2Icon,
  },
  {
    title: "Onboarding Demo",
    href: "/demos/onboarding",
    description: "Typeform-style flow powered by orchestrator hooks.",
    icon: FormInputIcon,
  },

  {
    title: "Stream Demo",
    href: "/test-stream",
    description: "Streaming responses example.",
    icon: PlugZapIcon,
  },
  {
    title: "Response Demo",
    href: "/test-response",
    description: "Response evaluation example.",
    icon: AtomIcon,
  },
  {
    title: "QO Demo",
    href: "/test-qo",
    description: "Queue orchestration playground.",
    icon: PanelTopIcon,
  },
  {
    title: "UI Demo",
    href: "/ui-demo",
    description: "UI component showcase.",
    icon: Code2Icon,
  },
];

export function DemoNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {demoLinks.map((link) => {
        const isActive =
          pathname === link.href || (link.href !== "/demos" && pathname.startsWith(link.href));
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary/10 font-medium text-primary ring-1 ring-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>{link.title}</span>
            <Icon className="size-4 shrink-0" />
          </Link>
        );
      })}
    </nav>
  );
}
