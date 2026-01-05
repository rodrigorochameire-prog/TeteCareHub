"use client";

import Image from "next/image";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dog, Plus, CreditCard, Calendar, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { LoadingPage } from "@/components/shared/loading";

export default function TutorPetsPage() {
  const { data: pets, isLoading } = trpc.pets.myPets.useQuery();

  if (isLoading) {
    return <LoadingPage />;
  }

  // Stats
  const totalPets = pets?.length || 0;
  const approvedPets = pets?.filter(p => p.approvalStatus === "approved").length || 0;
  const totalCredits = pets?.reduce((sum, p) => sum + (p.credits || 0), 0) || 0;
  const pendingPets = pets?.filter(p => p.approvalStatus === "pending").length || 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-icon">
            <Dog />
          </div>
          <div className="page-header-info">
            <h1>Meus Pets</h1>
            <p>Gerencie seus pets cadastrados</p>
          </div>
        </div>
        <div className="page-header-actions">
          <Button asChild size="sm" className="btn-sm btn-primary">
            <Link href="/tutor/pets/new">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Novo Pet
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total</span>
            <Dog className="stat-card-icon primary" />
          </div>
          <div className="stat-card-value">{totalPets}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Aprovados</span>
            <Heart className="stat-card-icon green" />
          </div>
          <div className="stat-card-value">{approvedPets}</div>
        </div>

        <div className={`stat-card ${pendingPets > 0 ? 'highlight' : ''}`}>
          <div className="stat-card-header">
            <span className="stat-card-title">Pendentes</span>
            <Calendar className={`stat-card-icon ${pendingPets > 0 ? 'amber' : 'muted'}`} />
          </div>
          <div className="stat-card-value">{pendingPets}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Dias Totais</span>
            <CreditCard className="stat-card-icon blue" />
          </div>
          <div className="stat-card-value">{totalCredits}</div>
        </div>
      </div>

      {/* Pets List */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">
            <Dog />
            Todos os Pets
            <Badge variant="secondary" className="ml-2">{totalPets}</Badge>
          </div>
        </div>
        <div className="section-card-content">
          {!pets || pets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Dog /></div>
              <div className="empty-state-title">Nenhum pet cadastrado</div>
              <div className="empty-state-description">
                Comece cadastrando seu primeiro pet!
              </div>
              <Button asChild size="sm" className="mt-4">
                <Link href="/tutor/pets/new">Cadastrar Pet</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {pets.map((pet) => (
                <Link key={pet.id} href={`/tutor/pets/${pet.id}`}>
                  <div className="p-4 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-3">
                      {pet.photoUrl ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={pet.photoUrl}
                            alt={pet.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Dog className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{pet.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {pet.breed || "Sem raça definida"}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <Badge className={
                        pet.approvalStatus === "approved" ? "badge-green" :
                        pet.approvalStatus === "pending" ? "badge-amber" : "badge-rose"
                      }>
                        {pet.approvalStatus === "approved" ? "Aprovado" :
                         pet.approvalStatus === "pending" ? "Pendente" : "Rejeitado"}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{pet.credits} dias</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
