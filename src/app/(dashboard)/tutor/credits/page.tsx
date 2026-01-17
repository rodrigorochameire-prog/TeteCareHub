"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, Coins, Dog, ShoppingCart, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { LoadingPage } from "@/components/shared/loading";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";

// Função para determinar cor da barra de créditos
function getCreditBarClass(credits: number, maxCredits: number = 20) {
  const percentage = (credits / maxCredits) * 100;
  if (percentage >= 60) return "full"; // Verde
  if (percentage >= 30) return "medium"; // Amarelo
  return "low"; // Vermelho
}

export default function TutorCreditsPage() {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  const { data: summary, isLoading: summaryLoading, refetch } = trpc.credits.mySummary.useQuery();
  const { data: packages, isLoading: packagesLoading } = trpc.credits.packages.useQuery();

  const isLoading = summaryLoading || packagesLoading;

  // Verificar parâmetros de retorno do Stripe
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const credits = searchParams.get("credits");

    if (success === "true" && credits) {
      toast.success(`Pagamento confirmado! ${credits} créditos adicionados.`);
      refetch();
      // Limpar URL
      window.history.replaceState({}, "", "/tutor/credits");
    } else if (canceled === "true") {
      toast.info("Pagamento cancelado.");
      window.history.replaceState({}, "", "/tutor/credits");
    }
  }, [searchParams, refetch]);

  const handlePurchase = async (
    packageId: number,
    packageName: string,
    credits: number,
    priceInCents: number
  ) => {
    if (!selectedPetId && summary?.petCredits && summary.petCredits.length > 0) {
      toast.warning("Selecione um pet para adicionar os créditos");
      return;
    }

    setIsProcessing(packageId);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          packageName,
          credits,
          priceInCents,
          petId: selectedPetId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao iniciar checkout");
      }

      // Redirecionar para Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Erro no checkout:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao processar pagamento");
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="page-container">
      {/* Header Premium */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="icon-primary">
            <Coins />
          </div>
          <div className="page-header-info">
            <h1>Meus Créditos</h1>
            <p>Gerencie seus créditos de creche</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card de Total de Créditos */}
        <div className="stat-card highlight md:col-span-1">
          <div className="stat-card-header">
            <span className="stat-card-title">Créditos Disponíveis</span>
            <div className="stat-card-icon">
              <Coins />
            </div>
          </div>
          <div className="stat-card-value">{summary?.totalCredits ?? 0}</div>
          <div className="stat-card-description">dias de creche</div>
        </div>

        {/* Card de Créditos por Pet */}
        <div className="section-card md:col-span-2">
          <div className="section-card-header">
            <div className="section-card-title">
              <Dog className="h-5 w-5" />
              Créditos por Pet
            </div>
          </div>
          <div className="section-card-content">
            {summary?.petCredits && summary.petCredits.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {summary.petCredits.map((pet) => {
                  const creditClass = getCreditBarClass(pet.credits);
                  return (
                    <button
                      key={pet.id}
                      onClick={() => setSelectedPetId(selectedPetId === pet.id ? null : pet.id)}
                      className={cn(
                        "flex flex-col gap-2 p-4 rounded-2xl transition-all duration-300",
                        selectedPetId === pet.id
                          ? "bg-orange-50 dark:bg-orange-950/30 ring-2 ring-orange-500 shadow-ios"
                          : "bg-muted/50 hover:bg-muted/80 hover:shadow-ios-sm"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          {selectedPetId === pet.id && <CheckCircle className="h-4 w-4 text-orange-500" />}
                          {pet.name}
                        </span>
                        <span className={cn(
                          "font-bold",
                          creditClass === "full" ? "text-emerald-600" :
                          creditClass === "medium" ? "text-amber-600" : "text-red-600"
                        )}>
                          {pet.credits}
                        </span>
                      </div>
                      {/* Barra de créditos com cores funcionais */}
                      <div className="progress-credits">
                        <div className={cn("progress-fill", creditClass)} 
                          style={{ width: `${Math.min((pet.credits / 20) * 100, 100)}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><Dog /></div>
                <div className="empty-state-title">Nenhum pet cadastrado</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seleção de Pet */}
      {summary?.petCredits && summary.petCredits.length > 0 && (
        <div className={cn(
          "section-card",
          selectedPetId 
            ? "!bg-emerald-50/80 dark:!bg-emerald-950/30 !border-emerald-200 dark:!border-emerald-800" 
            : "!bg-amber-50/80 dark:!bg-amber-950/30 !border-amber-200 dark:!border-amber-800"
        )}>
          <div className="section-card-content flex items-start gap-4">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
              selectedPetId 
                ? "bg-emerald-100 dark:bg-emerald-900/40" 
                : "bg-amber-100 dark:bg-amber-900/40"
            )}>
              <Dog className={cn(
                "h-5 w-5",
                selectedPetId ? "text-emerald-600" : "text-amber-600"
              )} />
            </div>
            <div className="flex-1">
              <p className={cn(
                "font-semibold",
                selectedPetId ? "text-emerald-800 dark:text-emerald-300" : "text-amber-800 dark:text-amber-300"
              )}>
                {selectedPetId 
                  ? `Pet selecionado: ${summary.petCredits.find(p => p.id === selectedPetId)?.name}`
                  : "Selecione um pet acima"}
              </p>
              <p className={cn(
                "text-sm mt-1",
                selectedPetId ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
              )}>
                {selectedPetId 
                  ? "Os créditos serão adicionados a este pet."
                  : "Clique em um pet para selecionar onde os créditos serão adicionados."}
              </p>
            </div>
            {selectedPetId && <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />}
          </div>
        </div>
      )}

      {/* Info Card - Navy style */}
      <div className="card-navy">
        <div className="card-navy-content flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">Como funcionam os créditos?</p>
            <p className="text-sm text-white/80 mt-1">
              Cada crédito equivale a 1 dia de creche para seu pet. Compre pacotes com desconto 
              e use quando quiser! Os créditos são associados a cada pet individualmente.
            </p>
            <p className="text-sm text-white/60 mt-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Pagamento seguro via Stripe
            </p>
          </div>
        </div>
      </div>

      {/* Pacotes */}
      <div className="section-card">
        <div className="section-card-header">
          <div>
            <div className="section-card-title">
              <ShoppingCart className="h-5 w-5" />
              Comprar Créditos
            </div>
            <div className="section-card-subtitle">Escolha um pacote para adicionar créditos</div>
          </div>
        </div>
        <div className="section-card-content">
          {!packages || packages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Coins /></div>
              <div className="empty-state-title">Nenhum pacote disponível</div>
              <div className="empty-state-description">No momento não há pacotes disponíveis para compra.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg, index) => {
                const pricePerCredit = Math.round(pkg.priceInCents / pkg.credits);
                const originalPrice = pkg.discountPercent > 0
                  ? Math.round(pkg.priceInCents / (1 - pkg.discountPercent / 100))
                  : null;
                const isPopular = index === 1; // Segundo pacote como mais popular

                return (
                  <div 
                    key={pkg.id} 
                    className={cn(
                      "relative rounded-2xl p-5 transition-all duration-300",
                      "bg-white/80 dark:bg-slate-800/60",
                      "border border-white/40 dark:border-white/10",
                      "shadow-ios hover:shadow-ios-md hover:-translate-y-1",
                      isPopular && "ring-2 ring-orange-500 shadow-primary-glow"
                    )}
                  >
                    {/* Badge de desconto */}
                    {pkg.discountPercent > 0 && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                        -{pkg.discountPercent}%
                      </div>
                    )}
                    
                    {/* Badge Popular */}
                    {isPopular && (
                      <div className="absolute -top-2 left-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        POPULAR
                      </div>
                    )}

                    <div className="space-y-4 mt-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{pkg.name}</h3>
                        {pkg.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{pkg.description}</p>
                        )}
                      </div>
                      
                      <div className="py-2">
                        <div className="text-4xl font-bold text-foreground tracking-tight">{pkg.credits}</div>
                        <p className="text-sm text-muted-foreground">créditos</p>
                      </div>
                      
                      <div className="py-2 border-t border-border/50">
                        {originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatCurrency(originalPrice)}
                          </div>
                        )}
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(pkg.priceInCents)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(pricePerCredit)}/crédito
                        </p>
                      </div>
                      
                      <Button
                        className={cn(
                          "w-full",
                          isPopular ? "btn-primary" : ""
                        )}
                        variant={isPopular ? "default" : "outline"}
                        disabled={isProcessing === pkg.id || !selectedPetId}
                        onClick={() => handlePurchase(pkg.id, pkg.name, pkg.credits, pkg.priceInCents)}
                      >
                        {isProcessing === pkg.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Comprar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
