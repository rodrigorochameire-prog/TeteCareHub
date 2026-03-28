"use client";

import { use } from "react";
import { trpc } from "@/lib/trpc/client";
import { InviteWizard } from "@/components/invite/invite-wizard";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { data, isLoading, error } = trpc.invitePublic.getByToken.useQuery(
    { token },
    { retry: false }
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Carregando convite...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const message =
      error?.message || "Convite nao encontrado ou invalido.";
    return (
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h2 className="text-lg font-semibold">Convite indisponivel</h2>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <InviteWizard token={token} data={data} />;
}
