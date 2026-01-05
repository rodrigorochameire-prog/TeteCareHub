"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Dog, 
  Shield, 
  ShieldCheck,
  UserCheck,
  Calendar,
  MoreVertical,
  Eye,
  ArrowUpRight,
  Sparkles,
  Crown,
  CheckCircle2,
  Clock,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { LoadingPage } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminTutorsPage() {
  const [search, setSearch] = useState("");
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data: tutors, isLoading } = trpc.users.tutors.useQuery({ search });
  const { data: stats } = trpc.users.stats.useQuery();

  const promoteMutation = trpc.users.promoteToAdmin.useMutation({
    onSuccess: () => {
      toast.success("Usuário promovido a admin!");
      utils.users.tutors.invalidate();
      utils.users.stats.invalidate();
      setPromoteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Stats summary
  const statsSummary = useMemo(() => {
    if (!tutors) return { total: 0, verified: 0, withPets: 0, totalPets: 0 };
    return {
      total: tutors.length,
      verified: tutors.filter(t => t.emailVerified).length,
      withPets: tutors.filter(t => t.petCount > 0).length,
      totalPets: tutors.reduce((acc, t) => acc + t.petCount, 0),
    };
  }, [tutors]);

  if (isLoading) {
    return <LoadingPage />;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarGradient = (name: string) => {
    const gradients = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-amber-500",
      "from-rose-500 to-red-500",
      "from-indigo-500 to-violet-500",
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="space-y-6 animate-page-in">
      {/* Header Premium */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 rounded-2xl blur-xl" />
        <div className="relative bg-gradient-to-br from-card via-card to-violet-500/5 rounded-2xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                Gestão de Tutores
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie os tutores cadastrados no sistema
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{stats?.tutors || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Total de Tutores</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-600">{stats?.admins || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Administradores</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <Crown className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">{stats?.verified || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Verificados</p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-orange-600">{statsSummary.totalPets}</p>
                <p className="text-xs text-muted-foreground mt-1">Pets Cadastrados</p>
              </div>
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <Dog className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tutors Grid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Tutores</CardTitle>
              <CardDescription>
                {tutors?.length || 0} tutores encontrados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!tutors || tutors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {search ? "Nenhum tutor encontrado" : "Nenhum tutor cadastrado"}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {search ? "Tente ajustar sua busca" : "Aguardando novos cadastros"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tutors.map((tutor) => (
                <Card
                  key={tutor.id}
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedTutor(tutor);
                    setIsDetailOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className={`h-12 w-12 bg-gradient-to-br ${getAvatarGradient(tutor.name)} group-hover:scale-110 transition-transform`}>
                          <AvatarFallback className="bg-transparent text-white font-semibold">
                            {getInitials(tutor.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{tutor.name}</p>
                            {tutor.emailVerified && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                            {tutor.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTutor(tutor);
                            setIsDetailOpen(true);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUserId(tutor.id);
                            setPromoteDialogOpen(true);
                          }}>
                            <Crown className="h-4 w-4 mr-2 text-purple-500" />
                            Promover a Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Dog className="h-4 w-4" />
                        <span className="font-medium">{tutor.petCount}</span> pets
                      </div>
                      {tutor.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{tutor.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Desde {formatDate(tutor.createdAt)}
                      </div>
                      {tutor.emailVerified ? (
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
                          Verificado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30">
                          Pendente
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tutor Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedTutor && (
                <>
                  <Avatar className={`h-10 w-10 bg-gradient-to-br ${getAvatarGradient(selectedTutor.name)}`}>
                    <AvatarFallback className="bg-transparent text-white font-semibold">
                      {getInitials(selectedTutor.name)}
                    </AvatarFallback>
                  </Avatar>
                  {selectedTutor.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Detalhes do tutor
            </DialogDescription>
          </DialogHeader>

          {selectedTutor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <p className="font-medium text-sm truncate">{selectedTutor.email}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Telefone
                  </p>
                  <p className="font-medium text-sm">{selectedTutor.phone || "Não informado"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Dog className="h-3 w-3" /> Pets
                  </p>
                  <p className="font-medium text-sm">{selectedTutor.petCount} cadastrados</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Cadastro
                  </p>
                  <p className="font-medium text-sm">{formatDate(selectedTutor.createdAt)}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">Status</p>
                <div className="flex items-center gap-2">
                  {selectedTutor.emailVerified ? (
                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Email Verificado
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30">
                      <Clock className="h-3 w-3 mr-1" />
                      Aguardando Verificação
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90"
                  onClick={() => {
                    setSelectedUserId(selectedTutor.id);
                    setIsDetailOpen(false);
                    setPromoteDialogOpen(true);
                  }}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Promover a Admin
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Promote Dialog */}
      <ConfirmDialog
        open={promoteDialogOpen}
        onOpenChange={setPromoteDialogOpen}
        title="Promover a Administrador"
        description="Tem certeza que deseja promover este usuário a administrador? Ele terá acesso completo ao sistema."
        confirmLabel="Promover"
        onConfirm={() => {
          if (selectedUserId) {
            promoteMutation.mutate({ id: selectedUserId });
          }
        }}
        isLoading={promoteMutation.isPending}
      />
    </div>
  );
}
