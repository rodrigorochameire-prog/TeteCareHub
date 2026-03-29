"use client";

import { Badge } from "@/components/ui/badge";
import { Building2, User } from "lucide-react";

interface SourceBadgeProps {
  source: "admin" | "tutor";
}

export function SourceBadge({ source }: SourceBadgeProps) {
  if (source === "admin") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Building2 className="h-3 w-3" />
        Creche
      </Badge>
    );
  }

  return (
    <Badge variant="info" className="gap-1">
      <User className="h-3 w-3" />
      Tutor
    </Badge>
  );
}
