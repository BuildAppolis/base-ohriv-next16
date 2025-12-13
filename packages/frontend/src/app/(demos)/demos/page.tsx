"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { demoLinks } from "./_components/demo-nav";

export default function DemoCatalogPage() {
  const demos = demoLinks.filter((demo) => demo.href !== "/demos");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary">Catalog</Badge>
        <p className="text-muted-foreground">
          Pick a demo to explore. The sidebar also lets you jump between
          experiences.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {demos.map((demo) => {
          const Icon = demo.icon;

          return (
            <Card key={demo.href} className="">

              <CardContent className="flex items-center justify-end">
                <CardHeader className="flex flex-row items-start justify-between border-none">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg ">
                      <Icon className="size-4 text-primary" />
                      {demo.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {demo.description}
                    </p>
                  </div>
                </CardHeader>
                <Button asChild size="sm" variant="primary">
                  <Link href={demo.href} className="flex items-center gap-1">
                    Open <ArrowRightIcon className="size-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
