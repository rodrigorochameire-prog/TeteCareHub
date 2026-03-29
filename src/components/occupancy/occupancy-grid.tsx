"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface OccupancyPet {
  id: number;
  name: string;
  photoUrl?: string | null;
  checkinTime?: Date | string | null;
}

interface OccupancyGridProps {
  capacity: number;
  pets: OccupancyPet[];
  onCheckin: () => void;
  onCheckout: (petId: number, petName: string) => void;
}

export function OccupancyGrid({
  capacity,
  pets,
  onCheckin,
  onCheckout,
}: OccupancyGridProps) {
  const slots = Array.from({ length: capacity }, (_, i) => {
    return pets[i] ?? null;
  });

  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
      }}
    >
      {slots.map((pet, idx) =>
        pet ? (
          <button
            key={`occupied-${pet.id}`}
            type="button"
            onClick={() => onCheckout(pet.id, pet.name)}
            className="group flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-md hover:bg-accent/30 cursor-pointer"
          >
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
              {pet.photoUrl && (
                <AvatarImage src={pet.photoUrl} alt={pet.name} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                {pet.name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-foreground truncate w-full text-center">
              {pet.name}
            </span>
            {pet.checkinTime && (
              <span className="text-[10px] text-muted-foreground">
                {format(new Date(pet.checkinTime), "HH:mm")}
              </span>
            )}
          </button>
        ) : (
          <button
            key={`empty-${idx}`}
            type="button"
            onClick={onCheckin}
            className="group flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border p-3 min-h-[100px] transition-all hover:border-primary/50 hover:bg-accent/20 cursor-pointer"
          >
            <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
              Livre
            </span>
          </button>
        )
      )}
    </div>
  );
}
