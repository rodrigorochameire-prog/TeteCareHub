"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, Coins, Dog, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function TutorCreditsPage() {
  const { data: summary, isLoading: summaryLoading } = trpc.credits.mySummary.useQuery();
  const { data: packages, isLoading: packagesLoading } = trpc.credits.packages.useQuery();

  const isLoading = summaryLoading || packagesLoading;

  const handlePurchase = (packageId: number, packageName: string) => {
    // TODO: Integrar com Stripe
    toast.info(`Compra do ${packageName} será implementada em breve com Stripe!`);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meus Créditos"
        description="Gerencie seus créditos de creche"
      />

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Disponíveis</CardTitle>
            <Coins className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{summary?.totalCredits ?? 0}</div>
            <p className="text-sm text-muted-foreground">dias de creche</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos por Pet</CardTitle>
            <Dog className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summary?.petCredits && summary.petCredits.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {summary.petCredits.map((pet) => (
                  <div
                    key={pet.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      {pet.species === "cat" ? "🐱" : "🐶"} {pet.name}
                    </span>
                    <span className="font-bold text-primary">{pet.credits}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Dog className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhum pet cadastrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-start gap-3 pt-6">
          <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Como funcionam os créditos?</p>
            <p className="text-sm text-blue-700 mt-1">
              Cada crédito equivale a 1 dia de creche para seu pet. Compre pacotes com desconto 
              e use quando quiser! Os créditos são associados a cada pet individualmente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pacotes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Comprar Créditos
          </CardTitle>
          <CardDescription>Escolha um pacote para adicionar créditos</CardDescription>
        </CardHeader>
        <CardContent>
          {!packages || packages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum pacote disponível no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg) => {
                const pricePerCredit = Math.round(pkg.priceInCents / pkg.credits);
                const originalPrice = pkg.discountPercent > 0
                  ? Math.round(pkg.priceInCents / (1 - pkg.discountPercent / 100))
                  : null;

                return (
                  <Card key={pkg.id} className="relative overflow-hidden hover:shadow-md transition-shadow">
                    {pkg.discountPercent > 0 && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{pkg.discountPercent}%
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      {pkg.description && (
                        <CardDescription className="text-xs">{pkg.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-3xl font-bold">{pkg.credits}</div>
                        <p className="text-sm text-muted-foreground">créditos</p>
                      </div>
                      <div>
                        {originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatCurrency(originalPrice)}
                          </div>
                        )}
                        <div className="text-xl font-semibold text-primary">
                          {formatCurrency(pkg.priceInCents)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(pricePerCredit)}/crédito
                        </p>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handlePurchase(pkg.id, pkg.name)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Comprar
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
