"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface StepTutorDataProps {
  token: string;
  tutor: {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  dashboardAccess: boolean;
  onNext: () => void;
}

export function StepTutorData({
  token,
  tutor,
  dashboardAccess,
  onNext,
}: StepTutorDataProps) {
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [password, setPassword] = useState("");

  const saveStep1 = trpc.invitePublic.saveStep1.useMutation({
    onSuccess: () => {
      toast.success("Dados salvos com sucesso!");
      onNext();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao salvar dados.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveStep1.mutate({
      token,
      address: address || undefined,
      emergencyContact: emergencyContact || undefined,
      emergencyPhone: emergencyPhone || undefined,
      notes: notes || undefined,
      password: password || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Admin-filled data (read-only) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Dados cadastrados</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Cadastrado pela creche
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nome</span>
              <span className="font-medium">{tutor.name || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{tutor.email || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Telefone</span>
              <span className="font-medium">{tutor.phone || "—"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable complement */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dados complementares</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Endereco</Label>
            <Input
              id="address"
              placeholder="Seu endereco completo"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contato de emergencia</Label>
              <Input
                id="emergencyContact"
                placeholder="Nome do contato"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Telefone de emergencia</Label>
              <Input
                id="emergencyPhone"
                placeholder="(00) 00000-0000"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea
              id="notes"
              placeholder="Informacoes adicionais que a creche deve saber..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {dashboardAccess && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha de acesso ao painel</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Voce usara esta senha para acessar o painel e acompanhar seus
                pets.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saveStep1.isPending}>
          {saveStep1.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="mr-2 h-4 w-4" />
          )}
          Proximo
        </Button>
      </div>
    </form>
  );
}
