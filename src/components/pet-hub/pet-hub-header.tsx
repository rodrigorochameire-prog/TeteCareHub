"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PawPrint, MessageCircle } from "lucide-react";

interface Tutor {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  isPrimary: boolean;
}

interface Pet {
  id: number;
  name: string;
  breed?: string | null;
  photoUrl?: string | null;
  weight?: number | null;
  status?: string | null;
  tutors: Tutor[];
}

interface PetHubHeaderProps {
  pet: Pet;
}

function getStatusBadge(status?: string | null) {
  switch (status) {
    case "active":
      return <Badge variant="success">Ativo</Badge>;
    case "at_daycare":
      return <Badge variant="info">Na creche</Badge>;
    case "inactive":
      return <Badge variant="secondary">Inativo</Badge>;
    default:
      return <Badge variant="success">Ativo</Badge>;
  }
}

function formatWeight(weight: number | null | undefined): string {
  if (!weight) return "";
  const kg = weight > 100 ? weight / 1000 : weight;
  return `${kg.toFixed(1)} kg`;
}

export function PetHubHeader({ pet }: PetHubHeaderProps) {
  const primaryTutor = pet.tutors.find((t) => t.isPrimary) ?? pet.tutors[0];
  const weight = formatWeight(pet.weight);

  const whatsappUrl = primaryTutor?.phone
    ? `https://wa.me/55${primaryTutor.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Ola ${primaryTutor.name}, sobre ${pet.name}...`
      )}`
    : null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={pet.photoUrl ?? undefined} alt={pet.name} />
        <AvatarFallback>
          <PawPrint className="h-8 w-8 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold truncate">{pet.name}</h1>
          {getStatusBadge(pet.status)}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
          {pet.breed && <span>{pet.breed}</span>}
          {pet.breed && weight && <span>·</span>}
          {weight && <span>{weight}</span>}
        </div>
        {primaryTutor && (
          <p className="text-sm text-muted-foreground mt-0.5">
            Tutor: {primaryTutor.name}
          </p>
        )}
      </div>

      {whatsappUrl && (
        <Button asChild variant="outline" className="gap-2 shrink-0">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </Button>
      )}
    </div>
  );
}
