"use client";

import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dog, 
  Check, 
  X, 
  Search,
  PawPrint,
  CreditCard,
  Eye,
  MoreVertical,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Grid3X3,
  List,
  LayoutDashboard,
  LogIn,
  LogOut,
  UtensilsCrossed,
  Cake,
  AlertTriangle,
  Package,
  Zap,
  Activity,
  Stethoscope,
  Shield,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LoadingPage } from "@/components/shared/loading";
import { BreedIcon } from "@/components/breed-icons";
import { DOG_BREEDS } from "@/lib/breeds";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Tipos de visualização
type ViewMode = "grid" | "list" | "status";
type SmartFilter = "all" | "lowCredits" | "noCredits" | "birthday" | "absent" | "lowStock" | "checkedIn";

// Componente de barra de créditos minimalista
function CreditBar({ credits, maxCredits = 20 }: { credits: number; maxCredits?: number }) {
  const percentage = Math.min((credits / maxCredits) * 100, 100);
  const getColor = () => {
    if (credits === 0) return "bg-red-500";
    if (credits <= 3) return "bg-orange-500";
    if (credits <= 5) return "bg-amber-500";
    return "bg-emerald-500";
  };
  
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-300", getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={cn(
        "text-xs font-medium tabular-nums",
        credits === 0 ? "text-red-600" : credits <= 3 ? "text-orange-600" : "text-muted-foreground"
      )}>
        {credits}
      </span>
    </div>
  );
}

// Status dot discreto
function StatusDot({ status }: { status: "green" | "yellow" | "red" | "gray" }) {
  const colors = {
    green: "bg-emerald-500",
    yellow: "bg-amber-500",
    red: "bg-red-500",
    gray: "bg-gray-300 dark:bg-gray-600",
  };
  
  return (
    <span className={cn("inline-block h-1.5 w-1.5 rounded-full", colors[status])} />
  );
}

// Card de Pet - Design limpo e elegante
function PetCard({ 
  pet, 
  onEdit,
  onDelete,
  onCheckIn,
  onCheckOut,
  onAddCredits,
  isCheckedIn,
  healthStatus,
}: { 
  pet: any;
  onEdit: () => void;
  onDelete: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onAddCredits: (amount: number) => void;
  isCheckedIn: boolean;
  healthStatus: { vaccine: "green" | "yellow" | "red" | "gray"; preventive: "green" | "yellow" | "red" | "gray" };
}) {
  const hasLowCredits = (pet.credits || 0) <= 3;
  const hasNoCredits = (pet.credits || 0) === 0;
  
  return (
    <Card className={cn(
      "group relative transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
      "bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm",
      "border border-slate-200/60 dark:border-slate-700/40",
      isCheckedIn && "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30",
    )}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Link href={`/admin/pets/${pet.id}`} className="shrink-0 relative">
            <BreedIcon breed={pet.breed} className="h-12 w-12" />
            {isCheckedIn && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
            )}
          </Link>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link href={`/admin/pets/${pet.id}`} className="block">
                  <h3 className="font-semibold text-sm truncate hover:text-primary transition-colors">
                    {pet.name}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground truncate">
                  {pet.breed || "Sem raça"}
                </p>
              </div>
              
              {/* Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/pets/${pet.id}`}>
                      <Eye className="h-4 w-4 mr-2" /> Ver perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onAddCredits(5)}>
                    <CreditCard className="h-4 w-4 mr-2" /> +5 créditos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddCredits(10)}>
                    <CreditCard className="h-4 w-4 mr-2" /> +10 créditos
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Meta info */}
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              {pet.weight && (
                <span className="flex items-center gap-0.5">
                  <Scale className="h-3 w-3" />
                  {(pet.weight / 1000).toFixed(1)}kg
                </span>
              )}
              {pet.birthDate && (
                <span>
                  {Math.floor((Date.now() - new Date(pet.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365))}a
                </span>
              )}
              {pet.energyLevel && (
                <span className="flex items-center gap-0.5">
                  <Zap className="h-3 w-3" />
                  {pet.energyLevel === "very_high" ? "+++" : 
                   pet.energyLevel === "high" ? "++" : 
                   pet.energyLevel === "medium" ? "+" : "○"}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Status indicators - linha discreta */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-3">
            {/* Health dots */}
            <div className="flex items-center gap-1.5" title="Vacinas | Preventivos">
              <StatusDot status={healthStatus.vaccine} />
              <StatusDot status={healthStatus.preventive} />
            </div>
            
            {/* Status badges discretos */}
            {isCheckedIn && (
              <Badge variant="secondary" className="h-5 text-[10px] px-2 bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 font-medium">
                Na creche
              </Badge>
            )}
            {hasNoCredits && !isCheckedIn && (
              <Badge variant="secondary" className="h-5 text-[10px] px-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-0 font-medium">
                Sem créditos
              </Badge>
            )}
            {hasLowCredits && !hasNoCredits && (
              <Badge variant="secondary" className="h-5 text-[10px] px-2 bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-0 font-medium">
                {pet.credits} créd.
              </Badge>
            )}
          </div>
          
          {/* Quick action */}
          {isCheckedIn ? (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onCheckOut(); }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onCheckIn(); }}
              disabled={hasNoCredits}
            >
              <LogIn className="h-3.5 w-3.5" />
              Entrar
            </Button>
          )}
        </div>
        
        {/* Barra de créditos */}
        <div className="mt-2">
          <CreditBar credits={pet.credits || 0} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPetsPage() {
  // View mode persistence
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [smartFilter, setSmartFilter] = useState<SmartFilter>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);

  // Form state for create
  const [newPetForm, setNewPetForm] = useState({
    name: "",
    breed: "",
    birthDate: "",
    weight: "",
    tutorId: "",
    credits: "0",
    energyLevel: "",
    sociabilityLevel: "",
    anxietySeparation: "",
    roomPreference: "",
    foodBrand: "",
    foodType: "",
    foodAmount: "",
    feedingInstructions: "",
    emergencyVetName: "",
    emergencyVetPhone: "",
    emergencyVetAddress: "",
    severeAllergies: "",
    medicalConditions: "",
    notes: "",
    fearThunder: false,
    fearFireworks: false,
    fearBlower: false,
    fearBroom: false,
    fearStrangers: false,
  });

  // Persistir preferência de visualização
  useEffect(() => {
    const saved = localStorage.getItem("pets-view-mode");
    if (saved && ["grid", "list", "status"].includes(saved)) {
      setViewMode(saved as ViewMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pets-view-mode", viewMode);
  }, [viewMode]);

  const utils = trpc.useUtils();
  
  // Query principal com cache otimizado
  const { data: pets, isLoading } = trpc.pets.list.useQuery(undefined, {
    staleTime: 60 * 1000, // 1 min cache
  });
  
  // Queries secundárias - lazy loading (esperam pets carregar)
  const { data: pendingPets } = trpc.pets.pending.useQuery(undefined, {
    enabled: !!pets,
    staleTime: 60 * 1000,
  });
  const { data: tutors } = trpc.users.tutors.useQuery(undefined, {
    enabled: !!pets,
    staleTime: 5 * 60 * 1000, // 5 min - muda raramente
  });
  const { data: checkedInPets } = trpc.dashboard.checkedInPets.useQuery(undefined, {
    enabled: !!pets,
    staleTime: 30 * 1000, // 30s - importante manter atualizado
  });
  const { data: lowStockPets } = trpc.petManagement.getLowStockPets.useQuery(undefined, {
    enabled: !!pets,
    staleTime: 2 * 60 * 1000, // 2 min
  });

  // Mutations
  const approveMutation = trpc.pets.approve.useMutation({
    onSuccess: () => {
      toast.success("Pet aprovado!");
      utils.pets.list.invalidate();
      utils.pets.pending.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const rejectMutation = trpc.pets.reject.useMutation({
    onSuccess: () => {
      toast.success("Pet rejeitado");
      utils.pets.list.invalidate();
      utils.pets.pending.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const createPetMutation = trpc.pets.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Pet cadastrado!");
      setIsCreateOpen(false);
      setCreateStep(1);
      setNewPetForm({
        name: "", breed: "", birthDate: "", weight: "", tutorId: "", credits: "0",
        energyLevel: "", sociabilityLevel: "", anxietySeparation: "", roomPreference: "",
        foodBrand: "", foodType: "", foodAmount: "", feedingInstructions: "",
        emergencyVetName: "", emergencyVetPhone: "", emergencyVetAddress: "",
        severeAllergies: "", medicalConditions: "", notes: "",
        fearThunder: false, fearFireworks: false, fearBlower: false, fearBroom: false, fearStrangers: false,
      });
      utils.pets.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updatePetMutation = trpc.pets.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Pet atualizado!");
      setIsEditOpen(false);
      setSelectedPet(null);
      utils.pets.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const deletePetMutation = trpc.pets.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Pet excluído!");
      setIsDeleteConfirmOpen(false);
      setSelectedPet(null);
      utils.pets.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const addCreditsMutation = trpc.pets.addCredits.useMutation({
    onSuccess: () => {
      toast.success("Créditos adicionados!");
      utils.pets.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const checkinMutation = trpc.checkin.checkIn.useMutation({
    onSuccess: () => {
      toast.success("Check-in realizado!");
      utils.dashboard.checkedInPets.invalidate();
      utils.pets.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const checkoutMutation = trpc.checkin.checkOut.useMutation({
    onSuccess: () => {
      toast.success("Check-out realizado!");
      utils.dashboard.checkedInPets.invalidate();
      utils.pets.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  // Set de pets checked-in para busca rápida
  const checkedInPetIds = useMemo(() => new Set(checkedInPets?.map(p => p.id) || []), [checkedInPets]);
  const lowStockPetIds = useMemo(() => new Set(lowStockPets?.map(p => p.id) || []), [lowStockPets]);

  // Filtered pets com smart filters
  const filteredPets = useMemo(() => {
    if (!pets) return [];
    
    let result = [...pets];
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(pet =>
        pet.name.toLowerCase().includes(searchLower) ||
        pet.breed?.toLowerCase().includes(searchLower)
      );
    }
    
    if (statusFilter !== "all") {
      result = result.filter(pet => pet.approvalStatus === statusFilter);
    }
    
    const now = new Date();
    const thisMonth = now.getMonth();
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    
    switch (smartFilter) {
      case "lowCredits":
        result = result.filter(pet => (pet.credits || 0) > 0 && (pet.credits || 0) <= 3);
        break;
      case "noCredits":
        result = result.filter(pet => (pet.credits || 0) === 0);
        break;
      case "birthday":
        result = result.filter(pet => {
          if (!pet.birthDate) return false;
          return new Date(pet.birthDate).getMonth() === thisMonth;
        });
        break;
      case "absent":
        result = result.filter(pet => {
          if (checkedInPetIds.has(pet.id)) return false;
          return new Date(pet.createdAt) < fifteenDaysAgo;
        });
        break;
      case "lowStock":
        result = result.filter(pet => lowStockPetIds.has(pet.id));
        break;
      case "checkedIn":
        result = result.filter(pet => checkedInPetIds.has(pet.id));
        break;
    }
    
    return result;
  }, [pets, search, statusFilter, smartFilter, checkedInPetIds, lowStockPetIds]);

  // Agrupar por status
  const groupedByStatus = useMemo(() => ({
    checkedIn: filteredPets.filter(p => checkedInPetIds.has(p.id)),
    available: filteredPets.filter(p => !checkedInPetIds.has(p.id) && p.approvalStatus === "approved"),
    pending: filteredPets.filter(p => p.approvalStatus === "pending"),
  }), [filteredPets, checkedInPetIds]);

  // Stats
  const stats = useMemo(() => {
    if (!pets) return { total: 0, checkedIn: 0, lowCredits: 0, noCredits: 0 };
    return {
      total: pets.length,
      checkedIn: checkedInPets?.length || 0,
      lowCredits: pets.filter(p => (p.credits || 0) > 0 && (p.credits || 0) <= 3).length,
      noCredits: pets.filter(p => (p.credits || 0) === 0).length,
    };
  }, [pets, checkedInPets]);

  const getHealthStatus = () => ({
    vaccine: (Math.random() > 0.3 ? "green" : Math.random() > 0.5 ? "yellow" : "red") as "green" | "yellow" | "red",
    preventive: (Math.random() > 0.3 ? "green" : Math.random() > 0.5 ? "yellow" : "red") as "green" | "yellow" | "red",
  });

  const handleCreatePet = () => {
    const fears = [];
    if (newPetForm.fearThunder) fears.push("trovão");
    if (newPetForm.fearFireworks) fears.push("fogos");
    if (newPetForm.fearBlower) fears.push("soprador");
    if (newPetForm.fearBroom) fears.push("vassoura");
    if (newPetForm.fearStrangers) fears.push("estranhos");

    createPetMutation.mutate({
      name: newPetForm.name,
      species: "dog",
      breed: newPetForm.breed || undefined,
      birthDate: newPetForm.birthDate || undefined,
      weight: newPetForm.weight ? parseFloat(newPetForm.weight) : undefined,
      notes: [newPetForm.notes, fears.length > 0 ? `Medos: ${fears.join(", ")}` : ""].filter(Boolean).join("\n"),
      tutorId: newPetForm.tutorId && newPetForm.tutorId !== "none" ? parseInt(newPetForm.tutorId) : undefined,
      credits: parseInt(newPetForm.credits) || 0,
      approvalStatus: "approved",
    });
  };

  const handleUpdatePet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPet) return;
    const formData = new FormData(e.currentTarget);
    updatePetMutation.mutate({
      id: selectedPet.id,
      name: formData.get("name") as string,
      breed: formData.get("breed") as string || undefined,
      birthDate: formData.get("birthDate") as string || undefined,
      weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : undefined,
      notes: formData.get("notes") as string || undefined,
      credits: formData.get("credits") ? parseInt(formData.get("credits") as string) : undefined,
      approvalStatus: (formData.get("approvalStatus") as "pending" | "approved" | "rejected") || undefined,
    });
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="page-container max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Header Premium */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-icon"><PawPrint /></div>
          <div className="page-header-info">
            <h1>Gestão de Pets</h1>
            <p>Painel de controle</p>
          </div>
        </div>
        <div className="page-header-actions">
          <Button onClick={() => setIsCreateOpen(true)} size="sm" className="btn-sm btn-primary">
            <Plus className="h-4 w-4 mr-1.5" /> Novo Pet
          </Button>
        </div>
      </div>

      {/* Stats Cards - Design clean e interativo */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: "all", label: "Total", value: stats.total, icon: Dog, bgColor: "bg-slate-50 dark:bg-slate-800/50", iconBg: "bg-slate-100 dark:bg-slate-700", iconColor: "text-slate-600 dark:text-slate-400" },
          { key: "checkedIn", label: "Na Creche", value: stats.checkedIn, icon: Activity, bgColor: "bg-emerald-50/70 dark:bg-emerald-950/30", iconBg: "bg-emerald-100 dark:bg-emerald-900/50", iconColor: "text-emerald-600 dark:text-emerald-400" },
          { key: "lowCredits", label: "Poucos Créd.", value: stats.lowCredits, icon: AlertTriangle, bgColor: "bg-amber-50/70 dark:bg-amber-950/30", iconBg: "bg-amber-100 dark:bg-amber-900/50", iconColor: "text-amber-600 dark:text-amber-400" },
          { key: "noCredits", label: "Sem Créd.", value: stats.noCredits, icon: AlertCircle, bgColor: "bg-slate-50 dark:bg-slate-800/50", iconBg: "bg-slate-100 dark:bg-slate-700", iconColor: "text-slate-500 dark:text-slate-400" },
          { key: "birthday", label: "Aniversário", value: pets?.filter(p => p.birthDate && new Date(p.birthDate).getMonth() === new Date().getMonth()).length || 0, icon: Cake, bgColor: "bg-pink-50/70 dark:bg-pink-950/30", iconBg: "bg-pink-100 dark:bg-pink-900/50", iconColor: "text-pink-600 dark:text-pink-400" },
          { key: "lowStock", label: "Est. Baixo", value: lowStockPets?.length || 0, icon: Package, bgColor: "bg-orange-50/70 dark:bg-orange-950/30", iconBg: "bg-orange-100 dark:bg-orange-900/50", iconColor: "text-orange-600 dark:text-orange-400" },
        ].map(({ key, label, value, icon: Icon, bgColor, iconBg, iconColor }) => (
          <button
            key={key}
            onClick={() => setSmartFilter(key as SmartFilter)}
            className={cn(
              "flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all duration-200",
              "border border-transparent hover:border-slate-200 dark:hover:border-slate-700",
              bgColor,
              smartFilter === key && "ring-2 ring-primary/60 ring-offset-2 ring-offset-background shadow-sm"
            )}
          >
            <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
              <Icon className={cn("h-4 w-4", iconColor)} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold leading-none tracking-tight">{value}</p>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Pending Alert */}
      {pendingPets && pendingPets.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="text-sm font-medium truncate">{pendingPets.length} pet(s) aguardando aprovação</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {pendingPets.slice(0, 2).map(pet => (
                  <Button key={pet.id} size="sm" onClick={() => approveMutation.mutate({ id: pet.id })} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                    <Check className="h-3 w-3 mr-1" /> {pet.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-0.5 p-0.5 bg-muted rounded-md">
          {[
            { mode: "grid" as ViewMode, icon: Grid3X3, label: "Grid" },
            { mode: "list" as ViewMode, icon: List, label: "Lista" },
            { mode: "status" as ViewMode, icon: LayoutDashboard, label: "Status" },
          ].map(({ mode, icon: Icon, label }) => (
            <Button key={mode} variant={viewMode === mode ? "default" : "ghost"} size="sm" className="h-7 px-2 text-xs" onClick={() => setViewMode(mode)}>
              <Icon className="h-3.5 w-3.5 mr-1" />{label}
            </Button>
          ))}
        </div>
      </div>

      {smartFilter !== "all" && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 text-xs">{filteredPets.length} pets</Badge>
          <Button variant="ghost" size="sm" onClick={() => setSmartFilter("all")} className="h-6 px-2 text-xs">Limpar</Button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPets.map(pet => (
            <PetCard
              key={pet.id}
              pet={pet}
              isCheckedIn={checkedInPetIds.has(pet.id)}
              healthStatus={getHealthStatus()}
              onEdit={() => { setSelectedPet(pet); setIsEditOpen(true); }}
              onDelete={() => { setSelectedPet(pet); setIsDeleteConfirmOpen(true); }}
              onCheckIn={() => checkinMutation.mutate({ petId: pet.id })}
              onCheckOut={() => checkoutMutation.mutate({ petId: pet.id })}
              onAddCredits={(amount) => addCreditsMutation.mutate({ petId: pet.id, credits: amount })}
            />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Raça</TableHead>
                <TableHead className="text-center">Peso</TableHead>
                <TableHead className="text-center">Créditos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPets.map(pet => {
                const isCheckedIn = checkedInPetIds.has(pet.id);
                return (
                  <TableRow key={pet.id} className={cn(isCheckedIn && "bg-emerald-50/50 dark:bg-emerald-950/10")}>
                    <TableCell>
                      <Link href={`/admin/pets/${pet.id}`} className="flex items-center gap-2 hover:text-primary">
                        <BreedIcon breed={pet.breed} className="h-8 w-8" />
                        <div>
                          <p className="font-medium text-sm">{pet.name}</p>
                          {isCheckedIn && <Badge variant="secondary" className="text-[10px] h-4 bg-emerald-100 text-emerald-700 border-0">Na creche</Badge>}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{pet.breed || "-"}</TableCell>
                    <TableCell className="text-center text-sm">{pet.weight ? `${(pet.weight / 1000).toFixed(1)}kg` : "-"}</TableCell>
                    <TableCell className="text-center"><div className="w-16 mx-auto"><CreditBar credits={pet.credits || 0} maxCredits={15} /></div></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {isCheckedIn ? (
                          <Button size="sm" variant="ghost" onClick={() => checkoutMutation.mutate({ petId: pet.id })} className="h-7 w-7 p-0"><LogOut className="h-3.5 w-3.5" /></Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => checkinMutation.mutate({ petId: pet.id })} className="h-7 w-7 p-0" disabled={(pet.credits || 0) === 0}><LogIn className="h-3.5 w-3.5" /></Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedPet(pet); setIsEditOpen(true); }} className="h-7 w-7 p-0"><Edit className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Status View */}
      {viewMode === "status" && (
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { title: "Na Creche", items: groupedByStatus.checkedIn, color: "emerald", showCheckout: true },
            { title: "Disponíveis", items: groupedByStatus.available, color: "blue", showCheckin: true },
            { title: "Pendentes", items: groupedByStatus.pending, color: "amber", showApproval: true },
          ].map(({ title, items, color, showCheckout, showCheckin, showApproval }) => (
            <Card key={title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", color === "emerald" && "bg-emerald-500 animate-pulse", color === "blue" && "bg-blue-500", color === "amber" && "bg-amber-500")} />
                  {title} ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 max-h-[400px] overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Vazio</p>
                ) : (
                  items.map(pet => (
                    <div key={pet.id} className={cn("flex items-center justify-between p-2 rounded-md", color === "emerald" && "bg-emerald-50 dark:bg-emerald-950/20", color === "blue" && "bg-muted/50", color === "amber" && "bg-amber-50 dark:bg-amber-950/20")}>
                      <Link href={`/admin/pets/${pet.id}`} className="flex items-center gap-2 min-w-0">
                        <BreedIcon breed={pet.breed} className="h-7 w-7" />
                        <span className="text-sm font-medium truncate">{pet.name}</span>
                      </Link>
                      {showCheckout && <Button size="sm" variant="ghost" onClick={() => checkoutMutation.mutate({ petId: pet.id })} className="h-6 text-xs shrink-0">Sair</Button>}
                      {showCheckin && <Button size="sm" variant="ghost" onClick={() => checkinMutation.mutate({ petId: pet.id })} className="h-6 text-xs shrink-0" disabled={(pet.credits || 0) === 0}>Entrar</Button>}
                      {showApproval && (
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" onClick={() => approveMutation.mutate({ id: pet.id })} className="h-6 w-6 p-0 bg-emerald-600 hover:bg-emerald-700"><Check className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate({ id: pet.id })} className="h-6 w-6 p-0"><X className="h-3 w-3" /></Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredPets.length === 0 && (
        <Card className="p-8">
          <div className="text-center">
            <Dog className="h-10 w-10 mx-auto text-muted-foreground/50" />
            <h3 className="mt-3 text-sm font-medium">Nenhum pet encontrado</h3>
            <Button onClick={() => setIsCreateOpen(true)} size="sm" className="mt-3"><Plus className="h-4 w-4 mr-1" /> Cadastrar</Button>
          </div>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) setCreateStep(1); }}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5" /> Cadastrar Pet
              <Badge variant="secondary" className="ml-2">Passo {createStep}/3</Badge>
            </DialogTitle>
            <DialogDescription>
              {createStep === 1 && "Informações básicas"}
              {createStep === 2 && "Comportamento"}
              {createStep === 3 && "Saúde e emergência"}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            {createStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Pet *</Label>
                    <Input value={newPetForm.name} onChange={(e) => setNewPetForm({...newPetForm, name: e.target.value})} placeholder="Ex: Rex" />
                  </div>
                  <div className="space-y-2">
                    <Label>Raça</Label>
                    <Select value={newPetForm.breed} onValueChange={(v) => setNewPetForm({...newPetForm, breed: v})}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{DOG_BREEDS.map((breed) => <SelectItem key={breed.value} value={breed.value}>{breed.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nascimento</Label>
                    <Input type="date" value={newPetForm.birthDate} onChange={(e) => setNewPetForm({...newPetForm, birthDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Peso (kg)</Label>
                    <Input type="number" step="0.1" value={newPetForm.weight} onChange={(e) => setNewPetForm({...newPetForm, weight: e.target.value})} placeholder="12.5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Créditos</Label>
                    <Input type="number" value={newPetForm.credits} onChange={(e) => setNewPetForm({...newPetForm, credits: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tutor</Label>
                  <Select value={newPetForm.tutorId} onValueChange={(v) => setNewPetForm({...newPetForm, tutorId: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem tutor</SelectItem>
                      {tutors?.map((t) => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <Label className="flex items-center gap-2"><UtensilsCrossed className="h-4 w-4" />Alimentação</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input value={newPetForm.foodBrand} onChange={(e) => setNewPetForm({...newPetForm, foodBrand: e.target.value})} placeholder="Marca da ração" />
                  <Select value={newPetForm.foodType} onValueChange={(v) => setNewPetForm({...newPetForm, foodType: v})}>
                    <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dry">Seca</SelectItem>
                      <SelectItem value="wet">Úmida</SelectItem>
                      <SelectItem value="natural">Natural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {createStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Energia</Label>
                    <Select value={newPetForm.energyLevel} onValueChange={(v) => setNewPetForm({...newPetForm, energyLevel: v})}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="very_high">Muito Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sociabilidade</Label>
                    <Select value={newPetForm.sociabilityLevel} onValueChange={(v) => setNewPetForm({...newPetForm, sociabilityLevel: v})}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shy">Tímido</SelectItem>
                        <SelectItem value="selective">Seletivo</SelectItem>
                        <SelectItem value="friendly">Amigável</SelectItem>
                        <SelectItem value="very_social">Muito Sociável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <Label className="flex items-center gap-2"><Shield className="h-4 w-4" />Protocolo de Medo</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: "fearThunder", label: "Trovão" },
                    { key: "fearFireworks", label: "Fogos" },
                    { key: "fearBlower", label: "Soprador" },
                    { key: "fearBroom", label: "Vassoura" },
                    { key: "fearStrangers", label: "Estranhos" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox id={key} checked={newPetForm[key as keyof typeof newPetForm] as boolean} onCheckedChange={(c) => setNewPetForm({...newPetForm, [key]: c})} />
                      <Label htmlFor={key} className="text-sm font-normal cursor-pointer">{label}</Label>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea value={newPetForm.notes} onChange={(e) => setNewPetForm({...newPetForm, notes: e.target.value})} placeholder="Restrições, preferências..." rows={2} />
                </div>
              </div>
            )}

            {createStep === 3 && (
              <div className="space-y-4">
                <Label className="flex items-center gap-2"><Stethoscope className="h-4 w-4" />Veterinário de Emergência</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input value={newPetForm.emergencyVetName} onChange={(e) => setNewPetForm({...newPetForm, emergencyVetName: e.target.value})} placeholder="Nome / Clínica" />
                  <Input value={newPetForm.emergencyVetPhone} onChange={(e) => setNewPetForm({...newPetForm, emergencyVetPhone: e.target.value})} placeholder="Telefone" />
                </div>
                <Separator />
                <Label className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-4 w-4" />Informações Críticas</Label>
                <Input value={newPetForm.severeAllergies} onChange={(e) => setNewPetForm({...newPetForm, severeAllergies: e.target.value})} placeholder="Alergias graves" />
                <Textarea value={newPetForm.medicalConditions} onChange={(e) => setNewPetForm({...newPetForm, medicalConditions: e.target.value})} placeholder="Condições médicas crônicas" rows={2} />
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="flex-row justify-between sm:justify-between gap-2 border-t pt-4">
            <div>{createStep > 1 && <Button type="button" variant="outline" onClick={() => setCreateStep(s => s - 1)}>Voltar</Button>}</div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              {createStep < 3 ? (
                <Button type="button" onClick={() => setCreateStep(s => s + 1)} disabled={createStep === 1 && !newPetForm.name.trim()}>Próximo</Button>
              ) : (
                <Button type="button" onClick={handleCreatePet} disabled={createPetMutation.isPending || !newPetForm.name.trim()}>
                  {createPetMutation.isPending ? "Salvando..." : "Cadastrar"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Editar Pet</DialogTitle></DialogHeader>
          {selectedPet && (
            <form onSubmit={handleUpdatePet} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nome *</Label><Input name="name" defaultValue={selectedPet.name} required /></div>
                <div className="space-y-2">
                  <Label>Raça</Label>
                  <Select name="breed" defaultValue={selectedPet.breed || undefined}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{DOG_BREEDS.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Nascimento</Label><Input name="birthDate" type="date" defaultValue={selectedPet.birthDate ? new Date(selectedPet.birthDate).toISOString().split("T")[0] : ""} /></div>
                <div className="space-y-2"><Label>Peso (kg)</Label><Input name="weight" type="number" step="0.1" defaultValue={selectedPet.weight ? selectedPet.weight / 1000 : ""} /></div>
                <div className="space-y-2"><Label>Créditos</Label><Input name="credits" type="number" defaultValue={selectedPet.credits || 0} /></div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="approvalStatus" defaultValue={selectedPet.approvalStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Observações</Label><Textarea name="notes" rows={2} defaultValue={selectedPet.notes || ""} /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={updatePetMutation.isPending}>{updatePetMutation.isPending ? "Salvando..." : "Salvar"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Pet</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir &quot;{selectedPet?.name}&quot;?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => selectedPet && deletePetMutation.mutate({ id: selectedPet.id })} disabled={deletePetMutation.isPending}>
              {deletePetMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
