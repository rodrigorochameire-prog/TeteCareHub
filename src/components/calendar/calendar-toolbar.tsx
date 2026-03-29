"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CalendarView, CalendarFilters } from "./types";

const EVENT_TYPE_OPTIONS = [
  { value: "creche", label: "Creche" },
  { value: "hospedagem", label: "Hospedagem" },
  { value: "vaccination", label: "Vacinação" },
  { value: "medication", label: "Medicamento" },
  { value: "medical", label: "Consulta" },
  { value: "preventive", label: "Preventivo" },
  { value: "general", label: "Geral" },
];

interface CalendarToolbarProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  date: Date;
  onDateChange: (date: Date) => void;
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
  pets: Array<{ id: number; name: string }>;
  tutors: Array<{ id: number; name: string }>;
}

function formatPeriodLabel(view: CalendarView, date: Date): string {
  if (view === "day") {
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  }
  if (view === "week") {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    const startStr = format(weekStart, "d", { locale: ptBR });
    const endStr = format(weekEnd, "d MMM yyyy", { locale: ptBR });
    return `${startStr}–${endStr}`;
  }
  return format(date, "MMMM yyyy", { locale: ptBR });
}

function navigateDate(view: CalendarView, date: Date, direction: number): Date {
  if (view === "day") return direction > 0 ? addDays(date, 1) : subDays(date, 1);
  if (view === "week") return direction > 0 ? addWeeks(date, 1) : subWeeks(date, 1);
  return direction > 0 ? addMonths(date, 1) : subMonths(date, 1);
}

export function CalendarToolbar({
  view,
  onViewChange,
  date,
  onDateChange,
  filters,
  onFiltersChange,
  pets,
  tutors,
}: CalendarToolbarProps) {
  const activeFilterCount =
    filters.types.length +
    (filters.petId ? 1 : 0) +
    (filters.tutorId ? 1 : 0);

  function handleTypeToggle(type: string, checked: boolean) {
    const newTypes = checked
      ? [...filters.types, type]
      : filters.types.filter((t) => t !== type);
    onFiltersChange({ ...filters, types: newTypes });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Visualização */}
      <Tabs
        value={view}
        onValueChange={(v) => onViewChange(v as CalendarView)}
      >
        <TabsList>
          <TabsTrigger value="day">Dia</TabsTrigger>
          <TabsTrigger value="week">Semana</TabsTrigger>
          <TabsTrigger value="month">Mês</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Navegação */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDateChange(navigateDate(view, date, -1))}
          aria-label="Anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDateChange(new Date())}
        >
          Hoje
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDateChange(navigateDate(view, date, 1))}
          aria-label="Próximo"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="min-w-[180px] text-center text-sm font-medium text-foreground capitalize">
          {formatPeriodLabel(view, date)}
        </span>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="h-4 w-4" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Tipo de evento
              </p>
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`filter-type-${opt.value}`}
                    checked={filters.types.includes(opt.value)}
                    onCheckedChange={(checked) =>
                      handleTypeToggle(opt.value, Boolean(checked))
                    }
                  />
                  <Label
                    htmlFor={`filter-type-${opt.value}`}
                    className="cursor-pointer text-sm"
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtro Pet */}
        <Select
          value={filters.petId?.toString() ?? "all"}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              petId: v === "all" ? undefined : Number(v),
            })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Pet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os pets</SelectItem>
            {pets.map((pet) => (
              <SelectItem key={pet.id} value={pet.id.toString()}>
                {pet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro Tutor */}
        <Select
          value={filters.tutorId?.toString() ?? "all"}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              tutorId: v === "all" ? undefined : Number(v),
            })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tutor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tutores</SelectItem>
            {tutors.map((tutor) => (
              <SelectItem key={tutor.id} value={tutor.id.toString()}>
                {tutor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
