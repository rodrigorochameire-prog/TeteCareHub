"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutGrid,
  Users,
  DoorOpen,
  Hotel,
  Settings2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CalendarDays,
} from "lucide-react";
import { OccupancyGrid } from "@/components/occupancy/occupancy-grid";
import {
  CalendarCheckinDialog,
  CalendarCheckoutDialog,
} from "@/components/calendar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function OccupancyPage() {
  const utils = trpc.useUtils();

  const { data: currentData, isLoading: loadingCurrent } =
    trpc.occupancy.current.useQuery(undefined, { staleTime: 15 * 1000 });
  const { data: capacityData } = trpc.occupancy.getCapacity.useQuery();
  const { data: allPets } = trpc.pets.list.useQuery({ approvalStatus: "approved" });

  // Dialog de capacidade
  const [capacityDialogOpen, setCapacityDialogOpen] = useState(false);
  const [newCapacity, setNewCapacity] = useState("");

  // Relatório mensal
  const now = new Date();
  const [reportMonth, setReportMonth] = useState(now.getMonth());
  const [reportYear, setReportYear] = useState(now.getFullYear());

  const { data: reportData, isLoading: loadingReport } =
    trpc.occupancy.monthlyReport.useQuery(
      { month: reportMonth, year: reportYear },
      { staleTime: 60 * 1000 }
    );

  // Dialog de checkout
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPet, setCheckoutPet] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const setCapacityMutation = trpc.occupancy.setCapacity.useMutation({
    onSuccess: () => {
      utils.occupancy.current.invalidate();
      utils.occupancy.getCapacity.invalidate();
      setCapacityDialogOpen(false);
      setNewCapacity("");
    },
  });

  function handleRefresh() {
    utils.occupancy.current.invalidate();
  }

  function handleCheckinSuccess() {
    utils.occupancy.current.invalidate();
    utils.dashboard.checkedInPets.invalidate();
  }

  function handleCheckoutTrigger(petId: number, petName: string) {
    setCheckoutPet({ id: petId, name: petName });
    setCheckoutOpen(true);
  }

  function handleCheckoutSuccess() {
    setCheckoutOpen(false);
    setCheckoutPet(null);
    utils.occupancy.current.invalidate();
    utils.dashboard.checkedInPets.invalidate();
  }

  function handleSetCapacity(e: React.FormEvent) {
    e.preventDefault();
    const val = parseInt(newCapacity, 10);
    if (isNaN(val) || val < 1) return;
    setCapacityMutation.mutate({ maxCapacity: val });
  }

  const capacity = currentData?.maxCapacity ?? capacityData?.maxCapacity ?? 15;
  const occupied = currentData?.count ?? 0;
  const available = currentData?.availableSpots ?? 0;
  const percentage = currentData?.occupancyPercent ?? 0;

  // Pets que ainda nao fizeram check-in (para o dialog)
  const checkedInIds = new Set(currentData?.pets.map((p) => p.id) ?? []);
  const availablePetsForCheckin = (allPets ?? [])
    .filter((p) => !checkedInIds.has(p.id))
    .map((p) => ({ id: p.id, name: p.name }));

  if (loadingCurrent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Ocupação</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="h-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ocupação</h1>
            <p className="text-sm text-muted-foreground">
              Mapa visual de vagas da creche
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewCapacity(String(capacity));
              setCapacityDialogOpen(true);
            }}
          >
            <Settings2 className="mr-1.5 h-4 w-4" />
            Alterar capacidade
          </Button>
          <CalendarCheckinDialog
            onSuccess={handleCheckinSuccess}
            pets={availablePetsForCheckin}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium uppercase">
                Capacidade
              </span>
              <LayoutGrid className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">
              {capacity}
            </div>
            <div className="text-xs text-muted-foreground">vagas totais</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium uppercase">
                Ocupados
              </span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">
              {occupied}
            </div>
            <div className="text-xs text-muted-foreground">
              {percentage}% de ocupação
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium uppercase">
                Livres
              </span>
              <DoorOpen className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {available}
            </div>
            <div className="text-xs text-muted-foreground">vagas disponíveis</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium uppercase">
                Hospedados
              </span>
              <Hotel className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">
              {occupied}
            </div>
            <div className="text-xs text-muted-foreground">pets na creche</div>
          </CardContent>
        </Card>
      </div>

      {/* Grid visual */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-base">
            Mapa de Vagas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OccupancyGrid
            capacity={capacity}
            pets={(currentData?.pets ?? []).map((p) => ({
              id: p.id,
              name: p.name,
              photoUrl: p.photoUrl,
              checkinTime: p.updatedAt,
            }))}
            onCheckin={() => {
              /* CalendarCheckinDialog é trigger-based, o botão no header abre */
            }}
            onCheckout={handleCheckoutTrigger}
          />
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* Relatório Mensal de Ocupação               */}
      {/* ============================================ */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Relatório Mensal
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Ocupação diária e ranking de pets
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(reportMonth)}
                onValueChange={(v) => setReportMonth(Number(v))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((name, idx) => (
                    <SelectItem key={idx} value={String(idx)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(reportYear)}
                onValueChange={(v) => setReportYear(Number(v))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map(
                    (y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadingReport ? (
            <div className="h-[320px] flex items-center justify-center text-muted-foreground">
              Carregando relatório...
            </div>
          ) : !reportData ? (
            <div className="h-[320px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          ) : (
            <>
              {/* Cards de resumo */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-medium uppercase">
                        Média diária
                      </span>
                      <CalendarDays className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mt-2">
                      {reportData.averageOccupancy}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      pets/dia
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-medium uppercase">
                        Taxa de ocupação
                      </span>
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mt-2">
                      {reportData.occupancyRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      do mês
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-medium uppercase">
                        Dia de pico
                      </span>
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                      {reportData.peakDay ? reportData.peakDay.count : 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {reportData.peakDay
                        ? `dia ${reportData.peakDay.day}`
                        : "sem dados"}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-medium uppercase">
                        Dia mais vazio
                      </span>
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mt-2">
                      {reportData.lowestDay ? reportData.lowestDay.count : 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {reportData.lowestDay
                        ? `dia ${reportData.lowestDay.day}`
                        : "sem dados"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de barras */}
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reportData.dailyBreakdown}
                    margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
                  >
                    <XAxis
                      dataKey="day"
                      className="text-muted-foreground"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      className="text-muted-foreground"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        fontSize: "12px",
                        color: "hsl(var(--popover-foreground))",
                      }}
                      formatter={(value, _name, props) => [
                        `${value} pets (${(props.payload as { rate?: number })?.rate ?? 0}%)`,
                        "Ocupação",
                      ]}
                      labelFormatter={(label: number) =>
                        `Dia ${label} de ${MONTH_NAMES[reportMonth]}`
                      }
                    />
                    <ReferenceLine
                      y={reportData.capacity}
                      stroke="hsl(var(--destructive))"
                      strokeDasharray="3 3"
                      label={{
                        value: `Capacidade: ${reportData.capacity}`,
                        position: "right",
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 11,
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={24}>
                      {reportData.dailyBreakdown.map((entry) => (
                        <Cell
                          key={entry.day}
                          fill={
                            entry.rate >= 90
                              ? "#dc2626"
                              : entry.rate >= 70
                                ? "#f59e0b"
                                : "#16a34a"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Ranking de pets */}
              {reportData.petRanking.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Ranking de Frequência
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                            #
                          </th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                            Pet
                          </th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">
                            Dias presentes
                          </th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">
                            % do mês
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.petRanking.map((pet, idx) => (
                          <tr
                            key={pet.petId}
                            className="border-b border-border last:border-0"
                          >
                            <td className="py-2 px-3 text-muted-foreground">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3 font-medium text-foreground">
                              {pet.name}
                            </td>
                            <td className="py-2 px-3 text-right text-foreground">
                              {pet.daysPresent}
                            </td>
                            <td className="py-2 px-3 text-right text-muted-foreground">
                              {pet.percentOfMonth}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Check-out dialog */}
      {checkoutPet && (
        <CalendarCheckoutDialog
          petId={checkoutPet.id}
          petName={checkoutPet.name}
          open={checkoutOpen}
          onOpenChange={(open) => {
            setCheckoutOpen(open);
            if (!open) setCheckoutPet(null);
          }}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Alterar capacidade dialog */}
      <Dialog open={capacityDialogOpen} onOpenChange={setCapacityDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSetCapacity}>
            <DialogHeader>
              <DialogTitle>Alterar Capacidade</DialogTitle>
              <DialogDescription>
                Defina a capacidade máxima de pets na creche.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-2">
              <Label htmlFor="new-capacity">Nova capacidade</Label>
              <Input
                id="new-capacity"
                type="number"
                min={1}
                max={200}
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                placeholder="Ex: 30"
              />
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCapacityDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  setCapacityMutation.isPending ||
                  !newCapacity ||
                  parseInt(newCapacity, 10) < 1
                }
              >
                {setCapacityMutation.isPending
                  ? "Salvando..."
                  : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
