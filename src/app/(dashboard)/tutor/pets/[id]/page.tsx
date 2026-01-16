"use client";

import { use, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PetAvatar } from "@/components/pet-avatar";
import {
  Dog,
  Calendar,
  Weight,
  Utensils,
  FileText,
  Pencil,
  Coins,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Syringe,
  Pill,
  GraduationCap,
  ClipboardList,
  FolderOpen,
  MessageSquare,
  Heart,
  Brain,
  Users,
  Zap,
  Frown,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { LoadingPage } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { notFound } from "next/navigation";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface PetPageProps {
  params: Promise<{ id: string }>;
}

// Opções para cálculo do gráfico de radar
const socializationScores: Record<string, number> = {
  excellent: 100,
  good: 75,
  moderate: 50,
  poor: 25,
};

const energyScores: Record<string, number> = {
  high: 100,
  normal: 66,
  low: 33,
};

const obedienceScores: Record<string, number> = {
  excellent: 100,
  good: 66,
  needs_work: 33,
};

const anxietyScores: Record<string, number> = {
  none: 100,
  mild: 66,
  moderate: 33,
  severe: 0,
};

const aggressionScores: Record<string, number> = {
  none: 100,
  mild: 66,
  moderate: 33,
  severe: 0,
};

export default function TutorPetDetailPage(props: PetPageProps) {
  const params = use(props.params);
  const petId = parseInt(params.id);

  const { data: pet, isLoading, error } = trpc.pets.byId.useQuery({ id: petId });
  
  // Buscar registros de comportamento dos últimos 30 dias
  const { data: behaviorLogs } = trpc.behavior.byPet.useQuery(
    { petId, limit: 30 },
    { enabled: !!pet, staleTime: 5 * 60 * 1000 }
  );

  // Calcular dados do gráfico de radar baseado nos registros de comportamento
  const radarData = useMemo(() => {
    if (!behaviorLogs || behaviorLogs.length === 0) {
      // Retorna valores padrão baseados no perfil do pet
      return [
        { subject: "Socialização", value: 50, fullMark: 100 },
        { subject: "Obediência", value: 50, fullMark: 100 },
        { subject: "Energia", value: 50, fullMark: 100 },
        { subject: "Calma", value: 50, fullMark: 100 },
        { subject: "Docilidade", value: 50, fullMark: 100 },
      ];
    }

    // Calcular médias dos registros de comportamento
    const calcAvg = (field: string, scores: Record<string, number>) => {
      const values = behaviorLogs
        .map((log: any) => log[field])
        .filter(Boolean)
        .map((v: string) => scores[v] || 50);
      
      if (values.length === 0) return 50;
      return Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length);
    };

    return [
      { subject: "Socialização", value: calcAvg("socialization", socializationScores), fullMark: 100 },
      { subject: "Obediência", value: calcAvg("obedience", obedienceScores), fullMark: 100 },
      { subject: "Energia", value: calcAvg("energy", energyScores), fullMark: 100 },
      { subject: "Calma", value: calcAvg("anxiety", anxietyScores), fullMark: 100 },
      { subject: "Docilidade", value: calcAvg("aggression", aggressionScores), fullMark: 100 },
    ];
  }, [behaviorLogs]);

  // Últimos registros de comportamento formatados
  const recentBehavior = useMemo(() => {
    if (!behaviorLogs) return [];
    return behaviorLogs.slice(0, 5);
  }, [behaviorLogs]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error || !pet) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Aprovado
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Pendente
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejeitado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const PetIcon = Dog;

  return (
    <div className="space-y-6">
      <PageHeader
        title={pet.name}
        description={pet.breed || "Cachorro"}
        backHref="/tutor/pets"
        actions={
          <Button asChild>
            <Link href={`/tutor/pets/${pet.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <PetAvatar 
                  photoUrl={pet.photoUrl} 
                  breed={pet.breed} 
                  name={pet.name} 
                  size={64} 
                />
                <div className="flex-1">
                  <CardTitle className="text-2xl">{pet.name}</CardTitle>
                  <CardDescription>{pet.breed}</CardDescription>
                </div>
                {getStatusBadge(pet.approvalStatus)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pet.birthDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nascimento</p>
                      <p className="font-medium">{formatDate(pet.birthDate)}</p>
                    </div>
                  </div>
                )}

                {pet.weight && (
                  <div className="flex items-start gap-2">
                    <Weight className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Peso</p>
                      <p className="font-medium">{(pet.weight / 1000).toFixed(1)} kg</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <Coins className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Créditos</p>
                    <p className="font-medium">{pet.credits} dias</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alimentação */}
          {(pet.foodBrand || pet.foodAmount) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Utensils className="h-5 w-5" />
                  Alimentação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {pet.foodBrand && (
                    <div>
                      <p className="text-sm text-muted-foreground">Marca da ração</p>
                      <p className="font-medium">{pet.foodBrand}</p>
                    </div>
                  )}
                  {pet.foodAmount && (
                    <div>
                      <p className="text-sm text-muted-foreground">Quantidade diária</p>
                      <p className="font-medium">{pet.foodAmount}g</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Perfil Comportamental */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-purple-500" />
                Perfil Comportamental
              </CardTitle>
              <CardDescription>
                Avaliação baseada nos registros da creche
                {behaviorLogs && behaviorLogs.length > 0 && (
                  <span className="ml-1">
                    ({behaviorLogs.length} registros)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" fontSize={11} stroke="#94a3b8" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                    <Radar
                      name="Comportamento"
                      dataKey="value"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.5}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [`${value}%`, 'Pontuação']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Legenda dos atributos */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                  <Users className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-muted-foreground">Socialização</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                  <GraduationCap className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-muted-foreground">Obediência</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                  <Zap className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-muted-foreground">Energia</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                  <Activity className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-muted-foreground">Calma</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                  <Heart className="h-3.5 w-3.5 text-pink-500" />
                  <span className="text-muted-foreground">Docilidade</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Últimos Registros de Comportamento */}
          {recentBehavior.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5 text-green-500" />
                  Últimos Registros
                </CardTitle>
                <CardDescription>
                  Registros de comportamento recentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBehavior.map((log: any, idx: number) => (
                    <div key={log.id || idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.logDate).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short"
                          })}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {log.socialization && (
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {log.socialization === "excellent" ? "Excelente" :
                               log.socialization === "good" ? "Bom" :
                               log.socialization === "moderate" ? "Moderado" : "Ruim"}
                            </Badge>
                          )}
                          {log.energy && (
                            <Badge variant="outline" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              {log.energy === "high" ? "Alta" :
                               log.energy === "normal" ? "Normal" : "Baixa"}
                            </Badge>
                          )}
                          {log.anxiety && log.anxiety !== "none" && (
                            <Badge variant="outline" className="text-xs text-amber-600">
                              <Frown className="h-3 w-3 mr-1" />
                              {log.anxiety === "mild" ? "Leve" :
                               log.anxiety === "moderate" ? "Moderada" : "Severa"}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {log.notes && (
                        <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {pet.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{pet.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Créditos */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Créditos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{pet.credits}</div>
              <p className="text-sm text-muted-foreground">dias de creche</p>
              <Separator className="my-4" />
              <Button asChild className="w-full">
                <Link href="/tutor/credits">Comprar Créditos</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/bookings">
                  <Clock className="h-4 w-4 mr-2" />
                  Fazer Reserva
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/calendar">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Calendário
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Gestão de Saúde */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Saúde & Cuidados
              </CardTitle>
              <CardDescription>Acompanhe todos os registros</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/vaccines">
                  <Syringe className="h-4 w-4 mr-2 text-blue-500" />
                  Vacinas
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/medications">
                  <Pill className="h-4 w-4 mr-2 text-purple-500" />
                  Medicamentos
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/training">
                  <GraduationCap className="h-4 w-4 mr-2 text-orange-500" />
                  Treinamento
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/logs">
                  <ClipboardList className="h-4 w-4 mr-2 text-green-500" />
                  Logs Diários
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/documents">
                  <FolderOpen className="h-4 w-4 mr-2 text-amber-500" />
                  Documentos
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Comunicação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Comunicação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/wall">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ver Mural
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Info do Cadastro */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div className="flex justify-between">
                <span>Cadastrado em</span>
                <span>{formatDate(pet.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Última atualização</span>
                <span>{formatDate(pet.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
