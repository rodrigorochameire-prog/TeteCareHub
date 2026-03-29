"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Bell, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const EVENT_TYPE_LABELS: Record<string, string> = {
  vaccine: "Vacinas",
  preventive: "Preventivos",
  medication: "Medicamentos",
  booking: "Reservas",
  plan_renewal: "Renovação de plano",
};

const EVENT_TYPE_DESCRIPTIONS: Record<string, string> = {
  vaccine: "Notificações sobre vacinas vencendo ou pendentes",
  preventive: "Notificações sobre tratamentos preventivos (antipulgas, vermífugos, etc.)",
  medication: "Lembretes de medicamentos contínuos",
  booking: "Alertas sobre reservas de creche e hospedagem",
  plan_renewal: "Aviso de renovação de planos e pacotes",
};

interface RuleState {
  id: number;
  eventType: string;
  daysBeforeCustom: number | null;
  notifyApp: boolean;
  notifyWhatsapp: boolean;
  isActive: boolean;
  dirty: boolean;
}

export default function NotificationsSettingsPage() {
  const { data: rules, isLoading } = trpc.notificationRules.list.useQuery();
  const updateRule = trpc.notificationRules.update.useMutation();
  const utils = trpc.useUtils();

  const [localRules, setLocalRules] = useState<RuleState[]>([]);

  // Sync from server when data arrives
  useEffect(() => {
    if (rules) {
      setLocalRules(
        rules.map((r) => ({
          id: r.id,
          eventType: r.eventType,
          daysBeforeCustom: r.daysBeforeCustom,
          notifyApp: r.notifyApp,
          notifyWhatsapp: r.notifyWhatsapp,
          isActive: r.isActive,
          dirty: false,
        }))
      );
    }
  }, [rules]);

  function updateLocal(id: number, patch: Partial<Omit<RuleState, "id" | "eventType" | "dirty">>) {
    setLocalRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch, dirty: true } : r))
    );
  }

  async function handleSave(rule: RuleState) {
    try {
      await updateRule.mutateAsync({
        id: rule.id,
        daysBeforeCustom: rule.daysBeforeCustom,
        notifyApp: rule.notifyApp,
        notifyWhatsapp: rule.notifyWhatsapp,
        isActive: rule.isActive,
      });
      setLocalRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, dirty: false } : r))
      );
      utils.notificationRules.list.invalidate();
      toast.success("Regra atualizada com sucesso");
    } catch {
      toast.error("Erro ao salvar regra de notificação");
    }
  }

  async function handleSaveAll() {
    const dirtyRules = localRules.filter((r) => r.dirty);
    if (dirtyRules.length === 0) {
      toast.info("Nenhuma alteração pendente");
      return;
    }

    try {
      await Promise.all(
        dirtyRules.map((rule) =>
          updateRule.mutateAsync({
            id: rule.id,
            daysBeforeCustom: rule.daysBeforeCustom,
            notifyApp: rule.notifyApp,
            notifyWhatsapp: rule.notifyWhatsapp,
            isActive: rule.isActive,
          })
        )
      );
      setLocalRules((prev) => prev.map((r) => ({ ...r, dirty: false })));
      utils.notificationRules.list.invalidate();
      toast.success(`${dirtyRules.length} regra(s) atualizada(s) com sucesso`);
    } catch {
      toast.error("Erro ao salvar regras de notificação");
    }
  }

  const hasDirtyRules = localRules.some((r) => r.dirty);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-72 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Configuração de Notificações
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure quando e como os tutores recebem notificações sobre seus pets.
          </p>
        </div>
        {hasDirtyRules && (
          <Button
            onClick={handleSaveAll}
            disabled={updateRule.isPending}
            className="gap-2"
          >
            {updateRule.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Alterações
          </Button>
        )}
      </div>

      {/* Rules */}
      {localRules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">
              Nenhuma regra de notificação cadastrada
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              As regras serão criadas automaticamente pelo sistema.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {localRules.map((rule) => {
            const label = EVENT_TYPE_LABELS[rule.eventType] ?? rule.eventType;
            const description = EVENT_TYPE_DESCRIPTIONS[rule.eventType] ?? "";

            return (
              <Card
                key={rule.id}
                className={`transition-all duration-200 ${
                  rule.dirty ? "ring-2 ring-primary/30" : ""
                } ${!rule.isActive ? "opacity-60" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">{label}</CardTitle>
                      {rule.dirty && (
                        <Badge variant="warning" className="text-[10px]">
                          Alterado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${rule.id}`} className="text-sm text-muted-foreground">
                        Ativo
                      </Label>
                      <Switch
                        id={`active-${rule.id}`}
                        checked={rule.isActive}
                        onCheckedChange={(checked) => updateLocal(rule.id, { isActive: checked })}
                      />
                    </div>
                  </div>
                  {description && (
                    <CardDescription>{description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {/* Days before */}
                    <div className="space-y-2">
                      <Label htmlFor={`days-${rule.id}`}>Dias de antecedência</Label>
                      <Input
                        id={`days-${rule.id}`}
                        type="number"
                        min={1}
                        max={90}
                        value={rule.daysBeforeCustom ?? ""}
                        placeholder="Padrão do sistema"
                        onChange={(e) => {
                          const val = e.target.value;
                          updateLocal(rule.id, {
                            daysBeforeCustom: val ? parseInt(val, 10) : null,
                          });
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        1 a 90 dias antes do vencimento
                      </p>
                    </div>

                    {/* App notifications toggle */}
                    <div className="space-y-2">
                      <Label>Notificações no App</Label>
                      <div className="flex items-center gap-2 pt-1">
                        <Switch
                          id={`app-${rule.id}`}
                          checked={rule.notifyApp}
                          onCheckedChange={(checked) => updateLocal(rule.id, { notifyApp: checked })}
                        />
                        <Label htmlFor={`app-${rule.id}`} className="text-sm font-normal text-muted-foreground">
                          {rule.notifyApp ? "Ativado" : "Desativado"}
                        </Label>
                      </div>
                    </div>

                    {/* WhatsApp toggle */}
                    <div className="space-y-2">
                      <Label>WhatsApp</Label>
                      <div className="flex items-center gap-2 pt-1">
                        <Switch
                          id={`whatsapp-${rule.id}`}
                          checked={rule.notifyWhatsapp}
                          onCheckedChange={(checked) => updateLocal(rule.id, { notifyWhatsapp: checked })}
                        />
                        <Label htmlFor={`whatsapp-${rule.id}`} className="text-sm font-normal text-muted-foreground">
                          {rule.notifyWhatsapp ? "Ativado" : "Desativado"}
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Individual save */}
                  {rule.dirty && (
                    <div className="flex justify-end mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSave(rule)}
                        disabled={updateRule.isPending}
                        className="gap-1.5"
                      >
                        {updateRule.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        Salvar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
