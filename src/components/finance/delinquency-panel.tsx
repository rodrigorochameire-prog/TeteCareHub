"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PetAvatar } from "@/components/pet-avatar";
import { AlertTriangle, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function buildWhatsAppUrl(phone: string | null, petName: string, tutorName: string) {
  if (!phone) return null;
  const cleanPhone = phone.replace(/\D/g, "");
  const phoneWithCountry = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  const message = encodeURIComponent(
    `Olá ${tutorName}! Notamos que o(a) ${petName} está sem créditos na creche. ` +
    `Podemos ajudar a renovar o pacote? Assim garantimos a continuidade do cuidado. 🐾`
  );
  return `https://wa.me/${phoneWithCountry}?text=${message}`;
}

const STATUS_CONFIG = {
  red: {
    label: "Sem créditos",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  },
  yellow: {
    label: "Poucos créditos",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  green: {
    label: "Em dia",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
} as const;

export function DelinquencyPanel() {
  const { data, isLoading } = trpc.expenses.getDelinquencyReport.useQuery();

  const redPets = data?.filter((p) => p.status === "red") ?? [];
  const yellowPets = data?.filter((p) => p.status === "yellow") ?? [];
  const greenPets = data?.filter((p) => p.status === "green") ?? [];

  const visiblePets = [...redPets, ...yellowPets];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Semáforo de Inadimplência
              </CardTitle>
              <CardDescription className="text-xs">
                {redPets.length} sem créditos &middot; {yellowPets.length} com poucos &middot; {greenPets.length} em dia
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Carregando...
          </div>
        ) : visiblePets.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Todos os pets estão em dia com os créditos!
          </div>
        ) : (
          <div className="space-y-2">
            {visiblePets.map((pet) => {
              const config = STATUS_CONFIG[pet.status];
              const waUrl = buildWhatsAppUrl(pet.tutorPhone, pet.name, pet.tutorName ?? "");
              return (
                <div
                  key={pet.id}
                  className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:border-primary/20 transition-colors"
                >
                  <PetAvatar
                    photoUrl={pet.photoUrl}
                    name={pet.name}
                    size="sm"
                    rounded="full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {pet.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${config.badgeClass}`}
                      >
                        {pet.credits} cr
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{pet.tutorName}</span>
                      {pet.lastPaymentDate && (
                        <>
                          <span>&middot;</span>
                          <span>
                            Último pgto:{" "}
                            {format(new Date(pet.lastPaymentDate), "dd/MM/yy", {
                              locale: ptBR,
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {waUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5 text-xs"
                      asChild
                    >
                      <a href={waUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-3.5 w-3.5" />
                        Cobrar
                      </a>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
